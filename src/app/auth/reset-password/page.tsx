"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type SessionCheck = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const [sessionCheck, setSessionCheck] = useState<SessionCheck>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionCheck(session ? "valid" : "invalid");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setStatus("error");
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords don't match.");
      return;
    }

    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("saved");
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
            color: "var(--brand-blue-dk)",
            marginBottom: "0.25rem",
          }}
        >
          Design Intelligence Platform
        </div>
        <p style={{ margin: "0 0 1.75rem", fontSize: "0.85rem", color: "var(--muted)" }}>
          Set your password
        </p>

        {sessionCheck === "checking" && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Checking your link…</p>
        )}

        {sessionCheck === "invalid" && (
          <p style={{ fontSize: "0.85rem", color: "var(--brand-pink)" }}>
            This link has expired or has already been used. Go back to{" "}
            <a href="/login" style={{ color: "var(--brand-blue-dk)", fontWeight: 600 }}>
              the sign-in page
            </a>{" "}
            and request a new one from &quot;Forgot your password?&quot;
          </p>
        )}

        {sessionCheck === "valid" && status === "saved" && (
          <p style={{ fontSize: "0.85rem", color: "var(--brand-blue-dk)" }}>
            Password set. <a href="/ambulatory" style={{ fontWeight: 600 }}>Continue to the app →</a>
          </p>
        )}

        {sessionCheck === "valid" && status !== "saved" && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border-strong)",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
                boxSizing: "border-box",
              }}
            />
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={status === "saving"}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                border: "none",
                background: "var(--brand-blue)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: status === "saving" ? "default" : "pointer",
                opacity: status === "saving" ? 0.7 : 1,
              }}
            >
              {status === "saving" ? "Saving…" : "Set password"}
            </button>
            {status === "error" && (
              <p style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "var(--brand-pink)" }}>
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
