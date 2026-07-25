import { useState } from "react";
import { MINOR_CARDS, SUIT_LABEL, SUIT_THEME, getCardById, type Arcana, type Suit, type TarotCard } from "../data/cards";
import { SPREAD_NAME, SPREAD_ORDER, SPREAD_POSITIONS, SPREAD_SOURCE } from "../data/spreadMeaning";
import { CardVisual, EmptyCardSlot } from "./CardVisual";
import { CardPicker } from "./CardPicker";

export type SelectedCards = Partial<Record<Arcana, string>>;

const SUITS: Suit[] = ["wands", "cups", "swords", "pentacles"];

export function CardSpread({
  selected,
  onChange,
}: {
  selected: SelectedCards;
  onChange: (arcana: Arcana, card: TarotCard) => void;
}) {
  const [pickerFor, setPickerFor] = useState<Arcana | null>(null);
  const [pipSuit, setPipSuit] = useState<Suit | null>(null);

  function closePicker() {
    setPickerFor(null);
    setPipSuit(null);
  }

  function handleSelect(arcana: Arcana, card: TarotCard) {
    onChange(arcana, card);
    closePicker();
  }

  return (
    <section style={{ padding: "20px 16px 8px" }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{SPREAD_NAME}</div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{SPREAD_SOURCE}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        {SPREAD_ORDER.map((arcana) => {
          const position = SPREAD_POSITIONS[arcana];
          const cardId = selected[arcana];
          const card = cardId ? getCardById(cardId) : undefined;
          return (
            <div key={arcana} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-accent)", textAlign: "center" }}>
                {position.order}. {position.title}
              </div>
              {card ? (
                <button onClick={() => setPickerFor(arcana)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <CardVisual card={card} size="md" />
                </button>
              ) : (
                <EmptyCardSlot label={arcanaShortLabel(arcana)} onClick={() => setPickerFor(arcana)} size="md" />
              )}
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", textAlign: "center", lineHeight: 1.4 }}>
                {position.question}
              </div>
            </div>
          );
        })}
      </div>

      {(pickerFor === "major" || pickerFor === "person") && (
        <CardPicker
          arcana={pickerFor}
          searchable={false}
          onClose={closePicker}
          onSelect={(card) => handleSelect(pickerFor, card)}
        />
      )}

      {pickerFor === "minor" && !pipSuit && <SuitChooser onClose={closePicker} onSelect={setPipSuit} />}

      {pickerFor === "minor" && pipSuit && (
        <CardPicker
          cards={MINOR_CARDS.filter((c) => c.suit === pipSuit)}
          title={`${SUIT_LABEL[pipSuit]} 카드 선택`}
          question={SPREAD_POSITIONS.minor.question}
          searchable={false}
          onBack={() => setPipSuit(null)}
          onClose={closePicker}
          onSelect={(card) => handleSelect("minor", card)}
        />
      )}
    </section>
  );
}

function SuitChooser({ onClose, onSelect }: { onClose: () => void; onSelect: (suit: Suit) => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", zIndex: 50 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-bg-elevated)",
          width: "100%",
          borderRadius: "20px 20px 0 0",
          padding: "16px 16px calc(24px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{SPREAD_POSITIONS.minor.title} 카드 선택</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>먼저 수트를 골라주세요</div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "18px 10px",
                borderRadius: 14,
                border: `1px solid ${SUIT_THEME[suit].color}66`,
                background: `${SUIT_THEME[suit].color}22`,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{SUIT_THEME[suit].element}</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{SUIT_LABEL[suit]}</span>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>10장</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function arcanaShortLabel(arcana: Arcana): string {
  if (arcana === "major") return "메이저 22장";
  if (arcana === "person") return "인물 16장";
  return "마이너 40장";
}
