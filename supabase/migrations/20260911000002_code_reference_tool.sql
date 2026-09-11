-- ============================================================
-- Code reference tool: FGI edition + related codes by jurisdiction
-- ============================================================
-- A standalone lookup (not tied to a specific registered project):
-- given a jurisdiction (US state, or 'ALL' for nationally-applicable
-- entries) and a facility/guideline type, recommends the applicable
-- FGI Guidelines document + edition, plus other relevant codes
-- (IBC, NFPA 101, ASHRAE 170, state amendments, etc.).
--
-- This is infrastructure only — no jurisdiction data is seeded here.
-- Code adoption varies by state and changes over time; getting a
-- specific code edition wrong for a real project carries real
-- compliance risk, so this starts empty and is admin-authored/kept
-- current by CommonSpirit's own team, same pattern as Training modules.

CREATE TABLE code_references (
  id              SERIAL PRIMARY KEY,
  jurisdiction    TEXT        NOT NULL,             -- US state name, or 'ALL' for a nationally-applicable entry
  guideline_type  TEXT        CHECK (guideline_type IN ('AMBULATORY','ACUTE','BUILDING_PERFORMANCE')), -- NULL = applies to all types
  fgi_document    TEXT        NOT NULL,             -- e.g. 'FGI Guidelines for Design and Construction of Outpatient Facilities'
  fgi_edition     TEXT        NOT NULL,             -- e.g. '2022'
  notes           TEXT,                             -- amendments, caveats, AHJ-specific notes
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_code_references_jurisdiction ON code_references (jurisdiction);
CREATE INDEX idx_code_references_guideline_type ON code_references (guideline_type);

CREATE TABLE code_reference_related_codes (
  id                SERIAL PRIMARY KEY,
  code_reference_id INTEGER     NOT NULL REFERENCES code_references(id) ON DELETE CASCADE,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  code_name         TEXT        NOT NULL,           -- e.g. 'IBC', 'NFPA 101', 'ASHRAE 170', 'State Amendment'
  edition_reference TEXT,                           -- e.g. '2021', 'Chapter 4 Amendment'
  notes             TEXT
);

CREATE INDEX idx_related_codes_reference ON code_reference_related_codes (code_reference_id);

ALTER TABLE code_references              ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_reference_related_codes ENABLE ROW LEVEL SECURITY;

-- Same read/write pattern as every other content table (rooms, finishes,
-- etc.): any signed-in user can read it, only admins can author it.
CREATE POLICY "authenticated_read_code_references" ON code_references FOR SELECT TO authenticated
  USING (TRUE);
CREATE POLICY "admin_write_code_references" ON code_references FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "authenticated_read_related_codes" ON code_reference_related_codes FOR SELECT TO authenticated
  USING (TRUE);
CREATE POLICY "admin_write_related_codes" ON code_reference_related_codes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER code_references_updated_at BEFORE UPDATE ON code_references
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
