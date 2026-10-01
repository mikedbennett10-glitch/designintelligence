"use client";

import { useEffect, useRef, useState } from "react";

import type { SearchResult } from "@/app/api/search/route";

export default function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results ?? []);
          setOpen(true);
        })
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <input
        type="search"
        placeholder="Search a room, finish, equipment, or furniture code…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        style={{
          width: "100%",
          padding: "0.55rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid var(--border-strong)",
          fontSize: "0.9rem",
          boxSizing: "border-box",
        }}
      />
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.25rem)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: "0.75rem", fontSize: "0.82rem", color: "var(--hint)", fontStyle: "italic" }}>
              No matches for &quot;{query}&quot;
            </div>
          ) : (
            results.map((r) => (
              <a
                key={`${r.type}-${r.code}`}
                href={r.href}
                onClick={handleSelect}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.6rem",
                  padding: "0.6rem 0.85rem",
                  textDecoration: "none",
                  color: "var(--text)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    color: "var(--brand-blue-dk)",
                    flexShrink: 0,
                  }}
                >
                  {r.type}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", flexShrink: 0 }}>{r.code}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.name}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
