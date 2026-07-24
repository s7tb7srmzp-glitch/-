// 완전한 보안이 아닌, 우연한 방문자를 막기 위한 가벼운 진입 장벽입니다.
// 실제 비밀번호는 코드에 저장하지 않고 SHA-256 해시만 비교합니다.
// PASSCODE_HASH 교체 방법: 브라우저 콘솔에서 아래 실행 후 결과를 붙여넣으세요.
//   crypto.subtle.digest("SHA-256", new TextEncoder().encode("원하는비밀번호")).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")))
export const PASSCODE_HASH = "REPLACE_WITH_SHA256_HASH";

export async function verifyPasscode(input: string): Promise<boolean> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === PASSCODE_HASH;
}
