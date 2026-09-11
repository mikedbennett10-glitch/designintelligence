"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { GuidelineType } from "@/lib/types/rooms";

export interface CreateCodeReferenceResult {
  ok: boolean;
  message: string;
}

export interface RelatedCodeInput {
  codeName: string;
  editionReference: string;
  notes: string;
}

export interface CreateCodeReferenceInput {
  jurisdiction: string;
  guidelineType: GuidelineType | "";
  fgiDocument: string;
  fgiEdition: string;
  notes: string;
  relatedCodes: RelatedCodeInput[];
}

/**
 * Creates a code reference entry + its related codes in one go. Runs
 * under the caller's own session, not a service-role client — the
 * admin_write_code_references / admin_write_related_codes RLS policies
 * (both is_admin()) enforce authorization, same pattern as
 * lockToCurrentEdition and createTrainingModule.
 */
export async function createCodeReference(input: CreateCodeReferenceInput): Promise<CreateCodeReferenceResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }

  if (!input.jurisdiction.trim() || !input.fgiDocument.trim() || !input.fgiEdition.trim()) {
    return { ok: false, message: "Jurisdiction, FGI document, and FGI edition are required." };
  }

  const supabase = await createClient();

  const referencesTable = supabase.from("code_references") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: number } | null; error: { message: string } | null }>;
      };
    };
  };

  const { data: inserted, error: refError } = await referencesTable
    .insert({
      jurisdiction: input.jurisdiction.trim(),
      guideline_type: input.guidelineType || null,
      fgi_document: input.fgiDocument.trim(),
      fgi_edition: input.fgiEdition.trim(),
      notes: input.notes.trim() || null,
    })
    .select("id")
    .single();

  if (refError || !inserted) {
    return { ok: false, message: `Couldn't create the entry: ${refError?.message ?? "unknown error"}` };
  }

  const validCodes = input.relatedCodes.filter((c) => c.codeName.trim());
  if (validCodes.length > 0) {
    const relatedTable = supabase.from("code_reference_related_codes") as unknown as {
      insert: (values: Record<string, unknown>[]) => Promise<{ error: { message: string } | null }>;
    };
    const { error: relatedError } = await relatedTable.insert(
      validCodes.map((c, i) => ({
        code_reference_id: inserted.id,
        sort_order: i,
        code_name: c.codeName.trim(),
        edition_reference: c.editionReference.trim() || null,
        notes: c.notes.trim() || null,
      }))
    );
    if (relatedError) {
      return {
        ok: false,
        message: `Entry created, but couldn't save related codes: ${relatedError.message}`,
      };
    }
  }

  revalidatePath("/admin/code-reference");
  revalidatePath("/code-reference");
  return { ok: true, message: `Created the ${input.jurisdiction} entry for ${input.fgiDocument}.` };
}
