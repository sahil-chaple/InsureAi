import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import GUID

class Claim(Base):
    __tablename__ = "claims"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    claim_number = Column(String, unique=True, index=True, nullable=False)
    policy_id = Column(GUID, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    incident_type = Column(String, nullable=False)
    claim_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="submitted", nullable=False) # submitted, under_review, approved, rejected, paid
    fraud_score = Column(String, default="low", nullable=False) # low, medium, high
    ai_confidence = Column(Float, nullable=True)
    ai_summary = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    policy = relationship("Policy", back_populates="claims")
    user = relationship("User", back_populates="claims", foreign_keys=[user_id])
    resolver = relationship("User", back_populates="resolved_claims", foreign_keys=[resolved_by])
    documents = relationship("Document", back_populates="claim")

class Document(Base):
    __tablename__ = "documents"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    claim_id = Column(GUID, ForeignKey("claims.id", ondelete="SET NULL"), nullable=True)
    policy_id = Column(GUID, ForeignKey("policies.id", ondelete="SET NULL"), nullable=True)
    uploaded_by = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    ocr_confidence = Column(Float, nullable=True)
    verification_status = Column(String, default="pending", nullable=False) # pending, verified, tamper_suspected
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    claim = relationship("Claim", back_populates="documents")
    policy = relationship("Policy", back_populates="documents")
    uploader = relationship("User")
