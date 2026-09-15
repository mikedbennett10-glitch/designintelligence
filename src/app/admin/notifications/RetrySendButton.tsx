"use client";

import { useState, useTransition } from "react";

import { retrySendNotification } from "./actions";

export default function RetrySendButton({ notificationId }: { notificationId: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await retrySendNotification(notificationId);
      setResult({ ok: res.ok, text: res.message });
    });
  }

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{
          padding: "0.3rem 0.7rem",
          borderRadius: "6px",
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: isPending ? "default" : "pointer",
        }}
      >
        {isPending ? "Sending…" : "Send now"}
      </button>
      {result && (
        <span
          style={{
            marginLeft: "0.6rem",
            fontSize: "0.75rem",
            color: result.ok ? "var(--brand-blue-dk)" : "var(--brand-pink)",
          }}
        >
          {result.text}
        </span>
      )}
    </div>
  );
}
