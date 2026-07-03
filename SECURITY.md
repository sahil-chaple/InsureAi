# Security Decisions Log

This file tracks security-relevant decisions as we make them. Update it
whenever a decision affects auth, data handling, or infra — don't let
these live only in someone's head or a Slack thread.

## Secrets management

- **Local dev:** `.env` file, gitignored, populated from `.env.example`.
- **Production:** [DECIDE THIS WEEK] — AWS Secrets Manager / GCP Secret
  Manager / self-hosted Vault. Whichever we pick, secrets are never
  written to `.env` files or committed anywhere in production.
- Rule: if a value looks like a real credential in a PR diff, the PR
  gets rejected, no exceptions.

## Database access model

- No service uses the Postgres superuser at runtime. Each service has
  its own least-privilege role (see `db/init.sql`):
  - `core_api_svc` — read/write on business tables, INSERT-only on audit_log
  - `document_svc` — access limited to the documents table
  - `auditor_ro` — read-only, including on audit_log
- `audit_log` is append-only. No role has UPDATE or DELETE on it.

## Sensitive data handling

- Medical records, government ID numbers, and payment details are
  never stored as plaintext. They go through field-level encryption
  (see `claims.sensitive_data_encrypted`) before insert.
- Encryption key lives outside the database, currently in
  `FIELD_ENCRYPTION_KEY` for local dev — moves to secrets manager
  before any real data touches this system.

## Authentication

- Auth is handled by Keycloak (self-hosted). We do not write custom
  login/session/token logic.
- Roles: `customer`, `claims_reviewer`, `underwriter`, `admin`, `auditor`.
- Every new API endpoint requires an explicit RBAC test proving other
  roles cannot access it, before it's considered done.

## File uploads (once Document Verification agent is built)

- All uploads go through: file-type allowlist → size limit → virus
  scan (ClamAV) → EXIF strip → sandboxed parsing. No exceptions, no
  "just for testing" bypass that outlives the test.

## Open items (update as decided)

- [ ] Production secrets manager choice
- [ ] TLS termination strategy for prod
- [ ] Log redaction policy (make sure PII never lands in plaintext logs)

Keycloak realm config is version-controlled via db/keycloak/insurance-platform-realm.json and auto-imported — don't configure realm/roles/clients only through the UI without re-exporting