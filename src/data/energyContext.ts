// 층위 카드 초기값(기본값)입니다. 앱을 처음 실행할 때 한 번만 시드로 쓰이며,
// 이후에는 설정 화면에서 저장한 값이 유일한 출처입니다(src/lib/storage.ts의 getLayerCards 참고).
// 4개 슬롯은 서로 독립적이며, 한 슬롯이 두 역할을 겸하지 않습니다.

export const DEFAULT_PERSONALITY_CARD_ID = "major-7"; // 전차 — 영혼 & 성격 카드
export const DEFAULT_YEAR_CARD_ID = "major-11"; // 정의 — 올해의 카드
export const DEFAULT_WEEK_CARD_ID = "major-17"; // 별 — 이번 주의 카드
export const DEFAULT_MONTH_CARD_ID = "minor-cups-10"; // 컵 10 — 이번 달의 카드
