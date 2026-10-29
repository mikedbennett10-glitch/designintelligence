import Link from "next/link";

import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { GUIDES, VIDEOS } from "@/lib/tutorials";

export default async function TutorialsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <Header user={null} />
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "1.1rem 1.5rem 2rem" }}>
          <p style={{ color: "var(--muted)" }}>Sign in to view tutorials.</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "1.1rem 1.5rem 2rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Tutorials</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem", maxWidth: "60ch" }}>
          Step-by-step guides and video walkthroughs for every part of the platform.
        </p>

        <section style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "0.6rem" }}>Step-by-step guides</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {GUIDES.map((g) =>
              g.status === "available" ? (
                <Link
                  key={g.slug}
                  href={`/tutorials/${g.slug}`}
                  className="tile-card"
                  style={{ display: "block" }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{g.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{g.description}</div>
                </Link>
              ) : (
                <div key={g.slug} className="tile-card tile-card--disabled">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{g.title}</div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                      COMING SOON
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem" }}>{g.description}</div>
                </div>
              )
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "0.6rem" }}>Video tutorials</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {VIDEOS.map((v) => (
              <div key={v.slug} className="tile-card tile-card--disabled">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{v.title}</div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                    COMING SOON
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem" }}>{v.description}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
