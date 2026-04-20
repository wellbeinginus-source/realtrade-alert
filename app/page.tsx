"use client";

import { useState, useEffect } from "react";
import { REGION_CODES } from "@/lib/molit-api";
import { getConditions, saveCondition, deleteCondition, toggleCondition, type AlertCondition } from "@/lib/alert-conditions";
import KakaoAdFit from "@/components/KakaoAdFit";
import AdBanner from "@/components/AdBanner";
import { CoupangBanner } from "@/components/CoupangBanner";

const REGION_GROUPS: Record<string, string[]> = {
  "서울": Object.keys(REGION_CODES).filter((k) => k.startsWith("11")),
  "경기": Object.keys(REGION_CODES).filter((k) => k.startsWith("41")),
};

const PRICE_OPTIONS = [
  { label: "제한 없음", value: 0 },
  { label: "3억 이하", value: 30000 },
  { label: "5억 이하", value: 50000 },
  { label: "7억 이하", value: 70000 },
  { label: "10억 이하", value: 100000 },
  { label: "15억 이하", value: 150000 },
  { label: "20억 이하", value: 200000 },
];

export default function Home() {
  const [conditions, setConditions] = useState<AlertCondition[]>([]);
  const [showForm, setShowForm] = useState(false);

  // 폼 상태
  const [name, setName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minArea, setMinArea] = useState(0);
  const [notifyMethod, setNotifyMethod] = useState<"telegram" | "email">("telegram");
  const [notifyTarget, setNotifyTarget] = useState("");

  useEffect(() => {
    setConditions(getConditions());
  }, []);

  async function handleSave() {
    if (!name.trim() || selectedDistricts.length === 0) return;

    saveCondition({
      name: name.trim(),
      regionCodes: selectedDistricts,
      maxPrice: maxPrice || undefined,
      minArea: minArea || undefined,
      buildingTypes: ["아파트"],
      notifyMethod,
      notifyTarget: notifyTarget.trim(),
      active: true,
    });

    // 텔레그램 알림이 있으면 서버에도 구독 등록
    if (notifyMethod === "telegram" && notifyTarget.trim()) {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: notifyTarget.trim(),
          name: name.trim(),
          regionCodes: selectedDistricts,
          maxPrice: maxPrice || undefined,
          minArea: minArea || undefined,
        }),
      }).catch(() => {});
    }

    setConditions(getConditions());
    resetForm();
  }

  function handleDelete(id: string) {
    deleteCondition(id);
    setConditions(getConditions());
  }

  function handleToggle(id: string) {
    toggleCondition(id);
    setConditions(getConditions());
  }

  function resetForm() {
    setShowForm(false);
    setName("");
    setSelectedRegion("");
    setSelectedDistricts([]);
    setMaxPrice(0);
    setMinArea(0);
    setNotifyTarget("");
  }

  function toggleDistrict(code: string) {
    setSelectedDistricts((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
            실거래가 알림
          </h1>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            beta
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6">
        {/* 히어로 */}
        <section className="rounded-2xl bg-blue-600 p-6 text-white mb-6">
          <p className="text-sm text-blue-200 mb-1">부동산 실거래가</p>
          <h2 className="text-xl font-bold mb-2">
            관심 지역 거래가 올라오면
            <br />
            바로 알려드려요
          </h2>
          <p className="text-sm text-blue-200 leading-relaxed">
            국토부 실거래가 데이터를 매일 확인하고,
            <br />
            설정한 조건에 맞는 거래가 나타나면 알림을 보내요.
          </p>
        </section>

        {/* 알림 조건 목록 */}
        {conditions.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
              내 알림 조건 ({conditions.length}개)
            </h3>
            <div className="space-y-3">
              {conditions.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    c.active
                      ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      : "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200/50 dark:border-zinc-700/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={`text-xs px-2 py-1 rounded-lg ${
                          c.active
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {c.active ? "ON" : "OFF"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-zinc-400 hover:text-red-500 px-1"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.regionCodes.map((code) => (
                      <span key={code} className="text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded">
                        {REGION_CODES[code] || code}
                      </span>
                    ))}
                    {c.maxPrice && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        {(c.maxPrice / 10000).toFixed(0)}억 이하
                      </span>
                    )}
                    {c.minArea && (
                      <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                        {c.minArea}㎡ 이상
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 알림 추가 버튼 / 폼 */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors"
          >
            + 알림 조건 추가하기
          </button>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 space-y-5">
            <h3 className="font-bold text-base">새 알림 조건</h3>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                조건 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 강남 10억 이하 아파트"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* 지역 선택 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                지역 선택
              </label>
              <div className="flex gap-2 mb-3">
                {Object.keys(REGION_GROUPS).map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedRegion(group)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRegion === group
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
              {selectedRegion && (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                  {REGION_GROUPS[selectedRegion].map((code) => (
                    <button
                      key={code}
                      onClick={() => toggleDistrict(code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedDistricts.includes(code)
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {REGION_CODES[code]}
                    </button>
                  ))}
                </div>
              )}
              {selectedDistricts.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {selectedDistricts.length}개 지역 선택됨
                </p>
              )}
            </div>

            {/* 가격 상한 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                최대 가격
              </label>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMaxPrice(opt.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      maxPrice === opt.value
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 최소 면적 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                최소 면적 (㎡)
              </label>
              <input
                type="number"
                value={minArea || ""}
                onChange={(e) => setMinArea(Number(e.target.value))}
                placeholder="예: 59 (입력 안 하면 제한 없음)"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* 알림 방법 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                알림 방법
              </label>
              <div className="flex gap-2">
                {(["telegram", "email"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setNotifyMethod(method)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      notifyMethod === method
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {method === "telegram" ? "텔레그램" : "이메일"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={notifyTarget}
                onChange={(e) => setNotifyTarget(e.target.value)}
                placeholder={notifyMethod === "telegram" ? "텔레그램 chat ID" : "이메일 주소"}
                className="w-full mt-3 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm bg-white dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!name.trim() || selectedDistricts.length === 0}
                className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                저장하기
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 서비스 안내 */}
        <section className="mt-8 space-y-4">
          <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5">
            <h3 className="font-bold text-sm mb-3">이런 분께 추천해요</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>관심 지역 실거래가를 매일 확인하기 귀찮은 분</li>
              <li>특정 가격대 거래가 발생하면 바로 알고 싶은 분</li>
              <li>경매 입찰 전 시세 변동을 추적하고 싶은 분</li>
            </ul>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5">
            <h3 className="font-bold text-sm mb-3">가격</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">월 4,900원</span>
              <span className="text-sm text-zinc-500">알림 무제한</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              현재 베타 기간 무료 이용 가능
            </p>
          </div>
        </section>

        {/* 광고 */}
        <KakaoAdFit unit="DAN-7r7oU0EKUMSAOFS0" width={320} height={100} />
        <AdBanner />
        <CoupangBanner />

        {/* 면책 문구 */}
        <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <p className="font-semibold mb-1">안내</p>
          <p>
            본 서비스는 국토교통부 실거래가 공개시스템의 데이터를 활용하며,
            데이터의 정확성을 보장하지 않습니다. 실거래 신고 후 공개까지 시차가
            있을 수 있으며, 투자 판단의 책임은 이용자에게 있습니다.
          </p>
        </div>

        {/* 푸터 */}
        <footer className="mt-8 mb-4 text-center">
          <p className="text-xs text-zinc-400">
            데이터 출처: 국토교통부 실거래가 공개시스템
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs text-zinc-400">
            <a href="https://auction-calc.vercel.app" className="hover:text-zinc-600">경매 계산기</a>
            <a href="https://tax-calc-five.vercel.app" className="hover:text-zinc-600">세금 계산기</a>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            운영: 온기획(ON) | 이메일: js4yj@naver.com
          </p>
        </footer>
      </main>
    </div>
  );
}
