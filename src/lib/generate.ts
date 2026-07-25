import { callClaude } from "./ai";
import {
  buildEveningPrompt,
  buildMorningPrompt,
  buildOfflineMorningView,
  parseEveningBlocks,
  type EveningBlocks,
} from "./interpret";
import type { DrawnCards } from "./storage";

export interface MorningResult {
  message: string;
  /** true면 AI 연결 없이 카드 데이터만 표시한 것입니다 (해석문이 아님) */
  offline: boolean;
}

export async function generateMorningMessage(cards: DrawnCards): Promise<MorningResult> {
  const aiResult = await callClaude(buildMorningPrompt(cards));
  if (aiResult) return { message: aiResult, offline: false };
  return { message: buildOfflineMorningView(cards), offline: true };
}

export interface EveningResult extends EveningBlocks {
  /** true면 AI 연결이 없어 두 블록을 만들지 못한 것입니다 */
  offline: boolean;
}

// 저녁 두 블록은 사용자가 쓴 성찰 글을 읽어야만 만들 수 있으므로,
// AI 연결이 없으면 흉내내지 않고 빈 상태로 두고 화면에서 안내합니다.
export async function generateEveningFeedback(
  cards: DrawnCards,
  actualDay: string,
  satisfaction: number,
): Promise<EveningResult> {
  const aiResult = await callClaude(buildEveningPrompt(cards, actualDay, satisfaction));
  if (!aiResult) return { comparison: "", note: "", offline: true };
  return { ...parseEveningBlocks(aiResult), offline: false };
}
