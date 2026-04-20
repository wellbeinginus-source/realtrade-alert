import { kv } from "@vercel/kv";

export interface Subscriber {
  chatId: string;
  name: string;
  regionCodes: string[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  active: boolean;
}

const KV_KEY = "subscribers";

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await kv.get<Subscriber[]>(KV_KEY);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const subs = await getSubscribers();
  return subs.filter((s) => s.active);
}

export async function addSubscriber(sub: Subscriber): Promise<void> {
  const subs = await getSubscribers();
  const idx = subs.findIndex(
    (s) => s.chatId === sub.chatId && s.name === sub.name
  );
  if (idx !== -1) {
    subs[idx] = sub;
  } else {
    subs.push(sub);
  }
  await kv.set(KV_KEY, subs);
}

export async function removeSubscriber(chatId: string, name: string): Promise<boolean> {
  const subs = await getSubscribers();
  const filtered = subs.filter(
    (s) => !(s.chatId === chatId && s.name === name)
  );
  if (filtered.length === subs.length) return false;
  await kv.set(KV_KEY, filtered);
  return true;
}
