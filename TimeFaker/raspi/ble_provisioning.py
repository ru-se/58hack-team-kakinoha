"""
BLEプロビジョニングサーバー
スマホのセットアップ画面からBLE経由でデータを受け取り、
サーバーAPIに登録する。（旧: ble_test.py、DB直接アクセスをAPI経由に変更）
"""

import traceback
import asyncio
import logging
import json
import subprocess

logging.basicConfig(level=logging.INFO)

SERVICE_UUID = "A07498CA-AD5B-474E-940D-16F1FBE7E8CD"
CHAR_UUID = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B"

# サーバーAPIクライアント（run_ble_server呼び出し時に渡される）
_api_client = None


def on_write_request(characteristic, value, **kwargs):
    """Webチームからデータが届いた時に発動する処理"""
    print("\n📥 [BLE受信] 箱にデータが届きました！")
    print(f"🔍 生データ(Raw): {value}")

    try:
        if not value:
            print("⚠️ 空のデータを受信したためスキップします。")
            return

        decoded_str = value.decode('utf-8')
        print(f"🔍 変換後の文字列: {decoded_str}")

        data = json.loads(decoded_str)

        ssid = data.get("ssid")
        wifi_pass = data.get("password")
        discord_id = data.get("discord_id")
        mdm_device_id = data.get("mdm_device_id")

        print(f"🎯 受信データ: SSID={ssid}, Discord={discord_id}, MDM Device ID={mdm_device_id}")

        # 1. Wi-Fiの設定処理
        if ssid and wifi_pass:
            print(f"🔄 Wi-Fi '{ssid}' に接続を試みます...")
            result = subprocess.run(
                ["nmcli", "dev", "wifi", "connect", ssid, "password", wifi_pass],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                print("✅ Wi-Fiの接続に成功しました！")
            else:
                print(f"❌ Wi-Fi接続エラー: {result.stderr}")

        # 2. Discord ID / MDM IDをサーバーAPIに登録
        if discord_id and _api_client:
            print(f"💾 Discord ID '{discord_id}' をサーバーAPIに登録します...")
            success = _api_client.ble_register(
                discord_user_id=discord_id,
                mdm_device_id=mdm_device_id
            )
            if success:
                print(f"✅ Discord ID '{discord_id}' のサーバー登録が完了しました！")
            else:
                print(f"❌ サーバー登録に失敗しました")
        elif discord_id:
            print("⚠️ API クライアントが設定されていません。サーバーへの登録をスキップします。")

    except Exception as e:
        print(f"⚠️ データの解析・設定中にエラーが発生しました: {e}")


async def run_ble_server(api_client=None):
    """
    BLEプロビジョニングサーバーを起動する。

    Args:
        api_client: ServerClientインスタンス（サーバーAPI経由でユーザー登録するため）
    """
    global _api_client
    _api_client = api_client

    from bless import (
        BlessServer,
        GATTCharacteristicProperties,
        GATTAttributePermissions
    )

    server = BlessServer(name="TimeHacker")
    server.write_request_func = on_write_request

    try:
        print("🔄 BLEサーバーの準備中...")
        await server.add_new_service(SERVICE_UUID)

        char_flags = (
            GATTCharacteristicProperties.read |
            GATTCharacteristicProperties.write
        )
        permissions = (
            GATTAttributePermissions.readable |
            GATTAttributePermissions.writeable
        )

        initial_value = bytearray(b"Waiting for setup...")

        await server.add_new_characteristic(
            SERVICE_UUID, CHAR_UUID, char_flags, initial_value, permissions
        )

        print("🔄 BLE電波を発信します...")
        await server.start()
        print("✅ 成功！Webチームからの初期設定データを待機中です...")

        # 起動し続ける
        while True:
            await asyncio.sleep(10)

    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        traceback.print_exc()
    finally:
        try:
            await server.stop()
        except:
            pass


if __name__ == "__main__":
    asyncio.run(run_ble_server())
