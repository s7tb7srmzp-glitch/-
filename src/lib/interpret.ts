import { getCardById } from "../data/cards";
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
  return `당신은 사용자 전용 타로 명상 가이드입니다. 아래 고정 에너지와 오늘 뽑은 3장의 카드를 결합하여, 오늘 하루를 위한 따뜻하고 구체적인 한국어 메시지를 5~7문장으로 작성하세요.

[고정 에너지 컨텍스트 — 항상 유지되는 나의 본질]
${fixedEnergySummary()}

[오늘 뽑은 카드 — 쓰리 카드 일일 명상법(100일), 분리 배열법 응용]
${todayCardsSummary(cards)}

작성 규칙:
1. 먼저 "오늘의 원형(메이저)"이 어떤 분위기·주제로 하루를 감싸는지 말하세요.
2. 그 원형이 "오늘의 인물상(인물 카드)"으로서 나의 태도나 만나는 사람에게 어떻게 드러나는지 이어가세요.
3. 마지막으로 "현실적 행동과 결과(마이너 카드)"가 알려주는 구체적인 행동 지침을 제시하세요.
4. 고정 에너지(전차의 의지력 30%, 정의의 균형 25%, 펜타클10/별의 안정과 희망 20%)가 오늘의 카드와 어떻게 공명하는지 자연스럽게 녹여내세요.
5. 명령조가 아닌 다정한 명상 가이드의 어조로 작성하세요.`;
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

// API 키가 없을 때 사용하는 결정적(deterministic) 템플릿 해석 — 오프라인에서도 항상 동작합니다.
export function buildTemplateMorningMessage(cards: DrawnCards): string {
  const major = getCardById(cards.major);
  const person = getCardById(cards.person);
  const minor = getCardById(cards.minor);
  if (!major || !person || !minor) return "카드를 3장 모두 선택해주세요.";

  const chariot = getCardById(ENERGY_CONTEXT[0].cardId);
  const justice = getCardById(ENERGY_CONTEXT[1].cardId);
  const stability = getCardById(ENERGY_CONTEXT[2].cardId);

  return [
    `오늘 하루를 감싸는 원형은 ${major.nameKo}입니다. ${major.upright}의 기운이 오늘의 분위기와 주제를 이끕니다.`,
    `이 원형은 오늘 ${person.nameKo}의 모습으로 나에게 살아갑니다 — ${person.upright}.`,
    `현실에서는 ${minor.nameKo}의 결로 구체적인 행동과 결과가 드러납니다: ${minor.upright}.`,
    `당신의 본연의 의지력인 ${chariot?.nameKo}(30%)이 오늘의 원형을 뒷받침하고, ${justice?.nameKo}(25%)의 균형 감각이 판단의 기준이 되어줄 거예요.`,
    `${stability?.nameKo}가 상징하는 현실적 안정과 영적 희망(20%) 위에서, 오늘 뽑은 카드가 알려주는 구체적인 하루(25%)를 편안하게 맞이해보세요.`,
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
