/**
 * 구독자 관리 (MVP: JSON 파일 기반)
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export interface Subscriber {
  chatId: string;
  name: string;
  regionCodes: string[];
  minPrice?: number;
  maxPrice?: number;      // 만원 단위
  minArea?: number;       // ㎡
  maxArea?: number;
  active: boolean;
}

const DATA_PATH = join(process.cwd(), "data", "subscribers.json");

export function getSubscribers(): Subscriber[] {
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Subscriber[];
  } catch {
    return [];
  }
}

export function getActiveSubscribers(): Subscriber[] {
  return getSubscribers().filter((s) => s.active);
}

export function addSubscriber(sub: Subscriber): void {
  const subs = getSubscribers();
  // 같은 chatId + name 중복 방지
  const idx = subs.findIndex(
    (s) => s.chatId === sub.chatId && s.name === sub.name
  );
  if (idx !== -1) {
    subs[idx] = sub;
  } else {
    subs.push(sub);
  }
  writeFileSync(DATA_PATH, JSON.stringify(subs, null, 2), "utf-8");
}

export function removeSubscriber(chatId: string, name: string): boolean {
  const subs = getSubscribers();
  const filtered = subs.filter(
    (s) => !(s.chatId === chatId && s.name === name)
  );
  if (filtered.length === subs.length) return false;
  writeFileSync(DATA_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
