"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import GlobalSearch from "@/components/layout/GlobalSearch";
import ModeToggle from "@/components/layout/ModeToggle";
import type { CurrentUser } from "@/lib/auth";

export type HeaderUser = CurrentUser;

const TIER_LABELS: Record<string, string> = {
  internal_standard: "Internal",
  external_project: "External · Project",
  external_review: "External · Review",
  administrative: "Administrator",
};

const navLinkStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--brand-blue-dk)",
};

export default function Header({ user }: { user: HeaderUser | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          gap: "1rem",
        }}
      >
        <Link
          href="/"
          className="dip-header-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/brand/logo.png"
            alt="Design Intelligence Platform"
            width={1000}
            height={500}
            priority
            className="dip-logo-full"
            style={{ height: "64px", width: "auto" }}
          />
          <Image
            src="/brand/mark.png"
            alt="Design Intelligence Platform"
            width={256}
            height={256}
            priority
            className="dip-logo-mark"
            style={{ height: "64px", width: "auto" }}
          />
        </Link>

        {user && (
          <button
            type="button"
            className="dip-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              fontSize: "1.1rem",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        )}

        <div
          className="dip-header-desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
        >
          <ModeToggle />

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Link href="/" style={navLinkStyle}>
                Home
              </Link>
              <Link href="/projects" style={navLinkStyle}>
                Projects
              </Link>
              {user.tier === "administrative" && (
                <Link href="/admin/deviations" style={navLinkStyle}>
                  Deviations
                </Link>
              )}
              {user.tier === "administrative" && (
                <Link href="/admin/training" style={navLinkStyle}>
                  Training
                </Link>
              )}
              {user.tier === "administrative" && (
                <Link href="/admin/notifications" style={navLinkStyle}>
                  Notifications
                </Link>
              )}
              {user.tier === "administrative" && (
                <Link href="/admin/code-reference" style={navLinkStyle}>
                  Code Reference
                </Link>
              )}
              {user.tier === "administrative" && (
                <Link href="/admin/users/new" style={navLinkStyle}>
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
                color: "var(--brand-blue-dk)",
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {user && (
        <div className="dip-mobile-search" style={{ padding: "0 1rem 0.75rem" }}>
          <GlobalSearch />
        </div>
      )}

      {user && mobileMenuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "0.5rem 1rem 1rem",
            borderTop: "1px solid var(--border)",
            gap: "0.1rem",
          }}
        >
          <MobileLink href="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </MobileLink>
          <MobileLink href="/projects" onClick={() => setMobileMenuOpen(false)}>
            Projects
          </MobileLink>
          {user.tier === "administrative" && (
            <>
              <MobileLink href="/admin/deviations" onClick={() => setMobileMenuOpen(false)}>
                Deviations
              </MobileLink>
              <MobileLink href="/admin/training" onClick={() => setMobileMenuOpen(false)}>
                Training
              </MobileLink>
              <MobileLink href="/admin/notifications" onClick={() => setMobileMenuOpen(false)}>
                Notifications
              </MobileLink>
              <MobileLink href="/admin/code-reference" onClick={() => setMobileMenuOpen(false)}>
                Code Reference
              </MobileLink>
              <MobileLink href="/admin/users/new" onClick={() => setMobileMenuOpen(false)}>
                Provision user
              </MobileLink>
            </>
          )}
          <div
            style={{
              marginTop: "0.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user.displayName}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
              {TIER_LABELS[user.tier] ?? user.tier}
            </div>
            <ModeToggle />
          </div>
          <form action="/auth/signout" method="post" style={{ marginTop: "0.75rem" }}>
            <button
              type="submit"
              style={{
                width: "100%",
                appearance: "none",
                background: "none",
                border: "1px solid var(--border-strong)",
                borderRadius: "6px",
                padding: "0.5rem 0.7rem",
                fontSize: "0.8rem",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "block",
        padding: "0.65rem 0.25rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "var(--brand-blue-dk)",
        textDecoration: "none",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {children}
    </Link>
  );
}
