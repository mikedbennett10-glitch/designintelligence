"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export interface ProductImageItem {
  name: string;
  path: string;
  url: string;
}

export const ITEM_TYPES = ["finishes", "equipment", "furniture"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

async function itemExists(itemType: ItemType, itemKey: string): Promise<boolean> {
  const supabase = await createClient();
  if (itemType === "finishes") {
    const { data } = await supabase.from("finishes").select("code").eq("code", itemKey).maybeSingle();
    return Boolean(data);
  }
  if (itemType === "equipment") {
    const { data } = await supabase.from("equipment").select("taxonomy_id").eq("taxonomy_id", itemKey).maybeSingle();
    return Boolean(data);
  }
  const { data } = await supabase.from("furniture").select("taxonomy_id").eq("taxonomy_id", itemKey).maybeSingle();
  return Boolean(data);
}

/** Lists the images currently in an item's product-images folder. Admin-only, mirroring the write side. */
export async function getProductImages(itemType: ItemType, itemKey: string): Promise<ProductImageItem[]> {
  const admin = await requireAdmin();
  if (!admin || !itemKey) return [];

  const supabase = await createClient();
  const folder = `${itemType}/${itemKey}`;
  const { data, error } = await supabase.storage
    .from("product-images")
    .list(folder, { sortBy: { column: "name", order: "asc" } });

  if (error || !data) return [];

  return data
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => {
      const path = `${folder}/${f.name}`;
      return {
        name: f.name,
        path,
        url: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl,
      };
    });
}

/**
 * Uploads one image into an item's product-images/{itemType}/{itemKey}/
 * folder (the established taxonomy from 20260917000001_product_pages.sql).
 * Confirms the item actually exists first, so a typo'd code can't create
 * an orphan folder nobody will ever see.
 */
export async function uploadProductImage(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Administrators only." };

  const itemType = String(formData.get("itemType") ?? "") as ItemType;
  const itemKey = String(formData.get("itemKey") ?? "").trim();
  const file = formData.get("file") as File | null;
  const orderPrefix = String(formData.get("orderPrefix") ?? "").trim();

  if (!ITEM_TYPES.includes(itemType)) return { ok: false, message: "Invalid item type." };
  if (!itemKey) return { ok: false, message: "Item code is required." };
  if (!file || file.size === 0) return { ok: false, message: "Choose a file to upload." };

  if (!(await itemExists(itemType, itemKey))) {
    return { ok: false, message: `No ${itemType.slice(0, -1)} found with code "${itemKey}". Check the spelling.` };
  }

  const prefix = orderPrefix ? orderPrefix.padStart(2, "0") : "01";
  const safeName = `${prefix}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const path = `${itemType}/${itemKey}/${safeName}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) return { ok: false, message: `Upload failed: ${error.message}` };

  revalidatePath(`/${itemType}/${itemKey}`);
  return { ok: true, message: `Uploaded ${safeName}.` };
}

export async function deleteProductImage(itemType: ItemType, itemKey: string, path: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Administrators only." };

  const supabase = await createClient();
  const { error } = await supabase.storage.from("product-images").remove([path]);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/${itemType}/${itemKey}`);
  return { ok: true, message: "Deleted." };
}
