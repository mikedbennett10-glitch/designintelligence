import { createClient } from "@/lib/supabase/server";

export type ProductItemType = "finishes" | "equipment" | "furniture";

/**
 * Lists product images for one item from the `product-images` Storage
 * bucket's established folder taxonomy (see the migration comment in
 * 20260917000001_product_pages.sql): product-images/{itemType}/{itemKey}/*.
 * Files show in filename sort order — an admin controls display order by
 * naming files with numeric prefixes (01-, 02-, ...). Fails soft to an
 * empty array (no images yet, or Storage not reachable) rather than
 * throwing, matching the app's usual convention.
 */
export async function listProductImages(itemType: ProductItemType, itemKey: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const folder = `${itemType}/${itemKey}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .list(folder, { sortBy: { column: "name", order: "asc" } });

    if (error || !data) return [];

    return data
      .filter((f) => f.name && !f.name.startsWith("."))
      .map((f) => supabase.storage.from("product-images").getPublicUrl(`${folder}/${f.name}`).data.publicUrl);
  } catch {
    return [];
  }
}
