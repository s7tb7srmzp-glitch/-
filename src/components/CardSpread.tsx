import { useRef, useState } from "react";
import { MINOR_CARDS, SUIT_LABEL, SUIT_THEME, getCardById, type Arcana, type Suit, type TarotCard } from "../data/cards";
import { SPREAD_NAME, SPREAD_ORDER, SPREAD_POSITIONS, SPREAD_SOURCE } from "../data/spreadMeaning";
import { useLockBodyScroll } from "../lib/useLockBodyScroll";
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

  function closePicker() {
    setPickerFor(null);
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

      {pickerFor === "minor" && <PipPicker onClose={closePicker} onSelect={(card) => handleSelect("minor", card)} />}
    </section>
  );
}

// 핍 40장은 한 화면 안에서 수트 필터(칩) + 그 수트 10장 그리드로 보여줍니다.
// (예전에는 수트 선택 화면 -> 카드 선택 화면 2단계였는데, 한 단계로 줄이고 더 작게 만들었습니다.)
function PipPicker({ onClose, onSelect }: { onClose: () => void; onSelect: (card: TarotCard) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(gridRef);
  const [suit, setSuit] = useState<Suit>("wands");
  const position = SPREAD_POSITIONS.minor;
  const cards = MINOR_CARDS.filter((c) => c.suit === suit);

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
          maxHeight: "80dvh",
          borderRadius: "20px 20px 0 0",
          padding: "16px 16px calc(16px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{position.title} 카드 선택</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{position.question}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUITS.map((s) => {
            const active = s === suit;
            const color = SUIT_THEME[s].color;
            return (
              <button
                key={s}
                onClick={() => setSuit(s)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${active ? color : `${color}55`}`,
                  background: active ? color : `${color}1a`,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 11, opacity: 0.85 }}>{SUIT_THEME[s].element}</span>
                {SUIT_LABEL[s]}
              </button>
            );
          })}
        </div>

        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: 10,
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            flex: 1,
            minHeight: 0,
            paddingBottom: 8,
          }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onSelect(card)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "center" }}
            >
              <CardVisual card={card} size="sm" />
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
