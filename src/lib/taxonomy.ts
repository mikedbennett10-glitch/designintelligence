// Taxonomy ID helpers and constants.
//
// Room IDs:
//   AMB-[SECTION]-[ROOM_CODE]-[TYPE]   e.g. AMB-ROOM-EX-001
//   ACU-[DEPT]-[ROOM_CODE]-[TYPE]      e.g. ACU-ED-TRAUMA-001 (placeholder structure)
//   SHR-[CATEGORY]-[CODE]              e.g. SHR-FINISH-RFT1
//
// Drawing asset filenames:
//   [taxonomy-id]--[drawing-type]--[version].[ext]
//   e.g. amb-room-ex-001--fp--v1.0.1.svg

export type GuidelineType = "AMBULATORY" | "ACUTE";

export const DRAWING_TYPES = [
  "fp",
  "rcp",
  "elev-n",
  "elev-s",
  "elev-e",
  "elev-w",
  "axon",
  "det",
] as const;

export type DrawingType = (typeof DRAWING_TYPES)[number];

const TAXONOMY_PREFIX: Record<GuidelineType, string> = {
  AMBULATORY: "AMB",
  ACUTE: "ACU",
};

export function guidelineTypeFromTaxonomyId(
  taxonomyId: string
): GuidelineType | "SHARED" | null {
  const prefix = taxonomyId.split("-")[0];
  if (prefix === "AMB") return "AMBULATORY";
  if (prefix === "ACU") return "ACUTE";
  if (prefix === "SHR") return "SHARED";
  return null;
}

export function isTaxonomyId(value: string, type?: GuidelineType): boolean {
  if (type) return value.startsWith(`${TAXONOMY_PREFIX[type]}-`);
  return /^(AMB|ACU|SHR)-/.test(value);
}

/** Builds a Cloud Storage drawing asset filename from its parts. */
export function drawingFileName(
  taxonomyId: string,
  drawingType: DrawingType,
  version: string,
  ext: "svg" | "png"
): string {
  return `${taxonomyId.toLowerCase()}--${drawingType}--${version}.${ext}`;
}
