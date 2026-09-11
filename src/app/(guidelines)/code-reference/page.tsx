import { createClient } from "@/lib/supabase/server";
import { US_JURISDICTIONS } from "@/lib/types/codeReference";
import type { CodeReferenceWithRelated } from "@/lib/types/codeReference";
import type { GuidelineType } from "@/lib/types/rooms";

const GUIDELINE_TYPE_LABELS: Record<GuidelineType, string> = {
  AMBULATORY: "Ambulatory",
  ACUTE: "Acute",
  BUILDING_PERFORMANCE: "Building Performance",
};

async function findCodeReferences(
  jurisdiction: string,
  guidelineType: string
): Promise<CodeReferenceWithRelated[]> {
  const supabase = await createClient();

  let query = supabase
    .from("code_references")
    .select("*, relatedCodes:code_reference_related_codes(*)")
    .eq("is_active", true)
    .or(`jurisdiction.eq.${jurisdiction},jurisdiction.eq.ALL`);

  if (guidelineType) {
    query = query.or(`guideline_type.eq.${guidelineType},guideline_type.is.null`);
  }

  const { data, error } = await query;
  if (error) throw error;

  type Row = CodeReferenceWithRelated & { relatedCodes: CodeReferenceWithRelated["relatedCodes"] };
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    ...r,
    relatedCodes: (r.relatedCodes ?? []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export default async function CodeReferencePage({
  searchParams,
}: {
  searchParams: Promise<{ jurisdiction?: string; guidelineType?: string }>;
}) {
  const { jurisdiction, guidelineType } = await searchParams;

  let results: CodeReferenceWithRelated[] = [];
  let loadError: string | null = null;
  let searched = false;

  if (jurisdiction) {
    searched = true;
    try {
      results = await findCodeReferences(jurisdiction, guidelineType ?? "");
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Unable to load code references.";
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Code Reference</h1>
        <p style={{ color: "var(--muted)", maxWidth: "60ch" }}>
          Find the applicable FGI Guidelines edition and other relevant codes for a project&apos;s
          jurisdiction and facility type. Maintained by the Design &amp; Architecture team — always
          verify with the local Authority Having Jurisdiction before final design.
        </p>
      </div>

      <form
        method="get"
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: "1.75rem",
          padding: "1rem 1.25rem",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--surface)",
        }}
      >
        <div>
          <label
            htmlFor="jurisdiction"
            style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.4rem" }}
          >
            Jurisdiction (state)
          </label>
          <select
            id="jurisdiction"
            name="jurisdiction"
            required
            defaultValue={jurisdiction ?? ""}
            style={{ padding: "0.55rem 0.7rem", borderRadius: "6px", border: "1px solid var(--border-strong)", fontSize: "0.9rem", minWidth: "220px" }}
          >
            <option value="" disabled>
              Select a state…
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
          <label
            htmlFor="guidelineType"
            style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.4rem" }}
          >
            Facility type
          </label>
          <select
            id="guidelineType"
            name="guidelineType"
            defaultValue={guidelineType ?? ""}
            style={{ padding: "0.55rem 0.7rem", borderRadius: "6px", border: "1px solid var(--border-strong)", fontSize: "0.9rem", minWidth: "200px" }}
          >
            <option value="">Any facility type</option>
            <option value="AMBULATORY">Ambulatory</option>
            <option value="ACUTE">Acute</option>
            <option value="BUILDING_PERFORMANCE">Building Performance</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: "0.6rem 1.1rem",
            borderRadius: "6px",
            border: "none",
            background: "var(--csh-blue)",
            color: "#fff",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Find codes
        </button>
      </form>

      {!searched && (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
          Select a jurisdiction to see applicable codes.
        </p>
      )}

      {loadError && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--csh-pink-lt)",
            border: "1px solid var(--csh-pink)",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          Couldn&apos;t load code references: {loadError}
        </div>
      )}

      {searched && !loadError && results.length === 0 && (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
          No code reference entries yet for {jurisdiction}
          {guidelineType ? ` (${GUIDELINE_TYPE_LABELS[guidelineType as GuidelineType]})` : ""}. This
          reference tool is populated by the Design &amp; Architecture team — ask them to add this
          jurisdiction if it&apos;s missing.
        </p>
      )}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1.1rem 1.25rem",
                background: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.fgi_document}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {r.jurisdiction} · {r.guideline_type ? GUIDELINE_TYPE_LABELS[r.guideline_type] : "All facility types"}
                  </div>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    background: "var(--csh-blue-lt)",
                    color: "var(--csh-blue-dk)",
                    height: "fit-content",
                  }}
                >
                  FGI {r.fgi_edition}
                </span>
              </div>

              {r.notes && (
                <p style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: "0.75rem" }}>{r.notes}</p>
              )}

              {r.relatedCodes.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", marginBottom: "0.4rem" }}>
                    Other relevant codes
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {r.relatedCodes.map((c) => (
                      <li key={c.id} style={{ fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                        <strong>{c.code_name}</strong>
                        {c.edition_reference && ` — ${c.edition_reference}`}
                        {c.notes && <span style={{ color: "var(--muted)" }}> ({c.notes})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
