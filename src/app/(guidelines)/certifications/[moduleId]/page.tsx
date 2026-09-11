import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { QuizQuestionForTaking, TrainingModule } from "@/lib/types/training";

import QuizForm from "./QuizForm";

interface ModulePageData {
  module: Pick<TrainingModule, "id" | "title" | "description" | "content_body" | "passing_score" | "is_active">;
  questions: QuizQuestionForTaking[];
}

async function getModuleForTaking(moduleId: number): Promise<ModulePageData | null> {
  const supabase = await createClient();
  const { data: mod, error } = await supabase
    .from("training_modules")
    .select("id, title, description, content_body, passing_score, is_active")
    .eq("id", moduleId)
    .single();

  if (error || !mod) return null;
  const typedModule = mod as ModulePageData["module"];
  if (!typedModule.is_active) return null;

  // training_quiz_questions has no authenticated_read RLS policy (only
  // admins can read it via their own session) — the service-role client
  // is required here to fetch the questions at all. correct_choice_id is
  // stripped below before this ever reaches the client component.
  const serviceClient = createServiceRoleClient();
  const questionsTable = serviceClient.from("training_quiz_questions") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        order: (col: string) => Promise<{
          data: { id: number; sort_order: number; question_text: string; choices: { id: string; text: string }[] }[] | null;
        }>;
      };
    };
  };
  const { data: questions } = await questionsTable
    .select("id, sort_order, question_text, choices")
    .eq("module_id", moduleId)
    .order("sort_order");

  return {
    module: typedModule,
    questions: (questions ?? []) as QuizQuestionForTaking[],
  };
}

export default async function TakeTrainingModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const id = Number(moduleId);
  if (!Number.isFinite(id)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    return <p style={{ color: "var(--muted)" }}>Sign in to take this training module.</p>;
  }

  let data: ModulePageData | null = null;
  let loadError: string | null = null;
  try {
    data = await getModuleForTaking(id);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this module.";
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
        Couldn&apos;t load this module: {loadError}
      </div>
    );
  }

  if (!data || data.questions.length === 0) {
    return (
      <p style={{ color: "var(--muted)" }}>
        This module isn&apos;t available. It may not exist, be inactive, or have no quiz questions yet.
      </p>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>
      <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>{data.module.title}</h1>
      {data.module.description && (
        <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>{data.module.description}</p>
      )}
      {data.module.content_body && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--csh-charcoal-lt)",
            borderRadius: "8px",
            marginBottom: "1.75rem",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {data.module.content_body}
        </div>
      )}
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
        You need {data.module.passing_score}% or higher to pass.
      </p>
      <QuizForm moduleId={data.module.id} questions={data.questions} />
    </div>
  );
}
