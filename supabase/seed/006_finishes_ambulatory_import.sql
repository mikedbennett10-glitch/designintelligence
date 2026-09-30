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
-- product_url / images: per the Sept 30 conversation, web lookups for
-- vendor links and swatch photos are being done as a separate manual
-- pass, not inline with each transcription. Every item below is
-- text-only (product_url/images unset) EXCEPT SS-1, whose vendor URL
-- (bellavatisolidsurface.com) is printed directly on the spec sheet
-- itself -- that one's captured as-given, no lookup needed.
--
-- armstrongceilings.com is also confirmed blocked by this session's
-- network egress policy (same restriction hit earlier for a furniture
-- vendor), noted on ACT-1/2/3 below for when the manual pass gets to them.

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

  -- ── Acoustic Wall Panel (p. 85) ────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, product_number, color, dimensions, sustainability,
    location, edition_id
  ) VALUES (
    'AWP-1', 'AMBULATORY', 'Acoustic Wall Panel',
    'Recycled PET content flute wall panel. 5-6 week lead time.',
    '3form', 'Elements — 300.49 Flute Wall Panel', '300.49', 'Marble',
    '44" x 96" x .75" w/2" fluted blades',
    'LEED v4.1, Living Building Challenge, WELL Building Certification',
    'Staff breakroom, see room data sheet',
    v_edition_id
  )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, product_number = EXCLUDED.product_number,
    color = EXCLUDED.color, dimensions = EXCLUDED.dimensions,
    sustainability = EXCLUDED.sustainability, location = EXCLUDED.location,
    edition_id = EXCLUDED.edition_id;

  -- ── Flooring (p. 86) ───────────────────────────────────────
  -- RFT-1/RFT-2 carry a legacy_code (formally LVT-1/LVT-2); RSH-1
  -- formally SV-1. All three list the same Shaw/Patcraft rep contact.
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, dimensions, installation_notes, sustainability,
    location, legacy_code, vendor_contact, edition_id
  ) VALUES
    (
      'RFT-1', 'AMBULATORY', 'PVC-Free, Resilient Floor Tile',
      'Primary flooring. Alternate colorways available for refresh projects — contact design team.',
      'Shaw', 'EcoWorx Resilient — Pivot 4499V', 'Mindset 00115',
      '2.5 mm x 9" x 51"',
      'Glue down, brick installation pattern. Adhesive: use manufacturer recommended.',
      'PVC-free, carbon neutral, recyclable',
      'Typical, UNO', 'LVT-1', 'michele.leise@shawcontract.com', v_edition_id
    ),
    (
      'RFT-2', 'AMBULATORY', 'PVC-Free, Resilient Floor Tile',
      'Accent / wayfinding flooring. Alternate colorways available for refresh projects — contact design team.',
      'Shaw', 'EcoWorx Resilient — Observe 4566V', 'Regenerate 00103',
      '2.5 mm x 9" x 51"',
      'Glue down, brick installation pattern. Adhesive: use manufacturer recommended.',
      'PVC-free, carbon neutral, recyclable',
      'Care team zone and out-of-flow corridors', 'LVT-2', 'michele.leise@shawcontract.com', v_edition_id
    ),
    (
      'RSH-1', 'AMBULATORY', 'PVC-Free, Resilient Sheet/Roll',
      'Wet-area flooring. Alternate colorways available for refresh projects — contact design team.',
      'Patcraft', 'Eco System — Meaning Sheet I584V', 'Energize 00200',
      '2.5 mm thick, 2m wide',
      'Glue down. Adhesive: use manufacturer recommended. Base: integral cove.',
      'PVC-free, carbon neutral, recyclable',
      'Patient & staff toilets (California), EVS, bio-hazard closet, procedure rooms as required',
      'SV-1', 'michele.leise@shawcontract.com', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    sustainability = EXCLUDED.sustainability, location = EXCLUDED.location,
    legacy_code = EXCLUDED.legacy_code, vendor_contact = EXCLUDED.vendor_contact,
    edition_id = EXCLUDED.edition_id;

  -- ── Paint (p. 87–88) ───────────────────────────────────────
  -- "Manufacturer" fields are transcribed as printed ("to match X") —
  -- this specifies a color match, not necessarily a purchase requirement
  -- from that manufacturer.
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_number, color, location, edition_id
  ) VALUES
    (
      'P-1', 'AMBULATORY', 'Paint, General Wall Color',
      'General wall paint color, eggshell finish, UNO.',
      'To match Sherwin-Williams', 'SW 7008', 'Alabaster',
      'General wall color, UNO', v_edition_id
    ),
    (
      'P-2', 'AMBULATORY', 'Paint, Accent',
      'Accent paint, eggshell finish, UNO.',
      'To match Sherwin-Williams', 'SW 9553', 'Allegory',
      'Accent paint where noted on drawings', v_edition_id
    ),
    (
      'P-3', 'AMBULATORY', 'Paint, Accent',
      'Accent paint, eggshell finish, UNO. Use with WC-2 wallcovering substrate to prevent chipping and reduce maintenance.',
      'To match Benjamin Moore', '#447', 'Holiday Wreath',
      'See prototype finish plan', v_edition_id
    ),
    (
      'P-4', 'AMBULATORY', 'Paint, Accent',
      'Accent paint, eggshell finish, UNO. Use with WC-2 wallcovering substrate to prevent chipping and reduce maintenance.',
      'To match Benjamin Moore', '#HC-37', 'Mystic Gold',
      'See prototype finish plan', v_edition_id
    ),
    (
      'P-5', 'AMBULATORY', 'Paint, Accent',
      'Accent paint, eggshell finish, UNO.',
      'To match Sherwin-Williams', '9173', 'Shitake',
      'Accent paint where warm accent desired, i.e. Oncology', v_edition_id
    ),
    (
      'P-6', 'AMBULATORY', 'Paint, Accent',
      'Accent paint, flat finish.',
      'To match Sherwin-Williams', '6258', 'Tricorn Black',
      'Behind wood slat system', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_number = EXCLUDED.product_number, color = EXCLUDED.color,
    location = EXCLUDED.location, edition_id = EXCLUDED.edition_id;

  -- ── Plastic Laminate (p. 89) ───────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_number, color, dimensions, installation_notes, location, edition_id
  ) VALUES
    (
      'PL-1', 'AMBULATORY', 'Plastic Laminate',
      'High pressure laminate, soft grain finish with Aeon.',
      'Wilsonart', '8244K-28', 'Coronado Oak', '48" x 96" sheet',
      'Edge band: 3mm to match laminate, UNO.',
      'Casework & doors, typical UNO', v_edition_id
    ),
    (
      'PL-2', 'AMBULATORY', 'Plastic Laminate',
      'High pressure laminate, textured suede finish.',
      'Pionite', 'WX440', 'Black Forest Cake', '48" x 96" sheet',
      'Edge band: 3mm to match laminate, UNO.',
      'Check-in desk shell, see desk details', v_edition_id
    ),
    (
      'PL-3', 'AMBULATORY', 'Plastic Laminate',
      'High pressure laminate, fine velvet (38) finish.',
      'Wilsonart', '4877-38', 'Grey Mesh', '48" x 96" sheet',
      'Edge band: 3mm to match laminate, UNO.',
      'Countertop, work/copy', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_number = EXCLUDED.product_number, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    location = EXCLUDED.location, edition_id = EXCLUDED.edition_id;

  -- ── Solid Surface (p. 90) ──────────────────────────────────
  -- SS-1's product_url is printed directly on the sheet — captured
  -- as-given, no lookup needed. SK-1/SK-2 are integral sinks in the
  -- same schedule section, not surface material, but kept here to
  -- match the source document's own grouping.
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, product_number, color, dimensions, location,
    product_url, edition_id
  ) VALUES
    (
      'SS-1', 'AMBULATORY', 'Solid Surface',
      'Acrylic solid surface countertop material. Note: SS-1 has limited market distribution — confirm availability for the project location before specifying.',
      'Bellavati', NULL, NULL, 'Brine DFS1-409', '1/2" x 30" x 145"',
      'Wet location countertops & e-cafe',
      'https://www.bellavatisolidsurface.com', v_edition_id
    ),
    (
      'SK-1', 'AMBULATORY', 'Integral Solid Surface',
      'Integral solid surface ADA lavatory bowl sink.',
      'Gemstone', 'Lavatory Bowl', '1513-V ADA', 'Polar White',
      '14-15/16"W x 16-3/4"L x 7-1/16"D',
      'Exam rooms, clean/meds, POC testing',
      NULL, v_edition_id
    ),
    (
      'SK-2', 'AMBULATORY', 'Integral Solid Surface',
      'Integral solid surface double-compartment sink.',
      'Gemstone', 'Double Sink Compartment', '2916-UD', 'Polar White',
      '17-1/2"W x 31"L x 6-1/4"D',
      'Procedure room, instrument processing',
      NULL, v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, product_number = EXCLUDED.product_number,
    color = EXCLUDED.color, dimensions = EXCLUDED.dimensions,
    location = EXCLUDED.location, product_url = EXCLUDED.product_url,
    edition_id = EXCLUDED.edition_id;

  -- ── Tile, Ceramic (p. 91) ──────────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, dimensions, installation_notes, location, edition_id
  ) VALUES
    (
      'CT-1', 'AMBULATORY', 'Ceramic Wall Tile',
      'Subway pattern ceramic wall tile.',
      'Dal Tile', 'Subway — Color Wheel - Linear', 'Matte Arctic White 0790',
      '4-1/4" x 12-7/8" x 5/16"', 'Finish: matte. Grout: Mapei, #27 Silver.',
      'Public toilets', v_edition_id
    ),
    (
      'CTB-1', 'AMBULATORY', 'Ceramic Cove Base',
      'Cove base companion to CT-1 wall tile.',
      'Dal Tile', 'Cove Base, Flat Top A34C1MOD — Color Wheel - Linear', 'Matte Arctic White 0790',
      '4-1/4" x 12-7/8" x 5/16"', 'Finish: matte. Grout: Mapei, #27 Silver.',
      '@ CT-1 wall tile locations', v_edition_id
    ),
    (
      'CTBN-1', 'AMBULATORY', 'Ceramic Bullnose',
      'Bullnose trim companion to CT-1 wall tile.',
      'Dal Tile', 'Bullnose, 12" Side - S44C9MOD — Color Wheel - Linear', 'Matte Arctic White 0790',
      '4-1/4" x 12-7/8" x 5/16"', 'Finish: matte. Grout: Mapei, #27 Silver.',
      '@ CT-1 wall tile locations', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    location = EXCLUDED.location, edition_id = EXCLUDED.edition_id;

  -- ── Tile, Porcelain (p. 92) ────────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, dimensions, installation_notes, location, edition_id
  ) VALUES (
    'PFT-1', 'AMBULATORY', 'Porcelain Floor Tile',
    'Porcelain floor tile, honed+ finish.',
    'Stonepeak', 'Klastos', 'Light Grey',
    '24" x 48" | 12" x 24", 8mm thick',
    'Grout color: Mapei, TBD. Grout joint: manufacturer recommends 1/8". Coefficient of friction: >0.42. Base: varies.',
    'Public toilets & entry, as required', v_edition_id
  )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    location = EXCLUDED.location, edition_id = EXCLUDED.edition_id;

  -- ── Walk-off Mat (p. 93) ───────────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, dimensions, installation_notes, sustainability,
    location, edition_id
  ) VALUES
    (
      'WO-1', 'AMBULATORY', 'Walk-off Mat',
      'Lifetime limited warranty.',
      'Shaw Contract', 'Stepping Out — Bonjour II 5T032', 'Sterling 31557',
      '24" x 24" x .455"', 'Glue down, quarter turn.',
      '100% solution dyed PET',
      'Entry vestibule or pad', v_edition_id
    ),
    (
      'WO-2', 'AMBULATORY', 'Walk-off Mat',
      'Alternate, heavy-duty walk-off mat.',
      'Milliken', 'Obex — Grid CutXLVT, 11mm Closed', 'Dark Grey',
      '7.87" x 7.87" x .43"', NULL,
      '100% UV resistant PVC',
      'Regions with snow, gravel & ice', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    sustainability = EXCLUDED.sustainability, location = EXCLUDED.location,
    edition_id = EXCLUDED.edition_id;

  -- ── Wall Base (p. 94) ──────────────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, manufacturer,
    product_name, color, dimensions, location, edition_id, description
  ) VALUES
    (
      'RB-1', 'AMBULATORY', 'Rubber Base', 'Johnsonite/Tarkett',
      'TightLock Resilient - TDCR TA5 - 4-3/8 LOC', 'Dockside 199',
      '4-3/8"H', 'Typical, UNO', v_edition_id, 'Standard rubber wall base.'
    ),
    (
      'RB-2', 'AMBULATORY', 'Rubber Base', 'Johnsonite/Tarkett',
      'Millwork Monument - MW-TA5-S4', 'Dockside 199',
      '4"H x .25"W', 'Arrival, pause and patient corridors', v_edition_id,
      'Millwork base variant.'
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    manufacturer = EXCLUDED.manufacturer, product_name = EXCLUDED.product_name,
    color = EXCLUDED.color, dimensions = EXCLUDED.dimensions,
    location = EXCLUDED.location, edition_id = EXCLUDED.edition_id,
    description = EXCLUDED.description;

  -- ── Wallcovering (p. 95) ───────────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, dimensions, installation_notes, sustainability,
    location, edition_id
  ) VALUES
    (
      'WC-1', 'AMBULATORY', 'Wallcovering',
      '100% IFR Xorel content. Backing: X-Protect Wall. Cleaning: WS & BC (water, solvent & bleach cleanable).',
      'Carnegie', 'Xorel Linen 6291W | 3', '3', '52" wide',
      'Non-PVA primer, manufacturer''s recommended wallcovering adhesive.',
      'Class A fire rating',
      'Pause nooks and feature walls (wall behind check-in when budget requires)', v_edition_id
    ),
    (
      'WC-2', 'AMBULATORY', 'Fiberglass Paintable Wallcovering',
      'Roll yields 538 SF per roll.',
      'Vitrulan', 'Dauphin #235', NULL,
      '39.4"W x 162''L roll, .40mm thickness',
      'Commercial grade adhesive required.',
      NULL,
      'P-3 and P-4 locations', v_edition_id
    ),
    (
      'WC-3', 'AMBULATORY', 'Wallcovering (Mural)',
      'Mural, printed size to match existing condition. 4 panels: Panel A, Panel B, Panel C, Panel D.',
      'MDC', 'Living Well | Eden | MC02196', NULL,
      '12''H x 54"W / ea panel',
      '20 oz Type II non-woven. Backing: non-woven. Non-reversible hang / straight match; use manufacturer''s recommended wallcovering adhesive.',
      'Class A ASTM E84 fire rating. Passes CA CDPH Standard (Section 01350).',
      'Oncology infusion feature wall', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    sustainability = EXCLUDED.sustainability, location = EXCLUDED.location,
    edition_id = EXCLUDED.edition_id;

  -- ── Wall Protection, Corner Guards (p. 96) ─────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, manufacturer,
    product_name, color, dimensions, installation_notes, sustainability,
    location, edition_id, description
  ) VALUES
    (
      'CG-1', 'AMBULATORY', 'Corner Guard', 'C/S Acrovyn',
      'SSM-20N, 90 Degree Corner Guards', 'Mission White 933',
      '2" leg x 12'' maximum length', NULL, 'PVC-free',
      'Exposed corners in off-stage zone, see prototype finish plan',
      v_edition_id, 'Standard corner guard.'
    ),
    (
      'CG-2', 'AMBULATORY', 'Corner Guard', 'C/S Acrovyn',
      'CO-8, 3/16" (4.8mm) Nose Radius Guard 90-Degree',
      '16-gauge 304 stainless steel alloy #4 satin',
      '1" leg x 12'' maximum length', 'Construction adhesive.',
      'Cradle to Cradle Certified Silver',
      'See prototype finish plan',
      v_edition_id, 'Stainless steel corner guard.'
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    manufacturer = EXCLUDED.manufacturer, product_name = EXCLUDED.product_name,
    color = EXCLUDED.color, dimensions = EXCLUDED.dimensions,
    installation_notes = EXCLUDED.installation_notes, sustainability = EXCLUDED.sustainability,
    location = EXCLUDED.location, edition_id = EXCLUDED.edition_id,
    description = EXCLUDED.description;

  -- ── Wall Protection, Panels (p. 97) ────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, dimensions, installation_notes, sustainability,
    location, edition_id
  ) VALUES
    (
      'WP-1', 'AMBULATORY', 'Wall Protection Panel',
      'Standard wall protection wallcovering.',
      'C/S Acrovyn', 'Acrovyn 4000 Wallcovering', 'Mission White 933',
      '.060" x 4'' x 8'' or 5'' x 10''', NULL, 'PVC-free',
      'See prototype finish plan', v_edition_id
    ),
    (
      'WP-2', 'AMBULATORY', 'Wall Protection Panel',
      'Solid-surface wall protection sheet.',
      'Formica', 'HardStop — Neutral Twill 8826', NULL,
      '48" x 96" sheet', 'Finish: matte (58). Orientation: vertical.', NULL,
      'Patient & staff toilet wainscot', v_edition_id
    ),
    (
      'WP-3', 'AMBULATORY', 'Wall Protection Panel',
      'FRP wall protection sheet.',
      'Marlite', 'Standard FRP, Pebble', 'P100 White',
      '4'' x 8'' sheet', '4''-0" above integral cove base.', NULL,
      'EVS closet', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    dimensions = EXCLUDED.dimensions, installation_notes = EXCLUDED.installation_notes,
    sustainability = EXCLUDED.sustainability, location = EXCLUDED.location,
    edition_id = EXCLUDED.edition_id;

  -- ── Window Coverings (p. 98) ───────────────────────────────
  -- GF-1 is marked (OFOI) on the sheet -- an FF&E responsibility tag
  -- that has a home on equipment/furniture rows but not finishes;
  -- folded into installation_notes instead of adding a column for one
  -- item.
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, color, installation_notes, location, edition_id
  ) VALUES
    (
      'RS-1', 'AMBULATORY', 'Roller Shades',
      '3% openness.',
      'Skyco', 'Sheer Weave 4400 Eco', 'Eco/Alabaster U59',
      'Recessed mount (preferred in public spaces).', NULL, v_edition_id
    ),
    (
      'GF-1', 'AMBULATORY', 'Graphic Film',
      'Dusted Crystal pattern.',
      '3M', 'Dusted Crystal', NULL,
      'Vertical installation. OFOI — installed by signage vendor.',
      'Care team glazed wall system; see drawings', v_edition_id
    )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, color = EXCLUDED.color,
    installation_notes = EXCLUDED.installation_notes, location = EXCLUDED.location,
    edition_id = EXCLUDED.edition_id;

  -- ── Wood (p. 99) ───────────────────────────────────────────
  INSERT INTO finishes (
    code, guideline_scope, product_type, description, manufacturer,
    product_name, product_number, color, dimensions, sustainability, edition_id
  ) VALUES (
    'WD-1', 'AMBULATORY', 'Wood Slat System',
    'Solid poplar wood species, Class C fire performance. 1-year limited warranty, FAST3 lead time (3 weeks or less). CAD & Revit files available from manufacturer. Use with Acoustic Infill Panel 1318 (15/16" square lay-in, 24" x 24" x 3/4", color black) to achieve acoustic value.',
    'Armstrong', 'Woodworks Linear Solid Wood Panels', '8176W1', 'Antique Oak',
    'Plank: nominal 3" wide; standard panel: 12" x 96" x 3/4"',
    '100% USDA certified biobased content', v_edition_id
  )
  ON CONFLICT (code) DO UPDATE SET
    guideline_scope = EXCLUDED.guideline_scope, product_type = EXCLUDED.product_type,
    description = EXCLUDED.description, manufacturer = EXCLUDED.manufacturer,
    product_name = EXCLUDED.product_name, product_number = EXCLUDED.product_number,
    color = EXCLUDED.color, dimensions = EXCLUDED.dimensions,
    sustainability = EXCLUDED.sustainability, edition_id = EXCLUDED.edition_id;

END $$;
