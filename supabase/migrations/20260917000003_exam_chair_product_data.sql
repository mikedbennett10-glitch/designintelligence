-- ============================================================
-- Populate Exam Room Guest Chair (SHR-FURN-EXAMCHAIR-01) product data
-- ============================================================
-- First fully-populated product page, used as the reference example for
-- how to fill in manufacturer/model/product_url/revit_model_url on any
-- finish/equipment/furniture row. Vendor: Krug, "Karma" guest chair
-- (https://krug.ca/product/karma/).
--
-- Dimensions, upholstery spec, and weight capacity are intentionally
-- left NULL here rather than guessed — the vendor page could not be
-- fetched (blocked by network egress policy) and no spec sheet/
-- screenshot was provided alongside the .rvt file. Fill those in
-- directly in Supabase Studio, or hand over the spec sheet and a new
-- migration can do it.
--
-- The Revit model itself isn't uploaded by this migration (Storage
-- objects aren't SQL rows) — upload the .rvt file to the exact path
-- below in Supabase Studio -> Storage -> product-models, and this
-- column will resolve immediately (no further SQL needed):
--
--   product-models/furniture/SHR-FURN-EXAMCHAIR-01/KAR2NoArm-KAR2NoArm_Linking_Brackets.rvt

UPDATE furniture
SET
  manufacturer = 'Krug',
  model = 'Karma',
  product_url = 'https://krug.ca/product/karma/',
  revit_model_url = 'https://txfhdjkikvmldikdeahr.supabase.co/storage/v1/object/public/product-models/furniture/SHR-FURN-EXAMCHAIR-01/KAR2NoArm-KAR2NoArm_Linking_Brackets.rvt'
WHERE taxonomy_id = 'SHR-FURN-EXAMCHAIR-01';
