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
      <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <LayerCardStrip key={layerCardsVersion} />
      </div>
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {tab === "today" && <TodayPage onGoToSettings={() => setTab("settings")} />}
        {tab === "journal" && <JournalPage />}
        {tab === "report" && <ReportPage />}
        {tab === "settings" && <SettingsPage onLayerCardsChanged={() => setLayerCardsVersion((v) => v + 1)} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </PasscodeGate>
  );
}
