import { NextResponse } from "next/server";
import { fetchAptTrades, REGION_CODES } from "@/lib/molit-api";

/**
 * Cron 엔드포인트: 매일 실거래가 확인 → 조건 매칭 → 알림 발송
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

  // 서울 주요 지역 조회 (MVP: 전체 대신 상위 5개)
  const sampleRegions = ["11680", "11650", "11710", "11500", "11200"];
  const results: { region: string; count: number }[] = [];

  for (const code of sampleRegions) {
    try {
      const trades = await fetchAptTrades(code, dealYearMonth);
      results.push({ region: REGION_CODES[code] || code, count: trades.length });
    } catch {
      results.push({ region: REGION_CODES[code] || code, count: -1 });
    }
  }

  // TODO: 구독자 조건과 매칭 → 텔레그램/이메일 발송

  return NextResponse.json({
    ok: true,
    checked: dealYearMonth,
    results,
    timestamp: now.toISOString(),
  });
}
