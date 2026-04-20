"use client";

import { useEffect, useRef } from "react";

export default function AdBanner() {
  const initialized = useRef(false);

  useEffect(() => {
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

  return (
    <div className="my-8 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3913442122539155"
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
