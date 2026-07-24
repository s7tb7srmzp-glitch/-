// 3. 에너지 컨텍스트: 고정값 설정 (PPTX 슬라이드 4 기준)
// 사용자(김희정 님) 고유의 고정 에너지 카드와 해석 가중치.
// 매일 아침 뽑는 3장의 카드는 이 고정 에너지 위에서 해석됩니다.

export interface EnergyContextItem {
  label: string;
  cardId: string;
  weight: number; // %
  description: string;
}

export const ENERGY_CONTEXT: EnergyContextItem[] = [
  {
    label: "영혼 & 성격 카드",
    cardId: "major-7",
    weight: 30,
    description: "본연의 의지력 — 전차(The Chariot)",
  },
  {
    label: "올해의 카드",
    cardId: "major-11",
    weight: 25,
    description: "균형과 객관성 — 정의(Justice)",
  },
  {
    label: "이달 / 이번 주",
    cardId: "minor-pentacles-10",
    weight: 20,
    description: "현실적 안정 & 영적 희망 — 펜타클 10 / 별(The Star)",
  },
];

// 이달/이번 주는 두 장의 카드가 함께 지정되어 있어 별도로 둘째 카드를 추가로 참조합니다.
export const SECONDARY_MONTH_CARD_ID = "major-17"; // The Star

export const TODAY_CARDS_WEIGHT = 25; // 오늘의 카드(3장) — 사용자 직접 입력, 구체적 일상 가이드

export const ENERGY_CONTEXT_TOTAL_WEIGHT =
  ENERGY_CONTEXT.reduce((sum, item) => sum + item.weight, 0) + TODAY_CARDS_WEIGHT; // 100
