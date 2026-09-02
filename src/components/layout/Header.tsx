import Link from "next/link";

import ModeToggle from "@/components/layout/ModeToggle";

export default function Header() {
  return (
    <header
      style={{
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link
        href="/ambulatory"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.5rem",
          textDecoration: "none",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-doc)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--csh-blue-dk)",
          }}
        >
          Design Intelligence Platform
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          CommonSpirit Health NRES PDC
        </span>
      </Link>

      <ModeToggle />
    </header>
  );
}
