import { getCardById } from "../data/cards";
import { getAllEntries } from "../lib/storage";

export function JournalPage() {
  const entries = getAllEntries().slice().reverse();

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 16px" }}>나의 기록</h1>

      {entries.length === 0 && (
        <div style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "40px 0" }}>
          아직 기록이 없어요. 오늘 탭에서 첫 명상을 시작해보세요.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.map((entry) => {
          const major = entry.morning ? getCardById(entry.morning.cards.major) : undefined;
          const person = entry.morning ? getCardById(entry.morning.cards.person) : undefined;
          const minor = entry.morning ? getCardById(entry.morning.cards.minor) : undefined;
          return (
            <div key={entry.date} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{entry.date}</span>
                {entry.evening && <span style={{ fontSize: 13 }}>{"⭐".repeat(entry.evening.satisfaction)}</span>}
              </div>
              {major && person && minor && (
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "6px 0" }}>
                  {major.nameKo} · {person.nameKo} · {minor.nameKo}
                </div>
              )}
              {entry.morning && (
                <p style={{ margin: "6px 0", fontSize: 13, lineHeight: 1.6 }}>{entry.morning.message}</p>
              )}
              {entry.evening && (entry.evening.comparison ?? entry.evening.feedback) && (
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--color-primary)" }}>
                  {entry.evening.comparison ?? entry.evening.feedback}
                </p>
              )}
              {entry.evening?.note && (
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.6, color: "var(--color-accent)" }}>
                  {entry.evening.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
