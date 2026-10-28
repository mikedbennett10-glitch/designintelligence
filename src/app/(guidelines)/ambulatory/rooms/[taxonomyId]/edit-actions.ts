"use server";

import { revalidatePath } from "next/cache";

import { requireContentEditor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface EditResult {
  ok: boolean;
  message: string;
}

const DENIED: EditResult = { ok: false, message: "Content editor access required." };

/** FormData value, trimmed, or null if blank -- so clearing a field removes the stored value. */
function nullableText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

/** A textarea's lines, trimmed and with blanks dropped, as a Postgres TEXT[] value (or null if empty). */
function nullableLines(formData: FormData, key: string): string[] | null {
  const lines = String(formData.get(key) ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : null;
}

/**
 * Updates a room's Overview fields: description, size/ratio, adjacencies,
 * and MEP/Systems. Re-checks content-editor access server-side regardless
 * of what the UI already gated -- this action uses the caller's own
 * session (not service-role), so Postgres RLS (content_editor_update_rooms)
 * enforces the same check independently at the row level.
 */
export async function updateRoomOverview(
  taxonomyId: string,
  _prev: EditResult | null,
  formData: FormData
): Promise<EditResult> {
  const editor = await requireContentEditor();
  if (!editor) return DENIED;

  const supabase = await createClient();

  const sizeAreaRaw = String(formData.get("size_area_sf") ?? "").trim();
  const sizeAreaSf = sizeAreaRaw === "" ? null : Number(sizeAreaRaw);
  if (sizeAreaRaw !== "" && !Number.isFinite(sizeAreaSf)) {
    return { ok: false, message: "Area (SF) must be a number." };
  }

  const values = {
    description: nullableText(formData, "description"),
    size_display: nullableText(formData, "size_display"),
    size_area_sf: sizeAreaSf,
    size_notes: nullableText(formData, "size_notes"),
    ratio_note: nullableText(formData, "ratio_note"),
    same_handed: formData.get("same_handed") === "on",
    adjacency_labels: nullableLines(formData, "adjacency_labels"),
    mep_lighting: nullableText(formData, "mep_lighting"),
    mep_hvac: nullableText(formData, "mep_hvac"),
    mep_plumbing: nullableText(formData, "mep_plumbing"),
    mep_power_data: nullableText(formData, "mep_power_data"),
    mep_security: nullableText(formData, "mep_security"),
    mep_av: nullableText(formData, "mep_av"),
    mep_acoustic: nullableText(formData, "mep_acoustic"),
    mep_nurse_call: nullableText(formData, "mep_nurse_call"),
    mep_notes: nullableText(formData, "mep_notes"),
  };

  // Cast away the generated Database type's empty Tables map -- same
  // placeholder situation as the other hand-written server actions in
  // this app until `supabase gen types` is run against a real project.
  const roomsTable = supabase.from("rooms") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  };
  const { error } = await roomsTable.update(values).eq("taxonomy_id", taxonomyId);

  if (error) {
    return { ok: false, message: `Couldn't save: ${error.message}` };
  }

  revalidatePath(`/ambulatory/rooms/${taxonomyId}`);
  return { ok: true, message: "Overview updated." };
}

type DecisionLogicTable = {
  insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  update: (values: Record<string, unknown>) => {
    eq: (col: string, val: number) => Promise<{ error: { message: string } | null }>;
  };
  delete: () => {
    eq: (col: string, val: number) => Promise<{ error: { message: string } | null }>;
  };
};

export async function saveDecisionLogicItem(
  taxonomyId: string,
  _prev: EditResult | null,
  formData: FormData
): Promise<EditResult> {
  const editor = await requireContentEditor();
  if (!editor) return DENIED;

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { ok: false, message: "Content is required." };
  const category = nullableText(formData, "category");
  const idRaw = String(formData.get("id") ?? "").trim();

  const supabase = await createClient();
  const table = supabase.from("room_decision_logic") as unknown as DecisionLogicTable;

  const { error } = idRaw
    ? await table.update({ category, content }).eq("id", Number(idRaw))
    : await table.insert({
        room_taxonomy_id: taxonomyId,
        category,
        content,
        sort_order: Date.now() % 100000,
      });

  if (error) return { ok: false, message: `Couldn't save: ${error.message}` };
  revalidatePath(`/ambulatory/rooms/${taxonomyId}`);
  return { ok: true, message: "Saved." };
}

export async function deleteDecisionLogicItem(taxonomyId: string, id: number): Promise<EditResult> {
  const editor = await requireContentEditor();
  if (!editor) return DENIED;

  const supabase = await createClient();
  const table = supabase.from("room_decision_logic") as unknown as DecisionLogicTable;
  const { error } = await table.delete().eq("id", id);

  if (error) return { ok: false, message: `Couldn't delete: ${error.message}` };
  revalidatePath(`/ambulatory/rooms/${taxonomyId}`);
  return { ok: true, message: "Deleted." };
}

type OmissionsTable = {
  insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  update: (values: Record<string, unknown>) => {
    eq: (col: string, val: number) => Promise<{ error: { message: string } | null }>;
  };
  delete: () => {
    eq: (col: string, val: number) => Promise<{ error: { message: string } | null }>;
  };
};

export async function saveOmissionItem(
  taxonomyId: string,
  _prev: EditResult | null,
  formData: FormData
): Promise<EditResult> {
  const editor = await requireContentEditor();
  if (!editor) return DENIED;

  const item = String(formData.get("item") ?? "").trim();
  const rationale = String(formData.get("rationale") ?? "").trim();
  if (!item || !rationale) return { ok: false, message: "Item and rationale are both required." };
  const idRaw = String(formData.get("id") ?? "").trim();

  const supabase = await createClient();
  const table = supabase.from("room_intentional_omissions") as unknown as OmissionsTable;

  const { error } = idRaw
    ? await table.update({ item, rationale }).eq("id", Number(idRaw))
    : await table.insert({
        room_taxonomy_id: taxonomyId,
        item,
        rationale,
        sort_order: Date.now() % 100000,
      });

  if (error) return { ok: false, message: `Couldn't save: ${error.message}` };
  revalidatePath(`/ambulatory/rooms/${taxonomyId}`);
  return { ok: true, message: "Saved." };
}

export async function deleteOmissionItem(taxonomyId: string, id: number): Promise<EditResult> {
  const editor = await requireContentEditor();
  if (!editor) return DENIED;

  const supabase = await createClient();
  const table = supabase.from("room_intentional_omissions") as unknown as OmissionsTable;
  const { error } = await table.delete().eq("id", id);

  if (error) return { ok: false, message: `Couldn't delete: ${error.message}` };
  revalidatePath(`/ambulatory/rooms/${taxonomyId}`);
  return { ok: true, message: "Deleted." };
}
