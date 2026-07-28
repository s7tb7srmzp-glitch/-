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
      {/* -webkit-overflow-scrolling:touch을 일부러 넣지 않습니다. 이 속성은 스크롤
          영역을 별도 컴포지팅 레이어로 분리하는데, iOS WebKit에서 그 레이어의
          스크롤 가능 범위가 생성 시점 크기로 굳어버리는 버그가 있습니다. 그래서
          "오늘의 메시지 받기"로 본문이 늘어나도 스크롤이 안 되다가, 앱을
          백그라운드로 보냈다 돌아오면(강제 리레이아웃) 그제서야 풀렸습니다.
          최신 iOS(13+)는 이 속성 없이도 overflow:auto에 네이티브 모멘텀
          스크롤을 지원하므로 빼는 것이 올바른 수정입니다. */}
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 24 }}>
        {tab === "today" && <TodayPage onGoToSettings={() => setTab("settings")} />}
        {tab === "journal" && <JournalPage />}
        {tab === "report" && <ReportPage />}
        {tab === "settings" && <SettingsPage onLayerCardsChanged={() => setLayerCardsVersion((v) => v + 1)} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </PasscodeGate>
  );
}
