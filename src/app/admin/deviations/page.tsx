import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DeviationWithContext } from "@/lib/types/deviations";

import DeviationReviewList from "./DeviationReviewList";

interface CpiSignal {
  room_taxonomy_id: string;
  room_name: string;
  standard_element: string;
  edition_name: string;
  total_requests: number;
  approved_count: number;
  denied_count: number;
}

async function getDeviations(): Promise<DeviationWithContext[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deviations")
    .select("*, room:rooms(name), project:projects(procore_project_number)")
    .order("status", { ascending: true }) // 'pending' sorts before the rest alphabetically
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  type Row = Record<string, unknown> & {
    room_taxonomy_id: string;
    room: { name: string } | null;
    project: { procore_project_number: string } | null;
  };
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    ...(r as unknown as DeviationWithContext),
    room_name: r.room?.name ?? r.room_taxonomy_id,
    procore_project_number: r.project?.procore_project_number ?? "",
  }));
}

async function getCpiSignals(): Promise<CpiSignal[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("deviation_cpi_signals").select("*");
  return (data ?? []) as unknown as CpiSignal[];
}

export default async function AdminDeviationsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>
          You need administrative access to review deviation requests.
        </p>
      </div>
    );
  }

  let deviations: DeviationWithContext[] = [];
  let cpiSignals: CpiSignal[] = [];
  let loadError: string | null = null;

  try {
    [deviations, cpiSignals] = await Promise.all([getDeviations(), getCpiSignals()]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load deviation requests.";
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Deviation requests</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.75rem", maxWidth: "60ch" }}>
        Review, decide, and track requests to deviate from a published standard (WBS 7.2).
        Target response time: 5 business days.
      </p>

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
          Couldn&apos;t load deviation requests: {loadError}
        </div>
      ) : (
        <>
          {cpiSignals.length > 0 && (
            <div
              style={{
                marginBottom: "1.75rem",
                padding: "1rem 1.25rem",
                background: "#fdf1da",
                border: "1px solid #8a5a00",
                borderRadius: "8px",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", margin: "0 0 0.5rem", color: "#8a5a00" }}>
                CPI signals — standards with 3+ approved deviations this cycle
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {cpiSignals.map((s, i) => (
                  <li key={i} style={{ fontSize: "0.82rem", padding: "0.3rem 0" }}>
                    <strong>{s.room_name}</strong> — {s.standard_element} ({s.approved_count}{" "}
                    approved of {s.total_requests}, {s.edition_name})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DeviationReviewList deviations={deviations} />
        </>
      )}
    </div>
  );
}
