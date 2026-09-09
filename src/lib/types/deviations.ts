export type DeviationStatus = "pending" | "approved" | "approved_with_conditions" | "denied";

export interface Deviation {
  id: number;
  reference_number: string | null;
  project_id: number | null;
  room_taxonomy_id: string;
  standard_element: string;
  edition_id: number;
  submitted_by: string;
  submitted_at: string;
  proposed_alternative: string;
  justification: string;
  attachment_refs: string[] | null;
  status: DeviationStatus;
  decision_text: string | null;
  conditions: string | null;
  decided_by: string | null;
  decided_at: string | null;
  procore_rfi_ref: string | null;
  is_cpi_candidate: boolean;
  created_at: string;
}

/** A deviation joined with its room name and project number, for list/dashboard views. */
export interface DeviationWithContext extends Deviation {
  room_name: string;
  procore_project_number: string | null;
}
