import FinishesRepository from "@/components/guidelines/FinishesRepository";
import { getFinishesWithUsage } from "@/lib/repository";

export default async function FinishesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let finishes: Awaited<ReturnType<typeof getFinishesWithUsage>> = [];
  let loadError: string | null = null;

  try {
    finishes = await getFinishesWithUsage();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load the finishes repository.";
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Finishes Repository</h1>
        <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
          Every finish code referenced across the Ambulatory guidelines, with the rooms each is
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
          Couldn&apos;t load the finishes repository: {loadError}
        </div>
      ) : (
        <FinishesRepository finishes={finishes} initialQuery={q ?? ""} />
      )}
    </div>
  );
}
