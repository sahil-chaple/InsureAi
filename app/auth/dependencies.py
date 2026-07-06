"""
FastAPI dependencies for JWT authentication and role-based access control.

Usage in routes
───────────────
    from app.auth.dependencies import get_current_user, require_role

    @router.get("/admin-only")
    async def admin_dashboard(user: CurrentUser = Depends(get_current_user)):
        ...

    @router.post("/claims/{id}/approve")
    async def approve_claim(
        id: str,
        user: CurrentUser = Depends(require_role("admin", "underwriter")),
    ):
        ...
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Sequence

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import keycloak_settings
from .jwks import jwks_client

logger = logging.getLogger(__name__)

# ── Bearer-token extractor ──────────────────────────────────────
# auto_error=False so we can return our own 401 instead of FastAPI's default.
_bearer_scheme = HTTPBearer(auto_error=False)


# ── Authenticated user model ───────────────────────────────────
@dataclass(frozen=True)
class CurrentUser:
    """
    Lightweight, immutable representation of the authenticated caller.

    Attributes
    ----------
    sub : str
        Keycloak user ID (the ``sub`` claim).
    email : str | None
        Email from the ``email`` claim (may be absent on service accounts).
    roles : list[str]
        Realm-level roles extracted from ``realm_access.roles``.
    role : str
        *Primary* role — the first realm role found that matches a known
        application role, or ``"unknown"`` if none match.  Handy for simple
        single-role checks in endpoints.
    raw_claims : dict
        Full decoded token payload for anything not covered above.
    """

    sub: str
    email: str | None = None
    roles: list[str] = field(default_factory=list)
    role: str = "unknown"
    raw_claims: dict[str, Any] = field(default_factory=dict, repr=False)


# Application roles that map 1-to-1 with the DB ``users.role`` column.
_KNOWN_ROLES: set[str] = {
    "customer",
    "claims_reviewer",
    "underwriter",
    "admin",
    "auditor",
}


# ── Core dependency: get_current_user ──────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> CurrentUser:
    """
    Validate the incoming JWT against Keycloak's JWKS and return a
    ``CurrentUser`` instance.

    Validates:
      • Signature (RS256, matched by ``kid``)
      • Expiry (``exp``)
      • Issuer (``iss`` must match the configured realm URL)
      • Audience (``aud`` must include the configured client ID)

    Raises ``HTTPException(401)`` with a generic message on any failure
    — no internal details are leaked to the caller.
    """
    if credentials is None:
        raise _unauthorized("Missing authentication credentials")

    token = credentials.credentials

    try:
        # 1. Resolve the signing key (cached, with rotation support)
        public_key = jwks_client.get_signing_key(token)

        # 2. Decode + validate in one shot
        payload: dict[str, Any] = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=keycloak_settings.issuer,
            audience=keycloak_settings.client_id,
            options={
                "verify_exp": True,
                "verify_iss": True,
                "verify_aud": True,
            },
        )

    except jwt.ExpiredSignatureError:
        logger.debug("Token expired")
        raise _unauthorized()
    except jwt.InvalidIssuerError:
        logger.debug("Token issuer mismatch")
        raise _unauthorized()
    except jwt.InvalidAudienceError:
        logger.debug("Token audience mismatch")
        raise _unauthorized()
    except jwt.PyJWTError as exc:
        # Catch-all for bad signature, malformed token, etc.
        logger.debug("JWT validation failed: %s", exc)
        raise _unauthorized()
    except Exception as exc:
        # Unexpected (network error fetching JWKS, etc.)
        logger.exception("Unexpected error during token validation")
        raise _unauthorized()

    # 3. Extract realm roles
    realm_roles: list[str] = (
        payload.get("realm_access", {}).get("roles", [])
    )

    # Determine a single "primary" application role.
    primary_role = "unknown"
    for r in realm_roles:
        if r in _KNOWN_ROLES:
            primary_role = r
            break  # first match wins (most-specific first in Keycloak)

    if primary_role == "unknown":
        logger.debug(
            "No known application role in token for sub=%s (roles=%s)",
            payload.get("sub"),
            realm_roles,
        )

    return CurrentUser(
        sub=payload.get("sub", ""),
        email=payload.get("email"),
        roles=realm_roles,
        role=primary_role,
        raw_claims=payload,
    )


# ── RBAC dependency factory: require_role ──────────────────────
def require_role(*allowed_roles: str):
    """
    Return a FastAPI dependency that enforces one-of role membership.

    Usage::

        @router.delete("/users/{id}")
        async def delete_user(
            id: str,
            user: CurrentUser = Depends(require_role("admin")),
        ):
            ...

        @router.post("/claims/{id}/approve")
        async def approve(
            id: str,
            user: CurrentUser = Depends(require_role("admin", "underwriter")),
        ):
            ...
    """
    allowed: frozenset[str] = frozenset(allowed_roles)

    async def _check_role(
        user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        # Check if ANY of the user's realm roles match.
        if not allowed.intersection(user.roles):
            logger.info(
                "RBAC denied: sub=%s roles=%s, required one of %s",
                user.sub,
                user.roles,
                allowed,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return _check_role


# ── Helpers ─────────────────────────────────────────────────────
def _unauthorized(detail: str = "Invalid or expired token") -> HTTPException:
    """Consistent 401 with WWW-Authenticate header."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )
