from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.schemas.policy import PolicyOut, PolicyCreate, PolicyRenew
from app.services import policy_service, audit_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/policies", tags=["policies"])

@router.get("/me", response_model=List[PolicyOut])
def read_my_policies(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns a list of policies owned by the current user.
    """
    return policy_service.get_user_policies(db, user_id=current_user.id)

@router.get("/{id}", response_model=PolicyOut)
def read_policy(id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieves details of a specific policy.
    Enforces ownership validation (or admin/underwriter access overrides).
    """
    policy = policy_service.get_policy_by_id(db, policy_id=str(id))
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found.")
        
    # Owner verification or role overrides (admin / underwriter)
    if policy.user_id != current_user.id and current_user.role not in ["admin", "underwriter"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You do not own this policy and are unauthorized to view it."
        )
    return policy

@router.post("", response_model=PolicyOut, status_code=status.HTTP_201_CREATED)
def create_new_policy(
    request: Request, 
    policy_in: PolicyCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Creates a new policy post-checkout.
    """
    db_policy = policy_service.create_policy(db, user_id=current_user.id, policy_in=policy_in)
    
    audit_service.create_audit_entry(
        db=db,
        action="Create Policy",
        entity_type="Policy",
        entity_id=db_policy.id,
        actor_id=current_user.id,
        actor_label=current_user.email,
        ip_address=request.client.host if request.client else None,
        result=f"Success: Created policy {db_policy.policy_number}"
    )
    return db_policy

@router.patch("/{id}/renew", response_model=PolicyOut)
def renew_existing_policy(
    request: Request, 
    id: UUID, 
    renew_in: PolicyRenew, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Renews an active or expired policy contract, extending the end date.
    """
    policy = policy_service.get_policy_by_id(db, policy_id=str(id))
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found.")
        
    # Check ownership or role overrides
    if policy.user_id != current_user.id and current_user.role not in ["admin", "underwriter"]:
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN,
             detail="Access denied: Unauthorized to renew this policy."
         )
         
    old_end_date = policy.end_date
    policy = policy_service.renew_policy(db, policy=policy, months=renew_in.months)
    
    audit_service.create_audit_entry(
        db=db,
        action="Renew Policy",
        entity_type="Policy",
        entity_id=policy.id,
        actor_id=current_user.id,
        actor_label=current_user.email,
        ip_address=request.client.host if request.client else None,
        result=f"Success: Extended end date from {old_end_date} to {policy.end_date}"
    )
    
    return policy
