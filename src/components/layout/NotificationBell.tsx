"use client";

import { useEffect, useRef, useState } from "react";

import { getMyNotifications, markNotificationRead, type MyNotification } from "./notification-actions";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MyNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyNotifications().then((rows) => {
      setNotifications(rows);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function handleOpenNotification(n: MyNotification) {
    if (!n.read_at) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
      );
      await markNotificationRead(n.id);
    }
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          position: "relative",
          width: "2rem",
          height: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "16px",
              height: "16px",
              padding: "0 3px",
              borderRadius: "999px",
              background: "var(--brand-pink)",
              color: "#fff",
              fontSize: "0.62rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.4rem)",
            width: "320px",
            maxHeight: "380px",
            overflowY: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              padding: "0.65rem 0.9rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--muted)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            Notifications
          </div>
          {!loaded ? (
            <div style={{ padding: "1rem 0.9rem", fontSize: "0.82rem", color: "var(--hint)" }}>Loading…</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: "1rem 0.9rem", fontSize: "0.82rem", color: "var(--hint)", fontStyle: "italic" }}>
              Nothing yet.
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => handleOpenNotification(n)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.65rem 0.9rem",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  background: n.read_at ? "var(--surface)" : "var(--brand-blue-lt)",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                }}
              >
                <div style={{ fontWeight: n.read_at ? 500 : 700, color: "var(--text)" }}>{n.subject}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                  {timeAgo(n.created_at)}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
