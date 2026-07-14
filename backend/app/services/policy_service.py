import random
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.policy import Policy, InsurancePlan
from app.schemas.policy import PolicyCreate

def get_user_policies(db: Session, user_id: str) -> List[Policy]:
    return db.query(Policy).filter(Policy.user_id == user_id).all()

def get_policy_by_id(db: Session, policy_id: str) -> Optional[Policy]:
    return db.query(Policy).filter(Policy.id == policy_id).first()

def generate_policy_number(policy_type: str) -> str:
    year = datetime.now().year
    type_map = {
        "health": "HL",
        "motor": "MT",
        "life": "LF",
        "travel": "TR",
        "home": "HM"
    }
    code = type_map.get(policy_type.lower(), "GEN")
    random_num = random.randint(10000, 99999)
    return f"INS-{year}-{code}-{random_num}"

def create_policy(db: Session, user_id: str, policy_in: PolicyCreate) -> Policy:
    # Ensure unique policy number
    while True:
        pol_num = generate_policy_number(policy_in.policy_type)
        existing = db.query(Policy).filter(Policy.policy_number == pol_num).first()
        if not existing:
            break
            
    db_policy = Policy(
        policy_number=pol_num,
        user_id=user_id,
        policy_type=policy_in.policy_type,
        provider_name=policy_in.provider_name,
        coverage_amount=policy_in.coverage_amount,
        premium_amount=policy_in.premium_amount,
        start_date=policy_in.start_date,
        end_date=policy_in.end_date,
        status="active"
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return db_policy

def renew_policy(db: Session, policy: Policy, months: int = 12) -> Policy:
    """
    Extends policy end_date by a specified number of months and marks status as active.
    """
    original_end = policy.end_date
    
    # Exact month math to prevent month boundary bugs
    month = original_end.month - 1 + months
    year = original_end.year + month // 12
    month = month % 12 + 1
    
    # Handle end of month variations (e.g. Leap years and Feb 28/29)
    days_in_month = [
        31,
        29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ]
    day = min(original_end.day, days_in_month[month - 1])
    
    policy.end_date = date(year, month, day)
    policy.status = "active"
    
    db.commit()
    db.refresh(policy)
    return policy

def get_insurance_plans(db: Session) -> List[InsurancePlan]:
    return db.query(InsurancePlan).all()
