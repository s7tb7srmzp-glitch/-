import { getCardById, type TarotCard } from "../data/cards";
import { SPREAD_ORDER, SPREAD_POSITIONS } from "../data/spreadMeaning";
import type { DrawnCards } from "./storage";

// 분리 배열법 자리별 참조 필드
//   1번(원형)   = 메이저 → imagery + keywords
//   2번(인물상) = 인물   → imagery + persona
//   3번(현실)   = 핍     → imagery + situation
// 카드 의미는 cards.json에 적힌 것만 사용하며, 여기서 새로 지어내지 않습니다.
// 역방향(reversed)은 이 타로 방식에서 쓰지 않으므로 어떤 경로에서도 참조하지 않습니다.

const NOT_WRITTEN = "아직 작성되지 않았습니다";

function hasText(v: string | undefined): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** 자리별로 참조해야 할 데이터를 "라벨: 내용" 줄 목록으로 만듭니다. 비어 있으면 지어내지 않고 그대로 표시합니다. */
function positionDetailLines(card: TarotCard): string[] {
  if (card.arcana === "major") {
    const keywords = card.keywords.filter(hasText);
    return [`키워드: ${keywords.length > 0 ? keywords.join(", ") : NOT_WRITTEN}`];
  }
  if (card.arcana === "person") {
    const p = card.persona;
    return [
      `태도: ${hasText(p?.attitude) ? p.attitude : NOT_WRITTEN}`,
      `행동: ${hasText(p?.behavior) ? p.behavior : NOT_WRITTEN}`,
      `과할 때: ${hasText(p?.excess) ? p.excess : NOT_WRITTEN}`,
      `부족할 때: ${hasText(p?.lack) ? p.lack : NOT_WRITTEN}`,
    ];
  }
  const s = card.situation;
  return [
    `상황: ${hasText(s?.scene) ? s.scene : NOT_WRITTEN}`,
    `오늘 할 행동: ${hasText(s?.action) ? s.action : NOT_WRITTEN}`,
    `예상되는 결과: ${hasText(s?.outcome) ? s.outcome : NOT_WRITTEN}`,
    `주의: ${hasText(s?.caution) ? s.caution : NOT_WRITTEN}`,
  ];
}

function todayCardsSummary(cards: DrawnCards): string {
  return SPREAD_ORDER.map((arcana) => {
    const card = getCardById(cards[arcana]);
    const pos = SPREAD_POSITIONS[arcana];
    if (!card) return "";
    const detail = positionDetailLines(card)
      .map((line) => `  ${line}`)
      .join("\n");
    return [
      `- [${pos.title}] ${card.nameKo} (${pos.question})`,
      `  그림 묘사: ${hasText(card.imagery) ? card.imagery : NOT_WRITTEN}`,
      detail,
    ].join("\n");
  })
    .filter(Boolean)
    .join("\n\n");
}

// AI(Claude 등)에게 보낼 해석 프롬프트. "분리 배열법 – 쓰리 카드 일일 명상법(100일)"의
// 포지션 정의(메이저=원형/상징, 인물=인물상, 마이너=현실적 행동·결과)를 그대로 반영합니다.
// 오늘 뽑은 3장의 카드만 다루며, 층위 카드(성격·영혼/올해/이번 주/이번 달)는 언급하지 않습니다.
export function buildMorningPrompt(cards: DrawnCards): string {
  return `당신은 사용자 전용 타로 명상 가이드입니다. 오늘 뽑은 3장의 카드만으로, 오늘 하루를 위한 한국어 메시지를 작성하세요.

[오늘 뽑은 카드 — 쓰리 카드 일일 명상법(100일), 분리 배열법 응용]
${todayCardsSummary(cards)}

작성 규칙:
1. 위에 주어진 내용만 사용하세요. 카드의 의미를 새로 지어내지 마세요. 여기 적히지 않은 상징 풀이, 수트나 숫자의 일반적 의미, 다른 해석서의 내용을 끌어오지 마세요.
2. "${NOT_WRITTEN}"라고 적힌 항목은 내용이 없다는 뜻입니다. 그 부분을 추측해서 채우지 말고 그냥 넘어가세요.
3. 오늘 뽑지 않은 다른 카드나 기간(이번 주, 이번 달, 내일 등)은 절대 언급하지 마세요. 오직 이 3장과 오늘에만 집중하세요.
4. 역방향은 이 타로 방식에서 쓰지 않습니다. 역방향 의미를 언급하지 마세요.`;
}

// 저녁 피드백은 오늘 뽑은 3장(아침의 해석)과 사용자가 직접 쓴 성찰 내용만 다룹니다.
// 내일/다음 날에 대한 언급은 요청하지 않습니다 — AI가 존재하지 않는 내일의 카드나 상황을 지어내는 것을 막기 위함입니다.
export function buildEveningPrompt(morningMessage: string, actualDay: string): string {
  return `당신은 사용자 전용 타로 저널 가이드입니다. 아침의 해석과 실제 하루를 대조하여, 하루를 마무리하는 피드백을 작성하세요.

[아침의 해석]
${morningMessage}

[실제 보낸 하루 (사용자 기록)]
${actualDay}

작성 규칙:
1. 아침의 메시지가 실제로 어떻게 맞아떨어졌는지, 혹은 다르게 펼쳐졌는지 짚어주세요.
2. 사용자가 실제로 쓴 내용에만 근거하세요. 사용자가 쓰지 않은 감정이나 상황을 추측해서 덧붙이지 마세요.
3. 내일이나 다음 날에 대한 제안, 예측, 새로운 카드 언급은 하지 마세요. 오직 오늘 하루만 다루세요.`;
}

// API 키가 없을 때 사용하는 결정적(deterministic) 템플릿 해석 — 오프라인에서도 항상 동작합니다.
// 오늘 뽑은 3장(원형 → 인물상 → 현실적 행동)만 다루며, 문장은 cards.json에 적힌 내용으로만 구성합니다.
export function buildTemplateMorningMessage(cards: DrawnCards): string {
  const major = getCardById(cards.major);
  const person = getCardById(cards.person);
  const minor = getCardById(cards.minor);
  if (!major || !person || !minor) return "카드를 3장 모두 선택해주세요.";

  const majorKeywords = major.keywords.filter(hasText);
  const lines: string[] = [];

  lines.push(`[오늘의 원형] ${major.nameKo}`);
  lines.push(hasText(major.imagery) ? major.imagery : NOT_WRITTEN);
  lines.push(majorKeywords.length > 0 ? `키워드: ${majorKeywords.join(" · ")}` : `키워드: ${NOT_WRITTEN}`);
  lines.push("");

  lines.push(`[오늘의 인물상] ${person.nameKo}`);
  lines.push(hasText(person.imagery) ? person.imagery : NOT_WRITTEN);
  lines.push(hasText(person.persona?.attitude) ? person.persona.attitude : NOT_WRITTEN);
  lines.push(hasText(person.persona?.behavior) ? person.persona.behavior : NOT_WRITTEN);
  lines.push("");

  lines.push(`[현실적 행동과 결과] ${minor.nameKo}`);
  lines.push(hasText(minor.imagery) ? minor.imagery : NOT_WRITTEN);
  lines.push(hasText(minor.situation?.scene) ? minor.situation.scene : NOT_WRITTEN);
  lines.push(hasText(minor.situation?.action) ? minor.situation.action : NOT_WRITTEN);
  lines.push(hasText(minor.situation?.outcome) ? minor.situation.outcome : NOT_WRITTEN);
  lines.push(hasText(minor.situation?.caution) ? minor.situation.caution : NOT_WRITTEN);

  return lines.join("\n");
}

export function buildTemplateEveningFeedback(actualDay: string, satisfaction: number): string {
  const tone =
    satisfaction >= 4
      ? "오늘 하루, 아침의 메시지와 잘 공명한 것 같아요."
      : satisfaction <= 2
        ? "오늘은 아침의 해석과는 다른 결의 하루였네요."
        : "오늘 하루는 예상과 비슷한 듯 다른 결로 흘러갔어요.";
  const trimmed = actualDay.trim();
  const excerpt = trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
  return [tone, excerpt ? `"${excerpt}"라는 기록 속에서 오늘의 배움을 찾아보세요.` : ""].filter(Boolean).join(" ");
}
