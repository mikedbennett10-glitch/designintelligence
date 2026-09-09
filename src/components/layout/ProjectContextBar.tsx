import type { ProjectWithEdition } from "@/lib/types/projects";

export default function ProjectContextBar({ project }: { project: ProjectWithEdition }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.6rem 1.5rem",
        background: "var(--csh-blue-dk)",
        color: "#fff",
        fontSize: "0.82rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span
          style={{
            fontSize: "0.66rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            padding: "0.15rem 0.5rem",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.18)",
          }}
        >
          Project mode
        </span>
        <span>
          Viewing in the context of{" "}
          <strong style={{ fontFamily: "monospace" }}>{project.procore_project_number}</strong>
          {project.locked_edition_name
            ? ` — locked to ${project.locked_edition_name}`
            : " — edition not locked yet"}
        </span>
      </div>
      <form action="/projects/exit" method="post">
        <button
          type="submit"
          style={{
            appearance: "none",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: "6px",
            padding: "0.3rem 0.7rem",
            fontSize: "0.75rem",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Exit project mode
        </button>
      </form>
    </div>
  );
}
