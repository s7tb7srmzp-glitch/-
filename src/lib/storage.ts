// 서버 없이 브라우저 로컬 저장소에만 데이터를 저장합니다 (개인정보 보호).

import {
  DEFAULT_MONTH_CARD_ID,
  DEFAULT_PERSONALITY_CARD_ID,
  DEFAULT_WEEK_CARD_ID,
  DEFAULT_YEAR_CARD_ID,
} from "../data/energyContext";

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
const PERSONALITY_CARD_KEY = "daily-tarot:layer-personality";
const YEAR_CARD_KEY = "daily-tarot:layer-year";
const WEEK_CARD_KEY = "daily-tarot:layer-week";
const MONTH_CARD_KEY = "daily-tarot:month-card"; // 기존 키 이름 유지 (이미 저장된 값과 호환)

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

export interface BackupData {
  version: 1;
  exportedAt: string;
  entries: DailyEntry[];
}

export function buildBackup(): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: getAllEntries(),
  };
}

// 백업 파일 형식을 검증하고 기록 배열을 반환합니다. 형식이 올바르지 않으면 에러를 던집니다.
export function parseBackup(json: string): DailyEntry[] {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("JSON 파일을 읽을 수 없어요.");
  }
  const entries = (data as { entries?: unknown })?.entries;
  if (!Array.isArray(entries)) {
    throw new Error("올바른 백업 파일이 아니에요.");
  }
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || typeof (entry as DailyEntry).date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test((entry as DailyEntry).date)) {
      throw new Error("올바른 백업 파일이 아니에요.");
    }
  }
  return entries as DailyEntry[];
}

// 병합: 겹치지 않는 기존 날짜는 유지하고, 겹치는 날짜는 가져온 기록으로 교체합니다.
export function importEntriesMerge(importedEntries: DailyEntry[]): number {
  const entries = loadEntries();
  for (const entry of importedEntries) {
    entries[entry.date] = entry;
  }
  saveEntries(entries);
  return importedEntries.length;
}

// 전체 교체: 기존 기록을 모두 지우고 가져온 기록으로 완전히 대체합니다.
export function importEntriesOverwrite(importedEntries: DailyEntry[]): number {
  const entries: Record<string, DailyEntry> = {};
  for (const entry of importedEntries) {
    entries[entry.date] = entry;
  }
  saveEntries(entries);
  return importedEntries.length;
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

export function currentYearMonth(): string {
  return todayString().slice(0, 7); // YYYY-MM
}

// ISO 8601 주차 키 (예: "2026-W30"). 월~일을 한 주로 봅니다.
export function currentWeekKey(): string {
  const [y, m, d] = todayString().split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = date.getUTCDay() || 7; // 월=1 ... 일=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// 층위 카드: 성격·영혼 / 올해 / 이번 주 / 이번 달 — 서로 독립된 4개 슬롯입니다.
// 성격·영혼·올해는 만료 개념이 없고, 이번 주·이번 달은 주/달이 바뀌면 재입력을 안내합니다(자동 삭제하지 않음).

export interface WeekCardRecord {
  weekKey: string; // 이 카드를 설정한 주 (예: "2026-W30")
  cardId: string;
}

export interface MonthCardRecord {
  yearMonth: string; // YYYY-MM, 이 카드를 설정한 달
  cardId: string;
}

export function getPersonalityCard(): string {
  return localStorage.getItem(PERSONALITY_CARD_KEY) ?? DEFAULT_PERSONALITY_CARD_ID;
}

export function setPersonalityCard(cardId: string): void {
  localStorage.setItem(PERSONALITY_CARD_KEY, cardId);
}

export function getYearCard(): string {
  return localStorage.getItem(YEAR_CARD_KEY) ?? DEFAULT_YEAR_CARD_ID;
}

export function setYearCard(cardId: string): void {
  localStorage.setItem(YEAR_CARD_KEY, cardId);
}

function getWeekCardRecord(): WeekCardRecord | null {
  try {
    const raw = localStorage.getItem(WEEK_CARD_KEY);
    return raw ? (JSON.parse(raw) as WeekCardRecord) : null;
  } catch {
    return null;
  }
}

// 매주 첫날, 사용자가 그 주의 카드를 직접 뽑아 입력합니다 (설정 탭에서).
export function setWeekCard(cardId: string): void {
  localStorage.setItem(WEEK_CARD_KEY, JSON.stringify({ weekKey: currentWeekKey(), cardId }));
}

export function getWeekCard(): WeekCardRecord {
  return getWeekCardRecord() ?? { weekKey: currentWeekKey(), cardId: DEFAULT_WEEK_CARD_ID };
}

// 이번 주 카드가 아직 입력되지 않았거나, 지난주 카드가 그대로 남아있으면 true.
export function needsWeekCardInput(): boolean {
  const record = getWeekCardRecord();
  return !record || record.weekKey !== currentWeekKey();
}

function getMonthCardRecord(): MonthCardRecord | null {
  try {
    const raw = localStorage.getItem(MONTH_CARD_KEY);
    return raw ? (JSON.parse(raw) as MonthCardRecord) : null;
  } catch {
    return null;
  }
}

// 매달 1일, 사용자가 그달의 운세 카드를 직접 뽑아 입력합니다 (설정 탭에서).
export function setMonthCard(cardId: string): void {
  localStorage.setItem(MONTH_CARD_KEY, JSON.stringify({ yearMonth: currentYearMonth(), cardId }));
}

export function getMonthCard(): MonthCardRecord {
  return getMonthCardRecord() ?? { yearMonth: currentYearMonth(), cardId: DEFAULT_MONTH_CARD_ID };
}

// 이번 달 카드가 아직 입력되지 않았거나, 지난달 카드가 그대로 남아있으면 true.
export function needsMonthCardInput(): boolean {
  const record = getMonthCardRecord();
  return !record || record.yearMonth !== currentYearMonth();
}

export interface LayerCards {
  personality: string;
  year: string;
  week: WeekCardRecord;
  month: MonthCardRecord;
}

export function getLayerCards(): LayerCards {
  return {
    personality: getPersonalityCard(),
    year: getYearCard(),
    week: getWeekCard(),
    month: getMonthCard(),
  };
}
