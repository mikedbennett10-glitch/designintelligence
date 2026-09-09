import Link from "next/link";
import { redirect } from "next/navigation";

import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/projects";

const GUIDELINE_MODES = [
  {
    label: "Ambulatory",
    href: "/ambulatory",
    description: "Room data sheets, prototype plans, and standards for ambulatory facilities.",
  },
  {
    label: "Acute",
    href: "/acute",
    description: "Room data sheets and standards for acute care facilities.",
  },
  {
    label: "Building Performance",
    href: "/building-performance",
    description: "Envelope, systems, and sustainability standards.",
  },
] as const;

async function getMyProjects(): Promise<Project[]> {
  const supabase = await createClient();
  // RLS already scopes this to projects the user is a member of, or all
  // projects for administrators — same query the /projects list page uses.
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return (data ?? []) as Project[];
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let projects: Project[] = [];
  let loadError: string | null = null;
  try {
    projects = await getMyProjects();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load your projects.";
  }

  return (
    <div>
      <Header user={user} />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>
          Welcome, {user.displayName}
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "2.5rem" }}>
          CommonSpirit Health NRES PDC — Design Intelligence Platform.
        </p>

        <section style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Your projects</h2>
            <Link href="/projects" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              View all →
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
              Couldn&apos;t load your projects: {loadError}
            </div>
          ) : projects.length === 0 ? (
            <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
              No projects are assigned to you yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1.1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background: "var(--surface)",
                    textDecoration: "none",
                    color: "var(--text)",
                  }}
                >
                  <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.88rem" }}>
                    {project.procore_project_number}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    {project.guideline_types.join(", ")}
                    {" · "}
                    {project.edition_lock_id ? "Locked" : "Not locked"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Guidelines</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {GUIDELINE_MODES.map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                style={{
                  display: "block",
                  padding: "1.25rem",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  background: "var(--surface)",
                  textDecoration: "none",
                  color: "var(--text)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{mode.label}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{mode.description}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Training</h2>
          <Link
            href="/certifications"
            style={{
              display: "block",
              padding: "1.25rem",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              background: "var(--surface)",
              textDecoration: "none",
              color: "var(--text)",
              maxWidth: "220px",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Certifications</div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Your required training modules and completion status.
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
