from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.user import ProfileCreate, ProfileOut
from app.schemas.policy import InsurancePlanOut
from app.services import auth_service, policy_service
from app.core.deps import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

class RiskAnalysisResponse(BaseModel):
    healthRisk: str
    assetExposure: str
    lifeCoverNeed: str
    profile: ProfileOut

class PlanRecommendation(BaseModel):
    id: str
    name: str
    policy_type: str
    provider_name: str
    coverage_amount: float
    premium_amount: float
    description: Optional[str] = None
    features: Optional[List[str]] = None
    match_score: int

    # Fix: enable standard support
    model_config = {
        "from_attributes": True
    }

from typing import Optional

def calculate_age(dob_str: Optional[str]) -> int:
    if not dob_str:
        return 35
    try:
        # Expected format YYYY-MM-DD
        dob = datetime.strptime(dob_str, "%Y-%m-%d")
        return (datetime.now() - dob).days // 365
    except Exception:
        return 35

@router.post("/analyze", response_model=RiskAnalysisResponse)
def analyze_risk(
    profile_in: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves/updates the user's onboarding profile and computes a rule-based mock risk analysis.
    """
    profile = auth_service.create_or_update_profile(db, user_id=current_user.id, profile_in=profile_in)
    
    age = calculate_age(profile.date_of_birth)
    
    # Calculate mock risk score thresholds
    # Health Risk
    if profile.is_smoker and age > 40:
        health_risk = "high"
    elif profile.is_smoker or age > 40 or len(profile.pre_existing_conditions or []) > 0:
        health_risk = "medium"
    else:
        health_risk = "low"
        
    # Asset Exposure
    income = float(profile.annual_income or 0)
    if profile.owns_vehicle and profile.owns_home:
        asset_exposure = "high"
    elif profile.owns_vehicle or profile.owns_home or income > 100000:
        asset_exposure = "medium"
    else:
        asset_exposure = "low"
        
    # Life Cover Need
    if profile.marital_status == "married" and age > 30:
        life_cover_need = "high"
    elif age > 25:
        life_cover_need = "medium"
    else:
        life_cover_need = "low"
        
    return RiskAnalysisResponse(
        healthRisk=health_risk,
        assetExposure=asset_exposure,
        lifeCoverNeed=life_cover_need,
        profile=ProfileOut.model_validate(profile)
    )

@router.get("", response_model=List[PlanRecommendation])
def get_recommended_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves and ranks seeded insurance plans using match scoring criteria.
    """
    profile = current_user.profile
    plans = policy_service.get_insurance_plans(db)
    
    recommendations = []
    
    for plan in plans:
        # Base match score
        score = 50
        
        if profile:
            age = calculate_age(profile.date_of_birth)
            
            if plan.policy_type == "health":
                if profile.is_smoker:
                    score += 20
                if age > 40:
                    score += 15
                if len(profile.pre_existing_conditions or []) > 0:
                    score += 15
            elif plan.policy_type == "motor":
                if profile.owns_vehicle:
                    score += 40
                else:
                    score -= 30
            elif plan.policy_type == "home":
                if profile.owns_home:
                    score += 40
                else:
                    score -= 30
            elif plan.policy_type == "life":
                if profile.marital_status == "married":
                    score += 20
                if 30 < age < 60:
                    score += 20
                if not profile.is_smoker:
                    score += 10
            elif plan.policy_type == "travel":
                score += 10
                
        # Constrain score between 0 and 100
        score = max(0, min(100, score))
        
        recommendations.append(
            PlanRecommendation(
                id=str(plan.id),
                name=plan.name,
                policy_type=plan.policy_type,
                provider_name=plan.provider_name,
                coverage_amount=float(plan.coverage_amount),
                premium_amount=float(plan.premium_amount),
                description=plan.description,
                features=plan.features,
                match_score=score
            )
        )
        
    # Sort recommendations by highest match score
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return recommendations
