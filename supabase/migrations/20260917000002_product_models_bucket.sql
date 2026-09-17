-- ============================================================
-- Revit model downloads: storage bucket for .rvt files
-- ============================================================
-- Mirrors the product-images bucket (20260917000001_product_pages.sql):
-- a public Storage bucket with the same per-item folder taxonomy, listed
-- live rather than tracked as DB rows. furniture.revit_model_url /
-- equipment.revit_model_url just point at a direct object URL in this
-- bucket — set that column once a file is uploaded to the matching path.
--
--   product-models/equipment/{taxonomy_id}/*.rvt
--   product-models/furniture/{taxonomy_id}/*.rvt
--
-- Same public-bucket tradeoff as product-images: readable via direct URL
-- without sign-in, write access admin-only via RLS. Revit models are
-- larger and arguably more sensitive (design IP) than product photos —
-- tighten to a private bucket + signed URLs if that tradeoff isn't
-- acceptable for models specifically, independent of the images bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-models', 'product-models', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_product_models" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-models');

CREATE POLICY "admin_write_product_models" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-models' AND is_admin());

CREATE POLICY "admin_update_product_models" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-models' AND is_admin())
  WITH CHECK (bucket_id = 'product-models' AND is_admin());

CREATE POLICY "admin_delete_product_models" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-models' AND is_admin());
