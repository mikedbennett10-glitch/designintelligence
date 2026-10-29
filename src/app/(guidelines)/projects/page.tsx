import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/projects";

const GUIDELINE_TYPE_LABELS: Record<string, string> = {
  AMBULATORY: "Ambulatory",
  ACUTE: "Acute",
  BUILDING_PERFORMANCE: "Building Performance",
};

const thStyle: React.CSSProperties = {
  padding: "0.6rem 0.75rem",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "var(--muted)",
  textTransform: "uppercase",
  borderBottom: "1px solid var(--border)",
};

const tdStyle: React.CSSProperties = {
  padding: "0.65rem 0.75rem",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "middle",
};

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
              background: "var(--brand-blue)",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Import From Projecto
          </Link>
        )}
      </div>

      {loadError ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--brand-pink-lt)",
            border: "1px solid var(--brand-pink)",
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
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "var(--bg)" }}>
                <th style={thStyle}>Project Number</th>
                <th style={thStyle}>Project Name</th>
                <th style={thStyle}>Project Type</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }} />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="dip-table-row">
                  <td style={tdStyle}>
                    <Link
                      href={`/projects/${project.id}`}
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "var(--brand-blue-dk)",
                      }}
                    >
                      {project.procore_project_number}
                    </Link>
                  </td>
                  <td style={tdStyle}>{project.name || <span style={{ color: "var(--hint)" }}>—</span>}</td>
                  <td style={tdStyle}>
                    {project.guideline_types.map((t) => GUIDELINE_TYPE_LABELS[t] ?? t).join(", ")}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--muted)" }}>
                    {project.edition_lock_id ? `Locked (${project.lock_event})` : "Edition not locked yet"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <form action={`/projects/${project.id}/enter`} method="post">
                      <button
                        type="submit"
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "6px",
                          border: "1px solid var(--border-strong)",
                          background: "var(--surface)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Enter project mode
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
