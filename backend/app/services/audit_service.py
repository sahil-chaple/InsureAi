from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def create_audit_entry(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    actor_id: Optional[str] = None,
    actor_label: str = "System",
    ip_address: Optional[str] = None,
    result: str = "Success"
) -> AuditLog:
    """
    Creates an append-only audit log entry.
    """
    db_log = AuditLog(
        actor_id=actor_id,
        actor_label=actor_label,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        ip_address=ip_address,
        result=result
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_audit_logs(
    db: Session,
    actor: Optional[str] = None,
    action: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieves audit logs filtered by actor, action, and date range.
    """
    query = db.query(AuditLog)
    
    if actor:
        # Match actor_label (System, AI Agent, or User's email)
        query = query.filter(AuditLog.actor_label.ilike(f"%{actor}%"))
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if date_from:
        query = query.filter(AuditLog.timestamp >= date_from)
    if date_to:
        query = query.filter(AuditLog.timestamp <= date_to)
        
    return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
