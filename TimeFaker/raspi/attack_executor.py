"""
3つのデバイス（スマホ・物理時計・Windows PC）への攻撃を
1つのクラスにまとめて管理する。
"""

import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# MDMプロファイルID（.envから読み込み）
PROFILE_TOKYO = os.getenv("MDM_PROFILE_TOKYO")
PROFILE_GMT9_5 = os.getenv("MDM_PROFILE_GMT9_5")
PROFILE_GMT10 = os.getenv("MDM_PROFILE_GMT10")
PROFILE_GMT10_5 = os.getenv("MDM_PROFILE_GMT10_5")
PROFILE_GMT11 = os.getenv("MDM_PROFILE_GMT11")


class AttackExecutor:
    def __init__(self, mdm_client, ble_beacon, ws_manager):
        """
        Args:
            mdm_client: MDMClient インスタンス（スマホ攻撃用）
            ble_beacon: ble_beacon_tx モジュール（物理時計攻撃用）
            ws_manager: ConnectionManager インスタンス（Windows PC攻撃用）
        """
        self.mdm = mdm_client
        self.ble = ble_beacon
        self.ws = ws_manager

    async def execute(self, offset_minutes: int):
        """
        3デバイスすべてに攻撃（時間ズレ）を実行する。

        Args:
            offset_minutes: ズラす分数（30, 60, 90, 120）
        """
        multiplier = offset_minutes // 30

        # 1. スマホ（MDM経由でタイムゾーン変更）
        profile_id = None
        match multiplier:
            case 1: profile_id = PROFILE_GMT9_5
            case 2: profile_id = PROFILE_GMT10
            case 3: profile_id = PROFILE_GMT10_5
            case 4: profile_id = PROFILE_GMT11

        if profile_id:
            success = await asyncio.to_thread(self.mdm.change_timezone, profile_id)
            if success:
                print(f"📱 [MDM] タイムゾーン変更成功 (プロファイル: {profile_id})")
            else:
                print("⚠️ [MDM] タイムゾーン変更に失敗しました")
        else:
            print(f"⚠️ [MDM] 対応するプロファイルがありません (offset={offset_minutes})")

        # 2. Windows PC（WebSocket経由）
        payload = {"action": "shift", "direction": "forward", "offset_minutes": offset_minutes}
        await self.ws.broadcast(payload)
        print(f"💻 [WebSocket] Windows PCにオフセット {offset_minutes}分 を送信")

        # 3. 物理時計（BLEビーコン経由）
        await asyncio.to_thread(
            self.ble.broadcast_time_burst, offset_minutes, repeat_count=5
        )
        print(f"⏰ [BLE] 物理時計にオフセット {offset_minutes}分 を送信")

    async def restore(self):
        """
        3デバイスすべてを元の時間に復旧する。
        """
        # 1. スマホ（東京タイムゾーンに戻す）
        if PROFILE_TOKYO:
            success = await asyncio.to_thread(self.mdm.change_timezone, PROFILE_TOKYO)
            if success:
                print("✅ [MDM] 復旧命令の送信に成功しました")
        else:
            print("❌ [MDM] PROFILE_TOKYO が設定されていません")

        # 2. Windows PC
        payload = {"action": "restore", "direction": "none", "offset_minutes": 0}
        await self.ws.broadcast(payload)
        print("💻 [WebSocket] Windows PCへ復旧命令を送信")

        # 3. 物理時計
        await asyncio.to_thread(
            self.ble.broadcast_time_burst, 0, repeat_count=3, interval_ms=100
        )
        print("⏰ [BLE] 物理時計へ復旧命令を送信")
