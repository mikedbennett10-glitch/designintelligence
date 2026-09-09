import type { GuidelineType } from "@/lib/types/rooms";

export interface Project {
  id: number;
  procore_project_number: string;
  guideline_types: GuidelineType[];
  edition_lock_id: number | null;
  lock_date: string | null;
  lock_event: string;
  room_types_in_scope: string[] | null;
  created_at: string;
  updated_at: string;
}

/** A project plus its locked edition's display name, for the project-mode banner and list. */
export interface ProjectWithEdition extends Project {
  locked_edition_name: string | null;
  locked_edition_date: string | null;
}
