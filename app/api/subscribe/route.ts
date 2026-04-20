import { NextResponse } from "next/server";
import { addSubscriber, getSubscribers, removeSubscriber } from "@/lib/subscribers";

/**
 * 구독 관리 API
 *
 * GET  /api/subscribe              → 전체 구독자 목록
 * POST /api/subscribe              → 구독 등록/수정
 * DELETE /api/subscribe?chatId=X&name=Y → 구독 삭제
 */

export async function GET() {
  const subscribers = getSubscribers();
  return NextResponse.json({ ok: true, subscribers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { chatId, name, regionCodes, minPrice, maxPrice, minArea, maxArea } =
      body;

    if (!chatId || !name || !regionCodes || !Array.isArray(regionCodes)) {
      return NextResponse.json(
        { error: "chatId, name, regionCodes(배열) 필수" },
        { status: 400 }
      );
    }

    addSubscriber({
      chatId,
      name,
      regionCodes,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      active: true,
    });

    return NextResponse.json({
      ok: true,
      message: "구독 등록 완료",
    });
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  const name = searchParams.get("name");

  if (!chatId || !name) {
    return NextResponse.json(
      { error: "chatId, name 파라미터 필수" },
      { status: 400 }
    );
  }

  const removed = removeSubscriber(chatId, name);

  return NextResponse.json({
    ok: removed,
    message: removed ? "구독 삭제 완료" : "해당 구독을 찾을 수 없음",
  });
}
