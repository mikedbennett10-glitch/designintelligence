import Link from "next/link";

import { requireAdmin } from "@/lib/auth";

const SECTIONS = [
  {
    href: "/admin/deviations",
    title: "Deviations",
    description: "Review and decide on submitted standard deviation requests.",
  },
  {
    href: "/admin/users",
    title: "Users",
    description: "Manage existing users, including content-editor access.",
  },
  {
    href: "/admin/users/new",
    title: "New users",
    description: "Provision an external user and send their magic-link invite.",
  },
  {
    href: "/admin/training",
    title: "Training",
    description: "Manage training modules, requirements, and quizzes.",
  },
  {
    href: "/admin/code-reference",
    title: "Code reference",
    description: "Manage code reference entries.",
  },
  {
    href: "/admin/notifications",
    title: "Notifications",
    description: "View and retry the outbound notification queue.",
  },
] as const;

export default async function AdminHomePage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Administration</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Platform management -- users, deviations, training, and notifications.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="tile-card"
            style={{ display: "block", padding: "0.9rem 1.1rem", borderRadius: "8px" }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{section.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{section.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
