from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.schemas.claim import ClaimOut, ClaimCreate, ClaimDecision
from app.services import claims_service, audit_service
from app.core.deps import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/claims", tags=["claims"])

@router.get("/me", response_model=List[ClaimOut])
def read_my_claims(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns all claims filed by the current authenticated user.
    """
    return claims_service.get_user_claims(db, user_id=current_user.id)

@router.get("/queue", response_model=List[ClaimOut])
def read_claims_queue(
    current_user: User = Depends(require_role("claims_reviewer", "admin")),
    db: Session = Depends(get_db)
):
    """
    Returns all claims across the platform for reviewer/admin examination.
    """
    return claims_service.get_all_claims_queue(db)

@router.get("/{id}", response_model=ClaimOut)
def read_claim(id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves details of a specific claim.
    Restricted to the owner of the claim or users with reviewer/admin access.
    """
    claim = claims_service.get_claim_by_id(db, claim_id=str(id))
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found.")
        
    if claim.user_id != current_user.id and current_user.role not in ["claims_reviewer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not own this claim and are unauthorized to view it."
        )
    return claim

@router.post("", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
def create_new_claim(
    request: Request,
    claim_in: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Files a new claim against an active policy.
    """
    db_claim = claims_service.create_claim(db, user_id=current_user.id, claim_in=claim_in)
    
    audit_service.create_audit_entry(
        db=db,
        action="File Claim",
        entity_type="Claim",
        entity_id=db_claim.id,
        actor_id=current_user.id,
        actor_label=current_user.email,
        ip_address=request.client.host if request.client else None,
        result=f"Success: Filed claim {db_claim.claim_number}"
    )
    return db_claim

@router.patch("/{id}/decision", response_model=ClaimOut)
def decide_claim(
    request: Request,
    id: UUID,
    decision_in: ClaimDecision,
    current_user: User = Depends(require_role("claims_reviewer", "admin")),
    db: Session = Depends(get_db)
):
    """
    Approves, rejects, or escalates a submitted claim.
    Enforces that high-fraud-score claims can only be decided by an administrator.
    """
    claim = claims_service.get_claim_by_id(db, claim_id=str(id))
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found.")
        
    old_status = claim.status
    
    try:
        updated_claim = claims_service.make_claim_decision(
            db=db,
            claim=claim,
            decision=decision_in.decision,
            notes=decision_in.notes,
            resolver_id=current_user.id,
            resolver_role=current_user.role
        )
    except PermissionError as e:
        audit_service.create_audit_entry(
            db=db,
            action="Claim Decision Attempt",
            entity_type="Claim",
            entity_id=claim.id,
            actor_id=current_user.id,
            actor_label=current_user.email,
            ip_address=request.client.host if request.client else None,
            result=f"Failed: Permission Error: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
        
    audit_service.create_audit_entry(
        db=db,
        action="Claim Decision",
        entity_type="Claim",
        entity_id=updated_claim.id,
        actor_id=current_user.id,
        actor_label=current_user.email,
        ip_address=request.client.host if request.client else None,
        result=f"Success: Status changed from {old_status} to {updated_claim.status}"
    )
    
    return updated_claim
