import { CardVisual } from "./CardVisual";
import { FormattedMessage } from "./FormattedMessage";
import { getCardById } from "../data/cards";
import { SPREAD_ORDER, SPREAD_POSITIONS } from "../data/spreadMeaning";
import { EVENING_COMPARISON_TITLE, EVENING_NOTE_TITLE, OFFLINE_EVENING_NOTICE, OFFLINE_MORNING_NOTICE } from "../lib/interpret";
import type { DailyEntry } from "../lib/storage";

const sectionStyle = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,
};

// 하루 기록 전체를 읽기 전용으로 보여줍니다. 기록 탭의 상세 화면과 PDF
// 인쇄본이 이 컴포넌트를 함께 씁니다.
export function EntryDetail({ entry }: { entry: DailyEntry }) {
  const cards = entry.morning?.cards;
  const comparison = entry.evening?.comparison ?? entry.evening?.feedback ?? "";
  const note = entry.evening?.note ?? "";
  const eveningOffline = entry.evening ? !comparison && !note : false;

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 14 }}>{entry.date}</div>

      {cards && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          {SPREAD_ORDER.map((arcana) => {
            const card = getCardById(cards[arcana]);
            const pos = SPREAD_POSITIONS[arcana];
            if (!card) return null;
            return (
              <div key={arcana} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", textAlign: "center" }}>
                  {pos.order}. {pos.title}
                </div>
                <CardVisual card={card} size="md" />
                <div style={{ fontSize: 12, fontWeight: 600, textAlign: "center" }}>{card.nameKo}</div>
              </div>
            );
          })}
        </div>
      )}

      {entry.morning && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", marginBottom: 8 }}>Step 1 · 아침 명상</div>
          {entry.morning.offline && (
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
              {entry.morning.offlineReason && <div style={{ marginTop: 4 }}>({entry.morning.offlineReason})</div>}
            </div>
          )}
          <FormattedMessage text={entry.morning.message} />
        </div>
      )}

      {entry.evening && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)", marginBottom: 8 }}>Step 2 · 저녁 성찰</div>

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>만족도 · </span>
            <span style={{ fontSize: 13 }}>
              {"⭐".repeat(entry.evening.satisfaction)} ({entry.evening.satisfaction}/5)
            </span>
          </div>

          <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>내가 쓴 성찰</div>
          <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{entry.evening.actualDay}</p>

          {eveningOffline ? (
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10 }}>
              {OFFLINE_EVENING_NOTICE}
            </div>
          ) : (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
              {comparison && (
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
                  <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{comparison}</p>
                </div>
              )}
              {note && (
                <div
                  style={{
                    background: "rgba(255,214,102,0.08)",
                    borderLeft: "3px solid var(--color-accent)",
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent)", marginBottom: 6 }}>{EVENING_NOTE_TITLE}</div>
                  <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
