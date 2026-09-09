import Link from "next/link";

import type { RoomPendingChange } from "@/lib/types/rooms";

export default function RoomLockContextBanner({
  projectNumber,
  lockedEditionName,
  changes,
  taxonomyId,
}: {
  projectNumber: string;
  lockedEditionName: string;
  changes: RoomPendingChange[];
  taxonomyId: string;
}) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          padding: "0.6rem 1rem",
          background: "var(--csh-blue-lt)",
          border: "1px solid var(--csh-blue)",
          borderRadius: "6px",
          fontSize: "0.82rem",
          color: "var(--csh-blue-dk)",
        }}
      >
        Showing this room as it stood in <strong>{lockedEditionName}</strong> — the edition{" "}
        <span style={{ fontFamily: "monospace" }}>{projectNumber}</span> is locked to.
      </div>

      {changes.length > 0 && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.85rem 1rem",
            background: "var(--csh-pink-lt)",
            border: "1px solid var(--csh-pink)",
            borderRadius: "6px",
          }}
        >
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--csh-pink)", marginBottom: "0.4rem" }}>
            Changed since this project&apos;s lock
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {changes.map((c) => (
              <li key={`${c.room_taxonomy_id}-${c.changed_in_edition_id}`} style={{ marginBottom: "0.4rem", fontSize: "0.82rem" }}>
                In <strong>{c.changed_in_edition_name}</strong>:{" "}
                {c.changed_fields?.length ? c.changed_fields.join(", ") : "content updated"}
                {c.change_summary ? ` — ${c.change_summary}` : ""}
              </li>
            ))}
          </ul>
          <Link
            href={`/ambulatory/rooms/${taxonomyId}?compareLive=1`}
            style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--csh-pink)" }}
          >
            View the current guideline →
          </Link>
        </div>
      )}
    </div>
  );
}
