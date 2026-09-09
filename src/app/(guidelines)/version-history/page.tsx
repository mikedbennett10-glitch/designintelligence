import EditionChangeLog from "@/components/guidelines/EditionChangeLog";
import EditionTimeline from "@/components/guidelines/EditionTimeline";
import { createClient } from "@/lib/supabase/server";
import type { Edition, EditionChangeWithRoom } from "@/lib/types/rooms";

interface VersionHistoryData {
  editions: Edition[];
  selected: Edition;
  changes: EditionChangeWithRoom[];
}

async function getVersionHistoryData(editionCode?: string): Promise<VersionHistoryData | null> {
  const supabase = await createClient();

  const { data: editions, error: editionsError } = await supabase
    .from("editions")
    .select("*")
    .eq("guideline_type", "AMBULATORY")
    .order("edition_date", { ascending: false });

  if (editionsError) throw editionsError;
  const editionList = (editions ?? []) as Edition[];
  if (editionList.length === 0) return null;

  const selected =
    editionList.find((e) => e.edition_code === editionCode) ??
    editionList.find((e) => e.is_current) ??
    editionList[0];

  const { data: changes, error: changesError } = await supabase
    .from("edition_changes")
    .select("*, room:rooms(name)")
    .eq("edition_id", selected.id)
    .order("sort_order");

  if (changesError) throw changesError;

  type ChangeRow = Record<string, unknown> & { room: { name: string } | null };
  const changeList: EditionChangeWithRoom[] = ((changes ?? []) as unknown as ChangeRow[]).map(
    (c) => ({ ...(c as unknown as EditionChangeWithRoom), room_name: c.room?.name ?? null })
  );

  return { editions: editionList, selected, changes: changeList };
}

export default async function VersionHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>;
}) {
  const { edition } = await searchParams;

  let data: VersionHistoryData | null = null;
  let loadError: string | null = null;

  try {
    data = await getVersionHistoryData(edition);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load version history.";
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--csh-pink-lt)",
          border: "1px solid var(--csh-pink)",
          borderRadius: "6px",
          fontSize: "0.875rem",
        }}
      >
        Couldn&apos;t load version history: {loadError}
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem" }}>Version History</h1>
        <p style={{ color: "var(--muted)" }}>No editions are visible yet.</p>
      </div>
    );
  }

  const { editions, selected, changes } = data;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Version History</h1>
        <p style={{ color: "var(--muted)", maxWidth: "65ch" }}>
          Every logged change across Ambulatory guideline editions, grouped by section.
        </p>
      </div>

      <div style={{ display: "flex", gap: "2.5rem" }}>
        <aside style={{ width: "220px", flexShrink: 0 }}>
          <EditionTimeline editions={editions} selectedCode={selected.edition_code} />
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.2rem" }}>{selected.name}</h2>
            {selected.subtitle && (
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
                {selected.subtitle}
              </p>
            )}
          </div>

          <EditionChangeLog changes={changes} />
        </main>
      </div>
    </div>
  );
}
