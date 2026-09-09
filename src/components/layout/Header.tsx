import Link from "next/link";

import ModeToggle from "@/components/layout/ModeToggle";
import type { CurrentUser } from "@/lib/auth";

export type HeaderUser = CurrentUser;

const TIER_LABELS: Record<string, string> = {
  internal_standard: "Internal",
  external_project: "External · Project",
  external_review: "External · Review",
  administrative: "Administrator",
};

export default function Header({ user }: { user: HeaderUser | null }) {
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

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <ModeToggle />

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link
              href="/projects"
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--csh-blue-dk)" }}
            >
              Projects
            </Link>
            {user.tier === "administrative" && (
              <Link
                href="/admin/users/new"
                style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--csh-blue-dk)" }}
              >
                Provision user
              </Link>
            )}
            <div style={{ textAlign: "right", lineHeight: 1.3 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{user.displayName}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {TIER_LABELS[user.tier] ?? user.tier}
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                style={{
                  appearance: "none",
                  background: "none",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "6px",
                  padding: "0.35rem 0.7rem",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--csh-blue-dk)",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
