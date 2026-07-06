"""
test_rbac.py — RBAC integration tests for InsureAI Core API.

Tests the full request → auth → role-check → response pipeline using
mocked RS256 JWTs (no live Keycloak required).

Coverage matrix
───────────────
  ┌─────────────────────────────┬───────┬─────────────┐
  │ Scenario                    │ Code  │ Endpoint(s) │
  ├─────────────────────────────┼───────┼─────────────┤
  │ No token at all             │ 401   │ /me, others │
  │ Expired token               │ 401   │ /me         │
  │ Garbage token               │ 401   │ /me         │
  │ Valid token, wrong role      │ 403   │ role-gated  │
  │ Valid token, correct role    │ 200   │ all routes  │
  │ /me returns the mock roles  │ 200   │ /me         │
  └─────────────────────────────┴───────┴─────────────┘

When real Keycloak becomes available, change only the ``make_token``
fixture in conftest.py — every assertion below stays the same.
"""

from __future__ import annotations

import pytest

# Re-export the helper from conftest so tests read cleanly.
from tests.conftest import _auth_header


# ════════════════════════════════════════════════════════════════════
#  401 — Missing / Invalid Credentials
# ════════════════════════════════════════════════════════════════════


class TestUnauthorized:
    """Requests with no token or an invalid token → 401."""

    @pytest.mark.asyncio
    async def test_no_token_on_me(self, client):
        """GET /me without Authorization header → 401."""
        resp = await client.get("/me")
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_no_token_on_admin_dashboard(self, client):
        """GET /admin/dashboard without token → 401."""
        resp = await client.get("/admin/dashboard")
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_no_token_on_claims_approve(self, client):
        """POST /claims/CLM-1/approve without token → 401."""
        resp = await client.post("/claims/CLM-1/approve")
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_garbage_token(self, client):
        """A non-JWT string → 401."""
        resp = await client.get("/me", headers=_auth_header("not.a.jwt"))
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_expired_token(self, client, make_token):
        """A properly signed but expired JWT → 401."""
        token = make_token(roles=["admin"], expire_in=-60)
        resp = await client.get("/me", headers=_auth_header(token))
        assert resp.status_code == 401


# ════════════════════════════════════════════════════════════════════
#  403 — Valid Token, Wrong Role
# ════════════════════════════════════════════════════════════════════


class TestForbidden:
    """Authenticated users without the required role → 403."""

    @pytest.mark.asyncio
    async def test_customer_cannot_access_admin_dashboard(
        self, client, make_token
    ):
        """A customer should not reach /admin/dashboard (admin-only)."""
        token = make_token(roles=["customer"])
        resp = await client.get(
            "/admin/dashboard", headers=_auth_header(token)
        )
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_customer_cannot_approve_claims(self, client, make_token):
        """A customer may not approve claims (admin/underwriter only)."""
        token = make_token(roles=["customer"])
        resp = await client.post(
            "/claims/CLM-1/approve", headers=_auth_header(token)
        )
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_underwriter_cannot_access_admin_dashboard(
        self, client, make_token
    ):
        """Underwriters don't have admin access."""
        token = make_token(roles=["underwriter"])
        resp = await client.get(
            "/admin/dashboard", headers=_auth_header(token)
        )
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_claims_reviewer_cannot_approve_claims(
        self, client, make_token
    ):
        """Claims reviewers can review but NOT approve."""
        token = make_token(roles=["claims_reviewer"])
        resp = await client.post(
            "/claims/CLM-1/approve", headers=_auth_header(token)
        )
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_auditor_cannot_access_admin_dashboard(
        self, client, make_token
    ):
        """Auditors are read-only, no admin access."""
        token = make_token(roles=["auditor"])
        resp = await client.get(
            "/admin/dashboard", headers=_auth_header(token)
        )
        assert resp.status_code == 403


# ════════════════════════════════════════════════════════════════════
#  200 — Correct Role Grants Access
# ════════════════════════════════════════════════════════════════════


class TestAuthorized:
    """Users with the right role(s) get 200 and correct response bodies."""

    # ── /me (any authenticated user) ───────────────────────────────

    @pytest.mark.asyncio
    async def test_admin_can_access_me(self, client, make_token):
        token = make_token(roles=["admin"], sub="uid-admin", email="a@b.com")
        resp = await client.get("/me", headers=_auth_header(token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["sub"] == "uid-admin"
        assert body["email"] == "a@b.com"
        assert body["role"] == "admin"
        assert "admin" in body["roles"]

    @pytest.mark.asyncio
    async def test_customer_can_access_me(self, client, make_token):
        token = make_token(
            roles=["customer"], sub="uid-cust", email="cust@insure.ai"
        )
        resp = await client.get("/me", headers=_auth_header(token))
        assert resp.status_code == 200
        body = resp.json()
        assert body["sub"] == "uid-cust"
        assert body["role"] == "customer"

    # ── /admin/dashboard (admin only) ──────────────────────────────

    @pytest.mark.asyncio
    async def test_admin_can_access_dashboard(self, client, make_token):
        token = make_token(roles=["admin"], email="boss@insure.ai")
        resp = await client.get(
            "/admin/dashboard", headers=_auth_header(token)
        )
        assert resp.status_code == 200
        body = resp.json()
        assert "admin" in body["message"].lower() or "boss@insure.ai" in body["message"]

    # ── /claims/{id}/approve (admin or underwriter) ────────────────

    @pytest.mark.asyncio
    async def test_admin_can_approve_claim(self, client, make_token):
        token = make_token(roles=["admin"], sub="uid-admin")
        resp = await client.post(
            "/claims/CLM-42/approve", headers=_auth_header(token)
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["claim_id"] == "CLM-42"
        assert body["approved_by"] == "uid-admin"

    @pytest.mark.asyncio
    async def test_underwriter_can_approve_claim(self, client, make_token):
        token = make_token(roles=["underwriter"], sub="uid-uw")
        resp = await client.post(
            "/claims/CLM-99/approve", headers=_auth_header(token)
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["claim_id"] == "CLM-99"
        assert body["approved_by"] == "uid-uw"
        assert body["role"] == "underwriter"

    # ── /claims/review-queue (claims_reviewer or admin) ────────────

    @pytest.mark.asyncio
    async def test_claims_reviewer_can_view_review_queue(
        self, client, make_token
    ):
        token = make_token(roles=["claims_reviewer"], sub="uid-reviewer")
        resp = await client.get(
            "/claims/review-queue", headers=_auth_header(token)
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["reviewer"] == "uid-reviewer"

    @pytest.mark.asyncio
    async def test_admin_can_view_review_queue(self, client, make_token):
        token = make_token(roles=["admin"], sub="uid-admin")
        resp = await client.get(
            "/claims/review-queue", headers=_auth_header(token)
        )
        assert resp.status_code == 200


# ════════════════════════════════════════════════════════════════════
#  /me — Role Claim Fidelity
# ════════════════════════════════════════════════════════════════════


class TestMeEndpointRoleFidelity:
    """
    Confirm that /me faithfully echoes back the role information from the
    mock token — proving the claim structure round-trips correctly.
    """

    @pytest.mark.asyncio
    async def test_me_returns_all_realm_roles(self, client, make_token):
        """Multiple realm roles should all appear in the response."""
        token = make_token(roles=["customer", "claims_reviewer"])
        resp = await client.get("/me", headers=_auth_header(token))
        assert resp.status_code == 200
        body = resp.json()
        assert set(body["roles"]) == {"customer", "claims_reviewer"}

    @pytest.mark.asyncio
    async def test_me_primary_role_is_first_known_role(
        self, client, make_token
    ):
        """
        ``role`` (singular) should be the first known application role
        found in the token's ``realm_access.roles`` list.
        """
        # "customer" comes first, so it should be the primary.
        token = make_token(roles=["customer", "admin"])
        resp = await client.get("/me", headers=_auth_header(token))
        body = resp.json()
        assert body["role"] == "customer"

    @pytest.mark.asyncio
    async def test_me_unknown_role_when_no_known_roles(
        self, client, make_token
    ):
        """If token has no recognized application roles → role == 'unknown'."""
        token = make_token(roles=["some_random_keycloak_role"])
        resp = await client.get("/me", headers=_auth_header(token))
        body = resp.json()
        assert body["role"] == "unknown"
        assert body["roles"] == ["some_random_keycloak_role"]

    @pytest.mark.asyncio
    async def test_me_no_roles_claim(self, client, make_token):
        """Token with empty roles list → role == 'unknown', roles == []."""
        token = make_token(roles=[])
        resp = await client.get("/me", headers=_auth_header(token))
        body = resp.json()
        assert body["role"] == "unknown"
        assert body["roles"] == []


# ════════════════════════════════════════════════════════════════════
#  /health — Public Endpoint (Sanity Check)
# ════════════════════════════════════════════════════════════════════


class TestHealthEndpoint:
    """The health-check is public and must not require a token."""

    @pytest.mark.asyncio
    async def test_health_returns_200_without_auth(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}
