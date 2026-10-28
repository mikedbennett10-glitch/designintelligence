import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import ContentEditorToggle from "./ContentEditorToggle";

interface UserRow {
  email: string;
  display_name: string;
  tier: string;
  organization: string | null;
  is_active: boolean;
  is_content_editor: boolean;
}

async function getUsers(): Promise<UserRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("email, display_name, tier, organization, is_active, is_content_editor")
    .order("display_name");

  if (error) throw error;
  return (data ?? []) as UserRow[];
}

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to manage users.</p>
      </div>
    );
  }

  let users: UserRow[] = [];
  let loadError: string | null = null;
  try {
    users = await getUsers();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load users.";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Users</h1>
          <p style={{ color: "var(--muted)" }}>
            Toggle &quot;Content editor&quot; to let someone edit room Overview, Decision Logic, and
            Intentional Omissions content directly in the app, regardless of their access tier.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          style={{
            flexShrink: 0,
            padding: "0.5rem 0.9rem",
            borderRadius: "6px",
            background: "var(--brand-blue)",
            color: "#fff",
            fontSize: "0.82rem",
            fontWeight: 600,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          + Provision external user
        </Link>
      </div>

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
          Couldn&apos;t load users: {loadError}
        </div>
      ) : users.length === 0 ? (
        <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No users yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {users.map((u) => (
            <div
              key={u.email}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                padding: "0.85rem 1.1rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--surface)",
                opacity: u.is_active ? 1 : 0.6,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {u.display_name}
                  {!u.is_active && (
                    <span style={{ fontWeight: 600, fontSize: "0.7rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {u.email} · {u.tier}
                  {u.organization ? ` · ${u.organization}` : ""}
                </div>
              </div>
              {u.tier === "administrative" ? (
                <span style={{ fontSize: "0.78rem", color: "var(--hint)", fontStyle: "italic" }}>
                  Admins can always edit content
                </span>
              ) : (
                <ContentEditorToggle email={u.email} initialValue={u.is_content_editor} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
