// "20. 분리 배열법 (78장 전체) – 응용 예" 참고 자료 기반
// [ 쓰리 카드 일일 명상법(100일) ] 스프레드 포지션 정의
// 메이저 22장 / 인물 16장 / 마이너 40장 각 1장씩 뽑아 오늘 하루를 명상합니다.

import type { Arcana } from "./cards";

export interface SpreadPosition {
  arcana: Arcana;
  order: 1 | 2 | 3;
  title: string;
  question: string;
  guide: string;
}

export const SPREAD_NAME = "쓰리 카드 일일 명상법 (100일)";
export const SPREAD_SOURCE = "분리 배열법 (78장 전체) – 응용 예";

export const SPREAD_POSITIONS: Record<Arcana, SpreadPosition> = {
  major: {
    arcana: "major",
    order: 1,
    title: "오늘의 원형",
    question: "오늘 하루 나와 함께하는 원형, 상징(분위기·주제·날씨)은?",
    guide: "메이저 카드는 오늘 하루 전체를 감싸는 큰 흐름과 분위기를 알려줍니다.",
  },
  person: {
    arcana: "person",
    order: 2,
    title: "오늘의 인물상",
    question: "이 원형은 오늘 나에게 어떤 인물로 살아가는가?",
    guide: "인물(궁정) 카드는 그 원형이 오늘 나의 태도나 만나는 사람으로 어떻게 드러나는지 보여줍니다.",
  },
  minor: {
    arcana: "minor",
    order: 3,
    title: "현실적 행동과 결과",
    question: "이 원형의 현실적 행동, 구체적 결과, 오늘 일어나는 일은?",
    guide: "마이너 카드는 오늘 실제로 벌어질 구체적인 사건과 취해야 할 행동을 알려줍니다.",
  },
};

export const SPREAD_ORDER: Arcana[] = ["major", "person", "minor"];
