import { useRef, useState } from "react";
import { CardPicker } from "../components/CardPicker";
import { InstallGuide } from "../components/InstallGuide";
import { ALL_CARDS, getCardById, type TarotCard } from "../data/cards";
import {
  AI_MODEL_LABEL,
  buildBackup,
  getAiModel,
  getMonthCard,
  getPersonalityCard,
  getWeekCard,
  getYearCard,
  getApiKey,
  setAiModel,
  type AiModel,
  importEntriesMerge,
  importEntriesOverwrite,
  needsMonthCardInput,
  needsWeekCardInput,
  parseBackup,
  setApiKey,
  setMonthCard,
  setPersonalityCard,
  setWeekCard,
  setYearCard,
  todayString,
  type DailyEntry,
} from "../lib/storage";

type LayerSlot = "personality" | "year" | "week" | "month";

const SLOT_META: Record<LayerSlot, { label: string; pickerTitle: string; question: string }> = {
  personality: { label: "성격·영혼", pickerTitle: "성격·영혼 카드 선택", question: "나의 본연의 의지와 영혼을 나타내는 카드는?" },
  year: { label: "올해", pickerTitle: "올해의 카드 선택", question: "올 한 해를 관통하는 카드는?" },
  week: { label: "이번 주", pickerTitle: "이번 주의 카드 선택", question: "이번 주, 나와 함께하는 에너지는?" },
  month: { label: "이번 달", pickerTitle: "이번 달의 카드 선택", question: "이번 달, 나와 함께하는 에너지는?" },
};

export function SettingsPage({ onLayerCardsChanged }: { onLayerCardsChanged?: () => void }) {
  const [key, setKey] = useState(getApiKey());
  const [saved, setSaved] = useState(false);
  const [model, setModelState] = useState<AiModel>(getAiModel());

  const [personality, setPersonalityState] = useState(getPersonalityCard());
  const [year, setYearState] = useState(getYearCard());
  const [week, setWeekState] = useState(getWeekCard());
  const [month, setMonthState] = useState(getMonthCard());
  const [weekStale, setWeekStale] = useState(needsWeekCardInput());
  const [monthStale, setMonthStale] = useState(needsMonthCardInput());
  const [pickerSlot, setPickerSlot] = useState<LayerSlot | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<DailyEntry[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  function handleSave() {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleSelectLayerCard(card: TarotCard) {
    if (pickerSlot === "personality") {
      setPersonalityCard(card.id);
      setPersonalityState(card.id);
    } else if (pickerSlot === "year") {
      setYearCard(card.id);
      setYearState(card.id);
    } else if (pickerSlot === "week") {
      setWeekCard(card.id);
      setWeekState(getWeekCard());
      setWeekStale(needsWeekCardInput());
    } else if (pickerSlot === "month") {
      setMonthCard(card.id);
      setMonthState(getMonthCard());
      setMonthStale(needsMonthCardInput());
    }
    setPickerSlot(null);
    onLayerCardsChanged?.();
  }

  function handleExport() {
    const backup = buildBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-tarot-backup-${todayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportMessage(null);
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const entries = parseBackup(String(reader.result));
        setPendingImport(entries);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "파일을 읽을 수 없어요.");
      }
    };
    reader.onerror = () => setImportError("파일을 읽을 수 없어요.");
    reader.readAsText(file);
  }

  function handleConfirmImport(mode: "merge" | "overwrite") {
    if (!pendingImport) return;
    const count = mode === "merge" ? importEntriesMerge(pendingImport) : importEntriesOverwrite(pendingImport);
    setPendingImport(null);
    setImportMessage(`${count}개의 기록을 ${mode === "merge" ? "병합" : "전체 교체"}했어요.`);
  }

  const slots: Array<{ key: LayerSlot; cardId: string; stale: boolean }> = [
    { key: "personality", cardId: personality, stale: false },
    { key: "year", cardId: year, stale: false },
    { key: "week", cardId: week.cardId, stale: weekStale },
    { key: "month", cardId: month.cardId, stale: monthStale },
  ];

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, margin: "0 0 16px" }}>설정</h1>

      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>층위 카드</div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
          성격·영혼과 올해의 카드는 한 번 정하면 계속 유지돼요. 이번 주·이번 달 카드는 주/달이 바뀌면 갱신 안내가
          뜨지만 자동으로 지워지지는 않아요.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {slots.map((slot) => {
            const meta = SLOT_META[slot.key];
            const c = getCardById(slot.cardId);
            return (
              <div
                key={slot.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: slot.stale ? "rgba(249,231,149,0.1)" : "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                    {meta.label}
                    {slot.stale && <span style={{ color: "var(--color-accent)" }}> · 갱신 필요</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c?.nameKo}
                  </div>
                </div>
                <button
                  onClick={() => setPickerSlot(slot.key)}
                  style={{
                    flexShrink: 0,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  변경
                </button>
              </div>
            );
          })}
        </div>
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

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>해석 모델</div>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>
            기본은 Sonnet이에요. 해석이 더 깊었으면 할 때 Opus로 바꾸면 되는데, API 요금이 더 많이 나옵니다.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(Object.keys(AI_MODEL_LABEL) as AiModel[]).map((m) => {
              const active = m === model;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setAiModel(m);
                    setModelState(m);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: active ? "1px solid var(--color-accent)" : "1px solid rgba(255,255,255,0.2)",
                    background: active ? "rgba(249,231,149,0.14)" : "rgba(255,255,255,0.06)",
                    color: active ? "var(--color-accent)" : "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {active ? "● " : "○ "}
                  {AI_MODEL_LABEL[m]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>데이터 백업</div>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6, margin: "0 0 10px" }}>
          모든 날짜의 기록(카드, 아침 명상문, 저녁 성찰문, 만족도)을 JSON 파일로 내보내거나 다시 불러올 수 있어요. API
          키는 백업에 포함되지 않습니다.
        </p>

        <button
          onClick={handleExport}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "none",
            background: "var(--color-accent)",
            color: "#1E2761",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          전체 기록 내보내기
        </button>

        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileSelect} style={{ display: "none" }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          기록 가져오기
        </button>

        {importError && <div style={{ fontSize: 12, color: "#F96167", marginTop: 10 }}>{importError}</div>}
        {importMessage && <div style={{ fontSize: 12, color: "var(--color-primary)", marginTop: 10 }}>{importMessage}</div>}
      </div>

      <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>홈 화면에 추가하기</h2>
      <InstallGuide />

      {pickerSlot && (
        <CardPicker
          cards={ALL_CARDS}
          title={SLOT_META[pickerSlot].pickerTitle}
          question={SLOT_META[pickerSlot].question}
          onClose={() => setPickerSlot(null)}
          onSelect={handleSelectLayerCard}
        />
      )}

      {pendingImport && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
          onClick={() => setPendingImport(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg-elevated)",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>가져오기 확인</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "var(--color-text-muted)" }}>
              {pendingImport.length}개의 기록을 찾았어요. 기존 기록과 어떻게 합칠까요?
            </p>
            <button
              onClick={() => handleConfirmImport("merge")}
              style={{
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: "var(--color-accent)",
                color: "#1E2761",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              병합 (겹치는 날짜만 교체)
            </button>
            <button
              onClick={() => handleConfirmImport("overwrite")}
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid rgba(249,97,103,0.5)",
                background: "rgba(249,97,103,0.12)",
                color: "#F96167",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              전체 교체 (기존 기록 삭제 후 대체)
            </button>
            <button
              onClick={() => setPendingImport(null)}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "none",
                background: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
