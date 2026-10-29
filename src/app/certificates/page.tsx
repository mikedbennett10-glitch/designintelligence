import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface CertificateRow {
  module_id: number;
  module_code: string;
  module_title: string;
  completed_at: string;
  score: number | null;
}

async function getCertificates(email: string): Promise<CertificateRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_completions")
    .select("module_id, completed_at, score, module:training_modules(module_code, title)")
    .eq("user_email", email)
    .eq("passed", true)
    .order("completed_at", { ascending: false });

  if (error) throw error;

  type Row = {
    module_id: number;
    completed_at: string;
    score: number | null;
    module: { module_code: string; title: string } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    module_id: r.module_id,
    module_code: r.module?.module_code ?? String(r.module_id),
    module_title: r.module?.title ?? "Training module",
    completed_at: r.completed_at,
    score: r.score,
  }));
}

export default async function CertificatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <Header user={null} />
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <p style={{ color: "var(--muted)" }}>Sign in to view your certificates.</p>
        </main>
      </div>
    );
  }

  let certificates: CertificateRow[] = [];
  let loadError: string | null = null;
  try {
    certificates = await getCertificates(user.email);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load your certificates.";
  }

  return (
    <div>
      <Header user={user} />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>My Certificates</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Training modules you&apos;ve completed and passed.
        </p>

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
            Couldn&apos;t load your certificates: {loadError}
          </div>
        ) : certificates.length === 0 ? (
          <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
            No completed training modules yet. See /certifications for what&apos;s required.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {certificates.map((cert) => (
              <div
                key={cert.module_id}
                className="tile-card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{cert.module_title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.15rem", fontFamily: "monospace" }}>
                    {cert.module_code}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.8rem", color: "var(--muted)" }}>
                  <div>Completed {new Date(cert.completed_at).toLocaleDateString()}</div>
                  {cert.score !== null && <div>Score: {cert.score}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
