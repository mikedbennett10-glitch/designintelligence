import Link from "next/link";

import type { Edition } from "@/lib/types/rooms";

const STATUS_LABELS: Record<Edition["status"], string> = {
  draft: "Draft",
  review: "In Review",
  released: "Released",
  superseded: "Superseded",
};

export default function EditionTimeline({
  editions,
  selectedCode,
}: {
  editions: Edition[];
  selectedCode: string;
}) {
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderLeft: "2px solid var(--border)",
      }}
    >
      {editions.map((edition) => {
        const active = edition.edition_code === selectedCode;
        return (
          <li key={edition.id} style={{ position: "relative", paddingLeft: "1.25rem", marginBottom: "1.25rem" }}>
            <span
              style={{
                position: "absolute",
                left: "-7px",
                top: "0.3rem",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: active ? "var(--csh-blue)" : "var(--surface)",
                border: `2px solid ${active ? "var(--csh-blue)" : "var(--border-strong)"}`,
              }}
            />
            <Link
              href={`/version-history?edition=${edition.edition_code}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: active ? "var(--csh-blue-dk)" : "var(--text)",
              }}
            >
              <div style={{ fontWeight: active ? 700 : 600, fontSize: "0.9rem" }}>{edition.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.1rem" }}>
                {new Date(edition.edition_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </div>
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.35rem" }}>
                {edition.is_current && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.1rem 0.45rem",
                      borderRadius: "999px",
                      background: "var(--csh-blue-lt)",
                      color: "var(--csh-blue-dk)",
                    }}
                  >
                    Current
                  </span>
                )}
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--hint)",
                  }}
                >
                  {STATUS_LABELS[edition.status]}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
