import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CodeReference } from "@/lib/types/codeReference";
import type { GuidelineType } from "@/lib/types/rooms";

const GUIDELINE_TYPE_LABELS: Record<GuidelineType, string> = {
  AMBULATORY: "Ambulatory",
  ACUTE: "Acute",
  BUILDING_PERFORMANCE: "Building Performance",
};

async function getCodeReferences(): Promise<CodeReference[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("code_references")
    .select("*")
    .order("jurisdiction")
    .order("guideline_type");
  if (error) throw error;
  return (data ?? []) as CodeReference[];
}

export default async function AdminCodeReferencePage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to manage code reference entries.</p>
      </div>
    );
  }

  let entries: CodeReference[] = [];
  let loadError: string | null = null;
  try {
    entries = await getCodeReferences();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load code reference entries.";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Code reference entries</h1>
          <p style={{ color: "var(--muted)" }}>FGI editions and related codes by jurisdiction and facility type.</p>
        </div>
        <Link
          href="/admin/code-reference/new"
          style={{
            flexShrink: 0,
            padding: "0.5rem 0.9rem",
            borderRadius: "6px",
            background: "var(--csh-blue)",
            color: "#fff",
            fontSize: "0.82rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + New entry
        </Link>
      </div>

      {loadError ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--csh-pink-lt)",
            border: "1px solid var(--csh-pink)",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          Couldn&apos;t load code reference entries: {loadError}
        </div>
      ) : entries.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No code reference entries yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {entries.map((e) => (
            <div
              key={e.id}
              style={{
                padding: "0.85rem 1.1rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--surface)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--muted)" }}>
                    {e.jurisdiction} · {e.guideline_type ? GUIDELINE_TYPE_LABELS[e.guideline_type] : "All facility types"}
                  </div>
                  <div style={{ fontWeight: 700 }}>{e.fgi_document}</div>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--csh-blue-dk)" }}>FGI {e.fgi_edition}</span>
              </div>
              {!e.is_active && (
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.3rem" }}>Inactive</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
