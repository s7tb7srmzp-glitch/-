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

/** 저녁 피드백 두 블록의 제목. AI 출력 파싱과 화면 표시가 이 문자열을 공유합니다. */
export const EVENING_COMPARISON_TITLE = "오늘의 카드 대조";
export const EVENING_NOTE_TITLE = "오늘의 한마디";

export const OFFLINE_MORNING_NOTICE = "AI 연결 없이 카드 데이터만 표시합니다.";
export const OFFLINE_EVENING_NOTICE = "AI 연결이 없어 오늘의 대조를 만들 수 없습니다.";

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

// ─────────────────────────────────────────────────────────────
// 아침 (API 경로)
// ─────────────────────────────────────────────────────────────

// "분리 배열법 – 쓰리 카드 일일 명상법(100일)"의 포지션 정의를 그대로 반영합니다.
// 오늘 뽑은 3장만 다루며, 층위 카드(성격·영혼/올해/이번 주/이번 달)는 언급하지 않습니다.
export function buildMorningPrompt(cards: DrawnCards): string {
  return `당신은 사용자 전용 타로 명상 가이드입니다. 오늘 뽑은 3장의 카드만으로, 오늘 하루를 위한 한국어 메시지를 4~5문장으로 작성하세요.

[오늘 뽑은 카드 — 쓰리 카드 일일 명상법(100일), 분리 배열법 응용]
${todayCardsSummary(cards)}

[문장 순서]
1. 먼저 세 장의 그림에 실제로 보이는 것을 짚으세요.
2. 이어서 각 자리에 주어진 내용(메이저=키워드, 인물=태도·행동, 핍=상황·오늘 할 행동·예상되는 결과·주의)을 풀어 쓰세요.
3. 마지막으로 세 자리가 오늘 하루 안에서 어떻게 이어지는지 연결하세요.

[반드시 지킬 것]
1. 위에 주어진 내용만 사용하세요. 카드의 의미를 새로 지어내지 마세요. 여기 적히지 않은 상징 풀이, 수트나 숫자의 일반적 의미, 다른 해석서의 내용을 끌어오지 마세요.
2. "${NOT_WRITTEN}"라고 적힌 항목은 내용이 없다는 뜻입니다. 그 부분을 추측해서 채우지 말고 그냥 넘어가세요.
3. 아직 하루가 시작되지 않았습니다. 평가하거나 위로하지 마세요. "좋은 하루가 될 거예요" 같은 말도 넣지 마세요.
4. 사용자의 감정이나 상태를 추측하지 마세요. "지금 지쳐 있다면", "마음이 무겁겠지만" 같은 표현을 쓰지 마세요.
5. 오늘 뽑지 않은 다른 카드나 기간(이번 주, 이번 달, 내일 등)은 절대 언급하지 마세요. 오직 이 3장과 오늘에만 집중하세요.
6. 역방향은 이 타로 방식에서 쓰지 않습니다. 역방향 의미를 언급하지 마세요.`;
}

// ─────────────────────────────────────────────────────────────
// 저녁 (API 경로) — 반드시 두 블록으로 나뉜 출력을 요청합니다
// ─────────────────────────────────────────────────────────────

export function buildEveningPrompt(cards: DrawnCards, actualDay: string, satisfaction: number): string {
  return `당신은 사용자 전용 타로 저널 가이드입니다. 아침에 뽑은 3장과 사용자가 직접 쓴 저녁 성찰을 대조하여, 아래 두 블록을 작성하세요.

[아침에 뽑은 3장]
${todayCardsSummary(cards)}

[사용자가 쓴 저녁 성찰 — 원문]
${actualDay}

[사용자가 매긴 오늘의 만족도] 5점 만점에 ${satisfaction}점

────────────────────────
출력 형식 — 아래 두 제목을 그대로 쓰고, 순서도 그대로 지키세요.

[${EVENING_COMPARISON_TITLE}]
(5~7문장)
- 아침 3장의 내용과 사용자가 쓴 성찰을 하나씩 직접 맞춰보세요.
- 사용자가 실제로 쓴 표현을 근거로 인용하세요.
- 어긋나거나 대응하지 않은 부분을 반드시 하나 이상 짚으세요. 전부 들어맞았다고 쓰지 마세요.
- 만족도 ${satisfaction}점을 반영하세요. 점수가 낮은 날을 충만한 하루라고 쓰지 마세요.
- 금지: 근거 없는 칭찬, 사용자가 쓰지 않은 감정 추측, 하루의 의미를 대신 결론짓는 문장("그게 오늘의 진짜 ○○였어요" 같은 것).

[${EVENING_NOTE_TITLE}]
(2~3문장)
- 여기서는 위로하고 조언해도 됩니다. 따뜻하게 쓰세요.
- 반드시 오늘 기록에 실제로 나온 내용에 근거하세요. 아무 날에나 붙는 일반론 위로는 쓰지 마세요.
- 조언은 내일 실제로 해볼 수 있는 구체적인 것 하나만 제시하세요.
- 금지: 과장된 칭송, 사용자의 성격이나 사람됨에 대한 평가, 내일 카드나 내일 상황에 대한 언급(아직 뽑지 않았습니다).

두 블록의 역할을 섞지 마세요. 대조 블록에서 위로하지 말고, 한마디 블록에서 다시 평가하지 마세요.`;
}

export interface EveningBlocks {
  comparison: string;
  note: string;
}

/**
 * AI 출력에서 두 블록을 분리합니다. 제목 글자를 기준으로 나누며, 두 제목이 모두
 * 발견되면 어느 쪽이 먼저 나오든 상관없이 각 제목 뒤의 내용을 해당 블록에 담습니다.
 * 제목이 하나만 발견되거나 아예 없으면 지어내지 않고 전체를 대조 블록에 넣고 한마디는 비워 둡니다.
 */
export function parseEveningBlocks(raw: string): EveningBlocks {
  const text = raw.trim();
  const compRe = new RegExp(`\\[?\\s*${EVENING_COMPARISON_TITLE}\\s*\\]?`);
  const noteRe = new RegExp(`\\[?\\s*${EVENING_NOTE_TITLE}\\s*\\]?`);
  const compMatch = compRe.exec(text);
  const noteMatch = noteRe.exec(text);

  if (!compMatch || !noteMatch) {
    return { comparison: text, note: "" };
  }

  const marks = (
    [
      { label: "comparison", start: compMatch.index, end: compMatch.index + compMatch[0].length },
      { label: "note", start: noteMatch.index, end: noteMatch.index + noteMatch[0].length },
    ] as const
  ).slice().sort((a, b) => a.start - b.start);

  const [first, second] = marks;
  const result: EveningBlocks = { comparison: "", note: "" };
  result[first.label] = text.slice(first.end, second.start).trim();
  result[second.label] = text.slice(second.end).trim();
  return result;
}

// ─────────────────────────────────────────────────────────────
// 오프라인 경로 — "생성"을 흉내내지 않습니다
// ─────────────────────────────────────────────────────────────

// AI 연결이 없을 때는 연결 문장을 만들지 않습니다.
// 매일 같은 연결 문형이 반복되면 그것이 곧 또 하나의 공식이 되기 때문입니다.
// 자리별 라벨과 cards.json의 내용을 그대로 보여주기만 합니다.
export function buildOfflineMorningView(cards: DrawnCards): string {
  const blocks = SPREAD_ORDER.map((arcana) => {
    const card = getCardById(cards[arcana]);
    const pos = SPREAD_POSITIONS[arcana];
    if (!card) return "";
    return [
      `[${pos.title}] ${card.nameKo}`,
      `그림 묘사`,
      `  ${hasText(card.imagery) ? card.imagery : NOT_WRITTEN}`,
      ...positionDetailLines(card).map((line) => {
        const [label, ...rest] = line.split(": ");
        return `${label}\n  ${rest.join(": ")}`;
      }),
    ].join("\n");
  }).filter(Boolean);

  return [OFFLINE_MORNING_NOTICE, "", ...blocks.join("\n\n").split("\n")].join("\n");
}
