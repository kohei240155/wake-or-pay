export type AlarmStatus = "scheduled" | "cancelled" | "punished" | "failed";

export interface Alarm {
  id: string;
  fireAt: number; // Unixミリ秒
  status: AlarmStatus;
  createdAt: number;
  cancelledAt?: number;
  punishedAt?: number;
  lastError?: string;
  qstashMessageId: string;
}

const STORAGE_KEY = "wakeorpay_alarm";

export function saveAlarm(alarm: Alarm): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarm));
}

export function loadAlarm(): Alarm | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Alarm;
  } catch {
    return null;
  }
}

export function clearAlarm(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
