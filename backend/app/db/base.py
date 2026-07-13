from app.db.base_class import Base

# Import all models here so they register on Base.metadata
from app.models.user import User, Profile
from app.models.policy import Policy, InsurancePlan
from app.models.claim import Claim, Document
from app.models.audit_log import AuditLog
