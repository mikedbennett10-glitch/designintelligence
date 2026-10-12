import type { RoomEquipmentWithDetail, RoomFurnitureWithDetail } from "@/lib/types/rooms";

/**
 * WBS 3.5.1 — SVG element ID → room data lookup engine.
 *
 * Convention: an SVG element that represents a placed item carries
 * `data-taxonomy-id="<taxonomy_id>"` (see public/schematics/*.svg for an
 * example). This resolves that id against the room's furniture/equipment
 * already loaded for the page — no extra fetch, and it can't drift from
 * what the FFE tab shows, because it's the same data.
 */
export interface TaxonomyLookupEntry {
  type: "furniture" | "equipment";
  taxonomy_id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
  quantity: number;
  notes: string | null;
}

export function buildTaxonomyLookup(
  equipment: RoomEquipmentWithDetail[],
  furniture: RoomFurnitureWithDetail[]
): Record<string, TaxonomyLookupEntry> {
  const lookup: Record<string, TaxonomyLookupEntry> = {};

  for (const re of equipment) {
    if (!re.equipment) continue;
    lookup[re.equipment.taxonomy_id] = {
      type: "equipment",
      taxonomy_id: re.equipment.taxonomy_id,
      name: re.equipment.name,
      manufacturer: re.equipment.manufacturer,
      model: re.equipment.model,
      category: re.equipment.category,
      quantity: re.quantity,
      notes: re.notes,
    };
  }

  for (const rf of furniture) {
    if (!rf.furniture) continue;
    lookup[rf.furniture.taxonomy_id] = {
      type: "furniture",
      taxonomy_id: rf.furniture.taxonomy_id,
      name: rf.furniture.name,
      manufacturer: rf.furniture.manufacturer,
      model: rf.furniture.model,
      category: rf.furniture.category,
      quantity: rf.quantity,
      notes: rf.notes,
    };
  }

  return lookup;
}
