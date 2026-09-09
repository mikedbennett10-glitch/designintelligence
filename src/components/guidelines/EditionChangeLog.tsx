"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { EditionChangeWithRoom } from "@/lib/types/rooms";

const CHANGE_TYPE_LABELS: Record<EditionChangeWithRoom["change_type"], string> = {
  N: "New",
  M: "Modified",
  E: "Eliminated",
};

const CHANGE_TYPE_COLORS: Record<
  EditionChangeWithRoom["change_type"],
  { bg: string; fg: string }
> = {
  N: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
  M: { bg: "#fdf1da", fg: "#8a5a00" },
  E: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
};

const ALL_TYPES: EditionChangeWithRoom["change_type"][] = ["N", "M", "E"];

function TypeChip({
  type,
  active,
  onClick,
}: {
  type: EditionChangeWithRoom["change_type"];
  active: boolean;
  onClick: () => void;
}) {
  const c = CHANGE_TYPE_COLORS[type];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        cursor: "pointer",
        border: `1px solid ${active ? c.fg : "var(--border-strong)"}`,
        background: active ? c.bg : "var(--surface)",
        color: active ? c.fg : "var(--muted)",
        borderRadius: "999px",
        padding: "0.3rem 0.75rem",
        fontSize: "0.78rem",
        fontWeight: 600,
      }}
    >
      {CHANGE_TYPE_LABELS[type]}
    </button>
  );
}

export default function EditionChangeLog({ changes }: { changes: EditionChangeWithRoom[] }) {
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(ALL_TYPES));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleType(t: string) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function toggleSection(section: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return changes.filter((c) => {
      if (!activeTypes.has(c.change_type)) return false;
      if (!q) return true;
      return [c.title, c.description, c.section, c.page]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q));
    });
  }, [changes, query, activeTypes]);

  const sections = useMemo(() => {
    const order: string[] = [];
    const bySection = new Map<string, EditionChangeWithRoom[]>();
    for (const c of filtered) {
      if (!bySection.has(c.section)) order.push(c.section);
      const list = bySection.get(c.section) ?? [];
      list.push(c);
      bySection.set(c.section, list);
    }
    return order.map((section) => ({ section, entries: bySection.get(section)! }));
  }, [filtered]);

  if (changes.length === 0) {
    return (
      <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
        No changes logged for this edition — it&apos;s the baseline.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <input
          type="search"
          placeholder="Search changes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: "1 1 260px",
            padding: "0.5rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid var(--border-strong)",
            fontSize: "0.85rem",
          }}
        />
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {ALL_TYPES.map((t) => (
            <TypeChip key={t} type={t} active={activeTypes.has(t)} onClick={() => toggleType(t)} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
        {filtered.length} of {changes.length} changes
      </div>

      {sections.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No changes match this search.</p>
      ) : (
        sections.map(({ section, entries }) => {
          const isCollapsed = collapsed.has(section);
          return (
            <div key={section} style={{ marginBottom: "1.25rem" }}>
              <button
                type="button"
                onClick={() => toggleSection(section)}
                style={{
                  appearance: "none",
                  background: "var(--surface-2, var(--csh-charcoal-lt))",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.6rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}
              >
                <span>
                  {section} <span style={{ color: "var(--muted)", fontWeight: 500 }}>({entries.length})</span>
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                  {isCollapsed ? "Show" : "Hide"}
                </span>
              </button>

              {!isCollapsed && (
                <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "1rem",
                        borderLeft: "1px solid var(--border)",
                        borderRight: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface)",
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
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: "1rem",
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{entry.title}</div>
                          {entry.page && (
                            <div style={{ fontSize: "0.75rem", color: "var(--hint)", flexShrink: 0 }}>
                              ADG p.{entry.page}
                            </div>
                          )}
                        </div>
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
                          {entry.description}
                        </p>
                        {entry.room_taxonomy_id && (
                          <Link
                            href={`/ambulatory/rooms/${entry.room_taxonomy_id}`}
                            style={{
                              display: "inline-block",
                              marginTop: "0.5rem",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "var(--csh-blue-dk)",
                            }}
                          >
                            View {entry.room_name ?? entry.room_taxonomy_id} →
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
