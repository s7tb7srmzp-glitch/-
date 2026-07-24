import { useState } from "react";
import { getCardById, type Arcana, type TarotCard } from "../data/cards";
import { SPREAD_NAME, SPREAD_ORDER, SPREAD_POSITIONS, SPREAD_SOURCE } from "../data/spreadMeaning";
import { CardVisual, EmptyCardSlot } from "./CardVisual";
import { CardPicker } from "./CardPicker";

export type SelectedCards = Partial<Record<Arcana, string>>;

export function CardSpread({
  selected,
  onChange,
}: {
  selected: SelectedCards;
  onChange: (arcana: Arcana, card: TarotCard) => void;
}) {
  const [pickerFor, setPickerFor] = useState<Arcana | null>(null);

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

      {pickerFor && (
        <CardPicker
          arcana={pickerFor}
          onClose={() => setPickerFor(null)}
          onSelect={(card) => {
            onChange(pickerFor, card);
            setPickerFor(null);
          }}
        />
      )}
    </section>
  );
}

function arcanaShortLabel(arcana: Arcana): string {
  if (arcana === "major") return "메이저 22장";
  if (arcana === "person") return "인물 16장";
  return "마이너 40장";
}
