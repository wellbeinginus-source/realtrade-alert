import { NextResponse } from "next/server";

/**
 * 구독 등록 API (MVP: 서버 저장 준비용 스텁)
 * POST /api/subscribe
 * Body: { conditions, notifyMethod, notifyTarget }
 *
 * TODO: DB 연동 후 실제 저장 구현
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { conditions, notifyMethod, notifyTarget } = body;

    if (!conditions || !notifyMethod || !notifyTarget) {
      return NextResponse.json(
        { error: "conditions, notifyMethod, notifyTarget 필수" },
        { status: 400 }
      );
    }

    // TODO: DB에 구독 정보 저장
    // TODO: 텔레그램 bot 연동 시 chat_id 검증
    // TODO: 이메일 인증 발송

    return NextResponse.json({
      ok: true,
      message: "구독 등록 완료 (베타)",
      subscription: {
        id: `sub_${Date.now()}`,
        conditions,
        notifyMethod,
        notifyTarget,
        createdAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청입니다" },
      { status: 400 }
    );
  }
}
