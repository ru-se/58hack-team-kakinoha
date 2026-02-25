import traceback
import asyncio
import logging
import json
import subprocess
from database import SessionLocal
import crud
from bless import (
    BlessServer,   #type: ignore
    GATTCharacteristicProperties, #type: ignore
    GATTAttributePermissions #type: ignore
)

logging.basicConfig(level=logging.INFO)

SERVICE_UUID = "A07498CA-AD5B-474E-940D-16F1FBE7E8CD"
CHAR_UUID = "51FF12BB-3ED8-46E5-B4F9-D64E2FEC021B"

# =========================================
# ★Webチームからデータが届いた時に発動する処理
# =========================================
def on_write_request(characteristic, value, **kwargs):
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
            import subprocess
            result = subprocess.run(
                ["nmcli", "dev", "wifi", "connect", ssid, "password", wifi_pass],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                print("✅ Wi-Fiの接続に成功しました！")
            else:
                print(f"❌ Wi-Fi接続エラー: {result.stderr}")

        # 2. Discord IDの保存処理
        if discord_id:
            print(f"💾 Discord ID '{discord_id}' をデータベースに保存します...")
            # DBのセッション（扉）を手動で開く
            db = SessionLocal()
            try:
                # crud.pyに作ったBLE専用関数を呼び出す！
                crud.register_user_from_ble(db, discord_id=discord_id, mdm_device_id=mdm_device_id)
                print(f"✅ Discord ID '{discord_id}' のDB連携処理が完了しました！")
                
            except Exception as e:
                print(f"❌ DB保存エラー: {e}")
                db.rollback() # エラーが起きたら変更を無かったことにする
            finally:
                db.close()    # 使い終わったら必ず扉を閉める（超重要！）
    except Exception as e:
        print(f"⚠️ データの解析・設定中にエラーが発生しました: {e}")

# =========================================
# BLEサーバーの起動処理
# =========================================
async def run_ble_server():
    server = BlessServer(name="TimeHacker")
    
    # ★サーバーに「書き込まれたらこの関数を呼ぶ」と登録
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