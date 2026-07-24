import { useEffect, useState } from "react";
import { CardSpread, type SelectedCards } from "../components/CardSpread";
import type { Arcana, TarotCard } from "../data/cards";
import { generateEveningFeedback, generateMorningMessage } from "../lib/generate";
import { getEntry, saveEvening, saveMorning, todayString, type DrawnCards } from "../lib/storage";

const card = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 16,
  padding: 16,
  margin: "0 16px 16px",
};

export function TodayPage() {
  const date = todayString();
  const [selected, setSelected] = useState<SelectedCards>({});
  const [morningMessage, setMorningMessage] = useState<string | null>(null);
  const [morningLoading, setMorningLoading] = useState(false);

  const [actualDay, setActualDay] = useState("");
  const [satisfaction, setSatisfaction] = useState(3);
  const [eveningFeedback, setEveningFeedback] = useState<string | null>(null);
  const [eveningLoading, setEveningLoading] = useState(false);

  useEffect(() => {
    const entry = getEntry(date);
    if (entry?.morning) {
      setSelected(entry.morning.cards);
      setMorningMessage(entry.morning.message);
    }
    if (entry?.evening) {
      setActualDay(entry.evening.actualDay);
      setSatisfaction(entry.evening.satisfaction);
      setEveningFeedback(entry.evening.feedback);
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
      const message = await generateMorningMessage(cards);
      setMorningMessage(message);
      saveMorning(date, cards, message);
    } finally {
      setMorningLoading(false);
    }
  }

  async function handleGenerateEvening() {
    if (!morningMessage || !actualDay.trim()) return;
    setEveningLoading(true);
    try {
      const feedback = await generateEveningFeedback(morningMessage, actualDay, satisfaction);
      setEveningFeedback(feedback);
      saveEvening(date, actualDay, satisfaction, feedback);
    } finally {
      setEveningLoading(false);
    }
  }

  function handleReset() {
    setSelected({});
    setMorningMessage(null);
    setActualDay("");
    setSatisfaction(3);
    setEveningFeedback(null);
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
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14 }}>{morningMessage}</p>
        </div>
      )}

      {morningMessage && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", marginBottom: 8 }}>Step 2 · 저녁 성찰</div>
          <textarea
            value={actualDay}
            onChange={(e) => setActualDay(e.target.value)}
            placeholder="오늘 실제로 보낸 하루를 자유롭게 기록해보세요..."
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 14,
              resize: "vertical",
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
            {eveningLoading ? "정리하는 중..." : "오늘 마무리하기"}
          </button>

          {eveningFeedback && (
            <p style={{ marginTop: 14, lineHeight: 1.7, fontSize: 14, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
              {eveningFeedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
