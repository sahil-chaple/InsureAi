import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import GUID

class Policy(Base):
    __tablename__ = "policies"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    policy_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_type = Column(String, nullable=False) # health, motor, life, travel, home
    provider_name = Column(String, nullable=False)
    coverage_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    premium_amount = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String, default="active", nullable=False) # active, expiring_soon, expired, cancelled
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")
    documents = relationship("Document", back_populates="policy")

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    policy_type = Column(String, nullable=False) # health, motor, life, travel, home
    provider_name = Column(String, nullable=False)
    coverage_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    premium_amount = Column(Numeric(precision=12, scale=2), nullable=False)
    description = Column(String, nullable=True)
    features = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
