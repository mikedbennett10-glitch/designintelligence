import Link from "next/link";
import { redirect } from "next/navigation";

import Header from "@/components/layout/Header";
import { getCurrentUser, getCurrentUserDebug } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/projects";

const GUIDELINE_MODES = [
  {
    label: "Ambulatory",
    href: "/ambulatory",
    description: "Room data sheets, prototype plans, and standards for ambulatory facilities.",
    comingSoon: false,
  },
  {
    label: "Acute",
    href: "/acute",
    description: "Room data sheets and standards for acute care facilities.",
    comingSoon: true,
  },
  {
    label: "Building Performance",
    href: "/building-performance",
    description: "Envelope, systems, and sustainability standards.",
    comingSoon: true,
  },
] as const;

const GUIDELINE_TYPE_LABELS: Record<string, string> = {
  AMBULATORY: "Ambulatory",
  ACUTE: "Acute",
  BUILDING_PERFORMANCE: "Building Performance",
};

const homeThStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "var(--muted)",
  textTransform: "uppercase",
};

const homeTdStyle: React.CSSProperties = {
  padding: "0.6rem 0.75rem",
};

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

  if (!user) {
    // Temporary diagnostic for a login-redirect-loop report: distinguish
    // "no Supabase session at all" (real logout -> redirect as normal) from
    // "session exists but the public.users profile lookup failed" (surface
    // it instead of silently bouncing back to /login with no explanation).
    const debug = await getCurrentUserDebug();
    if (!debug.hasAuthUser) redirect("/login");

    return (
      <div style={{ maxWidth: "640px", margin: "3rem auto", padding: "0 1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
          Signed in, but your profile didn&apos;t load
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
          Supabase accepted your sign-in (session email: <strong>{debug.authEmail}</strong>), but
          the app couldn&apos;t find or read your <code>public.users</code> row, so it couldn&apos;t
          finish logging you in. This is a temporary diagnostic page -- send this to the
          Platform Owner:
        </p>
        <pre
          style={{
            padding: "1rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "0.8rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(debug, null, 2)}
        </pre>
      </div>
    );
  }

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
          Design & Construction — internal design standards platform.
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
                background: "var(--brand-pink-lt)",
                border: "1px solid var(--brand-pink)",
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
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <th style={homeThStyle}>Project Number</th>
                    <th style={homeThStyle}>Project Name</th>
                    <th style={homeThStyle}>Project Type</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="tile-card" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={homeTdStyle}>
                        <Link
                          href={`/projects/${project.id}`}
                          style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--brand-blue-dk)" }}
                        >
                          {project.procore_project_number}
                        </Link>
                      </td>
                      <td style={homeTdStyle}>
                        {project.name || <span style={{ color: "var(--hint)" }}>—</span>}
                      </td>
                      <td style={homeTdStyle}>
                        {project.guideline_types.map((t) => GUIDELINE_TYPE_LABELS[t] ?? t).join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Guidelines</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            {GUIDELINE_MODES.map((mode) =>
              mode.comingSoon ? (
                <div
                  key={mode.href}
                  className="tile-card tile-card--disabled"
                  style={{ width: "220px", flex: "0 1 220px" }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{mode.label}</div>
                  <div style={{ fontSize: "0.82rem" }}>Coming soon</div>
                </div>
              ) : (
                <Link
                  key={mode.href}
                  href={mode.href}
                  className="tile-card"
                  style={{ width: "220px", flex: "0 1 220px" }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{mode.label}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    {mode.description}
                  </div>
                </Link>
              )
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Training</h2>
          <Link href="/certifications" className="tile-card" style={{ maxWidth: "220px" }}>
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
