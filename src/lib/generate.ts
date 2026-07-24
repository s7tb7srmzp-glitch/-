import { callClaude } from "./ai";
import { buildEveningPrompt, buildMorningPrompt, buildTemplateEveningFeedback, buildTemplateMorningMessage } from "./interpret";
import type { DrawnCards } from "./storage";

export async function generateMorningMessage(cards: DrawnCards): Promise<string> {
  const aiResult = await callClaude(buildMorningPrompt(cards));
  return aiResult ?? buildTemplateMorningMessage(cards);
}

export async function generateEveningFeedback(morningMessage: string, actualDay: string, satisfaction: number): Promise<string> {
  const aiResult = await callClaude(buildEveningPrompt(morningMessage, actualDay));
  return aiResult ?? buildTemplateEveningFeedback(actualDay, satisfaction);
}
