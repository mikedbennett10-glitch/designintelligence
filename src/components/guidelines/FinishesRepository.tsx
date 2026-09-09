"use client";

import { useMemo, useState } from "react";

import type { FinishWithUsage } from "@/lib/types/rooms";

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--muted)",
  padding: "0.6rem 0.85rem",
  borderBottom: "1px solid var(--border)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "0.65rem 0.85rem",
  borderBottom: "1px solid var(--border)",
  fontSize: "0.85rem",
  verticalAlign: "top",
};

const controlStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  fontSize: "0.85rem",
};

const swatchColors: Record<string, string> = {
  "warm grey": "#9b9690",
  "csh blue accent": "#0076a8",
  "clinical grey": "#b6b3ad",
  "pale blue": "#b3d8eb",
  "soft white": "#f5f4f1",
  "arctic white": "#ffffff",
  white: "#ffffff",
};

function Swatch({ color }: { color: string | null }) {
  const bg = color ? swatchColors[color.toLowerCase()] ?? "var(--csh-charcoal-lt)" : "var(--csh-charcoal-lt)";
  return (
    <span
      title={color ?? "No color on file"}
      style={{
        display: "inline-block",
        width: "1.1rem",
        height: "1.1rem",
        borderRadius: "4px",
        border: "1px solid var(--border-strong)",
        background: bg,
        verticalAlign: "middle",
        marginRight: "0.5rem",
      }}
    />
  );
}

export default function FinishesRepository({
  finishes,
  initialQuery = "",
}: {
  finishes: FinishWithUsage[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState("all");
  const [productType, setProductType] = useState("all");

  const productTypes = useMemo(
    () => Array.from(new Set(finishes.map((f) => f.product_type))).sort(),
    [finishes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return finishes.filter((f) => {
      if (scope !== "all" && f.guideline_scope !== scope) return false;
      if (productType !== "all" && f.product_type !== productType) return false;
      if (!q) return true;
      return [f.code, f.product_type, f.manufacturer, f.product_name, f.description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [finishes, query, scope, productType]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <input
          type="search"
          placeholder="Search code, product type, manufacturer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...controlStyle, flex: "1 1 260px" }}
        />
        <select value={productType} onChange={(e) => setProductType(e.target.value)} style={controlStyle}>
          <option value="all">All product types</option>
          {productTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={scope} onChange={(e) => setScope(e.target.value)} style={controlStyle}>
          <option value="all">All scopes</option>
          <option value="AMBULATORY">Ambulatory</option>
          <option value="ACUTE">Acute</option>
          <option value="SHARED">Shared</option>
        </select>
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
        {filtered.length} of {finishes.length} finishes
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--surface)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Code</th>
              <th style={th}>Product type</th>
              <th style={th}>Product</th>
              <th style={th}>Color</th>
              <th style={th}>Scope</th>
              <th style={th}>Used in</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...td, color: "var(--hint)", fontStyle: "italic" }}>
                  No finishes match this search.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f.code}>
                  <td style={{ ...td, fontFamily: "monospace", fontWeight: 600 }}>{f.code}</td>
                  <td style={td}>{f.product_type}</td>
                  <td style={td}>
                    {[f.manufacturer, f.product_name].filter(Boolean).join(" — ") || "—"}
                  </td>
                  <td style={td}>
                    <Swatch color={f.color} />
                    {f.color ?? "—"}
                  </td>
                  <td style={{ ...td, color: "var(--muted)" }}>{f.guideline_scope}</td>
                  <td style={{ ...td, color: "var(--muted)" }}>
                    {f.usedInRooms.length === 0
                      ? "Not yet assigned"
                      : f.usedInRooms.map((r) => r.name).join(", ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
