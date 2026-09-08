"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "2rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-doc)",
            fontWeight: 700,
            fontSize: "1.15rem",
            color: "var(--csh-blue-dk)",
            marginBottom: "0.25rem",
          }}
        >
          Design Intelligence Platform
        </div>
        <p style={{ margin: "0 0 1.75rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          CommonSpirit Health NRES PDC
        </p>

        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: "0.65rem 1rem",
            borderRadius: "6px",
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "1.25rem",
          }}
        >
          Continue with Google Workspace
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1rem 0",
            fontSize: "0.75rem",
            color: "var(--hint)",
          }}
        >
          <span style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
          for external project partners
          <span style={{ flex: 1, borderTop: "1px solid var(--border)" }} />
        </div>

        {status === "sent" ? (
          <p style={{ fontSize: "0.85rem", color: "var(--csh-blue-dk)" }}>
            Check <strong>{email}</strong> for a sign-in link. It&apos;ll only work if your
            account has already been provisioned by the Platform Owner.
          </p>
        ) : (
          <form onSubmit={sendMagicLink}>
            <input
              type="email"
              required
              placeholder="you@yourfirm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border-strong)",
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
                boxSizing: "border-box",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                border: "none",
                background: "var(--csh-blue)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: status === "sending" ? "default" : "pointer",
                opacity: status === "sending" ? 0.7 : 1,
              }}
            >
              {status === "sending" ? "Sending…" : "Email me a sign-in link"}
            </button>
            {status === "error" && (
              <p style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "var(--csh-pink)" }}>
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
