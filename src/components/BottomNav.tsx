export type Tab = "today" | "journal" | "report" | "settings";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "today", label: "오늘", icon: "🔮" },
  { id: "journal", label: "기록", icon: "📖" },
  { id: "report", label: "리포트", icon: "📊" },
  { id: "settings", label: "설정", icon: "⚙️" },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 10, // 카드 피커 등 모달(zIndex 50)보다 항상 아래에 있어야 합니다
        display: "flex",
        justifyContent: "space-around",
        background: "rgba(16,20,58,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
        backdropFilter: "blur(10px)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "6px 14px",
              color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
