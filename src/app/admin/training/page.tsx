import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ModuleType } from "@/lib/types/training";

interface ModuleListRow {
  id: number;
  module_code: string;
  module_type: ModuleType;
  title: string;
  is_active: boolean;
  question_count: number;
  requirement_count: number;
}

async function getModules(): Promise<ModuleListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_modules")
    .select(
      "id, module_code, module_type, title, is_active, questions:training_quiz_questions(count), requirements:training_requirements(count)"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  type Row = {
    id: number;
    module_code: string;
    module_type: ModuleType;
    title: string;
    is_active: boolean;
    questions: { count: number }[];
    requirements: { count: number }[];
  };

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    module_code: r.module_code,
    module_type: r.module_type,
    title: r.title,
    is_active: r.is_active,
    question_count: r.questions?.[0]?.count ?? 0,
    requirement_count: r.requirements?.[0]?.count ?? 0,
  }));
}

export default async function AdminTrainingPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to manage training modules.</p>
      </div>
    );
  }

  let modules: ModuleListRow[] = [];
  let loadError: string | null = null;
  try {
    modules = await getModules();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load training modules.";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Training modules</h1>
          <p style={{ color: "var(--muted)" }}>Content, requirements, and quizzes for Training &amp; Certifications.</p>
        </div>
        <Link
          href="/admin/training/new"
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
          + New module
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
          Couldn&apos;t load training modules: {loadError}
        </div>
      ) : modules.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No training modules yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {modules.map((m) => (
            <div
              key={m.id}
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
                    {m.module_code} · {m.module_type}
                  </div>
                  <div style={{ fontWeight: 700 }}>{m.title}</div>
                </div>
                {!m.is_active && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)" }}>Inactive</span>
                )}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                {m.question_count} question{m.question_count === 1 ? "" : "s"} · {m.requirement_count} requirement
                {m.requirement_count === 1 ? "" : "s"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
