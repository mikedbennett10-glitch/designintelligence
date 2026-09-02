// DIP-specific domain types.
//
// These are hand-written to mirror supabase/migrations/20260815000001_initial_schema.sql.
// Once Supabase is connected, run `supabase gen types typescript --local >
// src/lib/types/database.ts` and prefer importing row types from there where a
// 1:1 table shape is needed (e.g. `Database["public"]["Tables"]["rooms"]["Row"]`);
// keep the derived/composed shapes below (RoomWithChangeFlag, RoomDrawingStatus)
// here regardless, since they don't map to a single table.

export type GuidelineType = "AMBULATORY" | "ACUTE";
export type Zone = "On-Stage" | "Off-Stage" | "On-Stage / Off-Stage";
export type AxonType = 1 | 2 | 3;

export interface Edition {
  id: number;
  guideline_type: GuidelineType;
  edition_code: string;
  name: string;
  edition_date: string;
  status: "draft" | "review" | "released" | "superseded";
  is_current: boolean;
  subtitle: string | null;
  notes: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Room {
  taxonomy_id: string;
  legacy_code: string | null;
  guideline_type: GuidelineType;
  section: string;
  sort_order: number | null;
  name: string;
  subtitle: string | null;
  zone: Zone;
  same_handed: boolean;
  ratio_note: string | null;
  size_display: string | null;
  size_width_ft: number | null;
  size_depth_ft: number | null;
  size_area_sf: number | null;
  size_notes: string | null;
  description: string | null;
  mep_lighting: string | null;
  mep_hvac: string | null;
  mep_plumbing: string | null;
  mep_power_data: string | null;
  mep_security: string | null;
  mep_av: string | null;
  mep_acoustic: string | null;
  mep_nurse_call: string | null;
  mep_notes: string | null;
  adjacency_room_ids: string[] | null;
  adjacency_labels: string[] | null;
  axon_type: AxonType | null;
  edition_id: number;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomEditionSnapshot {
  id: number;
  room_taxonomy_id: string;
  edition_id: number;
  snapshot: Room;
  change_summary: string | null;
  changed_fields: string[] | null;
  created_at: string;
}

export interface Finish {
  code: string;
  guideline_scope: "AMBULATORY" | "ACUTE" | "SHARED";
  product_type: string;
  description: string;
  manufacturer: string | null;
  product_name: string | null;
  product_number: string | null;
  color: string | null;
  dimensions: string | null;
  installation_notes: string | null;
  sustainability: string | null;
  regional_variants: Record<string, unknown> | null;
  swatch_gcs_path: string | null;
  room_applications: string[] | null;
  is_active: boolean;
  edition_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: number;
  taxonomy_id: string;
  guideline_scope: "AMBULATORY" | "ACUTE" | "SHARED";
  name: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  responsibility: "OFOI" | "OFCI" | "IT/OFOI" | "IT/OFCI";
  dimensions: string | null;
  power_requirements: string | null;
  notes: string | null;
  is_active: boolean;
  edition_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Furniture {
  id: number;
  taxonomy_id: string;
  guideline_scope: "AMBULATORY" | "ACUTE" | "SHARED";
  name: string;
  category: string | null;
  subcategory: string | null;
  manufacturer: string | null;
  model: string | null;
  upholstery_spec: string | null;
  responsibility: "OFOI" | "OFCI";
  notes: string | null;
  is_active: boolean;
  edition_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface RoomFinish {
  id: number;
  room_taxonomy_id: string;
  finish_code: string;
  location: string;
  notes: string | null;
  sort_order: number;
}

export interface RoomEquipment {
  id: number;
  room_taxonomy_id: string;
  equipment_id: number;
  quantity: number;
  notes: string | null;
  sort_order: number;
}

export interface RoomFurniture {
  id: number;
  room_taxonomy_id: string;
  furniture_id: number;
  quantity: number;
  notes: string | null;
  sort_order: number;
}

/** Drawing readiness rollup, matches the `room_drawing_status` view. */
export interface RoomDrawingStatus {
  taxonomy_id: string;
  name: string;
  guideline_type: GuidelineType;
  axon_type: AxonType | null;
  production_ready: number;
  schematic_count: number;
  pending_count: number;
  total_drawings: number;
}

/**
 * A room resolved for a specific edition (via the `room_as_of_edition` SQL
 * function), plus whether a *later* edition has since changed it. Powers the
 * "changed since your locked edition" flag on room data sheets so a project
 * team can review the diff and decide whether to incorporate it.
 */
export interface RoomWithChangeFlag extends Room {
  resolved_edition_id: number;
  has_pending_change: boolean;
  latest_change_edition_id: number | null;
  latest_change_summary: string | null;
  latest_changed_fields: string[] | null;
}
