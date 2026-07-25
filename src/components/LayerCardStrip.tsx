import { useState } from "react";
import { getCardById, type TarotCard } from "../data/cards";
import { getLayerCards } from "../lib/storage";
import { CardVisual } from "./CardVisual";

interface Slot {
  label: string;
  card: TarotCard | undefined;
}

export function LayerCardStrip() {
  const layerCards = getLayerCards();
  const [openCard, setOpenCard] = useState<TarotCard | null>(null);

  const slots: Slot[] = [
    { label: "성격·영혼", card: getCardById(layerCards.personality) },
    { label: "올해", card: getCardById(layerCards.year) },
    { label: "이번주", card: getCardById(layerCards.week.cardId) },
    { label: "이번달", card: getCardById(layerCards.month.cardId) },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {slots.map((slot) => (
          <button
            key={slot.label}
            onClick={() => slot.card && setOpenCard(slot.card)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "6px 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              cursor: slot.card ? "pointer" : "default",
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: 9, color: "var(--color-text-muted)" }}>{slot.label}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {slot.card?.nameKo ?? "-"}
            </span>
          </button>
        ))}
      </div>

      {openCard && (
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
          onClick={() => setOpenCard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg-elevated)",
              borderRadius: 16,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              maxWidth: 260,
            }}
          >
            <CardVisual card={openCard} size="lg" />
            <div style={{ fontWeight: 700, fontSize: 15 }}>{openCard.nameKo}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", textAlign: "center" }}>
              {openCard.keywords.length > 0 ? openCard.keywords.join(" · ") : openCard.imagery}
            </div>
            <button
              onClick={() => setOpenCard(null)}
              style={{
                marginTop: 4,
                padding: "8px 20px",
                borderRadius: 10,
                border: "none",
                background: "var(--color-accent)",
                color: "#1E2761",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
