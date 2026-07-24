// 78장 타로 카드 데이터: 메이저(22) / 인물(court, 16) / 마이너(pip, 40)
// 실제 카드 이미지 대신, 라이선스 문제가 없는 카드 스타일 일러스트(코드로 렌더링)로 표현합니다.

export type Arcana = "major" | "person" | "minor";

export type Suit = "wands" | "cups" | "swords" | "pentacles";

export interface TarotCard {
  id: string;
  arcana: Arcana;
  number: number; // major: 0-21, minor/person: 1-10 (11 Page,12 Knight,13 Queen,14 King)
  suit?: Suit;
  nameKo: string;
  nameEn: string;
  upright: string;
  reversed: string;
  keywords: string[];
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

const MAJOR_DATA: Array<[number, string, string, string, string, string[]]> = [
  [0, "바보", "The Fool", "새로운 시작, 순수한 모험, 자유로운 도약", "무모함, 방향 상실, 준비 부족", ["시작", "모험", "자유"]],
  [1, "마법사", "The Magician", "의지의 실현, 창조력, 주도적 행동", "속임수, 능력 낭비, 목적 상실", ["창조", "주도", "실행력"]],
  [2, "여사제", "The High Priestess", "직관, 내면의 지혜, 비밀", "억눌린 직관, 표면적 이해, 혼란", ["직관", "고요함", "내면"]],
  [3, "여황제", "The Empress", "풍요, 돌봄, 창조와 성장", "과잉보호, 정체, 소진", ["풍요", "성장", "돌봄"]],
  [4, "황제", "The Emperor", "구조, 통제력, 안정적 리더십", "경직됨, 독단, 권위 남용", ["질서", "책임", "안정"]],
  [5, "교황", "The Hierophant", "전통, 배움, 신념 체계", "관습에 대한 의문, 독단적 믿음", ["전통", "가르침", "신념"]],
  [6, "연인", "The Lovers", "연결, 선택, 조화로운 관계", "불균형, 갈등, 잘못된 선택", ["선택", "연결", "조화"]],
  [7, "전차", "The Chariot", "의지력, 돌파, 방향을 잡은 전진", "통제력 상실, 방향성 부재", ["의지력", "추진력", "돌파"]],
  [8, "힘", "Strength", "내면의 용기, 부드러운 통제, 인내", "자기 의심, 힘의 오용, 무기력", ["용기", "인내", "부드러움"]],
  [9, "은둔자", "The Hermit", "성찰, 홀로 있는 지혜, 내면 탐구", "고립, 회피, 길을 잃음", ["성찰", "고독", "탐구"]],
  [10, "운명의 수레바퀴", "Wheel of Fortune", "전환점, 순환, 예상치 못한 변화", "정체, 통제 불능의 변화", ["전환", "순환", "기회"]],
  [11, "정의", "Justice", "균형, 공정함, 원인과 결과", "불공정, 편향, 책임 회피", ["균형", "공정", "객관성"]],
  [12, "매달린 사람", "The Hanged Man", "관점의 전환, 멈춤, 내려놓음", "정체, 저항, 헛된 희생", ["멈춤", "전환", "수용"]],
  [13, "죽음", "Death", "끝과 시작, 변형, 놓아줌", "변화에 대한 저항, 정체된 종결", ["변형", "종결", "재생"]],
  [14, "절제", "Temperance", "균형, 조화, 서서히 통합함", "불균형, 과잉, 조급함", ["조화", "균형", "치유"]],
  [15, "악마", "The Devil", "속박, 집착, 그림자 욕망", "속박에서 벗어남, 자각, 해방", ["집착", "속박", "그림자"]],
  [16, "탑", "The Tower", "급격한 붕괴, 진실의 드러남, 각성", "지연된 붕괴, 두려움으로 인한 회피", ["붕괴", "각성", "해체"]],
  [17, "별", "The Star", "희망, 치유, 영감", "믿음 상실, 좌절, 단절감", ["희망", "치유", "영감"]],
  [18, "달", "The Moon", "무의식, 불안, 모호함 속의 직관", "혼란 해소, 두려움 극복", ["무의식", "불안", "직관"]],
  [19, "태양", "The Sun", "기쁨, 활력, 명료한 성공", "일시적 우울, 과도한 낙관", ["기쁨", "활력", "성취"]],
  [20, "심판", "Judgement", "각성, 부름에 대한 응답, 재평가", "자기 비판, 결단력 부족", ["각성", "재평가", "부름"]],
  [21, "세계", "The World", "완성, 통합, 성취의 순환", "미완성, 지연된 마무리", ["완성", "통합", "성취"]],
];

const COURT_RANKS: Array<[number, string, string]> = [
  [11, "시종", "Page"],
  [12, "기사", "Knight"],
  [13, "여왕", "Queen"],
  [14, "왕", "King"],
];

const COURT_MEANING: Record<string, { upright: string; reversed: string; keywords: string[] }> = {
  Page: { upright: "호기심 어린 배움과 새로운 메시지", reversed: "미숙함, 성급한 시작", keywords: ["배움", "호기심", "시작"] },
  Knight: { upright: "목표를 향한 적극적 행동과 추진", reversed: "성급함, 방향 없는 질주", keywords: ["행동", "추진", "도전"] },
  Queen: { upright: "성숙한 이해와 포용력 있는 돌봄", reversed: "과민함, 감정적 소모", keywords: ["포용", "성숙", "직관"] },
  King: { upright: "숙련된 통제력과 책임 있는 권위", reversed: "고집, 권위의 오남용", keywords: ["권위", "숙련", "책임"] },
};

const SUITS: Suit[] = ["wands", "cups", "swords", "pentacles"];

const MINOR_NUMBER_MEANING: Record<number, { theme: string; keywords: string[] }> = {
  1: { theme: "새로운 씨앗과 순수한 잠재력", keywords: ["시작", "잠재력"] },
  2: { theme: "균형과 선택의 갈림길", keywords: ["균형", "선택"] },
  3: { theme: "협력을 통한 확장", keywords: ["협력", "확장"] },
  4: { theme: "안정과 잠시의 휴식", keywords: ["안정", "휴식"] },
  5: { theme: "갈등과 도전을 통한 배움", keywords: ["갈등", "도전"] },
  6: { theme: "조화와 주고받음의 균형", keywords: ["조화", "나눔"] },
  7: { theme: "인내와 스스로에 대한 점검", keywords: ["인내", "점검"] },
  8: { theme: "움직임과 집중된 노력", keywords: ["집중", "노력"] },
  9: { theme: "거의 다다른 결실과 내적 자원", keywords: ["결실", "자원"] },
  10: { theme: "완결과 다음 순환으로의 전환", keywords: ["완결", "전환"] },
};

function buildMajor(): TarotCard[] {
  return MAJOR_DATA.map(([number, nameKo, nameEn, upright, reversed, keywords]) => ({
    id: `major-${number}`,
    arcana: "major" as const,
    number,
    nameKo: `${number}. ${nameKo}`,
    nameEn,
    upright,
    reversed,
    keywords,
  }));
}

function buildCourt(): TarotCard[] {
  const cards: TarotCard[] = [];
  for (const suit of SUITS) {
    for (const [number, rankKo, rankEn] of COURT_RANKS) {
      const meaning = COURT_MEANING[rankEn];
      cards.push({
        id: `person-${suit}-${number}`,
        arcana: "person",
        number,
        suit,
        nameKo: `${SUIT_KO[suit]} ${rankKo}`,
        nameEn: `${rankEn} of ${suit}`,
        upright: `${SUIT_THEME[suit].domain} 영역에서 ${meaning.upright}`,
        reversed: `${SUIT_THEME[suit].domain} 영역에서 ${meaning.reversed}`,
        keywords: meaning.keywords,
      });
    }
  }
  return cards;
}

function buildMinor(): TarotCard[] {
  const cards: TarotCard[] = [];
  for (const suit of SUITS) {
    for (let number = 1; number <= 10; number++) {
      const meaning = MINOR_NUMBER_MEANING[number];
      const label = number === 1 ? "에이스" : String(number);
      cards.push({
        id: `minor-${suit}-${number}`,
        arcana: "minor",
        number,
        suit,
        nameKo: `${SUIT_KO[suit]} ${label}`,
        nameEn: `${number} of ${suit}`,
        upright: `${SUIT_THEME[suit].domain}: ${meaning.theme}`,
        reversed: `${SUIT_THEME[suit].domain}에서의 정체 또는 ${meaning.theme}의 왜곡`,
        keywords: meaning.keywords,
      });
    }
  }
  return cards;
}

export const MAJOR_CARDS: TarotCard[] = buildMajor();
export const PERSON_CARDS: TarotCard[] = buildCourt();
export const MINOR_CARDS: TarotCard[] = buildMinor();

export const ALL_CARDS: TarotCard[] = [...MAJOR_CARDS, ...PERSON_CARDS, ...MINOR_CARDS];

export function cardsByArcana(arcana: Arcana): TarotCard[] {
  if (arcana === "major") return MAJOR_CARDS;
  if (arcana === "person") return PERSON_CARDS;
  return MINOR_CARDS;
}

export function getCardById(id: string): TarotCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}
