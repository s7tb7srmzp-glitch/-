// AI 해석은 "[오늘의 원형] 세계" 같은 소제목으로 나뉘어 옵니다.
// 대괄호 줄은 소제목으로, 나머지는 본문 문단으로 보여줍니다.
// 오늘 탭과 기록 탭(및 PDF 출력)이 이 렌더링을 함께 씁니다.
export function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ fontSize: 14, lineHeight: 1.75 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 10 }} />;
        const heading = /^\[(.+?)\]\s*(.*)$/.exec(trimmed);
        if (heading) {
          return (
            <div key={i} style={{ marginTop: i === 0 ? 0 : 16, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: "var(--color-accent)" }}>{heading[1]}</span>
              {heading[2] && <span style={{ fontWeight: 700, marginLeft: 6 }}>{heading[2]}</span>}
            </div>
          );
        }
        return (
          <p key={i} style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
