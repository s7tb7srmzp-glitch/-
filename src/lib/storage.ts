// 서버 없이 브라우저 로컬 저장소에만 데이터를 저장합니다 (개인정보 보호).

export interface DrawnCards {
  major: string; // card id
  person: string;
  minor: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  morning?: {
    cards: DrawnCards;
    message: string;
    createdAt: string;
  };
  evening?: {
    actualDay: string;
    satisfaction: number; // 1-5
    feedback: string;
    createdAt: string;
  };
}

const ENTRIES_KEY = "daily-tarot:entries";
const API_KEY_KEY = "daily-tarot:api-key";
const UNLOCK_KEY = "daily-tarot:unlocked";

function loadEntries(): Record<string, DailyEntry> {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DailyEntry>) : {};
  } catch {
    return {};
  }
}

function saveEntries(entries: Record<string, DailyEntry>): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getEntry(date: string): DailyEntry | undefined {
  return loadEntries()[date];
}

export function getAllEntries(): DailyEntry[] {
  return Object.values(loadEntries()).sort((a, b) => a.date.localeCompare(b.date));
}

export function saveMorning(date: string, cards: DrawnCards, message: string): void {
  const entries = loadEntries();
  entries[date] = {
    ...entries[date],
    date,
    morning: { cards, message, createdAt: new Date().toISOString() },
  };
  saveEntries(entries);
}

export function saveEvening(date: string, actualDay: string, satisfaction: number, feedback: string): void {
  const entries = loadEntries();
  entries[date] = {
    ...entries[date],
    date,
    evening: { actualDay, satisfaction, feedback, createdAt: new Date().toISOString() },
  };
  saveEntries(entries);
}

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) ?? "";
}

export function setApiKey(key: string): void {
  if (key) localStorage.setItem(API_KEY_KEY, key);
  else localStorage.removeItem(API_KEY_KEY);
}

export function isUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === "true";
}

export function setUnlocked(): void {
  localStorage.setItem(UNLOCK_KEY, "true");
}

export function todayString(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}
