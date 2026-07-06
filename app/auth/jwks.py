"""
JWKS client with time-based caching and graceful key-rotation handling.

Design decisions
────────────────
* We use `PyJWKClient` from the `PyJWT` library, which already handles the
  heavy lifting of fetching, parsing, and matching `kid` headers.
* A thin wrapper adds a time-based cache (default 10 min) so we don't hit
  Keycloak on every request.
* On `kid` mismatch (e.g. after a key rotation) the cache is force-refreshed
  exactly once before giving up — prevents infinite retry loops.
"""

from __future__ import annotations

import logging
import time
from typing import Optional

import jwt
from jwt import PyJWKClient, PyJWKClientError

from .config import keycloak_settings

logger = logging.getLogger(__name__)


class CachedJWKSClient:
    """
    Wraps ``PyJWKClient`` with a TTL-based cache and one automatic
    retry on ``kid`` mismatch to handle key rotations.
    """

    def __init__(
        self,
        jwks_url: str | None = None,
        cache_ttl: int | None = None,
    ) -> None:
        self._jwks_url = jwks_url or keycloak_settings.jwks_url
        self._cache_ttl = cache_ttl or keycloak_settings.jwks_cache_ttl

        # PyJWKClient has its own internal cache; we layer a TTL on top.
        self._client = PyJWKClient(
            self._jwks_url,
            cache_keys=True,
            lifespan=self._cache_ttl,
        )
        self._last_fetch: float = 0.0

    # ── Public API ──────────────────────────────────────────────

    def get_signing_key(self, token: str) -> jwt.algorithms.RSAPublicKey:
        """
        Return the RSA public key that matches the token's ``kid`` header.

        On a cache miss or ``kid`` mismatch the JWKS is re-fetched (at most
        once per call) to handle key rotation gracefully.
        """
        try:
            signing_key = self._client.get_signing_key_from_jwt(token)
            self._last_fetch = time.monotonic()
            return signing_key.key
        except PyJWKClientError:
            # kid not found — possibly a key rotation.  Force a refresh.
            logger.info("JWKS kid miss — forcing cache refresh for key rotation")
            return self._force_refresh_and_retry(token)

    # ── Internals ───────────────────────────────────────────────

    def _force_refresh_and_retry(self, token: str) -> jwt.algorithms.RSAPublicKey:
        """Invalidate the cache once and retry.  If still no match, raise."""
        self._client = PyJWKClient(
            self._jwks_url,
            cache_keys=True,
            lifespan=self._cache_ttl,
        )
        signing_key = self._client.get_signing_key_from_jwt(token)  # may raise
        self._last_fetch = time.monotonic()
        return signing_key.key


# Module-level singleton — shared across all request handlers.
jwks_client = CachedJWKSClient()
