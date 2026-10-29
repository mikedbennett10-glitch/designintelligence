import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const TIER_LABELS: Record<string, string> = {
  internal_standard: "Internal",
  external_project: "External · Project",
  external_review: "External · Review",
  administrative: "Administrator",
};

interface ProfileFields {
  job_title: string | null;
  region: string | null;
  organization: string | null;
}

async function getProfileFields(email: string): Promise<ProfileFields | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("job_title, region, organization")
    .eq("email", email)
    .maybeSingle();
  return (data as ProfileFields | null) ?? null;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.02em", color: "var(--muted)" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.95rem", marginTop: "0.2rem" }}>
        {value || <span style={{ color: "var(--hint)" }}>—</span>}
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <Header user={null} />
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <p style={{ color: "var(--muted)" }}>Sign in to view your profile.</p>
        </main>
      </div>
    );
  }

  const fields = await getProfileFields(user.email);

  return (
    <div>
      <Header user={user} />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "480px" }}>
          <h1 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>Profile</h1>
          <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "0 1.25rem", background: "var(--surface)" }}>
            <Field label="Full name" value={user.displayName} />
            <Field label="Title" value={fields?.job_title} />
            <Field label="Region" value={fields?.region} />
            {fields?.organization && <Field label="Organization" value={fields.organization} />}
            <Field label="Email" value={user.email} />
            <Field label="Access tier" value={TIER_LABELS[user.tier] ?? user.tier} />
          </div>
        </div>
      </main>
    </div>
  );
}
