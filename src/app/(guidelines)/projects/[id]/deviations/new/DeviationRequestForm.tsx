"use client";

import { useFormState } from "react-dom";

import { submitDeviation, type SubmitDeviationResult } from "./actions";

const initialState: SubmitDeviationResult | null = null;

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

export default function DeviationRequestForm({
  projectId,
  roomTaxonomyId,
  roomName,
  editionId,
  editionName,
}: {
  projectId: number;
  roomTaxonomyId: string;
  roomName: string;
  editionId: number;
  editionName: string;
}) {
  const [state, formAction] = useFormState(submitDeviation, initialState);

  if (state?.ok) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--csh-blue-lt)",
          border: "1px solid var(--csh-blue)",
          borderRadius: "6px",
          color: "var(--csh-blue-dk)",
          fontSize: "0.9rem",
        }}
      >
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="roomTaxonomyId" value={roomTaxonomyId} />
      <input type="hidden" name="editionId" value={editionId} />

      <div
        style={{
          padding: "0.75rem 1rem",
          background: "var(--csh-charcoal-lt)",
          borderRadius: "6px",
          fontSize: "0.85rem",
        }}
      >
        <strong>{roomName}</strong>
        <span style={{ color: "var(--muted)" }}> · {editionName}</span>
      </div>

      <div>
        <label style={labelStyle} htmlFor="standardElement">
          Which standard are you deviating from?
        </label>
        <input
          id="standardElement"
          name="standardElement"
          required
          placeholder="e.g. Same-handed configuration, RFT-1 flooring, minimum room area 108 SF"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="proposedAlternative">
          Proposed alternative
        </label>
        <textarea
          id="proposedAlternative"
          name="proposedAlternative"
          required
          rows={3}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="justification">
          Clinical or operational justification
        </label>
        <textarea id="justification" name="justification" required rows={4} style={inputStyle} />
      </div>

      <button
        type="submit"
        style={{
          padding: "0.65rem 1rem",
          borderRadius: "6px",
          border: "none",
          background: "var(--csh-pink)",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Submit deviation request
      </button>

      {state && !state.ok && (
        <p style={{ fontSize: "0.85rem", color: "var(--csh-pink)" }}>{state.message}</p>
      )}
    </form>
  );
}
