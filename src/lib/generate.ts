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
  /** true면 AI 연결 없이 만든 것입니다 (진짜 AI 해석이 아님) */
  offline: boolean;
  /** offline이 true일 때, AI 연결이 왜 안 됐는지에 대한 사람이 읽을 수 있는 이유 */
  offlineReason?: string;
}

export async function generateMorningMessage(cards: DrawnCards): Promise<MorningResult> {
  const result = await callClaude(buildMorningPrompt(cards));
  if (result.ok) return { message: result.text, offline: false };
  return { message: buildOfflineMorningView(cards), offline: true, offlineReason: result.reason };
}

export interface EveningResult extends EveningBlocks {
  /** true면 AI 연결이 없어 두 블록을 만들지 못한 것입니다 */
  offline: boolean;
  offlineReason?: string;
}

// 저녁 두 블록은 사용자가 쓴 성찰 글을 읽어야만 만들 수 있으므로,
// AI 연결이 없으면 흉내내지 않고 빈 상태로 두고 화면에서 안내합니다.
export async function generateEveningFeedback(
  cards: DrawnCards,
  actualDay: string,
  satisfaction: number,
): Promise<EveningResult> {
  const result = await callClaude(buildEveningPrompt(cards, actualDay, satisfaction));
  if (!result.ok) return { comparison: "", note: "", offline: true, offlineReason: result.reason };
  return { ...parseEveningBlocks(result.text), offline: false };
}
