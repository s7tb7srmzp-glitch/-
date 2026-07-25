// 78장 타로 카드 데이터.
// 카드별 고유 내용(그림 묘사, 키워드, 인물 태도, 상황)은 모두 cards.json에 들어 있습니다.
// 이 파일은 cards.json을 읽어 앱에서 쓰는 형태로 변환만 합니다.
// 수트×숫자 공식으로 문장을 조립하던 예전 로직은 제거되었습니다.
// 역방향(reversed)은 이 타로 방식에서 사용하지 않으므로 어떤 메시지 생성에도 쓰지 않습니다.

import rawCards from "./cards.json";

export type Arcana = "major" | "person" | "minor";

export type Suit = "wands" | "cups" | "swords" | "pentacles";

/** 인물(court) 카드 전용: 이 카드가 오늘 나에게 살아있다면 어떤 태도로 하루를 사는가 */
export interface CardPersona {
  attitude: string;
  behavior: string;
  excess: string;
  lack: string;
}

/** 핍(pip) 카드 전용: 이 그림이 가리키는 상황과 오늘 취할 행동 */
export interface CardSituation {
  scene: string;
  action: string;
  outcome: string;
  caution: string;
}

export interface TarotCard {
  id: string;
  arcana: Arcana;
  number: number; // major: 0-21, minor: 1-10, person: 11 Page / 12 Knight / 13 Queen / 14 King
  suit?: Suit;
  nameKo: string;
  nameEn: string;
  /** 카드 그림에 실제로 보이는 것만 적은 순수 시각 묘사 (78장 전체) */
  imagery: string;
  /** 메이저 22장에만 채워져 있습니다 */
  keywords: string[];
  /** 인물(court) 16장에만 존재합니다 */
  persona?: CardPersona;
  /** 핍(pip) 40장에만 존재합니다 */
  situation?: CardSituation;
}

const SUIT_KO: Record<Suit, string> = {
  wands: "완드",
  cups: "컵",
  swords: "소드",
  pentacles: "펜타클",
};

export const SUIT_LABEL = SUIT_KO;

export const SUIT_THEME: Record<Suit, { element: string; domain: string; color: string }> = {
  wands: { element: "불", domain: "열정, 행동, 창조적 에너지", color: "#B8492A" },
  cups: { element: "물", domain: "감정, 관계, 직관", color: "#2E5C8A" },
  swords: { element: "공기", domain: "생각, 갈등, 진실", color: "#5B6472" },
  pentacles: { element: "흙", domain: "현실, 물질, 몸과 자원", color: "#3E6B4F" },
};

/** cards.json의 type을 앱에서 쓰는 arcana 값으로 옮깁니다. */
const TYPE_TO_ARCANA: Record<string, Arcana> = {
  major: "major",
  court: "person",
  pip: "minor",
};

interface RawCard {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  suit: string | null;
  image: string;
  imagery: string;
  keywords: string[];
  persona?: CardPersona;
  situation?: CardSituation;
}

/** id의 마지막 숫자를 카드 번호로 씁니다: major-7 → 7, person-wands-11 → 11, minor-cups-10 → 10 */
function numberFromId(id: string): number {
  const last = id.split("-").pop() ?? "";
  const n = Number.parseInt(last, 10);
  return Number.isNaN(n) ? 0 : n;
}

function toTarotCard(raw: RawCard): TarotCard {
  const arcana = TYPE_TO_ARCANA[raw.type];
  return {
    id: raw.id,
    arcana,
    number: numberFromId(raw.id),
    suit: (raw.suit as Suit | null) ?? undefined,
    nameKo: raw.name,
    nameEn: raw.nameEn,
    imagery: raw.imagery,
    keywords: raw.keywords,
    persona: raw.persona,
    situation: raw.situation,
  };
}

export const ALL_CARDS: TarotCard[] = (rawCards as RawCard[]).map(toTarotCard);

export const MAJOR_CARDS: TarotCard[] = ALL_CARDS.filter((c) => c.arcana === "major");
export const PERSON_CARDS: TarotCard[] = ALL_CARDS.filter((c) => c.arcana === "person");
export const MINOR_CARDS: TarotCard[] = ALL_CARDS.filter((c) => c.arcana === "minor");

export function cardsByArcana(arcana: Arcana): TarotCard[] {
  if (arcana === "major") return MAJOR_CARDS;
  if (arcana === "person") return PERSON_CARDS;
  return MINOR_CARDS;
}

const CARD_BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function getCardById(id: string): TarotCard | undefined {
  return CARD_BY_ID.get(id);
}
