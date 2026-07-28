import { useState } from "react";
import { EntryDetail } from "../components/EntryDetail";
import { PrintPortal } from "../components/PrintPortal";
import { getCardById } from "../data/cards";
import { printAfterImagesLoad } from "../lib/print";
import { getAllEntries, type DailyEntry } from "../lib/storage";

const exportButtonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
} as const;

export function JournalPage() {
  const entries = getAllEntries().slice().reverse();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [printEntries, setPrintEntries] = useState<DailyEntry[] | null>(null);

  async function handlePrint(toPrint: DailyEntry[]) {
    setPrintEntries(toPrint);
    await printAfterImagesLoad();
  }

  const selected = selectedDate ? entries.find((e) => e.date === selectedDate) : undefined;

  if (selected) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button
            onClick={() => setSelectedDate(null)}
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: 14, cursor: "pointer", padding: 0 }}
          >
            ‹ 목록으로
          </button>
          <button onClick={() => handlePrint([selected])} style={exportButtonStyle}>
            이 날 PDF로 내보내기
          </button>
        </div>
        <EntryDetail entry={selected} />
        {printEntries && (
          <PrintPortal>
            {printEntries.map((entry) => (
              <EntryDetail key={entry.date} entry={entry} />
            ))}
          </PrintPortal>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>나의 기록</h1>
        {entries.length > 0 && (
          <button onClick={() => handlePrint(entries)} style={exportButtonStyle}>
            전체 기록 PDF로 내보내기
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <div style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "40px 0" }}>
          아직 기록이 없어요. 오늘 탭에서 첫 명상을 시작해보세요.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((entry) => {
          const major = entry.morning ? getCardById(entry.morning.cards.major) : undefined;
          const person = entry.morning ? getCardById(entry.morning.cards.person) : undefined;
          const minor = entry.morning ? getCardById(entry.morning.cards.minor) : undefined;
          return (
            <button
              key={entry.date}
              onClick={() => setSelectedDate(entry.date)}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: "12px 14px",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{entry.date}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {entry.evening && <span style={{ fontSize: 12 }}>{"⭐".repeat(entry.evening.satisfaction)}</span>}
                  <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>›</span>
                </div>
              </div>
              {major && person && minor && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    margin: "4px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {major.nameKo} · {person.nameKo} · {minor.nameKo}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {printEntries && (
        <PrintPortal>
          {printEntries.map((entry, i) => (
            <div key={entry.date} className={i < printEntries.length - 1 ? "print-page-break" : undefined}>
              <EntryDetail entry={entry} />
            </div>
          ))}
        </PrintPortal>
      )}
    </div>
  );
}
