import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/lib/notifications";

import RetrySendButton from "./RetrySendButton";

const STATUS_STYLES: Record<NotificationRow["status"], { bg: string; fg: string; label: string }> = {
  pending: { bg: "#fdf1da", fg: "#8a5a00", label: "Pending" },
  sent: { bg: "var(--brand-blue-lt)", fg: "var(--brand-blue-dk)", label: "Sent" },
  failed: { bg: "var(--brand-pink-lt)", fg: "var(--brand-pink)", label: "Failed" },
};

const TYPE_LABELS: Record<NotificationRow["notification_type"], string> = {
  edition_change: "Edition change",
  deviation_decision: "Deviation decision",
};

async function getNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export default async function AdminNotificationsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to view the notification queue.</p>
      </div>
    );
  }

  let notifications: NotificationRow[] = [];
  let loadError: string | null = null;
  try {
    notifications = await getNotifications();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load notifications.";
  }

  const pendingCount = notifications.filter((n) => n.status === "pending").length;
  const failedCount = notifications.filter((n) => n.status === "failed").length;

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Notification queue</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>
        Edition-change alerts and deviation-decision notices, sent via Google Workspace (Gmail API).
      </p>

      {!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && (
        <div
          style={{
            padding: "0.85rem 1.1rem",
            marginBottom: "1.5rem",
            background: "var(--brand-charcoal-lt)",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            fontSize: "0.82rem",
            color: "var(--muted)",
          }}
        >
          Google Workspace sending isn&apos;t configured yet (pending IT approval of domain-wide
          delegation). Notifications below still queue correctly — they just won&apos;t send until
          that&apos;s in place.
        </div>
      )}

      {loadError ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--brand-pink-lt)",
            border: "1px solid var(--brand-pink)",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          Couldn&apos;t load the notification queue: {loadError}
        </div>
      ) : notifications.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No notifications yet.</p>
      ) : (
        <>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
            {pendingCount} pending · {failedCount} failed · showing latest {notifications.length}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {notifications.map((n) => {
              const style = STATUS_STYLES[n.status];
              return (
                <div
                  key={n.id}
                  style={{
                    padding: "0.85rem 1.1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background: "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "var(--muted)" }}>
                        {TYPE_LABELS[n.notification_type]} · {n.recipient_email}
                      </div>
                      <div style={{ fontWeight: 700, marginTop: "0.15rem" }}>{n.subject}</div>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.55rem",
                        borderRadius: "999px",
                        background: style.bg,
                        color: style.fg,
                        height: "fit-content",
                      }}
                    >
                      {style.label}
                    </span>
                  </div>
                  {n.error_message && (
                    <div style={{ fontSize: "0.78rem", color: "var(--brand-pink)", marginTop: "0.4rem" }}>
                      {n.error_message}
                    </div>
                  )}
                  {n.status !== "sent" && <RetrySendButton notificationId={n.id} />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
