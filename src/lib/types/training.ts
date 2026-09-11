export type ModuleType = "new_user" | "edition_onboarding" | "topic";
export type TriggerEvent = "provisioning" | "edition_published" | "project_assignment";
export type RequiredForTier = "all" | "internal_standard" | "external_project" | "external_review" | "administrative";

export interface TrainingModule {
  id: number;
  module_code: string;
  module_type: ModuleType;
  title: string;
  description: string | null;
  content_body: string | null;
  passing_score: number;
  edition_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface TrainingRequirement {
  id: number;
  module_id: number;
  required_for_tier: RequiredForTier;
  required_within_days: number | null;
  trigger_event: TriggerEvent;
}

export interface TrainingCompletion {
  id: number;
  user_email: string;
  module_id: number;
  edition_id: number | null;
  completed_at: string;
  score: number | null;
  passed: boolean;
  certificate_ref: string | null;
}

/** A question with its choices but WITHOUT correct_choice_id — safe to send to any signed-in user's browser. */
export interface QuizQuestionForTaking {
  id: number;
  sort_order: number;
  question_text: string;
  choices: { id: string; text: string }[];
}

/** Full question including the answer key — admin-only, never sent to a non-admin browser. */
export interface QuizQuestion extends QuizQuestionForTaking {
  module_id: number;
  correct_choice_id: string;
}
