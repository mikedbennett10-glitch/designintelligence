"use client";

import { useState, useTransition } from "react";

import type { DeviationStatus, DeviationWithContext } from "@/lib/types/deviations";

import { decideDeviation } from "./actions";

const STATUS_LABELS: Record<DeviationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  approved_with_conditions: "Approved with conditions",
  denied: "Denied",
};

const STATUS_COLORS: Record<DeviationStatus, { bg: string; fg: string }> = {
  pending: { bg: "#fdf1da", fg: "#8a5a00" },
  approved: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  approved_with_conditions: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  denied: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
};

function DecideForm({ deviationId }: { deviationId: number }) {
  const [status, setStatus] = useState<DeviationStatus>("approved");
  const [decisionText, setDecisionText] = useState("");
  const [conditions, setConditions] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await decideDeviation(deviationId, status, decisionText, conditions);
      setResult({ ok: res.ok, text: res.message });
    });
  }

  if (result?.ok) {
    return (
      <p style={{ fontSize: "0.82rem", color: "var(--csh-blue-dk)", margin: 0 }}>{result.text}</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "0.75rem",
        paddingTop: "0.75rem",
        borderTop: "1px dashed var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
      }}
    >
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as DeviationStatus)}
        style={{ padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid var(--border-strong)", fontSize: "0.82rem" }}
      >
        <option value="approved">Approve</option>
        <option value="approved_with_conditions">Approve with conditions</option>
        <option value="denied">Deny</option>
      </select>
      <textarea
        required
        placeholder="Decision explanation (sent to the requester)"
        value={decisionText}
        onChange={(e) => setDecisionText(e.target.value)}
        rows={2}
        style={{ padding: "0.5rem 0.6rem", borderRadius: "6px", border: "1px solid var(--border-strong)", fontSize: "0.82rem", fontFamily: "inherit" }}
      />
      {status === "approved_with_conditions" && (
        <textarea
          placeholder="Conditions of approval"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          rows={2}
          style={{ padding: "0.5rem 0.6rem", borderRadius: "6px", border: "1px solid var(--border-strong)", fontSize: "0.82rem", fontFamily: "inherit" }}
        />
      )}
      <button
        type="submit"
        disabled={isPending}
        style={{
          alignSelf: "flex-start",
          padding: "0.4rem 0.85rem",
          borderRadius: "6px",
          border: "none",
          background: "var(--csh-blue)",
          color: "#fff",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Saving…" : "Record decision"}
      </button>
      {result && !result.ok && (
        <p style={{ fontSize: "0.8rem", color: "var(--csh-pink)", margin: 0 }}>{result.text}</p>
      )}
    </form>
  );
}

export default function DeviationReviewList({ deviations }: { deviations: DeviationWithContext[] }) {
  if (deviations.length === 0) {
    return <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No deviation requests yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {deviations.map((d) => (
        <div
          key={d.id}
          style={{
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--muted)" }}>
                {d.reference_number ?? `#${d.id}`} · {d.procore_project_number}
              </div>
              <div style={{ fontWeight: 700, marginTop: "0.15rem" }}>{d.room_name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{d.standard_element}</div>
            </div>
            <span
              style={{
                flexShrink: 0,
                alignSelf: "flex-start",
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.15rem 0.55rem",
                borderRadius: "999px",
                background: STATUS_COLORS[d.status].bg,
                color: STATUS_COLORS[d.status].fg,
              }}
            >
              {STATUS_LABELS[d.status]}
            </span>
          </div>

          <div style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
            <strong>Proposed alternative: </strong>
            {d.proposed_alternative}
          </div>
          <div style={{ marginTop: "0.4rem", fontSize: "0.85rem" }}>
            <strong>Justification: </strong>
            {d.justification}
          </div>
          <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "var(--hint)" }}>
            Submitted by {d.submitted_by} on{" "}
            {new Date(d.submitted_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>

          {d.status !== "pending" && d.decision_text && (
            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--border)",
                fontSize: "0.85rem",
              }}
            >
              <strong>Decision: </strong>
              {d.decision_text}
              {d.conditions && (
                <div style={{ marginTop: "0.3rem" }}>
                  <strong>Conditions: </strong>
                  {d.conditions}
                </div>
              )}
            </div>
          )}

          {d.status === "pending" && <DecideForm deviationId={d.id} />}
        </div>
      ))}
    </div>
  );
}
