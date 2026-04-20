/**
 * 텔레그램 봇 메시지 발송
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.error("[Telegram] TELEGRAM_BOT_TOKEN 환경변수 미설정");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[Telegram] 발송 실패:", res.status, err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Telegram] 발송 에러:", error);
    return false;
  }
}
