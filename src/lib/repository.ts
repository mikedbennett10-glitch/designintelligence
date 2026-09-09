import { createClient } from "@/lib/supabase/server";
import type {
  EquipmentWithUsage,
  FinishWithUsage,
  FurnitureWithUsage,
  RoomUsageRef,
} from "@/lib/types/rooms";

/**
 * Fetches every row in a standards repository table plus a reverse-lookup
 * of which rooms reference each one (via the room_* junction table), so
 * the repository pages can show "used in: Exam Room, ..." per item
 * without an N+1 query per row.
 */
async function withUsage<TRow extends Record<string, unknown>, TKey extends string | number>(
  rows: TRow[],
  keyOf: (row: TRow) => TKey,
  junctionRows: { room_taxonomy_id: string; key: TKey; room_name: string }[]
) {
  const usageByKey = new Map<TKey, RoomUsageRef[]>();
  for (const j of junctionRows) {
    const list = usageByKey.get(j.key) ?? [];
    list.push({ taxonomy_id: j.room_taxonomy_id, name: j.room_name });
    usageByKey.set(j.key, list);
  }
  return rows.map((row) => ({
    ...row,
    usedInRooms: usageByKey.get(keyOf(row)) ?? [],
  }));
}

export async function getFinishesWithUsage(): Promise<FinishWithUsage[]> {
  const supabase = await createClient();

  const [{ data: finishes }, { data: links }] = await Promise.all([
    supabase.from("finishes").select("*").order("code"),
    supabase.from("room_finishes").select("finish_code, room:rooms(taxonomy_id, name)"),
  ]);

  type LinkRow = { finish_code: string; room: { taxonomy_id: string; name: string } | null };
  const junctionRows = ((links ?? []) as unknown as LinkRow[])
    .filter((l) => l.room)
    .map((l) => ({
      room_taxonomy_id: l.room!.taxonomy_id,
      key: l.finish_code,
      room_name: l.room!.name,
    }));

  return withUsage(
    (finishes ?? []) as unknown as Record<string, unknown>[],
    (row) => row.code as string,
    junctionRows
  ) as unknown as Promise<FinishWithUsage[]>;
}

export async function getEquipmentWithUsage(): Promise<EquipmentWithUsage[]> {
  const supabase = await createClient();

  const [{ data: equipment }, { data: links }] = await Promise.all([
    supabase.from("equipment").select("*").order("name"),
    supabase.from("room_equipment").select("equipment_id, room:rooms(taxonomy_id, name)"),
  ]);

  type LinkRow = { equipment_id: number; room: { taxonomy_id: string; name: string } | null };
  const junctionRows = ((links ?? []) as unknown as LinkRow[])
    .filter((l) => l.room)
    .map((l) => ({
      room_taxonomy_id: l.room!.taxonomy_id,
      key: l.equipment_id,
      room_name: l.room!.name,
    }));

  return withUsage(
    (equipment ?? []) as unknown as Record<string, unknown>[],
    (row) => row.id as number,
    junctionRows
  ) as unknown as Promise<EquipmentWithUsage[]>;
}

export async function getFurnitureWithUsage(): Promise<FurnitureWithUsage[]> {
  const supabase = await createClient();

  const [{ data: furniture }, { data: links }] = await Promise.all([
    supabase.from("furniture").select("*").order("name"),
    supabase.from("room_furniture").select("furniture_id, room:rooms(taxonomy_id, name)"),
  ]);

  type LinkRow = { furniture_id: number; room: { taxonomy_id: string; name: string } | null };
  const junctionRows = ((links ?? []) as unknown as LinkRow[])
    .filter((l) => l.room)
    .map((l) => ({
      room_taxonomy_id: l.room!.taxonomy_id,
      key: l.furniture_id,
      room_name: l.room!.name,
    }));

  return withUsage(
    (furniture ?? []) as unknown as Record<string, unknown>[],
    (row) => row.id as number,
    junctionRows
  ) as unknown as Promise<FurnitureWithUsage[]>;
}
