-- ============================================================
-- Real finish schedule import — Ambulatory Design Guidelines, March 2026
-- ============================================================
-- Transcribed from the actual finish schedule (WBS 4.1), unlike
-- 003_example_room_content.sql's placeholder finish rows. Uses
-- ON CONFLICT (code) DO UPDATE because several codes (e.g. ACT-1) were
-- already seeded there with invented placeholder data under the same
-- natural key — this is the real data replacing it, by design.
--
-- One section per category, added incrementally as pages are
-- transcribed. Re-running this file is always safe.
--
-- product_url / images: populated only where a vendor's site could be
-- confirmed and reached. armstrongceilings.com is blocked by this
-- session's network egress policy (same restriction hit earlier for a
-- furniture vendor) — ACT-1/2/3 below have no product_url or images
-- for that reason, not because they weren't looked for. Flagged per
-- item below.

DO $$
DECLARE
  v_edition_id INTEGER;
BEGIN
  SELECT id INTO v_edition_id FROM editions WHERE guideline_type = 'AMBULATORY' AND edition_code = 'MAR-2026';

  -- ── Acoustic Ceiling Tile (p. 84) ─────────────────────────
  -- All three: Armstrong Ceilings. armstrongceilings.com is
  -- egress-blocked for this session, so product_url is unset on all
  -- three -- confirmed via web search that ACT-1 (#1913 Ultima) matches
  -- 0.75 NRC / 35 CAC, but couldn't reach the site to get the canonical
  -- product page URL or download a product image.
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, product_number, dimensions, installation_notes,
    location, edition_id
  ) VALUES
    (
      'ACT-1', 'AMBULATORY', 'Acoustic Ceiling Tile',
      '15/16" square lay-in mineral fiber tile, 0.75 NRC / 35 CAC. Prelude XL 15/16" exposed tee grid.',
      'Armstrong Ceilings', 'Ultima', '1913',
      '2'' x 4'' x 3/4"',
      NULL,
      'Typical, UNO',
      v_edition_id
    ),
    (
      'ACT-2', 'AMBULATORY', 'Acoustic Ceiling Tile',
      '15/16" square lay-in mineral fiber tile, washable, 0.70 NRC / 38 CAC. Prelude XL 15/16" exposed tee grid.',
      'Armstrong Ceilings', 'Ultima HealthZone, Washable', '1938',
      '2'' x 4'' x 3/4"',
      NULL,
      'Blood draw, lab processing, instrument processing, procedure rooms, EVS',
      v_edition_id
    ),
    (
      'ACT-3', 'AMBULATORY', 'Acoustic Ceiling Tile',
      '9/16" square tegular fiberglass tile (guideline standard), 0.90-1.00 NRC / 26 CAC. Silhouette XL 9/16" grid, 1/4" reveal.',
      'Armstrong Ceilings', 'Optima', '3154',
      '48" x 96" x 1", typical UNO; 24" x 97" x 1" (use in humid climates)',
      'Shape & paint cut tegular edges as required.',
      'Arrival circulation & sub-wait, UNO',
      v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope    = EXCLUDED.guideline_scope,
    product_type        = EXCLUDED.product_type,
    description          = EXCLUDED.description,
    manufacturer         = EXCLUDED.manufacturer,
    product_name         = EXCLUDED.product_name,
    product_number       = EXCLUDED.product_number,
    dimensions           = EXCLUDED.dimensions,
    installation_notes   = EXCLUDED.installation_notes,
    location             = EXCLUDED.location,
    edition_id           = EXCLUDED.edition_id;

END $$;
