import { getApiKey } from "./storage";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export type ClaudeResult = { ok: true; text: string } | { ok: false; reason: string };

// 실패 이유를 화면에 그대로 보여줄 수 있도록, 모든 실패 경로에서 이유를 남깁니다.
// (예전에는 실패하면 전부 null만 반환해서 "연결이 안 된다"는 것 외에는 원인을 알 수 없었습니다.)
export async function callClaude(prompt: string): Promise<ClaudeResult> {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, reason: "API 키가 설정되어 있지 않아요. 설정 탭에서 키를 입력해주세요." };

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        // 저녁 피드백은 두 블록(대조 5~7문장 + 한마디 2~3문장)이라 여유가 필요합니다.
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    console.error("Claude API 요청 실패(네트워크):", err);
    return { ok: false, reason: "네트워크 오류로 AI 서버에 연결하지 못했어요." };
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = typeof body?.error?.message === "string" ? body.error.message : "";
    } catch {
      // 응답 본문이 JSON이 아닐 수 있습니다. 상태 코드만으로 안내합니다.
    }
    console.error(`Claude API 오류 (HTTP ${response.status}):`, detail || response.statusText);

    if (response.status === 401) return { ok: false, reason: "API 키가 올바르지 않아요. 설정에서 키를 다시 확인해주세요." };
    if (response.status === 429) return { ok: false, reason: "요청이 많아 AI가 응답하지 못했어요. 잠시 후 다시 시도해주세요." };
    return { ok: false, reason: `AI 응답 오류 (HTTP ${response.status})${detail ? `: ${detail}` : ""}` };
  }

  const data = await response.json();
  // content[0]이 항상 텍스트 블록이라고 가정하면 안 됩니다. 응답에 다른 종류의
  // 블록(예: thinking)이 먼저 올 수 있으므로, type이 "text"인 블록을 찾습니다.
  const blocks = Array.isArray(data?.content) ? data.content : [];
  const textBlock = blocks.find((b: unknown) => (b as { type?: string })?.type === "text");
  const text = (textBlock as { text?: unknown })?.text;
  if (typeof text !== "string") {
    console.error("Claude API 응답 형식을 읽을 수 없습니다:", data);
    return { ok: false, reason: "AI 응답 형식을 읽지 못했어요." };
  }
  return { ok: true, text };
}
