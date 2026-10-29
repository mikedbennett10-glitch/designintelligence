-- ============================================================
-- Spec sheet links on finishes/equipment/furniture
-- ============================================================
-- Parallel to product_url and revit_model_url -- a direct link to a
-- downloadable spec document for the item. Adding to all three
-- product tables for consistency, even though the first real value
-- (ACT-2) is a finish.

ALTER TABLE finishes  ADD COLUMN IF NOT EXISTS spec_sheet_url TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS spec_sheet_url TEXT;
ALTER TABLE furniture ADD COLUMN IF NOT EXISTS spec_sheet_url TEXT;
