"use client";

import { useState, useTransition } from "react";

import { US_JURISDICTIONS } from "@/lib/types/codeReference";
import type { GuidelineType } from "@/lib/types/rooms";

import { createCodeReference, type RelatedCodeInput } from "./actions";

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

function emptyRelatedCode(): RelatedCodeInput {
  return { codeName: "", editionReference: "", notes: "" };
}

export default function CodeReferenceForm() {
  const [jurisdiction, setJurisdiction] = useState("");
  const [guidelineType, setGuidelineType] = useState<GuidelineType | "">("");
  const [fgiDocument, setFgiDocument] = useState("");
  const [fgiEdition, setFgiEdition] = useState("");
  const [notes, setNotes] = useState("");
  const [relatedCodes, setRelatedCodes] = useState<RelatedCodeInput[]>([emptyRelatedCode()]);

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function updateRelatedCode(i: number, patch: Partial<RelatedCodeInput>) {
    setRelatedCodes((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function addRelatedCode() {
    setRelatedCodes((prev) => [...prev, emptyRelatedCode()]);
  }

  function removeRelatedCode(i: number) {
    setRelatedCodes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCodeReference({
        jurisdiction,
        guidelineType,
        fgiDocument,
        fgiEdition,
        notes,
        relatedCodes,
      });
      setResult({ ok: res.ok, text: res.message });
      if (res.ok) {
        setJurisdiction("");
        setGuidelineType("");
        setFgiDocument("");
        setFgiEdition("");
        setNotes("");
        setRelatedCodes([emptyRelatedCode()]);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label style={labelStyle} htmlFor="jurisdiction">
          Jurisdiction
        </label>
        <select
          id="jurisdiction"
          required
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          style={inputStyle}
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="ALL">All jurisdictions (national/model code)</option>
          {US_JURISDICTIONS.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="guidelineType">
          Facility type
        </label>
        <select
          id="guidelineType"
          value={guidelineType}
          onChange={(e) => setGuidelineType(e.target.value as GuidelineType | "")}
          style={inputStyle}
        >
          <option value="">All facility types</option>
          <option value="AMBULATORY">Ambulatory</option>
          <option value="ACUTE">Acute</option>
          <option value="BUILDING_PERFORMANCE">Building Performance</option>
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="fgiDocument">
          FGI document
        </label>
        <input
          id="fgiDocument"
          required
          placeholder="e.g. FGI Guidelines for Design and Construction of Outpatient Facilities"
          value={fgiDocument}
          onChange={(e) => setFgiDocument(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="fgiEdition">
          FGI edition
        </label>
        <input
          id="fgiEdition"
          required
          placeholder="e.g. 2022"
          value={fgiEdition}
          onChange={(e) => setFgiEdition(e.target.value)}
          style={{ ...inputStyle, maxWidth: "160px" }}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="notes">
          Notes (amendments, AHJ caveats)
        </label>
        <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} />
      </div>

      <div>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Other relevant codes</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
          e.g. IBC, NFPA 101, ASHRAE 170, or a specific state amendment.
        </p>
        {relatedCodes.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "0.6rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              placeholder="Code name (e.g. IBC)"
              value={c.codeName}
              onChange={(e) => updateRelatedCode(i, { codeName: e.target.value })}
              style={{ ...inputStyle, flex: "1 1 160px" }}
            />
            <input
              placeholder="Edition/reference"
              value={c.editionReference}
              onChange={(e) => updateRelatedCode(i, { editionReference: e.target.value })}
              style={{ ...inputStyle, flex: "1 1 120px" }}
            />
            <input
              placeholder="Notes"
              value={c.notes}
              onChange={(e) => updateRelatedCode(i, { notes: e.target.value })}
              style={{ ...inputStyle, flex: "2 1 180px" }}
            />
            {relatedCodes.length > 1 && (
              <button
                type="button"
                onClick={() => removeRelatedCode(i)}
                style={{ flexShrink: 0, border: "none", background: "none", color: "var(--csh-pink)", cursor: "pointer", fontSize: "0.8rem" }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRelatedCode}
          style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.8rem", cursor: "pointer" }}
        >
          + Add related code
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
        {isPending ? "Saving…" : "Create entry"}
      </button>

      {result && (
        <p style={{ fontSize: "0.85rem", color: result.ok ? "var(--csh-blue-dk)" : "var(--csh-pink)" }}>
          {result.text}
        </p>
      )}
    </form>
  );
}
