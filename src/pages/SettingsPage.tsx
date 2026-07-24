import { useState } from "react";
import { CardPicker } from "../components/CardPicker";
import { InstallGuide } from "../components/InstallGuide";
import { ALL_CARDS, getCardById, type TarotCard } from "../data/cards";
import { ENERGY_CONTEXT, SECONDARY_MONTH_CARD_ID, TODAY_CARDS_WEIGHT } from "../data/energyContext";
import { getActiveMonthCard, getApiKey, needsMonthCardInput, setApiKey, setMonthCard } from "../lib/storage";

export function SettingsPage() {
  const [key, setKey] = useState(getApiKey());
  const [saved, setSaved] = useState(false);
  const [monthCardRecord, setMonthCardRecord] = useState(getActiveMonthCard());
  const [monthCardStale, setMonthCardStale] = useState(needsMonthCardInput());
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSave() {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleSelectMonthCard(card: TarotCard) {
    setMonthCard(card.id);
    setMonthCardRecord(getActiveMonthCard());
    setMonthCardStale(needsMonthCardInput());
    setPickerOpen(false);
  }

  const star = getCardById(SECONDARY_MONTH_CARD_ID);
  const monthCard = getCardById(monthCardRecord.cardId);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 16px" }}>설정</h1>

      <div
        style={{
          background: monthCardStale ? "rgba(249,231,149,0.12)" : "rgba(255,255,255,0.05)",
          border: monthCardStale ? "1px solid rgba(249,231,149,0.4)" : "1px solid transparent",
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>이번 달의 카드</div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>
          매달 1일, 그달의 운세 카드를 직접 뽑아 여기에 입력해두면 매일 아침 해석에 함께 반영돼요.
        </p>
        {monthCardStale && (
          <div style={{ fontSize: 12, color: "var(--color-accent)", marginBottom: 10 }}>
            ⚠️ {monthCardRecord.yearMonth}월 카드가 아직 입력되지 않았어요 (마지막 설정: {monthCard?.nameKo ?? "없음"}).
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>
            {monthCard?.nameKo} <span style={{ color: "var(--color-text-muted)", fontSize: 11 }}>({monthCardRecord.yearMonth})</span>
          </span>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "none",
            background: "var(--color-accent)",
            color: "#1E2761",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {monthCardStale ? "이번 달 카드 설정하기" : "이번 달 카드 변경하기"}
        </button>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Claude API 키 (선택)</div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>
          입력하지 않아도 앱은 내장된 해석 엔진으로 정상 동작합니다. API 키는 이 기기의 로컬 저장소에만 저장되며 서버로
          전송되지 않습니다.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 13,
            marginBottom: 10,
          }}
        />
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "none",
            background: "var(--color-accent)",
            color: "#1E2761",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {saved ? "저장됨 ✓" : "저장"}
        </button>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>나의 고정 에너지 컨텍스트</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ENERGY_CONTEXT.map((item, index) => {
            const c = index === 2 ? monthCard : getCardById(item.cardId);
            return (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--color-text-muted)" }}>{item.label}</span>
                <span>
                  {c?.nameKo} · {item.weight}%
                </span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--color-text-muted)" }}>(보조) 영적 희망</span>
            <span>{star?.nameKo}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--color-text-muted)" }}>오늘의 카드 3장</span>
            <span>{TODAY_CARDS_WEIGHT}%</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>홈 화면에 추가하기</h2>
      <InstallGuide />

      {pickerOpen && (
        <CardPicker
          cards={ALL_CARDS}
          title="이번 달의 카드 선택"
          question="이번 달, 나와 함께하는 에너지는?"
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelectMonthCard}
        />
      )}
    </div>
  );
}
