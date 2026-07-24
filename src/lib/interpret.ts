import { getCardById, type Suit } from "../data/cards";
import { ENERGY_CONTEXT, SECONDARY_MONTH_CARD_ID, TODAY_CARDS_WEIGHT } from "../data/energyContext";
import { SPREAD_ORDER, SPREAD_POSITIONS } from "../data/spreadMeaning";
import type { DrawnCards } from "./storage";

function fixedEnergySummary(): string {
  const lines = ENERGY_CONTEXT.map((item) => {
    const card = getCardById(item.cardId);
    return `- ${item.label} (${item.weight}%): ${card?.nameKo} — ${item.description}`;
  });
  const star = getCardById(SECONDARY_MONTH_CARD_ID);
  if (star) lines.push(`  (보조) ${star.nameKo} — 영적 희망의 결`);
  lines.push(`- 오늘의 카드 3장 (${TODAY_CARDS_WEIGHT}%): 구체적인 오늘의 일상 가이드`);
  return lines.join("\n");
}

function todayCardsSummary(cards: DrawnCards): string {
  return SPREAD_ORDER.map((arcana) => {
    const id = cards[arcana];
    const card = getCardById(id);
    const pos = SPREAD_POSITIONS[arcana];
    if (!card) return "";
    return `- [${pos.title}] ${card.nameKo}: ${pos.question}\n  카드 의미: ${card.upright}`;
  }).join("\n");
}

// AI(Claude 등)에게 보낼 해석 프롬프트. "분리 배열법 – 쓰리 카드 일일 명상법(100일)"의
// 포지션 정의(메이저=원형/상징, 인물=인물상, 마이너=현실적 행동·결과)를 그대로 반영합니다.
export function buildMorningPrompt(cards: DrawnCards): string {
  const monthCard = getCardById(ENERGY_CONTEXT[2].cardId);
  const weekCard = getCardById(SECONDARY_MONTH_CARD_ID);
  return `당신은 사용자 전용 타로 명상 가이드입니다. 아래 고정 에너지와 오늘 뽑은 3장의 카드를 결합하여, 오늘 하루를 위한 따뜻하고 "구체적인" 한국어 메시지를 6~8문장으로 작성하세요.

[고정 에너지 컨텍스트 — 항상 유지되는 나의 본질]
${fixedEnergySummary()}

[오늘 뽑은 카드 — 쓰리 카드 일일 명상법(100일), 분리 배열법 응용]
${todayCardsSummary(cards)}

작성 규칙:
1. 먼저 "오늘의 원형(메이저)"과 "오늘의 인물상(인물 카드)"을 엮어서, 오늘이 어떤 성격의 날인지 구체적으로 묘사하세요 (예: "오늘은 ~한 분위기의, ~하게 살아가게 되는 날이에요").
2. 그다음 문장은 반드시 이런 형식으로 쓰세요: "이번 달의 카드인 ${monthCard?.nameKo}과 이번 주의 ${weekCard?.nameKo}의 영향으로, [구체적인 행동]을 하는 것이 좋겠어요." — 여기서 [구체적인 행동]은 "현실적 행동과 결과(마이너 카드)"의 의미를 실제 생활 속 행동(일/업무, 관계, 대화나 결정, 돈·건강·루틴 등 구체적 영역)으로 풀어서 제시해야 합니다. 추상적인 조언("편안하게 맞이하세요" 같은 말) 대신 오늘 실제로 할 수 있는 구체적 행동을 제시하세요.
3. 고정 에너지(전차의 의지력 30%, 정의의 균형 25%)가 그 행동을 어떻게 뒷받침하는지 짧게 덧붙이세요.
4. 명령조가 아닌 다정한 명상 가이드의 어조를 유지하되, 구체성을 절대 잃지 마세요.`;
}

export function buildEveningPrompt(morningMessage: string, actualDay: string): string {
  return `당신은 사용자 전용 타로 저널 가이드입니다. 아침의 해석과 실제 하루를 대조하여, 하루를 마무리하는 따뜻한 피드백을 4~6문장으로 작성하세요.

[아침의 해석]
${morningMessage}

[실제 보낸 하루 (사용자 기록)]
${actualDay}

작성 규칙:
1. 아침의 메시지가 실제로 어떻게 맞아떨어졌는지, 혹은 다르게 펼쳐졌는지 짚어주세요.
2. 오늘 하루에서 배울 점이나 의미를 짧게 정리해주세요.
3. 내일을 위한 부드러운 제안 한 가지로 마무리하세요.
4. 다정하고 성찰적인 어조를 유지하세요.`;
}

const SUIT_ACTION_DOMAIN: Record<Suit, string> = {
  wands: "업무나 지금 진행 중인 일",
  cups: "사람들과의 관계와 감정",
  swords: "중요한 대화나 결정",
  pentacles: "돈이나 건강, 생활 루틴",
};

const RANK_ACTION_DETAIL: Record<number, string> = {
  1: "{domain}에서 새로운 시도를 하나 작게 시작해보는 것이 좋겠어요.",
  2: "{domain}에서 두 가지를 두고 저울질하고 있다면, 오늘은 그 사이의 균형점을 찾아 결정해보는 것이 좋겠어요.",
  3: "{domain}에서 혼자 애쓰기보다, 주변 사람에게 손을 내밀어 함께 힘을 모아보는 것이 좋겠어요.",
  4: "{domain}에서 잠시 멈추고, 지금까지 쌓아온 것을 다지며 숨 고르는 시간을 가져보는 것이 좋겠어요.",
  5: "{domain}에서 예상치 못한 걸림돌이 있어도 조급해하지 말고, 거기서 배우는 자세로 넘어가 보는 것이 좋겠어요.",
  6: "{domain}에서 주고받는 균형을 맞추면, 오늘 하루가 한결 편안해질 거예요.",
  7: "{domain}에서 무리해서 새로 벌이기보다, 이미 쌓아온 것을 인내심 있게 지켜내는 데 집중해보는 것이 좋겠어요.",
  8: "{domain}에서 속도감 있게 움직여야 할 타이밍이에요. 미루던 일을 오늘 바로 처리해보는 것이 좋겠어요.",
  9: "{domain}에서 결승선이 가까워요. 스스로를 다독이며 마지막 힘을 내보는 것이 좋겠어요.",
  10: "{domain}에서 하나를 매듭짓고, 다음 단계를 준비하는 것이 좋겠어요.",
};

function buildActionSentence(minor: { suit?: Suit; number: number; upright: string }): string {
  if (!minor.suit) return minor.upright;
  const domain = SUIT_ACTION_DOMAIN[minor.suit];
  const template = RANK_ACTION_DETAIL[minor.number] ?? "{domain}에서 오늘의 흐름을 차분히 따라가 보는 것이 좋겠어요.";
  return template.replace("{domain}", domain);
}

// API 키가 없을 때 사용하는 결정적(deterministic) 템플릿 해석 — 오프라인에서도 항상 동작합니다.
export function buildTemplateMorningMessage(cards: DrawnCards): string {
  const major = getCardById(cards.major);
  const person = getCardById(cards.person);
  const minor = getCardById(cards.minor);
  if (!major || !person || !minor) return "카드를 3장 모두 선택해주세요.";

  const chariot = getCardById(ENERGY_CONTEXT[0].cardId);
  const justice = getCardById(ENERGY_CONTEXT[1].cardId);
  const monthCard = getCardById(ENERGY_CONTEXT[2].cardId);
  const weekCard = getCardById(SECONDARY_MONTH_CARD_ID);
  const actionSentence = buildActionSentence(minor);

  return [
    `오늘은 ${major.nameKo}의 기운이 함께하는 날이에요. ${major.upright}이 오늘의 분위기와 주제를 감싸고, 그 원형은 오늘 ${person.nameKo}의 모습으로 나에게 살아갑니다 — ${person.upright}.`,
    `이번 달의 카드인 ${monthCard?.nameKo}과 이번 주의 ${weekCard?.nameKo}의 영향으로, ${actionSentence}`,
    `${minor.nameKo}가 알려주는 결이 바로 이 행동이에요: ${minor.upright}.`,
    `당신의 본연의 의지력인 ${chariot?.nameKo}(30%)이 이 행동을 뒷받침하고, ${justice?.nameKo}(25%)의 균형 감각이 오늘의 판단 기준이 되어줄 거예요.`,
  ].join(" ");
}

export function buildTemplateEveningFeedback(actualDay: string, satisfaction: number): string {
  const tone = satisfaction >= 4 ? "오늘 하루, 아침의 메시지와 잘 공명한 것 같아요." : satisfaction <= 2 ? "오늘은 아침의 해석과는 다른 결의 하루였네요." : "오늘 하루는 예상과 비슷한 듯 다른 결로 흘러갔어요.";
  const trimmed = actualDay.trim();
  const excerpt = trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
  return [
    tone,
    excerpt ? `"${excerpt}"라는 기록 속에서 오늘의 배움을 찾아보세요.` : "",
    "내일은 오늘의 감각을 살려 조금 더 가볍게 하루를 시작해보는 건 어떨까요?",
  ]
    .filter(Boolean)
    .join(" ");
}
