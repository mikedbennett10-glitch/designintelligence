"use client";

import { useState, useTransition } from "react";

import type { QuizQuestionForTaking } from "@/lib/types/training";

import { submitQuizAttempt } from "./actions";

export default function QuizForm({
  moduleId,
  questions,
}: {
  moduleId: number;
  questions: QuizQuestionForTaking[];
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string; passed?: boolean } | null>(null);

  const allAnswered = questions.every((q) => answers[q.id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitQuizAttempt(moduleId, answers);
      setResult({ ok: res.ok, text: res.message, passed: res.passed });
    });
  }

  if (result?.ok) {
    return (
      <div
        style={{
          padding: "1.25rem",
          borderRadius: "8px",
          border: `1px solid ${result.passed ? "var(--csh-blue)" : "var(--csh-pink)"}`,
          background: result.passed ? "var(--csh-blue-lt)" : "var(--csh-pink-lt)",
          color: result.passed ? "var(--csh-blue-dk)" : "var(--csh-pink)",
          fontSize: "0.95rem",
        }}
      >
        {result.text}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {questions.map((q, i) => (
        <div
          key={q.id}
          style={{
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1rem",
            background: "var(--surface)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "0.6rem" }}>
            {i + 1}. {q.question_text}
          </div>
          {q.choices.map((c) => (
            <label
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0",
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name={`question-${q.id}`}
                checked={answers[q.id] === c.id}
                onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: c.id }))}
              />
              {c.text}
            </label>
          ))}
        </div>
      ))}

      <button
        type="submit"
        disabled={isPending || !allAnswered}
        style={{
          alignSelf: "flex-start",
          padding: "0.65rem 1.25rem",
          borderRadius: "6px",
          border: "none",
          background: "var(--csh-blue)",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: isPending || !allAnswered ? "default" : "pointer",
          opacity: isPending || !allAnswered ? 0.6 : 1,
        }}
      >
        {isPending ? "Submitting…" : "Submit quiz"}
      </button>

      {result && !result.ok && (
        <p style={{ fontSize: "0.85rem", color: "var(--csh-pink)" }}>{result.text}</p>
      )}
    </form>
  );
}
