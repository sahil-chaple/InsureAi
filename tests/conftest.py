"""
conftest.py — Shared fixtures for InsureAI API tests.

Design
──────
The mock JWT infrastructure lives entirely here.  Every test gets its
tokens from the ``make_token`` fixture, which mints real RS256 JWTs signed
by an ephemeral RSA key-pair generated at **session** scope.

To swap this out for real Keycloak tokens later, you only change how
``make_token`` obtains its JWT string — the test assertions are agnostic
to the token source.

How the override works
──────────────────────
We do NOT patch production code.  Instead we use FastAPI's
``app.dependency_overrides`` to replace ``get_current_user`` with a
local implementation that:

  1. Extracts the bearer token from the request.
  2. Decodes it against the *test* RSA public key (not Keycloak's JWKS).
  3. Builds a ``CurrentUser`` exactly the same way production code does.

Because the override is set at the app level, ``require_role`` (which
calls ``get_current_user`` internally) automatically gets the override
too — no extra wiring needed.
"""

from __future__ import annotations

import time
from typing import Any

import jwt as pyjwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from httpx import ASGITransport, AsyncClient

from app.auth.dependencies import CurrentUser, get_current_user, _KNOWN_ROLES
from app.main import app

# ── Session-scoped RSA key-pair (generated once per test run) ────────

_RSA_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)

_PRIVATE_PEM = _RSA_KEY.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.TraditionalOpenSSL,
    encryption_algorithm=serialization.NoEncryption(),
)

_PUBLIC_KEY = _RSA_KEY.public_key()

_PUBLIC_PEM = _PUBLIC_KEY.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)

# ── Test issuer / audience (match what the override expects) ─────────

_TEST_ISSUER = "http://localhost:8080/realms/insurance-platform"
_TEST_AUDIENCE = "core-api"


# ── Override dependency: decode against the test key ─────────────────

_bearer_scheme = HTTPBearer(auto_error=False)


async def _mock_get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentUser:
    """
    Drop-in replacement for ``get_current_user`` that validates JWTs
    against the test RSA public key instead of Keycloak's JWKS endpoint.

    The claim extraction logic is *identical* to production so that the
    tests exercise the same ``CurrentUser`` construction path.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload: dict[str, Any] = pyjwt.decode(
            token,
            _PUBLIC_PEM,
            algorithms=["RS256"],
            issuer=_TEST_ISSUER,
            audience=_TEST_AUDIENCE,
            options={
                "verify_exp": True,
                "verify_iss": True,
                "verify_aud": True,
            },
        )
    except pyjwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── Extract realm roles (mirrors production logic exactly) ───
    realm_roles: list[str] = payload.get("realm_access", {}).get("roles", [])

    primary_role = "unknown"
    for r in realm_roles:
        if r in _KNOWN_ROLES:
            primary_role = r
            break

    return CurrentUser(
        sub=payload.get("sub", ""),
        email=payload.get("email"),
        roles=realm_roles,
        role=primary_role,
        raw_claims=payload,
    )


# ── Fixtures ─────────────────────────────────────────────────────────


@pytest.fixture(scope="session")
def _apply_dependency_override():
    """
    Session-scoped fixture that wires the mock ``get_current_user``
    into the FastAPI app.  Every test in this session benefits.
    """
    app.dependency_overrides[get_current_user] = _mock_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture()
def make_token():
    """
    Factory fixture: returns a callable that mints a signed RS256 JWT
    with the specified roles and optional claim overrides.

    Usage in tests
    ──────────────
        token = make_token(roles=["admin"])
        token = make_token(roles=["customer"], email="a@b.com")
        token = make_token(roles=["underwriter"], sub="uid-42")

    When real Keycloak is available, swap this fixture body to do::

        token = await keycloak_admin.get_token(username, password)

    The test assertions stay the same.
    """

    def _mint(
        *,
        roles: list[str] | None = None,
        sub: str = "test-user-001",
        email: str = "test@insure.ai",
        extra_claims: dict[str, Any] | None = None,
        expire_in: int = 300,
    ) -> str:
        now = int(time.time())
        payload: dict[str, Any] = {
            "sub": sub,
            "email": email,
            "iss": _TEST_ISSUER,
            "aud": _TEST_AUDIENCE,
            "iat": now,
            "exp": now + expire_in,
            "realm_access": {
                "roles": roles or [],
            },
        }
        if extra_claims:
            payload.update(extra_claims)

        return pyjwt.encode(payload, _PRIVATE_PEM, algorithm="RS256")

    return _mint


@pytest.fixture()
async def client(_apply_dependency_override):
    """
    Async HTTP client wired to the FastAPI test app.

    Using ``httpx.AsyncClient`` + ``ASGITransport`` avoids starting a
    real server and keeps tests fully in-process.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def _auth_header(token: str) -> dict[str, str]:
    """Helper: build an Authorization header from a raw JWT string."""
    return {"Authorization": f"Bearer {token}"}
