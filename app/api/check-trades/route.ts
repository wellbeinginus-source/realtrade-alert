import { NextResponse } from "next/server";
import { fetchAptTrades, TradeRecord, REGION_CODES } from "@/lib/molit-api";
import { getActiveSubscribers, Subscriber } from "@/lib/subscribers";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * Cron 엔드포인트: 매일 실거래가 확인 → 구독자 조건 매칭 → 텔레그램 알림 발송
 * Vercel Cron 또는 외부 스케줄러에서 호출
 *
 * GET /api/check-trades?secret=XXX
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dealYearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  // 활성 구독자 로드
  const subscribers = getActiveSubscribers();

  if (subscribers.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "활성 구독자 없음",
      timestamp: now.toISOString(),
    });
  }

  // 구독자들의 모든 지역코드를 중복 없이 수집
  const regionCodeSet = new Set<string>();
  for (const sub of subscribers) {
    for (const code of sub.regionCodes) {
      regionCodeSet.add(code);
    }
  }
  const regionCodes = Array.from(regionCodeSet);

  // 지역별 실거래 데이터 조회
  const tradesByRegion: Record<string, TradeRecord[]> = {};
  const results: { region: string; count: number }[] = [];

  for (const code of regionCodes) {
    try {
      const trades = await fetchAptTrades(code, dealYearMonth);
      tradesByRegion[code] = trades;
      results.push({ region: REGION_CODES[code] || code, count: trades.length });
    } catch {
      tradesByRegion[code] = [];
      results.push({ region: REGION_CODES[code] || code, count: -1 });
    }
  }

  // 구독자별 조건 매칭 → 알림 발송
  let totalAlerts = 0;

  for (const sub of subscribers) {
    const matched = matchTrades(sub, tradesByRegion);
    if (matched.length === 0) continue;

    const message = buildAlertMessage(sub, matched);
    const sent = await sendTelegramMessage(sub.chatId, message);
    if (sent) totalAlerts++;
  }

  return NextResponse.json({
    ok: true,
    checked: dealYearMonth,
    regions: results,
    subscribers: subscribers.length,
    alertsSent: totalAlerts,
    timestamp: now.toISOString(),
  });
}

/**
 * 구독자 조건에 맞는 거래 필터링
 */
function matchTrades(
  sub: Subscriber,
  tradesByRegion: Record<string, TradeRecord[]>
): TradeRecord[] {
  const matched: TradeRecord[] = [];

  for (const code of sub.regionCodes) {
    const trades = tradesByRegion[code] || [];

    for (const t of trades) {
      // 가격 필터
      if (sub.minPrice !== undefined && t.dealAmount < sub.minPrice) continue;
      if (sub.maxPrice !== undefined && t.dealAmount > sub.maxPrice) continue;

      // 면적 필터
      if (sub.minArea !== undefined && t.area < sub.minArea) continue;
      if (sub.maxArea !== undefined && t.area > sub.maxArea) continue;

      matched.push(t);
    }
  }

  return matched;
}

/**
 * 알림 메시지 생성
 */
function buildAlertMessage(
  sub: Subscriber,
  trades: TradeRecord[]
): string {
  // 최대 10건만 알림 (너무 길면 텔레그램 제한)
  const shown = trades.slice(0, 10);
  const remaining = trades.length - shown.length;

  let msg = `🏠 <b>실거래가 알림</b> (${sub.name})\n`;
  msg += `총 ${trades.length}건 매칭\n\n`;

  for (const t of shown) {
    const regionName = REGION_CODES[t.regionCode] || t.regionCode;
    const priceText = formatPrice(t.dealAmount);

    msg += `📍 ${regionName} | ${t.aptName}\n`;
    msg += `💰 ${priceText}\n`;
    msg += `📐 ${t.area}㎡ | ${t.floor}층\n`;
    msg += `📅 ${t.dealYear}.${String(t.dealMonth).padStart(2, "0")}.${String(t.dealDay).padStart(2, "0")}\n\n`;
  }

  if (remaining > 0) {
    msg += `... 외 ${remaining}건\n`;
  }

  msg += `\n조건: ${sub.name}`;
  return msg;
}

/**
 * 가격 포맷 (만원 → "X억 Y만원")
 */
function formatPrice(amount: number): string {
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000);
    const man = amount % 10000;
    if (man === 0) return `${eok}억원`;
    return `${eok}억 ${man.toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}만원`;
}
