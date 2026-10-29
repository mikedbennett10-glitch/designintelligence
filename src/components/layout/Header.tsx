"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import GlobalSearch from "@/components/layout/GlobalSearch";
import ModeToggle from "@/components/layout/ModeToggle";
import NotificationBell from "@/components/layout/NotificationBell";
import UserMenu from "@/components/layout/UserMenu";
import type { CurrentUser } from "@/lib/auth";

export type HeaderUser = CurrentUser;

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
          position: "relative",
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
          <div
            className="dip-header-desktop-nav"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <ModeToggle />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          {user ? (
            <>
              <div className="dip-header-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Link href="/" style={navLinkStyle}>
                  Home
                </Link>
                <Link href="/projects" style={navLinkStyle}>
                  Projects
                </Link>
                <Link href="/certifications" style={navLinkStyle}>
                  Training
                </Link>
                {user.tier === "administrative" && (
                  <Link href="/admin" style={navLinkStyle}>
                    Admin
                  </Link>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <NotificationBell />
                <UserMenu user={user} />
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
              </div>
            </>
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
          <MobileLink href="/certifications" onClick={() => setMobileMenuOpen(false)}>
            Training
          </MobileLink>
          {user.tier === "administrative" && (
            <MobileLink href="/admin" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </MobileLink>
          )}
          <div
            style={{
              marginTop: "0.5rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <ModeToggle />
          </div>
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
