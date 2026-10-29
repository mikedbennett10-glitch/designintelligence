export const ITEM_TYPES = ["finishes", "equipment", "furniture"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];
