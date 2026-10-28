"use client";

import { useState, useTransition } from "react";

import { setContentEditor } from "./actions";

export default function ContentEditorToggle({
  email,
  initialValue,
}: {
  email: string;
  initialValue: boolean;
}) {
  const [checked, setChecked] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.82rem",
        cursor: isPending ? "default" : "pointer",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          setError(null);
          startTransition(async () => {
            const result = await setContentEditor(email, next);
            if (!result.ok) {
              setChecked(!next);
              setError(result.message);
            }
          });
        }}
      />
      Content editor
      {error && <span style={{ color: "var(--brand-pink)" }}>({error})</span>}
    </label>
  );
}
