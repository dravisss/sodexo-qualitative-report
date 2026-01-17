-- Qualitative Analyst - Neon Database Schema
-- Run this once against your Neon instance

CREATE TABLE IF NOT EXISTS units (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_slug TEXT REFERENCES units(slug),
    cycle_id TEXT DEFAULT '2026-Q1',
    respondent_info JSONB,
    answers JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'draft',
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    field_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    blob_key TEXT NOT NULL,
    content_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial units
INSERT INTO units (slug, name) VALUES
    ('general', 'Relatório Geral'),
    ('cajamar', 'Cajamar (Leroy Merlin)'),
    ('gru-food', 'Guarulhos FOOD (União Química)'),
    ('gru-fm', 'Guarulhos FM (União Química)')
ON CONFLICT (slug) DO NOTHING;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_unit ON submissions(unit_slug);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_attachments_submission ON attachments(submission_id);
