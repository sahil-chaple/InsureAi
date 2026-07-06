"""
InsureAI Core API — FastAPI entry point.

Demonstrates how to use the Keycloak auth dependencies on real routes.
Run with:  uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import Depends, FastAPI

from app.auth.dependencies import CurrentUser, get_current_user, require_role

app = FastAPI(
    title="InsureAI Core API",
    version="0.1.0",
    docs_url="/docs",
)


# ── Public health check (no auth) ──────────────────────────────
@app.get("/health", tags=["ops"])
async def health_check():
    return {"status": "ok"}


# ── Any authenticated user ─────────────────────────────────────
@app.get("/me", tags=["auth"])
async def whoami(user: CurrentUser = Depends(get_current_user)):
    """Return the calling user's identity and roles."""
    return {
        "sub": user.sub,
        "email": user.email,
        "role": user.role,
        "roles": user.roles,
    }


# ── Admin-only route ───────────────────────────────────────────
@app.get("/admin/dashboard", tags=["admin"])
async def admin_dashboard(
    user: CurrentUser = Depends(require_role("admin")),
):
    return {"message": f"Welcome, admin {user.email}"}


# ── Underwriter or admin can approve claims ────────────────────
@app.post("/claims/{claim_id}/approve", tags=["claims"])
async def approve_claim(
    claim_id: str,
    user: CurrentUser = Depends(require_role("admin", "underwriter")),
):
    return {
        "claim_id": claim_id,
        "approved_by": user.sub,
        "role": user.role,
    }


# ── Claims reviewer can review claims ─────────────────────────
@app.get("/claims/review-queue", tags=["claims"])
async def review_queue(
    user: CurrentUser = Depends(require_role("claims_reviewer", "admin")),
):
    return {"queue": [], "reviewer": user.sub}
