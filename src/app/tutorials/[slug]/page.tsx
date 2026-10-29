import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { findGuide } from "@/lib/tutorials";

export default async function TutorialGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <Header user={null} />
        <main style={{ maxWidth: "760px", margin: "0 auto", padding: "1.1rem 1.5rem 2rem" }}>
          <p style={{ color: "var(--muted)" }}>Sign in to view this guide.</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} />
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "1.1rem 1.5rem 2rem" }}>
        <Link href="/tutorials" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--brand-blue-dk)" }}>
          ← Tutorials
        </Link>
        <h1 style={{ fontSize: "1.4rem", margin: "0.5rem 0 0.25rem" }}>{guide.title}</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>{guide.description}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {guide.steps.map((step, i) => (
            <div key={step.image}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.5rem" }}>
                STEP {i + 1}
              </div>
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "0.6rem",
                }}
              >
                <Image
                  src={step.image}
                  alt={step.caption}
                  width={1100}
                  height={750}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              <p style={{ fontSize: "0.9rem" }}>{step.caption}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
