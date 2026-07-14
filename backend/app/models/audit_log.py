import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, event
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.base import GUID

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    actor_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    actor_label = Column(String, nullable=False)  # e.g., "AI Agent", "System", or email of user
    action = Column(String, nullable=False)        # e.g., "Login", "Create Policy", "Claim Decision"
    entity_type = Column(String, nullable=False)   # e.g., "User", "Policy", "Claim", "Document"
    entity_id = Column(String, nullable=True)      # ID of the entity that was acted upon (stored as string for flexibility)
    ip_address = Column(String, nullable=True)
    result = Column(String, nullable=False)        # e.g., "Success", "Failed", "Status changed from X to Y"

    # Relationships
    actor = relationship("User", back_populates="audit_logs")

# SQLAlchemy event listeners to block updates/deletes at the ORM level
@event.listens_for(AuditLog, "before_update")
def block_audit_log_updates(mapper, connection, target):
    raise PermissionError("Audit log entries are read-only and cannot be modified.")

@event.listens_for(AuditLog, "before_delete")
def block_audit_log_deletions(mapper, connection, target):
    raise PermissionError("Audit log entries are read-only and cannot be deleted.")
