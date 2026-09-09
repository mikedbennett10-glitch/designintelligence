import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header
        style={{
          height: "var(--header-height)",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0 1.5rem",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/ambulatory"
          style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none" }}
        >
          ← Guidelines
        </Link>
        <span
          style={{
            fontFamily: "var(--font-doc)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--csh-blue-dk)",
          }}
        >
          Platform Administration
        </span>
      </header>
      <main style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>{children}</main>
    </div>
  );
}
