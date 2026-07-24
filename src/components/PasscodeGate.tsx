import { useState, type ReactNode } from "react";
import { isUnlocked, setUnlocked } from "../lib/storage";
import { verifyPasscode } from "../lib/passcode";

export function PasscodeGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlockedState] = useState(() => isUnlocked());
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  if (unlocked) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError(false);
    const ok = await verifyPasscode(input);
    setChecking(false);
    if (ok) {
      setUnlocked();
      setUnlockedState(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40 }}>🔮</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>매일 타로 명상</div>
      <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>비밀번호를 입력해주세요</div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
        <input
          autoFocus
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: error ? "1px solid #F96167" : "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 16,
            textAlign: "center",
          }}
        />
        {error && <div style={{ fontSize: 12, color: "#F96167" }}>비밀번호가 올바르지 않아요.</div>}
        <button
          type="submit"
          disabled={!input || checking}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: input ? "var(--color-accent)" : "rgba(255,255,255,0.1)",
            color: input ? "#1E2761" : "var(--color-text-muted)",
            fontWeight: 700,
            fontSize: 14,
            cursor: input ? "pointer" : "not-allowed",
          }}
        >
          {checking ? "확인 중..." : "입장하기"}
        </button>
      </form>
    </div>
  );
}
