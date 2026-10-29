"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { CurrentUser } from "@/lib/auth";

import { UserCircleIcon } from "./icons";

export default function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        style={{
          width: "2rem",
          height: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
          color: "var(--text)",
          cursor: "pointer",
        }}
      >
        <UserCircleIcon />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.4rem)",
            width: "220px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.7rem 0.9rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{user.displayName}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.1rem" }}>{user.email}</div>
          </div>

          <MenuLink href="/profile" onClick={() => setOpen(false)}>
            Profile
          </MenuLink>
          <MenuLink href="/certificates" onClick={() => setOpen(false)}>
            My Certificates
          </MenuLink>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.65rem 0.9rem",
                border: "none",
                borderTop: "1px solid var(--border)",
                background: "var(--surface)",
                cursor: "pointer",
                fontSize: "0.85rem",
                color: "var(--text)",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
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
        padding: "0.65rem 0.9rem",
        fontSize: "0.85rem",
        color: "var(--text)",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
