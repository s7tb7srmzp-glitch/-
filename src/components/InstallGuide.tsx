const STEPS_IOS = [
  "Safari에서 앱 주소로 접속합니다.",
  "하단 공유 버튼(⬆️)을 탭합니다.",
  "'홈 화면에 추가'를 선택합니다.",
  "이름을 확인하고 '추가'를 누르면 완료!",
];

const STEPS_ANDROID = [
  "Chrome에서 앱 주소로 접속합니다.",
  "오른쪽 상단 메뉴(⋮)를 탭합니다.",
  "'홈 화면에 추가' 또는 '앱 설치'를 선택합니다.",
  "'설치'를 누르면 완료!",
];

function StepList({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{title}</div>
      <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map((step, i) => (
          <li key={i} style={{ fontSize: 13, lineHeight: 1.6 }}>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function InstallGuide() {
  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 14px" }}>
        홈 화면에 추가하면 주소창 없는 '전용 앱 모드'로 실행되어 실제 앱과 동일한 사용자 경험을 제공합니다.
      </p>
      <StepList title="🍎 iPhone (Safari)" steps={STEPS_IOS} />
      <StepList title="🤖 Android (Chrome)" steps={STEPS_ANDROID} />
    </div>
  );
}
