from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class PolicyBase(BaseModel):
    policy_type: str # health, motor, life, travel, home
    provider_name: str
    coverage_amount: float
    premium_amount: float
    start_date: date
    end_date: date

class PolicyCreate(PolicyBase):
    pass

class PolicyOut(PolicyBase):
    id: UUID
    policy_number: str
    user_id: UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InsurancePlanOut(BaseModel):
    id: UUID
    name: str
    policy_type: str
    provider_name: str
    coverage_amount: float
    premium_amount: float
    description: Optional[str] = None
    features: Optional[List[str]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PolicyRenew(BaseModel):
    months: int = 12
