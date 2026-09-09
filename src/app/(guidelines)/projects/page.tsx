import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/projects";

async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  let projects: Project[] = [];
  let loadError: string | null = null;
  try {
    projects = await getProjects();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load projects.";
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Projects</h1>
          <p style={{ color: "var(--muted)", maxWidth: "60ch" }}>
            Select a project to view guidelines in its context — the locked edition, room types
            in scope, and (once built) its deviations and training status.
          </p>
        </div>
        {user?.tier === "administrative" && (
          <Link
            href="/projects/new"
            style={{
              flexShrink: 0,
              padding: "0.55rem 1rem",
              borderRadius: "6px",
              background: "var(--csh-blue)",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + New project
          </Link>
        )}
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
          Couldn&apos;t load projects: {loadError}
        </div>
      ) : projects.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
          No projects are visible to you yet. Administrators can register one, or a Platform
          Owner can add you to an existing project.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {projects.map((project) => (
            <div
              key={project.id}
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
                <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.9rem" }}>
                  {project.procore_project_number}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                  {project.guideline_types.join(", ")}
                  {" · "}
                  {project.room_types_in_scope?.length ?? 0} room types in scope
                  {" · "}
                  {project.edition_lock_id ? `Locked (${project.lock_event})` : "Edition not locked yet"}
                </div>
              </div>
              <form action={`/projects/${project.id}/enter`} method="post">
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: "6px",
                    border: "1px solid var(--border-strong)",
                    background: "var(--surface)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Enter project mode
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
