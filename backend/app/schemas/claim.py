from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class ClaimCreate(BaseModel):
    policy_id: UUID
    incident_type: str
    claim_amount: float
    description: Optional[str] = None

class ClaimOut(BaseModel):
    id: UUID
    claim_number: str
    policy_id: UUID
    user_id: UUID
    incident_type: str
    claim_amount: float
    description: Optional[str] = None
    status: str # submitted, under_review, approved, rejected, paid
    fraud_score: str # low, medium, high
    ai_confidence: Optional[float] = None
    ai_summary: Optional[str] = None
    submitted_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)

class ClaimDecision(BaseModel):
    decision: str # approve, reject, escalate
    notes: str

class DocumentOut(BaseModel):
    id: UUID
    claim_id: Optional[UUID] = None
    policy_id: Optional[UUID] = None
    uploaded_by: UUID
    file_name: str
    file_path: str
    file_type: str
    ocr_confidence: Optional[float] = None
    verification_status: str # pending, verified, tamper_suspected
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
