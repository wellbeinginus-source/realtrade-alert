"use client";

import { useEffect, useRef } from "react";

// AdSense 광고단위의 data-ad-slot ID. 비어 있으면 무효 광고(빈 슬롯)가
// "게시자 콘텐츠가 없는 화면에 광고" 정책에 걸리므로 렌더하지 않습니다.
// AdSense 승인 후 광고단위를 만들어 이 값을 채우면 광고가 다시 노출됩니다.
const AD_SLOT: string = "";

export default function AdBanner() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!AD_SLOT) return;
    if (initialized.current) return;
    initialized.current = true;

    try {
      const adsByGoogle = (window as unknown as { adsbygoogle: unknown[] })
        .adsbygoogle || [];
      adsByGoogle.push({});
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  if (!AD_SLOT) return null;

  return (
    <div className="my-8 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3913442122539155"
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
