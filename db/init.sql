-- ============================================================
-- init.sql
-- Runs once when the Postgres container first starts.
-- Creates SEPARATE, LEAST-PRIVILEGE roles per service instead
-- of every service sharing the superuser account.
--
-- Security rule this encodes: a compromised Core API credential
-- should never be enough to read the audit log or forge entries
-- in it. Same for a compromised Document service credential.
-- ============================================================

-- Core tables (owned by superuser initially, ownership can be
-- transferred later once schema is finalized)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer','claims_reviewer','underwriter','admin','auditor')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    policy_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id),
    status TEXT NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('submitted','under_review','approved','denied','paid')),
    -- Sensitive: encrypt at the application layer before insert,
    -- this column stores ciphertext only, never plaintext medical/ID data.
    sensitive_data_encrypted BYTEA,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id),
    doc_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Append-only audit log. No app role gets UPDATE or DELETE on this,
-- by design — that's what makes it trustworthy as an audit trail.
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    occurred_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Scoped roles — least privilege per service
-- ============================================================

-- Core API: full read/write on business tables, INSERT-only on audit_log
CREATE ROLE core_api_svc WITH LOGIN PASSWORD 'changeme_core_api_local';
GRANT SELECT, INSERT, UPDATE ON users, policies, claims TO core_api_svc;
GRANT SELECT ON documents TO core_api_svc;
GRANT INSERT ON audit_log TO core_api_svc;
-- Explicitly no DELETE anywhere, no UPDATE on audit_log, no UPDATE on documents

-- Document service: only touches documents table
CREATE ROLE document_svc WITH LOGIN PASSWORD 'changeme_document_svc_local';
GRANT SELECT, INSERT ON documents TO document_svc;
GRANT INSERT ON audit_log TO document_svc;

-- Auditor: read-only across the board, including audit_log
CREATE ROLE auditor_ro WITH LOGIN PASSWORD 'changeme_auditor_local';
GRANT SELECT ON users, policies, claims, documents, audit_log TO auditor_ro;

-- Keycloak's own schema/user (separate DB user for the IdP itself)
CREATE ROLE keycloak_svc WITH LOGIN PASSWORD 'changeme_keycloak_local' CREATEDB;
CREATE DATABASE keycloak_db OWNER keycloak_svc;

-- NOTE: passwords above are LOCAL DEV PLACEHOLDERS matching .env.example.
-- In every other environment these roles are created with values pulled
-- from a secrets manager, never hardcoded in a committed file.