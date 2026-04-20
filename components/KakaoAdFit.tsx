"use client";

import { useEffect, useRef } from "react";

export default function KakaoAdFit({
  unit,
  width = 320,
  height = 100,
}: {
  unit: string;
  width?: number;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));

    containerRef.current?.appendChild(ins);

    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/kas/static/ba.min.js";
    script.async = true;
    containerRef.current?.appendChild(script);
  }, [unit, width, height]);

  return <div ref={containerRef} className="my-6 flex justify-center" />;
}
