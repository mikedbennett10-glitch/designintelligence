-- ============================================================
-- Design Intelligence Platform (DIP) — Database Schema v1.1
-- PostgreSQL 15 / Supabase · CommonSpirit Health NRES PDC
-- ============================================================
-- Execution order: editions → standards repositories → rooms →
-- edition_changes → room junction tables → room edition snapshots →
-- decision logic / omissions → drawings → projects → users →
-- deviations → training → utility functions/triggers → views → RLS
--
-- Changes from v1.0 (product decisions, confirmed):
--   1. Edition-locked fidelity: rooms are still updated in-place, but every
--      material change is captured as a full snapshot in
--      room_edition_snapshots. A project locked to an edition resolves
--      room content via room_as_of_edition() rather than the live row, and
--      rooms(-if changed since the lock) are flagged via
--      room_pending_changes / has_room_changed_since() so a project team
--      can review the diff and decide whether to incorporate it. This
--      supersedes the v1.0 "known limitation" note on rooms.edition_id.
--   2. room_finishes / room_equipment / room_furniture were already
--      junction tables in v1.0 — kept as-is (not array codes). This
--      version fixes the table-creation order so edition_changes (which
--      references rooms) is created after rooms, not before.
-- ============================================================

-- ============================================================
-- 1. EDITIONS & VERSION HISTORY
-- ============================================================

CREATE TABLE editions (
  id              SERIAL PRIMARY KEY,
  guideline_type  TEXT        NOT NULL CHECK (guideline_type IN ('AMBULATORY','ACUTE')),
  edition_code    TEXT        NOT NULL,               -- 'MAR-2026', 'JAN-2025'
  name            TEXT        NOT NULL,               -- 'March 2026 Edition'
  edition_date    DATE        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','review','released','superseded')),
  is_current      BOOLEAN     NOT NULL DEFAULT FALSE,
  subtitle        TEXT,                               -- one-sentence description for UI
  notes           TEXT,                               -- internal ops notes
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (guideline_type, edition_code)
);

-- Enforce exactly one current edition per guideline type
CREATE UNIQUE INDEX one_current_edition_per_type
  ON editions (guideline_type)
  WHERE is_current = TRUE;

COMMENT ON TABLE editions IS
  'One record per published edition per guideline type. '
  'is_current=TRUE marks the active edition. Enforced unique per type.';

-- ============================================================
-- 2. STANDARDS REPOSITORIES
-- Must exist before room junction tables reference them.
-- ============================================================

-- 2a. FINISHES
CREATE TABLE finishes (
  code              TEXT        PRIMARY KEY,           -- 'RFT-1', 'SS-1', 'WC-1' — the natural key
  guideline_scope   TEXT        NOT NULL DEFAULT 'SHARED'
                      CHECK (guideline_scope IN ('AMBULATORY','ACUTE','SHARED')),
  product_type      TEXT        NOT NULL,             -- 'Resilient Floor Tile', 'Solid Surface', etc.
  description       TEXT        NOT NULL,
  manufacturer      TEXT,
  product_name      TEXT,
  product_number    TEXT,                             -- manufacturer SKU / color number
  color             TEXT,
  dimensions        TEXT,                             -- e.g. '12"×24"' or '4" height'
  installation_notes TEXT,
  sustainability    TEXT,                             -- PVC-free, VOC content, recycled content, etc.
  -- Regional variants: JSON map of region code → alternate specification object
  -- Keys: 'NW', 'MTN', 'SW', 'MIDWEST', 'SOUTH'
  -- Value schema: { "product_name": "...", "product_number": "...", "color": "...", "notes": "..." }
  regional_variants JSONB,
  swatch_gcs_path   TEXT,                             -- Cloud Storage path: shr-finish-rft1--swatch--v1.0.0.png
  room_applications TEXT[],                           -- descriptive labels, e.g. {'Exam rooms', 'Corridors'}
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  edition_id        INTEGER     REFERENCES editions(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN finishes.regional_variants IS
  'JSONB map: region_code → { product_name, product_number, color, notes }. '
  'Region codes: NW, MTN, SW, MIDWEST, SOUTH. P-3 and P-4 are the primary example.';

-- 2b. EQUIPMENT
CREATE TABLE equipment (
  id              SERIAL PRIMARY KEY,
  taxonomy_id     TEXT        NOT NULL UNIQUE,        -- 'SHR-EQUIP-SCALE-01'
  guideline_scope TEXT        NOT NULL DEFAULT 'SHARED'
                    CHECK (guideline_scope IN ('AMBULATORY','ACUTE','SHARED')),
  name            TEXT        NOT NULL,               -- 'Scale, Adult w/Stadiometer'
  category        TEXT,                               -- 'Clinical', 'IT', 'Staff Support'
  manufacturer    TEXT,
  model           TEXT,
  responsibility  TEXT        NOT NULL DEFAULT 'OFOI'
                    CHECK (responsibility IN ('OFOI','OFCI','IT/OFOI','IT/OFCI')),
  dimensions      TEXT,                               -- '40¼"W × 34½"D × 45½"H'
  power_requirements TEXT,
  notes           TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  edition_id      INTEGER     REFERENCES editions(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2c. FURNITURE / FF&E
CREATE TABLE furniture (
  id              SERIAL PRIMARY KEY,
  taxonomy_id     TEXT        NOT NULL UNIQUE,        -- 'SHR-FURN-EXAM-CHAIR-01'
  guideline_scope TEXT        NOT NULL DEFAULT 'SHARED'
                    CHECK (guideline_scope IN ('AMBULATORY','ACUTE','SHARED')),
  name            TEXT        NOT NULL,
  category        TEXT,                               -- 'Seating - Clinical', 'Tables & Storage'
  subcategory     TEXT,
  manufacturer    TEXT,
  model           TEXT,
  upholstery_spec TEXT,
  responsibility  TEXT        NOT NULL DEFAULT 'OFOI'
                    CHECK (responsibility IN ('OFOI','OFCI')),
  notes           TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  edition_id      INTEGER     REFERENCES editions(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. ROOMS — CORE TABLE (Room Data Sheets)
-- ============================================================

CREATE TABLE rooms (

  -- ── Identity & taxonomy ──────────────────────────────────
  taxonomy_id       TEXT        PRIMARY KEY,           -- 'AMB-ROOM-EX-001' — platform-wide stable ID
  legacy_code       TEXT,                             -- 'RDS-EX-001' — ADG PDF reference (transition only)
  guideline_type    TEXT        NOT NULL
                      CHECK (guideline_type IN ('AMBULATORY','ACUTE')),
  section           TEXT        NOT NULL,             -- 'Standard Rooms', 'Clinic Planning', etc.
  sort_order        INTEGER,                          -- controls sidebar/grid display order within section

  -- ── Display ──────────────────────────────────────────────
  name              TEXT        NOT NULL,             -- 'Exam Room, Typical (2-Door)'
  subtitle          TEXT,                             -- short descriptor for card views

  -- ── Planning attributes ──────────────────────────────────
  zone              TEXT        NOT NULL
                      CHECK (zone IN ('On-Stage','Off-Stage','On-Stage / Off-Stage')),
  same_handed       BOOLEAN     NOT NULL DEFAULT FALSE,
  ratio_note        TEXT,                             -- '2.5 exam rooms / provider (Primary Care baseline)'

  -- ── Size / area ──────────────────────────────────────────
  -- Store display string AND parsed numerics for programmatic use (space planning API, spec builder)
  size_display      TEXT,                             -- "9'-0\" × 12'-0\" clear"
  size_width_ft     NUMERIC(6,2),                    -- parsed width in decimal feet
  size_depth_ft     NUMERIC(6,2),                    -- parsed depth in decimal feet
  size_area_sf      NUMERIC(8,2),                    -- square footage
  size_notes        TEXT,                             -- 'Calculate at 8 SF/person'

  -- ── Content ──────────────────────────────────────────────
  description       TEXT,                             -- full narrative (Overview tab)

  -- ── MEP / Systems ────────────────────────────────────────
  -- Individual columns for queryability. mep_notes is the catch-all.
  -- If Acute guidelines introduce MEP categories not present here, add columns via migration.
  mep_lighting      TEXT,
  mep_hvac          TEXT,
  mep_plumbing      TEXT,
  mep_power_data    TEXT,                             -- power + IT/data combined (per ADG convention)
  mep_security      TEXT,                             -- panic button, card reader specs
  mep_av            TEXT,                             -- AV, display, video conferencing
  mep_acoustic      TEXT,                             -- wall type, STC, white noise
  mep_nurse_call    TEXT,
  mep_notes         TEXT,                             -- catch-all for additional systems notes

  -- ── Adjacencies ──────────────────────────────────────────
  -- Parallel arrays: room_ids where a room-to-room relationship exists; labels for all adjacencies
  -- adjacency_room_ids may be shorter than adjacency_labels if some adjacencies are descriptive only
  -- Phase 2: promote to junction table if adjacency queries become a research need
  adjacency_room_ids TEXT[],
  adjacency_labels   TEXT[],

  -- ── Graphic asset classification ─────────────────────────
  -- Drives consultant architect deliverable scope (see WBS 3.2.1)
  axon_type         SMALLINT    CHECK (axon_type IN (1,2,3)),
  -- 1 = Full: FP + RCP + 4 elevations + axon SVG overlay + PNG render
  -- 2 = Plan + elevations only (no axon)
  -- 3 = Plan only

  -- ── Edition tracking ─────────────────────────────────────
  -- Rooms are updated in-place. edition_id = the edition in which this record was last materially changed.
  -- Full point-in-time fidelity for locked projects is provided by room_edition_snapshots
  -- (section 4c) + the room_as_of_edition() function — NOT by reading this row directly.
  edition_id        INTEGER     NOT NULL REFERENCES editions(id),

  -- ── Status ───────────────────────────────────────────────
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  is_published      BOOLEAN     NOT NULL DEFAULT FALSE,
  -- is_published=FALSE: visible to administrative users only (staging during edition cycle)
  -- is_published=TRUE:  visible to all authenticated users

  -- ── Timestamps ───────────────────────────────────────────
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE rooms IS
  'One record per room type. taxonomy_id is the stable platform-wide primary key used in filenames, '
  'URLs, API endpoints, and the drawing asset naming convention. '
  'Updated in-place across editions; point-in-time state is reconstructed via room_edition_snapshots.';

COMMENT ON COLUMN rooms.axon_type IS
  '1=Full treatment (FP+RCP+4elevs+axon SVG+PNG), '
  '2=Plan+elevations only, 3=Plan only. Drives consultant scope in WBS 3.2.1.';

COMMENT ON COLUMN rooms.edition_id IS
  'Edition in which this record was last materially changed. Not itself a per-edition snapshot — '
  'use room_as_of_edition(taxonomy_id, edition_id) for locked-edition fidelity.';

-- Indexes for common query patterns
CREATE INDEX idx_rooms_guideline_section  ON rooms (guideline_type, section);
CREATE INDEX idx_rooms_zone               ON rooms (zone);
CREATE INDEX idx_rooms_edition            ON rooms (edition_id);
CREATE INDEX idx_rooms_published          ON rooms (is_published) WHERE is_published = TRUE;

-- ============================================================
-- 4. EDITION CHANGE LOG, ROOM JUNCTION TABLES, ROOM SNAPSHOTS
-- ============================================================

-- 4a. Edition change log (populates Version History feature).
-- Created here (after rooms) because it references rooms(taxonomy_id).
CREATE TABLE edition_changes (
  id              SERIAL PRIMARY KEY,
  edition_id      INTEGER     NOT NULL REFERENCES editions(id),
  page            TEXT,                               -- ADG PDF page ref, e.g. '37' or '70-82'
  section         TEXT        NOT NULL,               -- 'Standard Rooms', 'Arrival', etc.
  title           TEXT        NOT NULL,               -- 'Exam Room, Typical Elevations'
  change_type     TEXT        NOT NULL CHECK (change_type IN ('N','M','E')),
                                                      -- N=New, M=Modified, E=Eliminated
  description     TEXT        NOT NULL,
  room_taxonomy_id TEXT       REFERENCES rooms(taxonomy_id),  -- nullable: not all changes are room-specific
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_edition_changes_edition ON edition_changes (edition_id);
CREATE INDEX idx_edition_changes_room    ON edition_changes (room_taxonomy_id);
CREATE INDEX idx_edition_changes_type    ON edition_changes (change_type);

-- 4b. Room junction tables (furniture/finishes/equipment are junction
-- tables, not array codes, so quantities/locations/notes are queryable
-- and reverse lookups like "which rooms use RFT-1?" are a simple join).

-- Room ↔ Finishes
CREATE TABLE room_finishes (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  finish_code       TEXT        NOT NULL REFERENCES finishes(code),
  location          TEXT        NOT NULL,           -- 'Floor', 'Base', 'Walls', 'Countertop', 'Ceiling'
  notes             TEXT,                           -- 'P-2 semi-gloss above sink', 'WP-1 wainscot all walls'
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (room_taxonomy_id, finish_code, location)
);

CREATE INDEX idx_room_finishes_room ON room_finishes (room_taxonomy_id);
CREATE INDEX idx_room_finishes_code ON room_finishes (finish_code);
-- Reverse lookup: "which rooms use RFT-1?"
-- SELECT room_taxonomy_id FROM room_finishes WHERE finish_code = 'RFT-1';

-- Room ↔ Equipment
CREATE TABLE room_equipment (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  equipment_id      INTEGER     NOT NULL REFERENCES equipment(id),
  quantity          SMALLINT    NOT NULL DEFAULT 1,
  notes             TEXT,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (room_taxonomy_id, equipment_id)
);

CREATE INDEX idx_room_equipment_room ON room_equipment (room_taxonomy_id);

-- Room ↔ Furniture
CREATE TABLE room_furniture (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  furniture_id      INTEGER     NOT NULL REFERENCES furniture(id),
  quantity          SMALLINT    NOT NULL DEFAULT 1,
  notes             TEXT,
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (room_taxonomy_id, furniture_id)
);

CREATE INDEX idx_room_furniture_room ON room_furniture (room_taxonomy_id);

-- 4c. Room edition snapshots — locked-edition fidelity + change flagging.
--
-- rooms is still updated in-place (per confirmed policy), but every INSERT
-- or UPDATE on rooms is captured here as a full JSONB snapshot of that row,
-- keyed by (room_taxonomy_id, edition_id). This gives two things:
--
--   1. Locked-edition fidelity: a project locked to edition X calls
--      room_as_of_edition(taxonomy_id, X) to get the room exactly as it
--      stood at that edition, even if `rooms` has since moved on.
--   2. Change flagging: room_pending_changes (section 12) diffs a room's
--      latest snapshot against the snapshot as-of a project's locked
--      edition, so the UI can flag "changed since your locked edition"
--      and show what changed (changed_fields) for the team to review.
CREATE TABLE room_edition_snapshots (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  edition_id        INTEGER     NOT NULL REFERENCES editions(id),
  snapshot          JSONB       NOT NULL,           -- full row snapshot of rooms as of this edition
  change_summary    TEXT,                           -- optional human-readable summary of the change
  changed_fields    TEXT[],                         -- column names that changed vs. the prior snapshot
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_taxonomy_id, edition_id)
);

CREATE INDEX idx_room_snapshots_room    ON room_edition_snapshots (room_taxonomy_id);
CREATE INDEX idx_room_snapshots_edition ON room_edition_snapshots (edition_id);

COMMENT ON TABLE room_edition_snapshots IS
  'Full JSONB snapshot of a rooms row, captured on every material change, keyed by '
  '(room_taxonomy_id, edition_id). Source of truth for locked-edition fidelity '
  '(room_as_of_edition) and for flagging rooms changed since a project''s edition lock '
  '(room_pending_changes).';

-- Auto-capture a snapshot whenever a room is inserted or updated.
CREATE OR REPLACE FUNCTION capture_room_edition_snapshot()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  prev_snapshot JSONB;
  changed       TEXT[];
BEGIN
  SELECT snapshot INTO prev_snapshot
  FROM room_edition_snapshots
  WHERE room_taxonomy_id = NEW.taxonomy_id
  ORDER BY id DESC
  LIMIT 1;

  IF prev_snapshot IS NOT NULL THEN
    SELECT array_agg(n.key ORDER BY n.key) INTO changed
    FROM jsonb_each(to_jsonb(NEW)) AS n(key, value)
    JOIN jsonb_each(prev_snapshot) AS o(key, value) USING (key)
    WHERE n.value IS DISTINCT FROM o.value
      AND n.key NOT IN ('updated_at', 'created_at');
  END IF;

  INSERT INTO room_edition_snapshots (room_taxonomy_id, edition_id, snapshot, changed_fields)
  VALUES (NEW.taxonomy_id, NEW.edition_id, to_jsonb(NEW), changed)
  ON CONFLICT (room_taxonomy_id, edition_id) DO UPDATE
    SET snapshot = EXCLUDED.snapshot,
        changed_fields = EXCLUDED.changed_fields;

  RETURN NEW;
END;
$$;

CREATE TRIGGER rooms_snapshot_trigger
  AFTER INSERT OR UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION capture_room_edition_snapshot();

-- Resolve a room's content as of a given (locked) edition: the latest
-- snapshot at or before that edition's date. Falls back to the earliest
-- available snapshot if the room didn't exist yet as of the locked edition.
CREATE OR REPLACE FUNCTION room_as_of_edition(p_room_taxonomy_id TEXT, p_edition_id INTEGER)
RETURNS JSONB LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (
      SELECT s.snapshot
      FROM room_edition_snapshots s
      JOIN editions target ON target.id = p_edition_id
      JOIN editions se     ON se.id = s.edition_id
      WHERE s.room_taxonomy_id = p_room_taxonomy_id
        AND se.edition_date <= target.edition_date
      ORDER BY se.edition_date DESC
      LIMIT 1
    ),
    (
      SELECT s.snapshot
      FROM room_edition_snapshots s
      WHERE s.room_taxonomy_id = p_room_taxonomy_id
      ORDER BY s.id ASC
      LIMIT 1
    )
  );
$$;

COMMENT ON FUNCTION room_as_of_edition IS
  'Returns the room row (as JSONB) exactly as it stood as of the given edition — the source '
  'a project locked to that edition should render, instead of the live rooms row.';

-- ============================================================
-- 5. DECISION LOGIC & INTENTIONAL OMISSIONS
-- ============================================================

CREATE TABLE room_decision_logic (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  category          TEXT,                           -- 'Layout', 'Safety', 'Clinical', 'Acoustic', 'Brand'
  content           TEXT        NOT NULL,           -- the rationale statement in plain language
  edition_id        INTEGER     REFERENCES editions(id),
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decision_logic_room ON room_decision_logic (room_taxonomy_id);

COMMENT ON TABLE room_decision_logic IS
  'Why each design decision was made. Populates the Decision Logic tab on room data sheets. '
  'Reduces deviation requests by making design intent visible to all users.';

CREATE TABLE room_intentional_omissions (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  item              TEXT        NOT NULL,           -- what was considered and excluded
  rationale         TEXT        NOT NULL,           -- why it was excluded
  edition_id        INTEGER     REFERENCES editions(id),
  sort_order        INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_omissions_room ON room_intentional_omissions (room_taxonomy_id);

COMMENT ON TABLE room_intentional_omissions IS
  'Things evaluated and deliberately not included. '
  'Example: wall-mounted TV excluded from exam room because it competes with provider-patient eye contact.';

-- ============================================================
-- 6. DRAWING ASSETS
-- ============================================================

CREATE TABLE room_drawings (
  id                SERIAL PRIMARY KEY,
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id) ON DELETE CASCADE,
  drawing_type      TEXT        NOT NULL
                      CHECK (drawing_type IN ('fp','rcp','elev-n','elev-s','elev-e','elev-w','axon','det')),
  version           TEXT        NOT NULL,           -- 'v1.0.1'
  format            TEXT        NOT NULL CHECK (format IN ('svg','png','pdf')),
  gcs_path          TEXT,                           -- full Cloud Storage path
  file_name         TEXT,                           -- 'amb-room-ex-001--fp--v1.0.1.svg'
  status            TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('ready','pending','superseded')),
  -- is_schematic=TRUE: hand-built SVG from dev prototype (interim)
  -- is_schematic=FALSE: consultant-delivered production asset
  is_schematic      BOOLEAN     NOT NULL DEFAULT FALSE,
  file_size_bytes   INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_taxonomy_id, drawing_type, format, version)
);

CREATE INDEX idx_drawings_room   ON room_drawings (room_taxonomy_id);
CREATE INDEX idx_drawings_status ON room_drawings (status);

COMMENT ON TABLE room_drawings IS
  'One record per drawing file per room type. '
  'For axonometrics, both the SVG overlay AND the PNG render are separate records '
  '(same drawing_type=axon, different format=svg/png, same version — must be from same Revit view).';

-- ============================================================
-- 7. PROJECTS (DIP-owned fields only; Procore is SSOT for everything else)
-- ============================================================

CREATE TABLE projects (
  id                      SERIAL PRIMARY KEY,
  -- Shared key with Procore. Exact field name to be confirmed with Procore implementation team.
  -- Format TBD — do NOT implement unique constraint format until confirmed with Procore team.
  procore_project_number  TEXT        NOT NULL UNIQUE,
  guideline_types         TEXT[]      NOT NULL,           -- '{AMBULATORY}' or '{AMBULATORY,ACUTE}'
  edition_lock_id         INTEGER     REFERENCES editions(id),
  lock_date               DATE,
  lock_event              TEXT        NOT NULL DEFAULT 'Schematic Design',
  room_types_in_scope     TEXT[],                         -- array of room taxonomy_ids
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE projects IS
  'Lightweight DIP project record. All other project data (name, address, team, phase, schedule, '
  'substantial completion date) is read from the Procore API on demand via Next.js server-side API routes. '
  'Procore credentials are never exposed to the client browser.';

COMMENT ON COLUMN projects.procore_project_number IS
  'Shared key with Procore. Confirm exact field name and format with Procore implementation team '
  'before platform build begins — this is a pre-build gate.';

COMMENT ON COLUMN projects.edition_lock_id IS
  'Edition this project is locked to (locked at Schematic Design per confirmed policy). '
  'Room content for this project should be read via room_as_of_edition(taxonomy_id, edition_lock_id), '
  'not the live rooms row.';

-- ============================================================
-- 8. USERS & ACCESS
-- ============================================================

CREATE TABLE users (
  email         TEXT        PRIMARY KEY,             -- Google account email; must match Procore user email
  display_name  TEXT        NOT NULL,
  tier          TEXT        NOT NULL
                  CHECK (tier IN ('internal_standard','external_project','external_review','administrative')),
  -- internal_standard:  CSH staff — read-only access to all published content
  -- external_project:   architects, contractors — read + deviation submission for their projects
  -- external_review:    firm partners on guideline dev — read + review comments
  -- administrative:     Design & Architecture team — full access including content management
  organization  TEXT,                                -- firm name for external users
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  expires_at    TIMESTAMPTZ,                         -- NULL for internal; set for external users
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: which users are on which projects, and in what role
CREATE TABLE project_members (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER     NOT NULL REFERENCES projects(id),
  user_email    TEXT        NOT NULL REFERENCES users(email),
  procore_role  TEXT,                                -- 'Architect of Record', 'General Contractor', etc.
  dip_tier      TEXT        NOT NULL
                  CHECK (dip_tier IN ('external_project','external_review','administrative')),
  provisioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  UNIQUE (project_id, user_email)
);

CREATE INDEX idx_project_members_project ON project_members (project_id);
CREATE INDEX idx_project_members_user    ON project_members (user_email);

-- ============================================================
-- 9. DEVIATIONS
-- ============================================================

CREATE TABLE deviations (
  id                SERIAL PRIMARY KEY,
  reference_number  TEXT        UNIQUE,              -- 'DEV-2026-0042' — set by trigger on insert
  project_id        INTEGER     NOT NULL REFERENCES projects(id),
  room_taxonomy_id  TEXT        NOT NULL REFERENCES rooms(taxonomy_id),
  -- Which specific element of the standard is being deviated from (e.g., 'Same-handed configuration',
  -- 'Minimum room area 108 SF', 'RFT-1 flooring', 'Provider entry door required')
  standard_element  TEXT        NOT NULL,
  edition_id        INTEGER     NOT NULL REFERENCES editions(id),   -- edition at time of submission
  submitted_by      TEXT        NOT NULL REFERENCES users(email),
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  proposed_alternative TEXT     NOT NULL,
  justification     TEXT        NOT NULL,
  attachment_refs   TEXT[],                          -- GCS paths for supporting documents
  status            TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','approved_with_conditions','denied')),
  decision_text     TEXT,
  conditions        TEXT,                            -- populated when approved_with_conditions
  decided_by        TEXT        REFERENCES users(email),
  decided_at        TIMESTAMPTZ,
  procore_rfi_ref   TEXT,                            -- Procore RFI number after write-back
  -- Flagged by the CPI signal detection view when ≥3 approved deviations cluster on same standard
  is_cpi_candidate  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deviations_project ON deviations (project_id);
CREATE INDEX idx_deviations_room    ON deviations (room_taxonomy_id);
CREATE INDEX idx_deviations_status  ON deviations (status);

-- Auto-generate reference number from the serial id after insert
CREATE OR REPLACE FUNCTION set_deviation_reference()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE deviations
  SET reference_number = 'DEV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEW.id::TEXT, 4, '0')
  WHERE id = NEW.id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER deviation_reference_trigger
  AFTER INSERT ON deviations
  FOR EACH ROW EXECUTE FUNCTION set_deviation_reference();

-- ============================================================
-- 10. TRAINING & CERTIFICATION
-- ============================================================

CREATE TABLE training_modules (
  id          SERIAL PRIMARY KEY,
  module_code TEXT        NOT NULL UNIQUE,         -- 'NEW_USER_ORIENTATION', 'EDITION_MAR_2026'
  module_type TEXT        NOT NULL
                CHECK (module_type IN ('new_user','edition_onboarding','topic')),
  title       TEXT        NOT NULL,
  description TEXT,
  edition_id  INTEGER     REFERENCES editions(id), -- for edition_onboarding modules
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Which modules are required for which tiers, and when
CREATE TABLE training_requirements (
  id                   SERIAL PRIMARY KEY,
  module_id            INTEGER     NOT NULL REFERENCES training_modules(id),
  required_for_tier    TEXT        NOT NULL,       -- 'all', or a specific tier value
  required_within_days INTEGER,                    -- SLA from trigger event
  trigger_event        TEXT        NOT NULL
                         CHECK (trigger_event IN ('provisioning','edition_published','project_assignment')),
  UNIQUE (module_id, required_for_tier)
);

-- Per-user completion records
CREATE TABLE training_completions (
  id            SERIAL PRIMARY KEY,
  user_email    TEXT        NOT NULL REFERENCES users(email),
  module_id     INTEGER     NOT NULL REFERENCES training_modules(id),
  edition_id    INTEGER     REFERENCES editions(id),
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score         NUMERIC(5,2),                     -- percentage 0.00–100.00
  passed        BOOLEAN     NOT NULL,
  certificate_ref TEXT,                           -- GCS path for generated certificate PDF
  UNIQUE (user_email, module_id, edition_id)
);

CREATE INDEX idx_completions_user   ON training_completions (user_email);
CREATE INDEX idx_completions_module ON training_completions (module_id);

-- ============================================================
-- 11. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER rooms_updated_at     BEFORE UPDATE ON rooms     FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER finishes_updated_at  BEFORE UPDATE ON finishes  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER furniture_updated_at BEFORE UPDATE ON furniture FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER projects_updated_at  BEFORE UPDATE ON projects  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- 12. VIEWS
-- ============================================================

-- Always-current edition per guideline type
CREATE VIEW current_editions AS
  SELECT * FROM editions WHERE is_current = TRUE;

-- Drawing readiness summary per room (useful for ops dashboard)
CREATE VIEW room_drawing_status AS
  SELECT
    r.taxonomy_id,
    r.name,
    r.guideline_type,
    r.axon_type,
    COUNT(d.id) FILTER (WHERE d.status = 'ready' AND NOT d.is_schematic) AS production_ready,
    COUNT(d.id) FILTER (WHERE d.is_schematic)                             AS schematic_count,
    COUNT(d.id) FILTER (WHERE d.status = 'pending')                       AS pending_count,
    COUNT(d.id)                                                             AS total_drawings
  FROM rooms r
  LEFT JOIN room_drawings d ON d.room_taxonomy_id = r.taxonomy_id
  GROUP BY r.taxonomy_id, r.name, r.guideline_type, r.axon_type;

-- Rooms changed in a later edition than each room's own edition_id — i.e.
-- every material change on record, most recent first. Joined against a
-- project's edition_lock_id in application code (or room_pending_changes_for
-- below) to answer "has this room changed since my project's locked edition?"
CREATE VIEW room_pending_changes AS
  SELECT
    s.room_taxonomy_id,
    r.name                AS room_name,
    s.edition_id           AS changed_in_edition_id,
    e.name                 AS changed_in_edition_name,
    e.edition_date          AS changed_in_edition_date,
    s.change_summary,
    s.changed_fields,
    s.created_at
  FROM room_edition_snapshots s
  JOIN rooms r    ON r.taxonomy_id = s.room_taxonomy_id
  JOIN editions e ON e.id = s.edition_id
  WHERE s.changed_fields IS NOT NULL AND array_length(s.changed_fields, 1) > 0;

COMMENT ON VIEW room_pending_changes IS
  'Every material room change on record (one row per snapshot with a non-empty diff). '
  'Filter to edition_date > a project''s locked edition date to find rooms changed since that lock.';

-- Convenience function: does this room have changes newer than a given (locked) edition?
CREATE OR REPLACE FUNCTION has_room_changed_since(p_room_taxonomy_id TEXT, p_edition_id INTEGER)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_pending_changes c
    JOIN editions locked ON locked.id = p_edition_id
    WHERE c.room_taxonomy_id = p_room_taxonomy_id
      AND c.changed_in_edition_date > locked.edition_date
  );
$$;

COMMENT ON FUNCTION has_room_changed_since IS
  'TRUE if the room has a recorded change in an edition later than p_edition_id. '
  'Use with a project''s edition_lock_id to drive the "changed since your locked edition" UI flag.';

-- CPI signal detection: standards with ≥3 approved deviations in the same edition cycle
CREATE VIEW deviation_cpi_signals AS
  SELECT
    d.room_taxonomy_id,
    r.name            AS room_name,
    d.standard_element,
    d.edition_id,
    e.name            AS edition_name,
    COUNT(*)          AS total_requests,
    COUNT(*) FILTER (WHERE d.status IN ('approved','approved_with_conditions')) AS approved_count,
    COUNT(*) FILTER (WHERE d.status = 'denied')                                  AS denied_count
  FROM deviations d
  JOIN rooms r   ON r.taxonomy_id = d.room_taxonomy_id
  JOIN editions e ON e.id = d.edition_id
  GROUP BY d.room_taxonomy_id, r.name, d.standard_element, d.edition_id, e.name
  HAVING COUNT(*) FILTER (WHERE d.status IN ('approved','approved_with_conditions')) >= 3;

COMMENT ON VIEW deviation_cpi_signals IS
  'Surfaces standards with 3+ approved deviations in an edition cycle. '
  'These are candidates for CPI review and potential guideline revision.';

-- Training compliance: users with incomplete required training
CREATE VIEW training_overdue AS
  SELECT
    u.email,
    u.display_name,
    tm.module_code,
    tm.title       AS module_title,
    tr.required_within_days,
    tr.trigger_event,
    u.created_at   AS provisioned_at,
    (u.created_at + (tr.required_within_days || ' days')::INTERVAL) AS deadline
  FROM users u
  CROSS JOIN training_modules tm
  JOIN training_requirements tr ON tr.module_id = tm.id
    AND (tr.required_for_tier = 'all' OR tr.required_for_tier = u.tier)
  WHERE tm.is_active = TRUE
    AND u.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM training_completions tc
      WHERE tc.user_email = u.email
        AND tc.module_id = tm.id
        AND tc.passed = TRUE
    )
    AND tr.trigger_event = 'provisioning';

-- ============================================================
-- 13. ROW LEVEL SECURITY (Supabase)
-- ============================================================
-- auth.jwt()->>'email' is the Supabase standard for reading the
-- authenticated user's email from the JWT. Assumes Google OAuth
-- through Supabase GoTrue — confirm this claim name with the
-- developer before implementing.

ALTER TABLE rooms                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishes                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE edition_changes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_finishes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_equipment              ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_furniture              ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_edition_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_drawings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_decision_logic         ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_intentional_omissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviations                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules            ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_requirements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions        ENABLE ROW LEVEL SECURITY;

-- Helper: current user's DIP tier
CREATE OR REPLACE FUNCTION current_dip_tier()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT tier FROM users WHERE email = auth.jwt()->>'email' AND is_active = TRUE;
$$;

-- Helper: is current user administrative?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT current_dip_tier() = 'administrative';
$$;

-- Helper: is current user a member of a given project?
CREATE OR REPLACE FUNCTION is_project_member(p_project_id INTEGER)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
      AND user_email = auth.jwt()->>'email'
  );
$$;

-- GUIDELINES CONTENT — all authenticated users read published content; admins read all
CREATE POLICY "read_published_rooms"   ON rooms FOR SELECT TO authenticated
  USING (is_published = TRUE OR is_admin());
CREATE POLICY "admin_manage_rooms"     ON rooms FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Apply same pattern to all reference/content tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'finishes','equipment','furniture','editions','edition_changes',
    'room_finishes','room_equipment','room_furniture',
    'room_edition_snapshots','room_drawings',
    'room_decision_logic','room_intentional_omissions',
    'training_modules','training_requirements'
  ]) LOOP
    EXECUTE format(
      'CREATE POLICY "authenticated_read_%1$s" ON %1$s FOR SELECT TO authenticated USING (TRUE);
       CREATE POLICY "admin_write_%1$s" ON %1$s FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());',
      tbl
    );
  END LOOP;
END $$;

-- PROJECTS — members see their projects; admins see all
CREATE POLICY "member_read_projects"   ON projects FOR SELECT TO authenticated
  USING (is_admin() OR is_project_member(id));
CREATE POLICY "admin_write_projects"   ON projects FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "member_read_memberships" ON project_members FOR SELECT TO authenticated
  USING (is_admin() OR is_project_member(project_id));
CREATE POLICY "admin_write_memberships" ON project_members FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- USERS — read own record; admins read all
CREATE POLICY "read_own_user"          ON users FOR SELECT TO authenticated
  USING (is_admin() OR email = auth.jwt()->>'email');
CREATE POLICY "admin_write_users"      ON users FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- DEVIATIONS — project members read their project's deviations; submit for their projects; admins manage
CREATE POLICY "member_read_deviations" ON deviations FOR SELECT TO authenticated
  USING (is_admin() OR is_project_member(project_id));
CREATE POLICY "member_submit_deviation" ON deviations FOR INSERT TO authenticated
  WITH CHECK (is_project_member(project_id) AND submitted_by = auth.jwt()->>'email');
CREATE POLICY "admin_decide_deviation" ON deviations FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- TRAINING COMPLETIONS — read/write own; admins read all
CREATE POLICY "read_own_completions"   ON training_completions FOR SELECT TO authenticated
  USING (is_admin() OR user_email = auth.jwt()->>'email');
CREATE POLICY "write_own_completions"  ON training_completions FOR INSERT TO authenticated
  WITH CHECK (user_email = auth.jwt()->>'email');

-- ============================================================
-- END OF SCHEMA — DIP v1.1
-- ============================================================
