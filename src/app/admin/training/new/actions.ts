"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ModuleType, RequiredForTier, TriggerEvent } from "@/lib/types/training";

export interface CreateModuleResult {
  ok: boolean;
  message: string;
}

export interface RequirementInput {
  requiredForTier: RequiredForTier;
  requiredWithinDays: number | null;
  triggerEvent: TriggerEvent;
}

export interface QuestionInput {
  questionText: string;
  choices: { id: string; text: string }[];
  correctChoiceId: string;
}

export interface CreateModuleInput {
  moduleCode: string;
  moduleType: ModuleType;
  title: string;
  description: string;
  contentBody: string;
  passingScore: number;
  editionId: number | null;
  requirements: RequirementInput[];
  questions: QuestionInput[];
}

/**
 * Creates a training module + its requirements + its quiz questions in one
 * go (WBS 10, Phase E authoring). Runs under the caller's own session, not
 * a service-role client, so the admin_write_training_modules /
 * admin_write_training_requirements / admin_manage_quiz_questions RLS
 * policies (all `is_admin()`) do the authorization check for us — same
 * pattern as lockToCurrentEdition in the projects actions file.
 */
export async function createTrainingModule(input: CreateModuleInput): Promise<CreateModuleResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }

  if (!input.moduleCode.trim() || !input.title.trim()) {
    return { ok: false, message: "Module code and title are required." };
  }
  if (input.questions.length === 0) {
    return { ok: false, message: "Add at least one quiz question." };
  }
  for (const q of input.questions) {
    if (!q.questionText.trim() || q.choices.length < 2) {
      return { ok: false, message: "Every question needs text and at least two choices." };
    }
    if (!q.choices.some((c) => c.id === q.correctChoiceId)) {
      return { ok: false, message: "Every question needs a correct choice selected." };
    }
  }

  const supabase = await createClient();

  const modulesTable = supabase.from("training_modules") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: number } | null; error: { message: string } | null }>;
      };
    };
  };

  const { data: inserted, error: moduleError } = await modulesTable
    .insert({
      module_code: input.moduleCode.trim(),
      module_type: input.moduleType,
      title: input.title.trim(),
      description: input.description.trim() || null,
      content_body: input.contentBody.trim() || null,
      passing_score: input.passingScore,
      edition_id: input.editionId,
    })
    .select("id")
    .single();

  if (moduleError || !inserted) {
    return { ok: false, message: `Couldn't create the module: ${moduleError?.message ?? "unknown error"}` };
  }

  const moduleId = inserted.id;

  if (input.requirements.length > 0) {
    const requirementsTable = supabase.from("training_requirements") as unknown as {
      insert: (values: Record<string, unknown>[]) => Promise<{ error: { message: string } | null }>;
    };
    const { error: reqError } = await requirementsTable.insert(
      input.requirements.map((r) => ({
        module_id: moduleId,
        required_for_tier: r.requiredForTier,
        required_within_days: r.requiredWithinDays,
        trigger_event: r.triggerEvent,
      }))
    );
    if (reqError) {
      return {
        ok: false,
        message: `Module created, but couldn't save requirements: ${reqError.message}`,
      };
    }
  }

  const questionsTable = supabase.from("training_quiz_questions") as unknown as {
    insert: (values: Record<string, unknown>[]) => Promise<{ error: { message: string } | null }>;
  };
  const { error: qError } = await questionsTable.insert(
    input.questions.map((q, i) => ({
      module_id: moduleId,
      sort_order: i,
      question_text: q.questionText.trim(),
      choices: q.choices,
      correct_choice_id: q.correctChoiceId,
    }))
  );
  if (qError) {
    return {
      ok: false,
      message: `Module created, but couldn't save quiz questions: ${qError.message}`,
    };
  }

  revalidatePath("/admin/training");
  return { ok: true, message: `Created "${input.title}" with ${input.questions.length} question(s).` };
}
