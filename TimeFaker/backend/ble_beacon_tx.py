import subprocess
import time
from datetime import datetime, timedelta, timezone
import sys

# ===== 設定 =====
DEVICE_NAME = b"TimeFaker_TX"

# 日本標準時（JST）のタイムゾーンを定義（UTC+9時間）
JST = timezone(timedelta(hours=+9), 'JST')

def execute_cmd(cmd):
    """コマンドを実行し、エラーを無視して続行する"""
    try:
        subprocess.run(cmd, shell=True, capture_output=True, check=False)
    except Exception as e:
        print(f"Command Error: {e}")

def build_adv_payload(hh, mm, ss, offset_min):
    """BLEアドバタイズメントのペイロード（生データ）を構築する"""
    
    offset_hex = offset_min & 0xFF
    
    mfg_data = [
        0x07,  # 長さ (7バイト)
        0xFF,  # タイプ: Manufacturer Specific Data
        0x01,  # Version
        hh,    # Hour
        mm,    # Minute
        ss,    # Second
        offset_hex, # Offset (signed)
        0x01   # Reserved
    ]
    
    name_data = [len(DEVICE_NAME) + 1, 0x09] + list(DEVICE_NAME)
    
    adv_payload = mfg_data + name_data
    total_active_len = len(adv_payload)
    
    adv_payload += [0x00] * (31 - len(adv_payload))
    
    return total_active_len, adv_payload

def broadcast_time_burst(offset_min, repeat_count=3, interval_ms=100):
    """現在時刻を取得し、オフセットを足した未来の時間をバースト送信する"""
    
    for i in range(repeat_count):
        # 1. 現在の日本時間（JST）を正確に取得する
        now_jst = datetime.now(JST)
        
        # 3. 計算された未来の時間の 時・分・秒 を取り出す
        hh, mm, ss = now_jst.hour, now_jst.minute, now_jst.second
        
        total_len, payload_bytes = build_adv_payload(hh, mm, ss, offset_min)
        
        hex_payload = " ".join([f"{b:02X}" for b in payload_bytes])
        cmd_set_data = f"hcitool -i hci0 cmd 0x08 0x0008 {total_len:02X} {hex_payload}"
        
        execute_cmd("hciconfig hci0 noleadv")
        execute_cmd(cmd_set_data)
        execute_cmd("hciconfig hci0 leadv 3") 
        
        if i == 0: 
            sign = "+" if offset_min >= 0 else ""
            print(f"📡 [BROADCAST] JST {now_jst.strftime('%H:%M:%S')} -> 送信時刻: {hh:02}:{mm:02}:{ss:02} (offset={sign}{offset_min}min)")
            print(f"   [Payload] {hex_payload[:total_len*3]}")
            
        time.sleep(interval_ms / 1000.0)

def main():
    print("==================================")
    print("  TimeFaker TX (Raspberry Pi JST版)")
    print("==================================")
    
    execute_cmd("hciconfig hci0 reset")
    execute_cmd("hciconfig hci0 up")
    
    print("System ready!\n")
    print("=== 使用方法 ===")
    print("オフセット値（-120 ~ +120）を入力してEnterを押してください")
    print("例: 30 (30分進める), 0 (今の時間を送る)")
    print("終了するには Ctrl+C を押してください\n")
    
    try:
        while True:
            user_input = input("> オフセットを入力: ").strip()
            
            if not user_input:
                continue
                
            try:
                offset = int(user_input)
                if offset < -120 or offset > 120:
                    print("⚠️ エラー: オフセットは -120 ~ +120 の範囲で入力してください")
                else:
                    sign = "+" if offset >= 0 else ""
                    print(f"🔄 オフセット設定: {sign}{offset} 分 → BLE送信準備中...")
                    
                    broadcast_time_burst(offset, repeat_count=3, interval_ms=100)
                    print("✅ BLE送信完了\n")
                    
            except ValueError:
                print("⚠️ エラー: 数字を入力してください")
                
    except KeyboardInterrupt:
        print("\n🛑 プログラムを終了します。Bluetoothを元の状態に戻します...")
        execute_cmd("hciconfig hci0 noleadv")
        sys.exit(0)

if __name__ == "__main__":
    main()