"use server";

import { getCurrentUser } from "@/lib/auth";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface QuizResult {
  ok: boolean;
  message: string;
  score?: number;
  passed?: boolean;
}

/**
 * Grades a quiz attempt and records it (WBS 10, Phase E). The correct
 * answers are fetched here via the service-role client, server-side only
 * — they're never sent to the browser (see the migration's note on why
 * training_quiz_questions has no authenticated_read policy). The
 * completion row itself is written with the caller's own session client
 * so the write_own_completions RLS policy (user_email = the caller's own
 * email) prevents anyone from recording a completion for someone else.
 *
 * Each attempt inserts a new row rather than upserting: training_completions'
 * UNIQUE(user_email, module_id, edition_id) doesn't dedupe a NULL edition_id
 * against itself (NULLs are never equal in a unique constraint), so an
 * upsert wouldn't reliably update a prior attempt anyway. The
 * certifications page already takes the most recent completion per module,
 * so a history of attempts is fine.
 */
export async function submitQuizAttempt(
  moduleId: number,
  answers: Record<number, string>
): Promise<QuizResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Sign in to submit this quiz." };
  }

  const serviceClient = createServiceRoleClient();

  const moduleTable = serviceClient.from("training_modules") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        single: () => Promise<{
          data: { id: number; passing_score: number; edition_id: number | null } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
  const { data: mod, error: modError } = await moduleTable
    .select("id, passing_score, edition_id")
    .eq("id", moduleId)
    .single();

  if (modError || !mod) {
    return { ok: false, message: "Couldn't find this training module." };
  }

  const questionsTable = serviceClient.from("training_quiz_questions") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => Promise<{
        data: { id: number; correct_choice_id: string }[] | null;
        error: { message: string } | null;
      }>;
    };
  };
  const { data: questions, error: qError } = await questionsTable
    .select("id, correct_choice_id")
    .eq("module_id", moduleId);

  if (qError || !questions || questions.length === 0) {
    return { ok: false, message: "Couldn't load this quiz's questions." };
  }

  const correctCount = questions.filter((q) => answers[q.id] === q.correct_choice_id).length;
  const score = Math.round((correctCount / questions.length) * 10000) / 100;
  const passed = score >= mod.passing_score;

  const supabase = await createClient();
  const completionsTable = supabase.from("training_completions") as unknown as {
    insert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
  const { error: insertError } = await completionsTable.insert({
    user_email: user.email,
    module_id: moduleId,
    edition_id: mod.edition_id,
    score,
    passed,
  });

  if (insertError) {
    return { ok: false, message: `Couldn't record your result: ${insertError.message}` };
  }

  return {
    ok: true,
    score,
    passed,
    message: passed
      ? `You scored ${score}% — passed (needed ${mod.passing_score}%).`
      : `You scored ${score}% — that's below the required ${mod.passing_score}%. You can retake it.`,
  };
}
