import { useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { LayerCardStrip } from "./components/LayerCardStrip";
import { PasscodeGate } from "./components/PasscodeGate";
import { TodayPage } from "./pages/TodayPage";
import { JournalPage } from "./pages/JournalPage";
import { ReportPage } from "./pages/ReportPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [layerCardsVersion, setLayerCardsVersion] = useState(0);

  return (
    <PasscodeGate>
      {/* 상단 고정 영역: safe-area(상태바) + 층위 카드 띠. 스크롤에 딸려가지 않도록 sticky +
          불투명 배경을 둬서, 본문이 스크롤돼도 상태바 아래로 글자가 비쳐 보이지 않게 합니다. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          flexShrink: 0,
          paddingTop: "env(safe-area-inset-top)",
          background: "var(--color-bg)",
        }}
      >
        <LayerCardStrip key={layerCardsVersion} />
      </div>
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 24 }}>
        {tab === "today" && <TodayPage onGoToSettings={() => setTab("settings")} />}
        {tab === "journal" && <JournalPage />}
        {tab === "report" && <ReportPage />}
        {tab === "settings" && <SettingsPage onLayerCardsChanged={() => setLayerCardsVersion((v) => v + 1)} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </PasscodeGate>
  );
}
