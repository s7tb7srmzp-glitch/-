import { useEffect, useRef, useState } from "react";
import { CardSpread, type SelectedCards } from "../components/CardSpread";
import { FormattedMessage } from "../components/FormattedMessage";
import { getCardById, type Arcana, type TarotCard } from "../data/cards";
import { generateEveningFeedback, generateMorningMessage, type EveningResult } from "../lib/generate";
import {
  EVENING_COMPARISON_TITLE,
  EVENING_NOTE_TITLE,
  OFFLINE_EVENING_NOTICE,
  OFFLINE_MORNING_NOTICE,
} from "../lib/interpret";
import {
  dismissMonthBanner,
  dismissWeekBanner,
  getEntry,
  isMonthBannerDismissed,
  isWeekBannerDismissed,
  needsMonthCardInput,
  needsWeekCardInput,
  saveEvening,
  saveMorning,
  todayString,
  type DrawnCards,
} from "../lib/storage";

const card = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 16,
  padding: 16,
  margin: "0 16px 16px",
};

export function TodayPage({ onGoToSettings }: { onGoToSettings?: () => void }) {
  const date = todayString();
  const [weekCardStale] = useState(needsWeekCardInput());
  const [monthCardStale] = useState(needsMonthCardInput());
  const [weekBannerDismissed, setWeekBannerDismissed] = useState(isWeekBannerDismissed());
  const [monthBannerDismissed, setMonthBannerDismissed] = useState(isMonthBannerDismissed());
  const showWeekNotice = weekCardStale && !weekBannerDismissed;
  const showMonthNotice = monthCardStale && !monthBannerDismissed;
  const [selected, setSelected] = useState<SelectedCards>({});
  const [morningMessage, setMorningMessage] = useState<string | null>(null);
  const [morningLoading, setMorningLoading] = useState(false);

  const [morningOffline, setMorningOffline] = useState(false);
  const [morningOfflineReason, setMorningOfflineReason] = useState<string | undefined>(undefined);

  const [actualDay, setActualDay] = useState("");
  const [satisfaction, setSatisfaction] = useState(3);
  const [evening, setEvening] = useState<EveningResult | null>(null);
  const [eveningLoading, setEveningLoading] = useState(false);
  const actualDayRef = useRef<HTMLTextAreaElement | null>(null);

  // 저녁 성찰 입력칸: 입력한 내용만큼 높이가 자동으로 늘어납니다 (최소 5줄, 최대 제한 없음).
  useEffect(() => {
    const el = actualDayRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [actualDay]);

  useEffect(() => {
    const entry = getEntry(date);
    if (entry?.morning) {
      setSelected(entry.morning.cards);
      setMorningMessage(entry.morning.message);
      // 예전 기록에는 offline 플래그가 없어 예전 방식(문구로 시작하는지)으로도 확인합니다.
      setMorningOffline(entry.morning.offline ?? entry.morning.message.startsWith(OFFLINE_MORNING_NOTICE));
      setMorningOfflineReason(entry.morning.offlineReason);
    }
    if (entry?.evening) {
      setActualDay(entry.evening.actualDay);
      setSatisfaction(entry.evening.satisfaction);
      // 예전 기록은 feedback 한 덩어리로 저장돼 있어 대조 블록에 넣어 보여줍니다.
      const comparison = entry.evening.comparison ?? entry.evening.feedback ?? "";
      const note = entry.evening.note ?? "";
      setEvening({ comparison, note, offline: !comparison && !note });
    }
  }, [date]);

  const allSelected = selected.major && selected.person && selected.minor;

  function handleCardChange(arcana: Arcana, card: TarotCard) {
    setSelected((prev) => ({ ...prev, [arcana]: card.id }));
    setMorningMessage(null);
  }

  async function handleGenerateMorning() {
    if (!allSelected) return;
    const cards: DrawnCards = { major: selected.major!, person: selected.person!, minor: selected.minor! };
    setMorningLoading(true);
    try {
      const result = await generateMorningMessage(cards);
      setMorningMessage(result.message);
      setMorningOffline(result.offline);
      setMorningOfflineReason(result.offlineReason);
      saveMorning(date, cards, result.message, result.offline, result.offlineReason);
    } finally {
      setMorningLoading(false);
    }
  }

  async function handleGenerateEvening() {
    if (!allSelected || !actualDay.trim()) return;
    const cards: DrawnCards = { major: selected.major!, person: selected.person!, minor: selected.minor! };
    setEveningLoading(true);
    try {
      const result = await generateEveningFeedback(cards, actualDay, satisfaction);
      setEvening(result);
      // AI 연결이 없어도 사용자가 쓴 성찰과 만족도는 저장합니다.
      saveEvening(date, actualDay, satisfaction, { comparison: result.comparison, note: result.note });
    } finally {
      setEveningLoading(false);
    }
  }

  function handleReset() {
    setSelected({});
    setMorningMessage(null);
    setMorningOffline(false);
    setMorningOfflineReason(undefined);
    setActualDay("");
    setSatisfaction(3);
    setEvening(null);
  }

  return (
    <div>
      <div style={{ padding: "16px 16px 0" }}>
        {morningMessage && (
          <button
            onClick={handleReset}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              fontSize: 13,
              padding: 0,
              marginBottom: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ‹ 카드 다시 선택하기
          </button>
        )}
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{date}</div>
        <h1 style={{ fontSize: 22, margin: "4px 0 0" }}>오늘의 명상</h1>
      </div>

      {(showWeekNotice || showMonthNotice) && (
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            width: "calc(100% - 32px)",
            margin: "14px 16px 0",
            borderRadius: 12,
            border: "1px solid rgba(249,231,149,0.4)",
            background: "rgba(249,231,149,0.12)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={onGoToSettings}
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              padding: "12px 14px",
              color: "var(--color-accent)",
              fontSize: 13,
              textAlign: "left",
              cursor: onGoToSettings ? "pointer" : "default",
            }}
          >
            🗓️{" "}
            {showWeekNotice && showMonthNotice
              ? "이번 주·이번 달 카드 갱신이 필요해요"
              : showWeekNotice
                ? "이번 주 카드 갱신이 필요해요"
                : "이번 달 카드 갱신이 필요해요"}{" "}
            — 설정 탭에서 확인해주세요 ›
          </button>
          <button
            onClick={() => {
              if (showWeekNotice) {
                dismissWeekBanner();
                setWeekBannerDismissed(true);
              }
              if (showMonthNotice) {
                dismissMonthBanner();
                setMonthBannerDismissed(true);
              }
            }}
            aria-label="안내 닫기"
            style={{
              background: "none",
              border: "none",
              borderLeft: "1px solid rgba(249,231,149,0.25)",
              padding: "0 14px",
              color: "var(--color-accent)",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <CardSpread selected={selected} onChange={handleCardChange} />

      <div style={{ padding: "0 16px 16px" }}>
        <button
          onClick={handleGenerateMorning}
          disabled={!allSelected || morningLoading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: allSelected ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
            color: allSelected ? "#1E2761" : "var(--color-text-muted)",
            fontWeight: 700,
            fontSize: 15,
            cursor: allSelected ? "pointer" : "not-allowed",
          }}
        >
          {morningLoading ? "해석을 만드는 중..." : "오늘의 메시지 받기"}
        </button>
      </div>

      {morningMessage && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", marginBottom: 8 }}>Step 1 · 아침 명상</div>
          {morningOffline && (
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                padding: "8px 10px",
                marginBottom: 10,
                lineHeight: 1.6,
              }}
            >
              {OFFLINE_MORNING_NOTICE}
              {morningOfflineReason && <div style={{ marginTop: 4 }}>({morningOfflineReason})</div>}
            </div>
          )}
          <FormattedMessage text={morningMessage} />
        </div>
      )}

      {morningMessage && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", marginBottom: 8 }}>Step 2 · 저녁 성찰</div>
          <textarea
            ref={actualDayRef}
            value={actualDay}
            onChange={(e) => setActualDay(e.target.value)}
            placeholder="오늘 실제로 보낸 하루를 자유롭게 기록해보세요..."
            rows={5}
            style={{
              width: "100%",
              minHeight: "8.6em", // 5줄(line-height 1.72em) 이상은 항상 유지
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 14,
              lineHeight: 1.72,
              resize: "none",
              overflow: "hidden",
              fontFamily: "inherit",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>만족도</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setSatisfaction(n)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  opacity: n <= satisfaction ? 1 : 0.3,
                }}
                aria-label={`만족도 ${n}`}
              >
                ⭐
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateEvening}
            disabled={!actualDay.trim() || eveningLoading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: actualDay.trim() ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
              color: actualDay.trim() ? "#1E2761" : "var(--color-text-muted)",
              fontWeight: 700,
              fontSize: 14,
              cursor: actualDay.trim() ? "pointer" : "not-allowed",
            }}
          >
            {eveningLoading ? "정리하는 중..." : evening ? "다시 정리하기" : "오늘 마무리하기"}
          </button>

          {evening?.offline && (
            <div
              style={{
                marginTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 12,
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "var(--color-text-muted)", marginBottom: 10 }}>
                {OFFLINE_EVENING_NOTICE}
                {evening.offlineReason && <div style={{ marginTop: 4, fontSize: 12 }}>({evening.offlineReason})</div>}
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: "var(--color-text-muted)" }}>아침 3장 · </span>
                {[selected.major, selected.person, selected.minor]
                  .map((id) => (id ? getCardById(id)?.nameKo : null))
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: "var(--color-text-muted)" }}>만족도 · </span>
                {"⭐".repeat(satisfaction)} ({satisfaction}/5)
              </div>
              <div style={{ color: "var(--color-text-muted)", marginBottom: 4 }}>내가 쓴 성찰</div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{actualDay}</p>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-text-muted)" }}>
                설정에서 API 키를 넣은 뒤 위의 "다시 정리하기"를 누르면 두 블록이 생성됩니다.
              </div>
            </div>
          )}

          {evening && !evening.offline && (
            <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
              {evening.comparison && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderLeft: "3px solid var(--color-text-muted)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 6 }}>
                    {EVENING_COMPARISON_TITLE}
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{evening.comparison}</p>
                </div>
              )}
              {evening.note && (
                <div
                  style={{
                    background: "rgba(255,214,102,0.08)",
                    borderLeft: "3px solid var(--color-accent)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent)", marginBottom: 6 }}>
                    {EVENING_NOTE_TITLE}
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{evening.note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
