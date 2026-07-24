import { useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { PasscodeGate } from "./components/PasscodeGate";
import { TodayPage } from "./pages/TodayPage";
import { JournalPage } from "./pages/JournalPage";
import { ReportPage } from "./pages/ReportPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <PasscodeGate>
      <main style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {tab === "today" && <TodayPage />}
        {tab === "journal" && <JournalPage />}
        {tab === "report" && <ReportPage />}
        {tab === "settings" && <SettingsPage />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </PasscodeGate>
  );
}
