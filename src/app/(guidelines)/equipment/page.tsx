import EquipmentRepository from "@/components/guidelines/EquipmentRepository";
import { getEquipmentWithUsage } from "@/lib/repository";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let equipment: Awaited<ReturnType<typeof getEquipmentWithUsage>> = [];
  let loadError: string | null = null;

  try {
    equipment = await getEquipmentWithUsage();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load the equipment schedule.";
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Equipment Schedule</h1>
        <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
          Every equipment item referenced across the Ambulatory guidelines, its OFOI/OFCI
          responsibility, and the rooms it&apos;s currently assigned to.
        </p>
      </div>

      {loadError ? (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--csh-pink-lt)",
            border: "1px solid var(--csh-pink)",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          Couldn&apos;t load the equipment schedule: {loadError}
        </div>
      ) : (
        <EquipmentRepository equipment={equipment} initialQuery={q ?? ""} />
      )}
    </div>
  );
}
