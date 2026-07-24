import type { TarotCard } from "../data/cards";
import { SUIT_THEME } from "../data/cards";

const MAJOR_COLOR = "#5B3E8A";
const PERSON_COLOR = "#8A5B3E";

function cardColor(card: TarotCard): string {
  if (card.arcana === "major") return MAJOR_COLOR;
  if (card.arcana === "person" && card.suit) return SUIT_THEME[card.suit].color;
  if (card.suit) return SUIT_THEME[card.suit].color;
  return PERSON_COLOR;
}

export function CardVisual({ card, size = "md" }: { card: TarotCard; size?: "sm" | "md" | "lg" }) {
  const color = cardColor(card);
  const dims = size === "lg" ? { w: 140, h: 224 } : size === "md" ? { w: 104, h: 166 } : { w: 72, h: 115 };

  return (
    <div
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: 12,
        background: `linear-gradient(160deg, ${color} 0%, #10143a 130%)`,
        border: "2px solid rgba(255,255,255,0.35)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: size === "sm" ? "8px 6px" : "12px 8px",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: size === "sm" ? 10 : 12, opacity: 0.85 }}>
        {card.arcana === "major" ? "MAJOR" : card.suit ? SUIT_THEME[card.suit].element : ""}
      </div>
      <div
        style={{
          fontSize: size === "sm" ? 12 : size === "md" ? 15 : 18,
          fontWeight: 700,
          lineHeight: 1.3,
          wordBreak: "keep-all",
        }}
      >
        {card.nameKo}
      </div>
      <div style={{ fontSize: size === "sm" ? 9 : 10, opacity: 0.7 }}>{card.nameEn}</div>
    </div>
  );
}

export function EmptyCardSlot({ label, onClick, size = "md" }: { label: string; onClick: () => void; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? { w: 140, h: 224 } : size === "md" ? { w: 104, h: 166 } : { w: 72, h: 115 };
  return (
    <button
      onClick={onClick}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
        border: "2px dashed rgba(255,255,255,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        fontSize: 13,
        cursor: "pointer",
        padding: 8,
        textAlign: "center",
      }}
    >
      + {label}
    </button>
  );
}
