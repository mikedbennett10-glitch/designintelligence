import { requireAdmin } from "@/lib/auth";

import TrainingModuleForm from "./TrainingModuleForm";

export default async function NewTrainingModulePage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to author training modules.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>New training module</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Reading content plus a multiple-choice quiz. Users must meet the passing score to complete it.
      </p>
      <TrainingModuleForm />
    </div>
  );
}
