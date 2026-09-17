-- ============================================================
-- Furniture: dimensions/weight/frame/location columns + full
-- Exam Room Guest Chair spec sheet
-- ============================================================
-- The furniture table only had category/subcategory/manufacturer/model/
-- upholstery_spec/notes -- no home for the dimensions, weight capacity,
-- frame finish, or location fields that appear on every vendor spec
-- sheet (matching the schedule format already used for equipment's
-- dimensions/power_requirements columns). Adding them now, driven by
-- the first fully-specified item, since every future furniture entry
-- will need the same fields.

ALTER TABLE furniture
  ADD COLUMN dimensions TEXT,
  ADD COLUMN weight_capacity TEXT,
  ADD COLUMN frame_finish TEXT,
  ADD COLUMN location TEXT;

UPDATE furniture
SET
  subcategory = 'Exam Guest, Armless',
  model = 'Karma KAR2C-22',
  dimensions = '23.7"W x 21.9"D x 33.9"H x 18" SH',
  weight_capacity = '500 lbs',
  frame_finish = 'Silver/Gray',
  upholstery_spec = 'UPL-5 Momentum Twill EPU, Wheat',
  location = 'Exam & Procedure Rooms'
WHERE taxonomy_id = 'SHR-FURN-EXAMCHAIR-01';
