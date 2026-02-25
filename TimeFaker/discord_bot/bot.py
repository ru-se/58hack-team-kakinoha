import discord
import asyncio
from discord.ext import commands
import requests
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む（システムの環境変数より優先）
load_dotenv(override=True)
TOKEN = os.getenv('DISCORD_BOT_TOKEN')

# API接続先の設定
API_BASE_URL = os.getenv('API_BASE_URL', "http://127.0.0.1:8000")

# !plan コマンドを受け付ける設定
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'✅ Botがログインしました: {bot.user}')
    print(f'接続先API: {API_BASE_URL}/api/plan/')
    print(f"登録コマンド: {', '.join(sorted(c.name for c in bot.commands))}")


@bot.command()
async def test(ctx):
    """
    !test
    BotからAPIサーバー（Docker側）へ疎通確認を行う。
    """
    trace_id = str(uuid.uuid4())
    url = f"{API_BASE_URL}/api/test/ping"

    payload = {
        "trace_id": trace_id,
        "discord_user_id": str(ctx.author.id),
        "source": "discord_bot",
    }

    try:
        response = await asyncio.to_thread(requests.post, url, json=payload, timeout=10)
        if response.status_code == 200:
            await ctx.send(
                "✅ Docker側APIへ送信できました。\n"
                f"trace_id: `{trace_id}`\n"
                f"確認URL: `{API_BASE_URL}/api/test/ping/{trace_id}`"
            )
        else:
            await ctx.send(f"⚠️ 送信失敗（status={response.status_code}）")
    except Exception as e:
        await ctx.send(f"❌ テスト送信エラー: {e}")

# コマンド: !plan @user1 @user2 YYYY-MM-DD HH:MM 予定名
@bot.command()
async def plan(ctx, members: commands.Greedy[discord.Member], date: str, time: str, *, task: str):
    """
    !plan @user1 @user2 2026-02-22 19:00 打ち上げ
    メンションされた全員の予定を登録する。
    メンションなしの場合はコマンドを打った本人のみ対象。
    """
    setting_url = f"{API_BASE_URL}/api/plan/"

    # メンションがない場合はコマンドを打った本人
    targets = members if members else [ctx.author]

    results = []
    for member in targets:
        discord_id = str(member.id)
        payload = {
            "discord_user_id": discord_id,
            "date": date,
            "time": time,
            "task": task,
        }
        try:
            response = await asyncio.to_thread(requests.post, setting_url, json=payload)
            if response.status_code == 200:
                data = response.json()
                cal_ok = data.get("calendar_registered", False)
                cal_msg = "✅ Googleカレンダーに登録済" if cal_ok else "⚠️ カレンダー未登録（!auth で認証してください）"
                results.append(f"✅ **{member.display_name}** さんの予定を登録しました！\n   📆 {cal_msg}")
            else:
                results.append(f"⚠️ **{member.display_name}** さんの登録に失敗しました（ステータス: {response.status_code}）")
        except Exception as e:
            results.append(f"❌ **{member.display_name}** さんへの登録エラー: {e}")

    await ctx.send(
        f"📅 **{date} {time}　{task}**\n"
        f"──────────────────\n"
        + "\n".join(results)
    )

# コマンド: !auth （Googleカレンダー認証）
@bot.command()
async def auth(ctx):
    """
    !auth
    Googleカレンダーへのアクセスを認証する。
    DMに認証用URLを送信する。
    """
    discord_id = str(ctx.author.id)
    url = f"{API_BASE_URL}/auth/google?discord_user_id={discord_id}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            auth_url = response.json()["auth_url"]
            # DMで認証 URLを送る
            await ctx.author.send(
                f"🔑 **Googleカレンダー認証**\n"
                f"下記のURLをクリックして、Googleアカウントと連携してください。\n\n"
                f"{auth_url}"
            )
            await ctx.send("📨 DMに認証用URLを送りました！クリックして認証を完了してください。")
        else:
            await ctx.send(f"⚠️認証URLの取得に失敗しました。")
    except Exception as e:
        await ctx.send(f"❌ サーバーへの接続エラー: {e}")

# コマンド: !register メールアドレス
@bot.command()
async def register(ctx, gmail: str):
    """
    !register example@gmail.com
    自分のGmailアドレスをDiscordアカウントと紐付けてDBに登録する。
    """
    discord_id = str(ctx.author.id)
    target_name = ctx.author.name

    register_url = f"{API_BASE_URL}/api/register/"
    payload = {"discord_user_id": discord_id, "gmail": gmail}

    try:
        response = requests.post(register_url, json=payload)

        if response.status_code == 200:
            data = response.json()
            await ctx.send(
                f"✅ Gmailを登録しました！\n"
                f"👤 Discordユーザー: {target_name}\n"
                f"📧 Gmail: {data['gmail']}"
            )
        else:
            await ctx.send(f"⚠️ 登録に失敗しました。ステータス: {response.status_code}")
    except Exception as e:
        await ctx.send(f"❌ サーバーへの接続エラー: {e}\n※サーバーは起動していますか？")

# コマンド: !myinfo （テスト用・自分のDB情報を全表示）
@bot.command()
async def myinfo(ctx):
    """
    !myinfo
    コマンドを打った人のDBに保存されている全情報を表示する。
    Googleカレンダー認証済みの場合は今日の予定も表示する。
    """
    discord_id = str(ctx.author.id)
    url = f"{API_BASE_URL}/api/user/{discord_id}"

    try:
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()

            if data["status"] == "not_found":
                await ctx.send("⚠️ あなたのデータはDBに登録されていません。\n`!register メールアドレス` で登録してください。")
                return

            # 今日の予定セクションを組み立て
            cal_status = data.get("calendar_status", "not_authorized")
            today_events = data.get("today_events", [])

            if cal_status == "not_authorized":
                calendar_section = "🔒 Googleカレンダー: `未認証（!auth で認証してください）`"
            elif cal_status == "error":
                calendar_section = "❌ Googleカレンダー: `取得に失敗しました`"
            elif not today_events:
                calendar_section = "📅 今日の予定: `なし`"
            else:
                lines = [f"📅 今日の予定: **{len(today_events)}件**"]
                for event in today_events:
                    summary = event.get("summary", "（タイトルなし）")
                    start = event.get("start", {})
                    # 終日予定は dateTime ではなく date
                    start_time = start.get("dateTime", start.get("date", ""))
                    # 時間部分だけ表示（例："2026-02-22T09:00:00+09:00" → "09:00"）
                    if "T" in start_time:
                        time_str = start_time.split("T")[1][:5]
                        lines.append(f"  ・ `{time_str}` {summary}")
                    else:
                        lines.append(f"  ・ 終日 {summary}")
                calendar_section = "\n".join(lines)

            await ctx.send(
                f"📋 **あなたのDB情報（テスト用）**\n"
                f"──────────────────\n"
                f"🆔 DB内部ID: `{data['id']}`\n"
                f"👤 Discord ID: `{data['discord_user_id']}`\n"
                f"📧 Gmail: `{data['gmail'] or '未登録'}`\n"
                f"📱 MDMデバイスID: `{data['mdm_device_id'] or '未登録'}`\n"
                f"⏰ ズレ時間: `{data['offset_minutes']}分`\n"
                f"🎯 攻撃予約フラグ: `{data['is_attack_scheduled']}`\n"
                f"──────────────────\n"
                f"{calendar_section}"
            )
        else:
            await ctx.send(f"⚠️ 情報の取得に失敗しました。ステータス: {response.status_code}")
    except Exception as e:
        await ctx.send(f"❌ サーバーへの接続エラー: {e}\n※サーバーは起動していますか？")


# コマンド: !dbdump （デバッグ用：DB全ユーザー一覧）
@bot.command()
async def dbdump(ctx):
    """
    !dbdump
    DBに登録されている全ユーザーの情報を表示する（テスト・デバッグ用）。
    """
    url = f"{API_BASE_URL}/api/debug/users"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            users = data.get("users", [])
            count = data.get("count", 0)

            if count == 0:
                await ctx.send("📭 DBにユーザーが登録されていません。")
                return

            lines = [f"🗄️ **DB全ユーザー一覧（{count}人）**\n──────────────────"]
            for u in users:
                cal_icon = "✅" if u["has_google_token"] else "❌"
                attack_icon = "🎯" if u["is_attack_scheduled"] else "⬜"
                lines.append(
                    f"**ID:{u['id']}** `{u['discord_user_id']}`\n"
                    f"  {cal_icon} Calendar　{attack_icon} Attack予約　⏰ {u['offset_minutes']}分ズレ"
                )
            await ctx.send("\n".join(lines))
        else:
            await ctx.send(f"⚠️ 取得失敗。ステータス: {response.status_code}")
    except Exception as e:
        await ctx.send(f"❌ サーバーへの接続エラー: {e}\n※サーバーは起動していますか？")

# コマンド: !schedule （Googleカレンダーの直近予定を表示）
@bot.command()
async def schedule(ctx):
    """
    !schedule
    Googleカレンダーに登録されている直近5件の予定を表示する。
    事前に !auth で認証が必要。
    """
    discord_id = str(ctx.author.id)
    url = f"{API_BASE_URL}/api/schedule/{discord_id}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()

            if data["status"] == "not_found":
                await ctx.send("⚠️ DBに登録されていません。まず `!auth` で認証してください。")
                return
            if data["status"] == "not_authorized":
                await ctx.send("⚠️ Googleカレンダーの認証が完了していません。`!auth` を実行してください。")
                return
            if data["status"] == "error":
                await ctx.send(f"❌ カレンダー取得エラー: {data['message']}")
                return

            events = data["events"]
            if not events:
                await ctx.send("📅 直近の予定はありません。")
                return

            msg = "📅 **あなたの直近の予定（Googleカレンダー）**\n──────────────────\n"
            for i, event in enumerate(events, 1):
                title = event.get("summary", "（タイトルなし）")
                start = event.get("start", {})
                # 終日イベントは "date"、時間指定イベントは "dateTime"
                start_str = start.get("dateTime", start.get("date", "不明"))
                # ISO形式を整形（"2026-03-01T10:00:00+09:00" → "2026-03-01 10:00"）
                if "T" in start_str:
                    start_str = start_str[:16].replace("T", " ")
                msg += f"{i}. `{start_str}` | {title}\n"
            msg += "──────────────────"

            await ctx.send(msg)
        else:
            await ctx.send(f"⚠️ 取得に失敗しました。ステータス: {response.status_code}")
    except Exception as e:
        await ctx.send(f"❌ サーバーへの接続エラー: {e}\n※サーバーは起動していますか？")
async def register_schedule_from_mentions(ctx, content: str, command_name: str):
    mentions = ctx.message.mentions
    # メンションがあればその文字列を除去、なければ入力全文を使う
    text = content
    for user in mentions:
        text = text.replace(user.mention, "").strip()

    parts = text.split(maxsplit=2)
    if len(parts) < 3:
        await ctx.send(f"⚠️ 形式が不正です。例: !{command_name} @user 2026-02-21 09:30 朝会")
        return

    date_str, time_str, title = parts[0], parts[1], parts[2].strip()

    # フォーマット検証
    try:
        datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        await ctx.send("⚠️ 日時形式が不正です。YYYY-MM-DD HH:MM で入力してください。")
        return

    url = f"{API_BASE_URL}/api/schedules/"

    target_ids = [str(u.id) for u in mentions] if mentions else [str(ctx.author.id)]

    payload = {
        "mentioned_discord_ids": target_ids,
        "date": date_str,
        "time": time_str,
        "title": title,
    }

    try:
        response = await asyncio.to_thread(requests.post, url, json=payload, timeout=10)
        if response.status_code != 200:
            await ctx.send(f"⚠️ サーバーとの通信に失敗しました。status={response.status_code}")
            return

        body = response.json()
        saved_ids = body.get("saved_ids", [])
        skipped_ids = body.get("skipped_ids", [])

        id_to_name = {str(u.id): u.display_name for u in mentions}
        if not mentions:
            id_to_name[str(ctx.author.id)] = ctx.author.display_name
        saved_names = [id_to_name.get(i, i) for i in saved_ids]
        skipped_names = [id_to_name.get(i, i) for i in skipped_ids]

        msg = [f"📅 {date_str} {time_str}", f"📝 {title}"]
        if saved_names:
            msg.append(f"✅ 保存しました: {', '.join(saved_names)}")
        if skipped_names:
            msg.append(f"⚠️ DB未登録のためスキップ: {', '.join(skipped_names)}")
        if not saved_names and not skipped_names:
            msg.append("⚠️ 対象ユーザーがありませんでした")

        await ctx.send("\n".join(msg))
    except Exception as e:
        await ctx.send(f"❌ ラズパイへの接続エラー: {e}")




@bot.command()
async def add(ctx, *, content: str):
    """
    使い方:
    !add @user1 @user2 2026-02-21 09:30 朝会
    """
    await register_schedule_from_mentions(ctx, content, command_name="add")

# Bot起動
if TOKEN:
    bot.run(TOKEN)
else:
    print("⚠️ DISCORD_BOT_TOKENが設定されていません！.envを確認してください。")
