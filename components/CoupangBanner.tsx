const COUPANG_LINK = "https://link.coupang.com/a/ep0BMn";

export function CoupangBanner() {
  return (
    <div className="my-8 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-center">
      <a
        href={COUPANG_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 bg-[#e52528] text-white font-bold rounded-lg hover:bg-[#c91f22] transition-colors text-sm"
      >
        부동산 투자 베스트셀러 보기
      </a>
      <p className="mt-2 text-xs text-zinc-400">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
        제공받습니다.
      </p>
    </div>
  );
}
