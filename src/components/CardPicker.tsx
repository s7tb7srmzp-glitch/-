import { useMemo, useRef, useState } from "react";
import { ALL_CARDS, cardsByArcana, type Arcana, type TarotCard } from "../data/cards";
import { SPREAD_POSITIONS } from "../data/spreadMeaning";
import { useLockBodyScroll } from "../lib/useLockBodyScroll";
import { CardVisual } from "./CardVisual";

interface CardPickerProps {
  arcana?: Arcana;
  cards?: TarotCard[];
  title?: string;
  question?: string;
  /** false면 검색창(및 자판 트리거)을 아예 렌더링하지 않습니다. 목록이 짧을 때 씁니다. */
  searchable?: boolean;
  /** 있으면 제목 옆에 뒤로가기 버튼을 보여줍니다 (예: 핍 수트 선택으로 돌아가기). */
  onBack?: () => void;
  onSelect: (card: TarotCard) => void;
  onClose: () => void;
}

export function CardPicker({ arcana, cards, title, question, searchable = true, onBack, onSelect, onClose }: CardPickerProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(gridRef);
  const [query, setQuery] = useState("");
  const position = arcana ? SPREAD_POSITIONS[arcana] : undefined;
  const cardList = cards ?? (arcana ? cardsByArcana(arcana) : ALL_CARDS);
  const displayTitle = title ?? (position ? `${position.title} 카드 선택` : "카드 선택");
  const displayQuestion = question ?? position?.question ?? "";

  const filtered = useMemo(() => {
    if (!searchable) return cardList;
    const q = query.trim().toLowerCase();
    if (!q) return cardList;
    return cardList.filter(
      (c) => c.nameKo.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q)),
    );
  }, [cardList, query, searchable]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        zIndex: 50,
      }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onBack && (
              <button
                onClick={onBack}
                aria-label="뒤로"
                style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 0 }}
              >
                ‹
              </button>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{displayTitle}</div>
              {displayQuestion && <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{displayQuestion}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {searchable && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="카드 이름 또는 키워드로 검색"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 14,
            }}
          />
        )}

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
          {filtered.map((card) => (
            <button
              key={card.id}
              onClick={() => onSelect(card)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "center" }}
            >
              <CardVisual card={card} size="sm" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--color-text-muted)", padding: 20 }}>
              검색 결과가 없어요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
