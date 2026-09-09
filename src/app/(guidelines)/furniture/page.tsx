import FurnitureRepository from "@/components/guidelines/FurnitureRepository";
import { getFurnitureWithUsage } from "@/lib/repository";

export default async function FurniturePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let furniture: Awaited<ReturnType<typeof getFurnitureWithUsage>> = [];
  let loadError: string | null = null;

  try {
    furniture = await getFurnitureWithUsage();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load the furniture schedule.";
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Furniture / FF&amp;E Schedule</h1>
        <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
          Every furniture item referenced across the Ambulatory guidelines, and the rooms it&apos;s
          currently assigned to.
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
          Couldn&apos;t load the furniture schedule: {loadError}
        </div>
      ) : (
        <FurnitureRepository furniture={furniture} initialQuery={q ?? ""} />
      )}
    </div>
  );
}
