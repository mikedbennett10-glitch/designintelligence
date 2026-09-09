import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types/projects";

import LockEditionButton from "./LockEditionButton";

const DEVIATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  approved_with_conditions: "Approved with conditions",
  denied: "Denied",
};

const DEVIATION_STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#fdf1da", fg: "#8a5a00" },
  approved: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  approved_with_conditions: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  denied: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
};

interface RoomRef {
  taxonomy_id: string;
  name: string;
}

interface DeviationSummary {
  id: number;
  reference_number: string | null;
  room_taxonomy_id: string;
  room_name: string;
  standard_element: string;
  status: string;
}

interface DeltaEntry {
  room_taxonomy_id: string;
  room_name: string;
  changed_in_edition_name: string;
  change_summary: string | null;
  changed_fields: string[] | null;
}

interface ProjectDetail {
  project: Project;
  lockedEditionName: string | null;
  currentEditionName: string | null;
  roomsInScope: RoomRef[];
  delta: DeltaEntry[];
  deviations: DeviationSummary[];
}

async function getProjectDetail(id: number): Promise<ProjectDetail | null> {
  const supabase = await createClient();

  const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !project) return null;
  const typedProject = project as Project;
  const primaryGuidelineType = typedProject.guideline_types[0] ?? "AMBULATORY";

  const [{ data: lockedEdition }, { data: currentEdition }, { data: rooms }] = await Promise.all([
    typedProject.edition_lock_id
      ? supabase.from("editions").select("id, name, edition_date").eq("id", typedProject.edition_lock_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("editions")
      .select("id, name, edition_date")
      .eq("guideline_type", primaryGuidelineType)
      .eq("is_current", true)
      .single(),
    typedProject.room_types_in_scope && typedProject.room_types_in_scope.length > 0
      ? supabase
          .from("rooms")
          .select("taxonomy_id, name")
          .in("taxonomy_id", typedProject.room_types_in_scope)
      : Promise.resolve({ data: [] }),
  ]);

  let delta: DeltaEntry[] = [];
  if (typedProject.edition_lock_id && typedProject.room_types_in_scope?.length) {
    const locked = lockedEdition as unknown as { edition_date: string } | null;
    if (locked) {
      const { data: pending } = await supabase
        .from("room_pending_changes")
        .select("*")
        .in("room_taxonomy_id", typedProject.room_types_in_scope)
        .gt("changed_in_edition_date", locked.edition_date);
      delta = (pending ?? []) as unknown as DeltaEntry[];
    }
  }

  // WBS 6.4.5 — project dashboard deviation summary. RLS already scopes
  // this to admins or members of this project, same as the project fetch
  // above, so no extra filtering is needed here.
  const { data: deviations } = await supabase
    .from("deviations")
    .select("id, reference_number, room_taxonomy_id, standard_element, status, room:rooms(name)")
    .eq("project_id", id)
    .order("submitted_at", { ascending: false });

  type DeviationRow = Record<string, unknown> & { room: { name: string } | null };
  const deviationSummaries: DeviationSummary[] = ((deviations ?? []) as unknown as DeviationRow[]).map(
    (d) => ({ ...(d as unknown as DeviationSummary), room_name: d.room?.name ?? String(d.room_taxonomy_id) })
  );

  return {
    project: typedProject,
    lockedEditionName: (lockedEdition as unknown as { name: string } | null)?.name ?? null,
    currentEditionName: (currentEdition as unknown as { name: string } | null)?.name ?? null,
    roomsInScope: (rooms ?? []) as RoomRef[],
    delta,
    deviations: deviationSummaries,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) notFound();

  const user = await getCurrentUser();

  let detail: ProjectDetail | null = null;
  let loadError: string | null = null;
  try {
    detail = await getProjectDetail(projectId);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this project.";
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--csh-pink-lt)",
          border: "1px solid var(--csh-pink)",
          borderRadius: "6px",
          fontSize: "0.875rem",
        }}
      >
        Couldn&apos;t load this project: {loadError}
      </div>
    );
  }

  if (!detail) {
    return (
      <p style={{ color: "var(--muted)" }}>
        This project isn&apos;t available. It may not exist, or you may need to be a member of
        it (or an administrator) to view it.
      </p>
    );
  }

  const { project, lockedEditionName, currentEditionName, roomsInScope, delta, deviations } = detail;
  const primaryGuidelineType = project.guideline_types[0] ?? "AMBULATORY";
  const isCurrent = lockedEditionName && lockedEditionName === currentEditionName;

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)" }}>
          {project.guideline_types.join(", ")}
        </div>
        <h1 style={{ fontSize: "1.5rem", margin: "0.2rem 0" }}>{project.procore_project_number}</h1>
        <form action={`/projects/${project.id}/enter`} method="post" style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Enter project mode
          </button>
        </form>
      </div>

      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          background: "var(--surface)",
        }}
      >
        <h2 style={{ fontSize: "1rem", marginTop: 0, marginBottom: "0.75rem" }}>Edition lock</h2>

        {project.edition_lock_id ? (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ margin: 0 }}>
              Locked to <strong>{lockedEditionName}</strong> on{" "}
              {project.lock_date
                ? new Date(project.lock_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "an unknown date"}{" "}
              ({project.lock_event}).
            </p>
            {!isCurrent && currentEditionName && (
              <p style={{ margin: "0.5rem 0 0", color: "var(--csh-pink)", fontSize: "0.85rem" }}>
                A newer edition ({currentEditionName}) has since been published.
              </p>
            )}
          </div>
        ) : (
          <p style={{ margin: "0 0 1rem", color: "var(--muted)" }}>
            Not locked yet. Lock the edition when this project reaches Schematic Design.
          </p>
        )}

        {user?.tier === "administrative" && (
          <LockEditionButton
            projectId={project.id}
            guidelineType={primaryGuidelineType}
            isRelock={Boolean(project.edition_lock_id)}
          />
        )}
      </section>

      {project.edition_lock_id && delta.length > 0 && (
        <section
          style={{
            border: "1px solid var(--csh-pink)",
            borderRadius: "8px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            background: "var(--csh-pink-lt)",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginTop: 0, marginBottom: "0.4rem", color: "var(--csh-pink)" }}>
            {delta.length} change{delta.length === 1 ? "" : "s"} affect rooms in scope for this project
          </h2>
          <p style={{ margin: "0 0 1rem", fontSize: "0.85rem" }}>
            These rooms changed in a later edition than this project&apos;s lock. Review each and
            decide whether to incorporate it.
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {delta.map((d) => (
              <li
                key={d.room_taxonomy_id}
                style={{
                  padding: "0.6rem 0",
                  borderTop: "1px solid rgba(232,0,107,0.25)",
                }}
              >
                <Link
                  href={`/ambulatory/rooms/${d.room_taxonomy_id}`}
                  style={{ fontWeight: 600, color: "var(--csh-pink)" }}
                >
                  {d.room_name}
                </Link>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  {" "}
                  — changed in {d.changed_in_edition_name}
                  {d.changed_fields?.length ? ` (${d.changed_fields.join(", ")})` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Deviation requests ({deviations.length})
        </h2>
        {deviations.length === 0 ? (
          <p style={{ color: "var(--hint)", fontStyle: "italic" }}>None submitted yet.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {deviations.map((d) => (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}
              >
                <span>
                  <Link href={`/ambulatory/rooms/${d.room_taxonomy_id}`} style={{ color: "var(--csh-blue-dk)", fontWeight: 600 }}>
                    {d.room_name}
                  </Link>
                  <span style={{ color: "var(--muted)" }}> — {d.standard_element}</span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    background: DEVIATION_STATUS_COLORS[d.status]?.bg ?? "var(--csh-charcoal-lt)",
                    color: DEVIATION_STATUS_COLORS[d.status]?.fg ?? "var(--muted)",
                  }}
                >
                  {DEVIATION_STATUS_LABELS[d.status] ?? d.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
          Room types in scope ({roomsInScope.length})
        </h2>
        {roomsInScope.length === 0 ? (
          <p style={{ color: "var(--hint)", fontStyle: "italic" }}>None selected.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {roomsInScope.map((r) => (
              <li key={r.taxonomy_id} style={{ marginBottom: "0.25rem" }}>
                <Link href={`/ambulatory/rooms/${r.taxonomy_id}`} style={{ color: "var(--csh-blue-dk)" }}>
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
