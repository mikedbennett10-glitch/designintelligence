"use client";

import { useState, useTransition } from "react";

import type { ModuleType, RequiredForTier, TriggerEvent } from "@/lib/types/training";

import {
  createTrainingModule,
  type QuestionInput,
  type RequirementInput,
} from "./actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.7rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  fontSize: "0.9rem",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "var(--muted)",
  marginBottom: "0.4rem",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "1rem",
  background: "var(--surface)",
  marginBottom: "0.85rem",
};

const TIERS: RequiredForTier[] = ["all", "internal_standard", "external_project", "external_review", "administrative"];
const TRIGGERS: TriggerEvent[] = ["provisioning", "edition_published", "project_assignment"];

let choiceIdCounter = 0;
function nextChoiceId() {
  choiceIdCounter += 1;
  return `c${choiceIdCounter}`;
}

interface DraftQuestion {
  key: string;
  questionText: string;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
}

function newDraftQuestion(): DraftQuestion {
  const c1 = nextChoiceId();
  const c2 = nextChoiceId();
  return {
    key: crypto.randomUUID(),
    questionText: "",
    choices: [
      { id: c1, text: "" },
      { id: c2, text: "" },
    ],
    correctChoiceId: c1,
  };
}

export default function TrainingModuleForm() {
  const [moduleCode, setModuleCode] = useState("");
  const [moduleType, setModuleType] = useState<ModuleType>("topic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [passingScore, setPassingScore] = useState(80);

  const [requirements, setRequirements] = useState<RequirementInput[]>([]);
  const [questions, setQuestions] = useState<DraftQuestion[]>([newDraftQuestion()]);

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function addRequirement() {
    setRequirements((prev) => [
      ...prev,
      { requiredForTier: "all", requiredWithinDays: 30, triggerEvent: "provisioning" },
    ]);
  }

  function updateRequirement(i: number, patch: Partial<RequirementInput>) {
    setRequirements((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function removeRequirement(i: number) {
    setRequirements((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, newDraftQuestion()]);
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => prev.filter((q) => q.key !== key));
  }

  function updateQuestionText(key: string, text: string) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, questionText: text } : q)));
  }

  function addChoice(key: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key ? { ...q, choices: [...q.choices, { id: nextChoiceId(), text: "" }] } : q
      )
    );
  }

  function updateChoiceText(key: string, choiceId: string, text: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.key === key
          ? { ...q, choices: q.choices.map((c) => (c.id === choiceId ? { ...c, text } : c)) }
          : q
      )
    );
  }

  function removeChoice(key: string, choiceId: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.key !== key) return q;
        const choices = q.choices.filter((c) => c.id !== choiceId);
        return {
          ...q,
          choices,
          correctChoiceId: q.correctChoiceId === choiceId ? (choices[0]?.id ?? "") : q.correctChoiceId,
        };
      })
    );
  }

  function setCorrectChoice(key: string, choiceId: string) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, correctChoiceId: choiceId } : q)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const questionInputs: QuestionInput[] = questions.map((q) => ({
      questionText: q.questionText,
      choices: q.choices,
      correctChoiceId: q.correctChoiceId,
    }));

    startTransition(async () => {
      const res = await createTrainingModule({
        moduleCode,
        moduleType,
        title,
        description,
        contentBody,
        passingScore,
        editionId: null,
        requirements,
        questions: questionInputs,
      });
      setResult({ ok: res.ok, text: res.message });
      if (res.ok) {
        setModuleCode("");
        setTitle("");
        setDescription("");
        setContentBody("");
        setRequirements([]);
        setQuestions([newDraftQuestion()]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label style={labelStyle} htmlFor="moduleCode">
          Module code
        </label>
        <input
          id="moduleCode"
          required
          placeholder="e.g. NEW_USER_ORIENTATION"
          value={moduleCode}
          onChange={(e) => setModuleCode(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="moduleType">
          Module type
        </label>
        <select
          id="moduleType"
          value={moduleType}
          onChange={(e) => setModuleType(e.target.value as ModuleType)}
          style={inputStyle}
        >
          <option value="new_user">New user orientation</option>
          <option value="edition_onboarding">Edition onboarding</option>
          <option value="topic">Topic</option>
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="title">
          Title
        </label>
        <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="description">
          Short description
        </label>
        <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="contentBody">
          Reading content
        </label>
        <textarea
          id="contentBody"
          rows={6}
          value={contentBody}
          onChange={(e) => setContentBody(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="passingScore">
          Passing score (%)
        </label>
        <input
          id="passingScore"
          type="number"
          min={0}
          max={100}
          value={passingScore}
          onChange={(e) => setPassingScore(Number(e.target.value))}
          style={{ ...inputStyle, maxWidth: "140px" }}
        />
      </div>

      <div>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Requirements</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
          Who must complete this module, and when.
        </p>
        {requirements.map((r, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={r.requiredForTier}
              onChange={(e) => updateRequirement(i, { requiredForTier: e.target.value as RequiredForTier })}
              style={{ ...inputStyle, width: "auto" }}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={r.triggerEvent}
              onChange={(e) => updateRequirement(i, { triggerEvent: e.target.value as TriggerEvent })}
              style={{ ...inputStyle, width: "auto" }}
            >
              {TRIGGERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              placeholder="Days"
              value={r.requiredWithinDays ?? ""}
              onChange={(e) =>
                updateRequirement(i, { requiredWithinDays: e.target.value ? Number(e.target.value) : null })
              }
              style={{ ...inputStyle, width: "90px" }}
            />
            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>days to complete</span>
            <button
              type="button"
              onClick={() => removeRequirement(i)}
              style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--csh-pink)", cursor: "pointer", fontSize: "0.8rem" }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRequirement}
          style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.8rem", cursor: "pointer" }}
        >
          + Add requirement
        </button>
      </div>

      <div>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Quiz questions</h2>
        {questions.map((q) => (
          <div key={q.key} style={cardStyle}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <input
                placeholder="Question text"
                value={q.questionText}
                onChange={(e) => updateQuestionText(q.key, e.target.value)}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removeQuestion(q.key)}
                style={{ flexShrink: 0, border: "none", background: "none", color: "var(--csh-pink)", cursor: "pointer", fontSize: "0.8rem" }}
              >
                Remove question
              </button>
            </div>
            {q.choices.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <input
                  type="radio"
                  name={`correct-${q.key}`}
                  checked={q.correctChoiceId === c.id}
                  onChange={() => setCorrectChoice(q.key, c.id)}
                  title="Correct answer"
                />
                <input
                  placeholder="Choice text"
                  value={c.text}
                  onChange={(e) => updateChoiceText(q.key, c.id, e.target.value)}
                  style={inputStyle}
                />
                {q.choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(q.key, c.id)}
                    style={{ flexShrink: 0, border: "none", background: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addChoice(q.key)}
              style={{ fontSize: "0.78rem", border: "none", background: "none", color: "var(--csh-blue-dk)", cursor: "pointer", padding: 0 }}
            >
              + Add choice
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.8rem", cursor: "pointer" }}
        >
          + Add question
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "0.65rem 1rem",
          borderRadius: "6px",
          border: "none",
          background: "var(--csh-blue)",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Saving…" : "Create module"}
      </button>

      {result && (
        <p style={{ fontSize: "0.85rem", color: result.ok ? "var(--csh-blue-dk)" : "var(--csh-pink)" }}>
          {result.text}
        </p>
      )}
    </form>
  );
}
