import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface RequiredModule {
  module_id: number;
  module_code: string;
  title: string;
  description: string | null;
  required_within_days: number | null;
  trigger_event: string;
}

interface Completion {
  module_id: number;
  completed_at: string;
  passed: boolean;
  score: number | null;
}

interface CertificationRow extends RequiredModule {
  completion: Completion | null;
}

const TRIGGER_LABELS: Record<string, string> = {
  provisioning: "Assigned at provisioning",
  edition_published: "Assigned when an edition publishes",
  project_assignment: "Assigned on project assignment",
};

async function getCertificationStatus(email: string, tier: string): Promise<CertificationRow[]> {
  const supabase = await createClient();

  const { data: requirements, error: reqError } = await supabase
    .from("training_requirements")
    .select(
      "module_id, required_within_days, trigger_event, module:training_modules(module_code, title, description, is_active)"
    )
    .in("required_for_tier", ["all", tier]);

  if (reqError) throw reqError;

  type RequirementRow = {
    module_id: number;
    required_within_days: number | null;
    trigger_event: string;
    module: { module_code: string; title: string; description: string | null; is_active: boolean } | null;
  };

  const activeRequirements = ((requirements ?? []) as unknown as RequirementRow[]).filter(
    (r) => r.module?.is_active
  );

  if (activeRequirements.length === 0) return [];

  const { data: completions, error: compError } = await supabase
    .from("training_completions")
    .select("module_id, completed_at, passed, score")
    .eq("user_email", email)
    .order("completed_at", { ascending: false });

  if (compError) throw compError;

  const completionByModule = new Map<number, Completion>();
  for (const c of (completions ?? []) as Completion[]) {
    if (!completionByModule.has(c.module_id)) completionByModule.set(c.module_id, c);
  }

  return activeRequirements.map((r) => ({
    module_id: r.module_id,
    module_code: r.module!.module_code,
    title: r.module!.title,
    description: r.module!.description,
    required_within_days: r.required_within_days,
    trigger_event: r.trigger_event,
    completion: completionByModule.get(r.module_id) ?? null,
  }));
}

export default async function CertificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p style={{ color: "var(--muted)" }}>
        Sign in to view your certification and training status.
      </p>
    );
  }

  let rows: CertificationRow[] = [];
  let loadError: string | null = null;
  try {
    rows = await getCertificationStatus(user.email, user.tier);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load certification status.";
  }

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Training & Certifications</h1>
        <p style={{ color: "var(--muted)", maxWidth: "60ch" }}>
          Required modules for your access tier and their completion status.
        </p>
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
          Couldn&apos;t load your certification status: {loadError}
        </div>
      ) : rows.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
          No training modules have been published yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {rows.map((row) => {
            const done = row.completion?.passed;
            return (
              <div
                key={row.module_id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  background: "var(--surface)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{row.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {TRIGGER_LABELS[row.trigger_event] ?? row.trigger_event}
                    {row.required_within_days != null && ` · due within ${row.required_within_days} days`}
                  </div>
                  {row.description && (
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                      {row.description}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      background: done ? "var(--csh-blue-lt)" : "var(--csh-charcoal-lt)",
                      color: done ? "var(--csh-blue-dk)" : "var(--muted)",
                    }}
                  >
                    {done
                      ? `Completed ${new Date(row.completion!.completed_at).toLocaleDateString()} (${row.completion!.score}%)`
                      : row.completion
                        ? `Failed (${row.completion.score}%)`
                        : "Not completed"}
                  </span>
                  <Link
                    href={`/certifications/${row.module_id}`}
                    style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--csh-blue-dk)" }}
                  >
                    {done ? "Retake" : row.completion ? "Try again" : "Start"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
