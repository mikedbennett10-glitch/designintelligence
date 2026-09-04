import type { EditionChangeItem } from "@/lib/types/rooms";

const CHANGE_TYPE_LABELS: Record<EditionChangeItem["change_type"], string> = {
  N: "New",
  M: "Modified",
  E: "Eliminated",
};

const CHANGE_TYPE_COLORS: Record<EditionChangeItem["change_type"], { bg: string; fg: string }> = {
  N: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  M: { bg: "#fdf1da", fg: "#8a5a00" },
  E: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
};

export interface VersionHistoryEntry extends EditionChangeItem {
  edition_name: string;
}

export default function VersionHistory({ entries }: { entries: VersionHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
        No logged changes for this room yet. It has been part of every edition since it was
        created.
      </p>
    );
  }

  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {entries.map((entry) => (
        <li
          key={entry.id}
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1rem 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              alignSelf: "flex-start",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.15rem 0.55rem",
              borderRadius: "999px",
              background: CHANGE_TYPE_COLORS[entry.change_type].bg,
              color: CHANGE_TYPE_COLORS[entry.change_type].fg,
            }}
          >
            {CHANGE_TYPE_LABELS[entry.change_type]}
          </span>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.15rem" }}>
              {entry.edition_name}
              {entry.page ? ` · ADG p.${entry.page}` : ""}
            </div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{entry.title}</div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text)" }}>
              {entry.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
