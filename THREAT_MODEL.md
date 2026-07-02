# Threat Model (living document)

Fill this in as a team today, revisit at the start of every phase.

## Assets (what we're protecting)

| Asset | Sensitivity | Where it lives |
|---|---|---|
| Customer PII (name, email, address) | High | `users` table |
| Government ID numbers (Aadhaar/PAN/etc.) | Critical | `claims.sensitive_data_encrypted`, `documents` |
| Medical records / hospital bills | Critical | `documents`, claim attachments |
| Payment / payout data | Critical | Payment service (delegated to Stripe/Razorpay — we never store raw card data) |
| Claim decisions & audit trail | High (integrity, not just confidentiality) | `audit_log` |
| Auth credentials / sessions | Critical | Keycloak |

## Attackers we're defending against

1. **External attacker** — tries to breach via web app, API, or file upload
2. **Malicious customer** — legitimate account, tries to access other users' data, submit fraudulent claims, or manipulate the AI agents (prompt injection via uploaded documents)
3. **Insider threat** — someone with legitimate reviewer/admin access misuses it
4. **Compromised dependency** — a malicious or vulnerable open-source package we pulled in

## Top risks (fill in as a team, rank by team consensus)

1. _______________________
2. _______________________
3. _______________________

## Mitigations already in place (Day 1)

- Least-privilege DB roles per service (no shared superuser)
- Append-only audit log
- Keycloak for auth instead of custom login logic
- Field-level encryption planned for sensitive columns
- Secrets excluded from version control via `.gitignore`

## Mitigations still needed

- [ ] File upload sandboxing + virus scanning (Phase 2)
- [ ] Prompt injection defenses for AI agents (Phase 3)
- [ ] Rate limiting on public endpoints, especially AI chat + upload
- [ ] Dependency scanning in CI (Trivy/Snyk)
- [ ] Automated RBAC test suite covering every endpoint