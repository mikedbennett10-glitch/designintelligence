-- ============================================================
-- Seed: Ambulatory editions
-- ============================================================
-- January 2025 is the historical baseline edition (superseded);
-- March 2026 is the current, active edition.

INSERT INTO editions (guideline_type, edition_code, name, edition_date, status, is_current, subtitle, published_at)
VALUES
  (
    'AMBULATORY',
    'JAN-2025',
    'January 2025 Edition',
    '2025-01-15',
    'superseded',
    FALSE,
    'Baseline Ambulatory Design Guidelines edition.',
    '2025-01-15T00:00:00Z'
  ),
  (
    'AMBULATORY',
    'MAR-2026',
    'March 2026 Edition',
    '2026-03-01',
    'released',
    TRUE,
    'Current Ambulatory Design Guidelines edition.',
    '2026-03-01T00:00:00Z'
  )
ON CONFLICT (guideline_type, edition_code) DO NOTHING;
