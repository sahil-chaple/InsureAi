import random
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.claim import Claim, Document
from app.schemas.claim import ClaimCreate

def get_user_claims(db: Session, user_id: str) -> List[Claim]:
    return db.query(Claim).filter(Claim.user_id == user_id).all()

def get_claim_by_id(db: Session, claim_id: str) -> Optional[Claim]:
    return db.query(Claim).filter(Claim.id == claim_id).first()

def get_all_claims_queue(db: Session) -> List[Claim]:
    """
    Returns all claims for review. Sorting by submitted_at descending.
    """
    return db.query(Claim).order_by(Claim.submitted_at.desc()).all()

def generate_claim_number() -> str:
    year = datetime.now().year
    random_num = random.randint(10000, 99999)
    return f"CLM-{year}-{random_num}"

def create_claim(db: Session, user_id: str, claim_in: ClaimCreate) -> Claim:
    """
    Creates a new claim and runs mock fraud risk analyzer.
    """
    while True:
        claim_num = generate_claim_number()
        existing = db.query(Claim).filter(Claim.claim_number == claim_num).first()
        if not existing:
            break

    # Mock rule-based risk score determination
    if claim_in.claim_amount > 100000:
        fraud_score = "high"
        ai_confidence = 0.88
        ai_summary = f"Risk engine flagged this claim due to high value ({claim_in.claim_amount}). Requires administrator review."
    elif claim_in.claim_amount > 30000:
        fraud_score = "medium"
        ai_confidence = 0.78
        ai_summary = "Risk engine labeled this claim as medium severity. Routine verification of receipts recommended."
    else:
        fraud_score = "low"
        ai_confidence = 0.95
        ai_summary = "Risk engine scored this claim as low-risk. Eligible for fast-track processing."

    db_claim = Claim(
        claim_number=claim_num,
        policy_id=claim_in.policy_id,
        user_id=user_id,
        incident_type=claim_in.incident_type,
        claim_amount=claim_in.claim_amount,
        description=claim_in.description,
        status="submitted",
        fraud_score=fraud_score,
        ai_confidence=ai_confidence,
        ai_summary=ai_summary
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

def make_claim_decision(
    db: Session, 
    claim: Claim, 
    decision: str, 
    notes: str, 
    resolver_id: str, 
    resolver_role: str
) -> Claim:
    """
    Applies approval/rejection decision to a claim.
    Enforces strict Human-In-The-Loop validation for high-fraud-score claims.
    """
    if claim.fraud_score == "high" and resolver_role != "admin":
        raise PermissionError("High-fraud-score claims require administrator approval.")

    # Map decision values to status string
    status_map = {
        "approve": "approved",
        "reject": "rejected",
        "escalate": "under_review"
    }
    
    new_status = status_map.get(decision.lower(), "under_review")
    
    claim.status = new_status
    claim.resolved_at = datetime.now(timezone.utc)
    claim.resolved_by = resolver_id
    
    # Append reviewer notes
    notes_header = f"\n\n[Decision: {new_status.upper()} by {resolver_role}]"
    claim.ai_summary = f"{claim.ai_summary or ''}{notes_header}\nReviewer Notes: {notes}"
    
    db.commit()
    db.refresh(claim)
    return claim

def create_document(
    db: Session,
    uploaded_by: str,
    file_name: str,
    file_path: str,
    file_type: str,
    claim_id: Optional[str] = None,
    policy_id: Optional[str] = None
) -> Document:
    """
    Inserts a record for an uploaded verification document.
    """
    db_doc = Document(
        claim_id=claim_id,
        policy_id=policy_id,
        uploaded_by=uploaded_by,
        file_name=file_name,
        file_path=file_path,
        file_type=file_type,
        verification_status="pending",
        ocr_confidence=None # OCR Stub (TODO)
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc
