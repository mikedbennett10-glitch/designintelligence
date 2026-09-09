"use client";

import { useState, useTransition } from "react";

import { lockToCurrentEdition } from "./actions";

export default function LockEditionButton({
  projectId,
  guidelineType,
  isRelock,
}: {
  projectId: number;
  guidelineType: "AMBULATORY" | "ACUTE";
  isRelock: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleClick() {
    if (isRelock && !window.confirm(
      "Update this project to the current edition? Team members will need to re-complete Edition Onboarding once that training exists."
    )) {
      return;
    }
    startTransition(async () => {
      const result = await lockToCurrentEdition(projectId, guidelineType);
      setMessage({ ok: result.ok, text: result.message });
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{
          padding: "0.5rem 0.9rem",
          borderRadius: "6px",
          border: "none",
          background: "var(--csh-blue)",
          color: "#fff",
          fontSize: "0.82rem",
          fontWeight: 600,
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Working…" : isRelock ? "Adopt current edition" : "Lock to current edition"}
      </button>
      {message && (
        <p
          style={{
            marginTop: "0.6rem",
            fontSize: "0.8rem",
            color: message.ok ? "var(--csh-blue-dk)" : "var(--csh-pink)",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
