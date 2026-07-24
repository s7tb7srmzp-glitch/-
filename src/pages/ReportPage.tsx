import { useMemo } from "react";
import { getCardById } from "../data/cards";
import { getAllEntries } from "../lib/storage";

function weekOfMonth(dateStr: string): number {
  const date = new Date(dateStr);
  return Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
}

export function ReportPage() {
  const now = useMemo(() => new Date(), []);
  const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  const monthEntries = useMemo(
    () =>
      getAllEntries().filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }),
    [now],
  );

  const weekBuckets = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const entry of monthEntries) {
      if (!entry.morning) continue;
      const week = weekOfMonth(entry.date);
      buckets[week] = (buckets[week] ?? 0) + 1;
    }
    return buckets;
  }, [monthEntries]);

  const majorFrequency = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of monthEntries) {
      if (!entry.morning) continue;
      const card = getCardById(entry.morning.cards.major);
      if (!card) continue;
      counts.set(card.nameKo, (counts.get(card.nameKo) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [monthEntries]);

  const avgSatisfaction = useMemo(() => {
    const withEvening = monthEntries.filter((e) => e.evening);
    if (withEvening.length === 0) return null;
    const sum = withEvening.reduce((acc, e) => acc + (e.evening?.satisfaction ?? 0), 0);
    return sum / withEvening.length;
  }, [monthEntries]);

  const maxWeekCount = Math.max(1, ...Object.values(weekBuckets));
  const maxMajorCount = Math.max(1, ...majorFrequency.map(([, c]) => c));

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>월간 분석 보고서</h1>
      <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>{monthLabel}</div>

      {monthEntries.length === 0 ? (
        <div style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "40px 0" }}>
          이번 달 기록이 아직 없어요. 매일 아침 명상을 기록하면 이곳에서 흐름을 볼 수 있어요.
        </div>
      ) : (
        <>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>주차별 명상 횟수</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 90 }}>
              {[1, 2, 3, 4, 5].map((week) => {
                const count = weekBuckets[week] ?? 0;
                const height = count === 0 ? 4 : Math.max(8, (count / maxWeekCount) * 80);
                return (
                  <div key={week} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        height,
                        borderRadius: 6,
                        background: count > 0 ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
                      }}
                    />
                    <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{week}주차</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>메이저 아르카나 출현 빈도</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {majorFrequency.map(([name, count]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, width: 90, flexShrink: 0 }}>{name}</span>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 10 }}>
                    <div
                      style={{
                        width: `${(count / maxMajorCount) * 100}%`,
                        background: "var(--color-primary)",
                        height: "100%",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {avgSatisfaction !== null && (
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>평균 만족도</div>
              <div style={{ fontSize: 24 }}>{"⭐".repeat(Math.round(avgSatisfaction))}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{avgSatisfaction.toFixed(1)} / 5.0</div>
            </div>
          )}

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, lineHeight: 1.7, fontSize: 13 }}>
            한 달 동안 나타난 주요 아르카나의 빈도와 감정적 만족도를 통해, 펜타클 10이 상징하는 안정적인 기운이 이번 달 일상에
            어떻게 투영되었는지 살펴보세요. {majorFrequency[0] && `이번 달 가장 자주 함께한 원형은 ${majorFrequency[0][0]}였어요.`}
          </div>
        </>
      )}
    </div>
  );
}
