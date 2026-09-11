import type { GuidelineType } from "@/lib/types/rooms";

export interface CodeReference {
  id: number;
  jurisdiction: string;
  guideline_type: GuidelineType | null;
  fgi_document: string;
  fgi_edition: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RelatedCode {
  id: number;
  code_reference_id: number;
  sort_order: number;
  code_name: string;
  edition_reference: string | null;
  notes: string | null;
}

export interface CodeReferenceWithRelated extends CodeReference {
  relatedCodes: RelatedCode[];
}

export const US_JURISDICTIONS = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
  "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "District of Columbia",
] as const;
