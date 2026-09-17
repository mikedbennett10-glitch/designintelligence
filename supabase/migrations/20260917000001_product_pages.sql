-- ============================================================
-- Product detail pages: vendor links, Revit models, image storage
-- ============================================================
-- Adds a vendor product page link (finishes/equipment/furniture) and a
-- Revit model download link (equipment/furniture only, per product
-- decision) to the three standards repository tables. Both are simple
-- URL fields — SQL-authored for now, same as every other field on
-- these tables (there's no admin CRUD UI for finishes/equipment/
-- furniture yet).
--
-- Product images are NOT a new DB table. Per product decision, images
-- live in a Supabase Storage bucket under an established folder
-- taxonomy, and the app lists whatever files exist in an item's folder
-- at render time rather than requiring a DB row per image:
--
--   product-images/finishes/{code}/*         e.g. finishes/RFT-1/01.jpg
--   product-images/equipment/{taxonomy_id}/* e.g. equipment/SHR-EQUIP-SCALE-01/01.jpg
--   product-images/furniture/{taxonomy_id}/* e.g. furniture/SHR-FURN-EXAM-CHAIR-01/01.jpg
--
-- Files display in filename sort order — use numeric prefixes (01-,
-- 02-, ...) to control ordering. Drop files into the matching folder
-- (Supabase Studio → Storage, or the API) and they appear on the
-- item's product page automatically — no separate step to register
-- each image.

ALTER TABLE finishes  ADD COLUMN product_url TEXT;
ALTER TABLE equipment ADD COLUMN product_url TEXT, ADD COLUMN revit_model_url TEXT;
ALTER TABLE furniture ADD COLUMN product_url TEXT, ADD COLUMN revit_model_url TEXT;

-- Public bucket: these are design-reference product images/models, not
-- sensitive content, and a public bucket means the app can render them
-- with a plain <img src> / download link with no signed-URL plumbing.
-- The app itself still sits behind sign-in, same as everything else —
-- this only means someone with a direct image URL (not discoverable
-- without already knowing the app's data) could load that one image
-- without signing in. Tighten to a private bucket + signed URLs later
-- if that tradeoff stops being acceptable.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Read: anyone (matches the public bucket). Write: admins only, mirroring
-- every other content table's admin_write_* policy.
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "admin_write_product_images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin())
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());
