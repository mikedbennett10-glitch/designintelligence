import { requireAdmin } from "@/lib/auth";

import CodeReferenceForm from "./CodeReferenceForm";

export default async function NewCodeReferencePage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to manage code reference entries.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>New code reference entry</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        The applicable FGI edition/document for a jurisdiction and facility type, plus any other
        relevant codes.
      </p>
      <CodeReferenceForm />
    </div>
  );
}
