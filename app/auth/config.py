"""
Keycloak auth configuration.

All Keycloak-specific settings live here so they can be swapped via env vars
in staging/production without touching any auth logic.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class KeycloakSettings:
    """Immutable Keycloak configuration, loaded once at startup."""

    server_url: str = field(
        default_factory=lambda: os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    )
    realm: str = field(
        default_factory=lambda: os.getenv("KEYCLOAK_REALM", "insurance-platform")
    )
    client_id: str = field(
        default_factory=lambda: os.getenv("KEYCLOAK_CLIENT_ID", "core-api")
    )

    # ── Derived URLs ────────────────────────────────────────────
    @property
    def jwks_url(self) -> str:
        return (
            f"{self.server_url}/realms/{self.realm}"
            f"/protocol/openid-connect/certs"
        )

    @property
    def issuer(self) -> str:
        """Expected `iss` claim in tokens minted by this realm."""
        return f"{self.server_url}/realms/{self.realm}"

    # How long (seconds) to cache the JWKS before re-fetching.
    jwks_cache_ttl: int = field(
        default_factory=lambda: int(os.getenv("JWKS_CACHE_TTL", "600"))  # 10 min
    )


# Module-level singleton — import this wherever you need the config.
keycloak_settings = KeycloakSettings()
