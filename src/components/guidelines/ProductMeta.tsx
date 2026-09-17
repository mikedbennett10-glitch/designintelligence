import Link from "next/link";

import type { RoomUsageRef } from "@/lib/types/rooms";

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.9rem" }}>{value}</div>
    </div>
  );
}

export function ProductFacts({ facts }: { facts: { label: string; value: string | null | undefined }[] }) {
  const visible = facts.filter((f) => f.value);
  if (visible.length === 0) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      {visible.map((f) => (
        <Fact key={f.label} label={f.label} value={f.value} />
      ))}
    </div>
  );
}

export function ProductExternalLinks({
  productUrl,
  revitModelUrl,
}: {
  productUrl: string | null;
  revitModelUrl?: string | null;
}) {
  if (!productUrl && !revitModelUrl) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem" }}>
      {productUrl && (
        <a
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.5rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid var(--brand-blue)",
            color: "var(--brand-blue-dk)",
            fontSize: "0.82rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View vendor product page →
        </a>
      )}
      {revitModelUrl && (
        <a
          href={revitModelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "0.5rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid var(--border-strong)",
            color: "var(--muted)",
            fontSize: "0.82rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Download .rvt model
        </a>
      )}
    </div>
  );
}

export function UsedInRooms({ rooms }: { rooms: RoomUsageRef[] }) {
  return (
    <div>
      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Used in</h2>
      {rooms.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>Not currently assigned to any room.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          {rooms.map((r) => (
            <li key={r.taxonomy_id} style={{ marginBottom: "0.35rem" }}>
              <Link href={`/ambulatory/rooms/${r.taxonomy_id}`} style={{ color: "var(--brand-blue-dk)", fontWeight: 600 }}>
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
