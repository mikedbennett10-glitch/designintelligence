"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { label: "Ambulatory", href: "/guidelines/ambulatory" },
  { label: "Acute", href: "/guidelines/acute" },
] as const;

export default function ModeToggle() {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      aria-label="Guideline mode"
      style={{
        display: "inline-flex",
        border: "1px solid var(--border-strong)",
        borderRadius: "999px",
        padding: "2px",
        background: "var(--csh-charcoal-lt)",
      }}
    >
      {MODES.map((mode) => {
        const active = pathname?.startsWith(mode.href);
        return (
          <Link
            key={mode.href}
            href={mode.href}
            role="tab"
            aria-selected={active}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
              color: active ? "#ffffff" : "var(--muted)",
              background: active ? "var(--csh-blue)" : "transparent",
              transition: "background 0.15s ease",
            }}
          >
            {mode.label}
          </Link>
        );
      })}
    </div>
  );
}
