"use client";

import { useEffect, useRef, useState } from "react";

import type { TaxonomyLookupEntry } from "@/lib/svgLookup";

const TYPE_LABEL: Record<TaxonomyLookupEntry["type"], string> = {
  furniture: "Furniture",
  equipment: "Equipment",
};

/**
 * Renders an inline SVG and wires up any element carrying
 * `data-taxonomy-id` as a hotspot: hovering shows its resolved room-data
 * record, clicking pins it. This is the consuming side of the lookup
 * engine in src/lib/svgLookup.ts (WBS 3.5.1) — a first cut at the hover
 * panel from 3.5.2, scoped to furniture/equipment.
 */
export default function SvgHotspotViewer({
  svgMarkup,
  lookup,
}: {
  svgMarkup: string;
  lookup: Record<string, TaxonomyLookupEntry>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hotspots = Array.from(container.querySelectorAll<SVGElement>("[data-taxonomy-id]"));

    function idOf(e: Event) {
      return (e.currentTarget as SVGElement).getAttribute("data-taxonomy-id");
    }
    function handleEnter(e: Event) {
      setHoveredId(idOf(e));
    }
    function handleLeave() {
      setHoveredId(null);
    }
    function handleClick(e: Event) {
      const id = idOf(e);
      setPinnedId((prev) => (prev === id ? null : id));
    }
    function handleKeyDown(e: Event) {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        handleClick(e);
      }
    }

    hotspots.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
      el.addEventListener("click", handleClick);
      el.addEventListener("keydown", handleKeyDown);
    });

    return () => {
      hotspots.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
        el.removeEventListener("click", handleClick);
        el.removeEventListener("keydown", handleKeyDown);
      });
    };
  }, [svgMarkup]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll("[data-taxonomy-id]").forEach((el) => {
      const id = el.getAttribute("data-taxonomy-id");
      el.classList.toggle("dip-hotspot-hover", id !== null && id === hoveredId);
      el.classList.toggle("dip-hotspot-pinned", id !== null && id === pinnedId);
    });
  }, [hoveredId, pinnedId]);

  const shownId = hoveredId ?? pinnedId;
  const shown = shownId ? lookup[shownId] : null;

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <style>{`
        .dip-svg-hotspot-container svg { max-width: 100%; height: auto; display: block; }
        .dip-svg-hotspot-container [data-taxonomy-id] { cursor: pointer; }
        .dip-svg-hotspot-container [data-taxonomy-id]:focus-visible {
          outline: 2px solid var(--brand-blue);
          outline-offset: 2px;
        }
        .dip-svg-hotspot-container .dip-hotspot-hover > rect,
        .dip-svg-hotspot-container .dip-hotspot-hover > circle {
          fill-opacity: 0.75;
          stroke: var(--brand-blue);
          stroke-width: 1.5;
        }
        .dip-svg-hotspot-container .dip-hotspot-pinned > rect,
        .dip-svg-hotspot-container .dip-hotspot-pinned > circle {
          stroke: var(--brand-pink);
          stroke-width: 2;
        }
      `}</style>

      <div
        ref={containerRef}
        className="dip-svg-hotspot-container"
        style={{
          flex: "1 1 320px",
          minWidth: 0,
          border: "1px solid var(--border)",
          borderRadius: "8px",
          background: "var(--surface)",
          padding: "0.75rem",
        }}
        // eslint-disable-next-line react/no-danger -- svgMarkup is our own static /public asset, not user input
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />

      <div style={{ width: "230px", flexShrink: 0 }}>
        {shown ? (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.75rem",
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--muted)",
                marginBottom: "0.25rem",
              }}
            >
              {TYPE_LABEL[shown.type]}
            </div>
            <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{shown.name}</div>
            <div
              style={{
                fontSize: "0.76rem",
                color: "var(--muted)",
                fontFamily: "monospace",
                marginBottom: "0.4rem",
              }}
            >
              {shown.taxonomy_id}
            </div>
            {(shown.manufacturer || shown.model) && (
              <div style={{ fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                {[shown.manufacturer, shown.model].filter(Boolean).join(" — ")}
              </div>
            )}
            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Qty: {shown.quantity}</div>
            {shown.notes && (
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.4rem" }}>
                {shown.notes}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "0.78rem", color: "var(--hint)", fontStyle: "italic", padding: "0.75rem" }}>
            Hover or click an item in the drawing to see its spec. Click again to unpin.
          </div>
        )}
      </div>
    </div>
  );
}
