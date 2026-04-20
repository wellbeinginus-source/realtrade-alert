/**
 * 알림 조건 & 구독 관리 (localStorage MVP → 추후 DB)
 */

export interface AlertCondition {
  id: string;
  name: string;                    // 사용자 지정 이름 (예: "강남 10억 이하")
  regionCodes: string[];           // 지역코드 목록
  minPrice?: number;               // 최소 금액 (만원)
  maxPrice?: number;               // 최대 금액 (만원)
  minArea?: number;                // 최소 면적 (㎡)
  maxArea?: number;                // 최대 면적 (㎡)
  buildingTypes: string[];         // 건물 유형 (아파트, 오피스텔 등)
  notifyMethod: "telegram" | "email" | "kakao";
  notifyTarget: string;            // 텔레그램 chat_id 또는 이메일
  active: boolean;
  createdAt: number;
}

const STORAGE_KEY = "realtrade_conditions";

export function getConditions(): AlertCondition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCondition(condition: Omit<AlertCondition, "id" | "createdAt">): AlertCondition {
  const conditions = getConditions();
  const newCondition: AlertCondition = {
    ...condition,
    id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };
  conditions.push(newCondition);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
  return newCondition;
}

export function deleteCondition(id: string): void {
  const conditions = getConditions().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
}

export function toggleCondition(id: string): void {
  const conditions = getConditions();
  const idx = conditions.findIndex((c) => c.id === id);
  if (idx !== -1) {
    conditions[idx].active = !conditions[idx].active;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
  }
}
