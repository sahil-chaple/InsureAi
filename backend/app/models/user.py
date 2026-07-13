import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import GUID, EncryptedString, EncryptedJSON

class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="customer", nullable=False) # customer, claims_reviewer, underwriter, admin, auditor
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    policies = relationship("Policy", back_populates="user")
    claims = relationship("Claim", back_populates="user", foreign_keys="[Claim.user_id]")
    resolved_claims = relationship("Claim", back_populates="resolver", foreign_keys="[Claim.resolved_by]")
    audit_logs = relationship("AuditLog", back_populates="actor")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Sensitive fields encrypted at application level
    date_of_birth = Column(EncryptedString, nullable=True)
    pre_existing_conditions = Column(EncryptedJSON, nullable=True) # Stored as encrypted JSON string
    
    gender = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    annual_income = Column(Numeric(precision=15, scale=2), nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    height_cm = Column(Numeric(precision=5, scale=2), nullable=True)
    weight_kg = Column(Numeric(precision=5, scale=2), nullable=True)
    is_smoker = Column(Boolean, default=False, nullable=True)
    owns_vehicle = Column(Boolean, default=False, nullable=True)
    owns_home = Column(Boolean, default=False, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")
