-- ============================================================
-- AAP SMSF Platform — PostgreSQL Schema v2
-- ============================================================

-- COMPANY GROUPS (referrers / firms)
CREATE TABLE company_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,              -- e.g. "Clime ASX", "Liberty", "AAP"
  type        TEXT NOT NULL DEFAULT 'referrer', -- 'referrer' | 'internal'
  logo_url    TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- STAFF (team members)
CREATE TABLE staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,  -- 'master_owner'|'bookkeeper'|'compliance'|'tax_agent'|'auditor'|'access_controller'
  photo_url     TEXT,
  bio           TEXT,
  fun_facts     TEXT,
  phone         TEXT,
  extension     TEXT,
  smtp_host     TEXT,
  smtp_port     INT,
  smtp_user     TEXT,
  smtp_pass_enc TEXT,
  imap_host     TEXT,
  imap_port     INT,
  company_group_id UUID REFERENCES company_groups(id),
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- CLIENTS
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_ref      TEXT UNIQUE NOT NULL,
  fund_name       TEXT NOT NULL,
  stage           TEXT NOT NULL DEFAULT 'Start',
  company_group_id UUID REFERENCES company_groups(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_clients_stage ON clients(stage);
CREATE INDEX idx_clients_company ON clients(company_group_id);
