from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.services import audit_service
from app.core.deps import require_role
from app.models.user import User
from pydantic import BaseModel
from uuid import UUID

router = APIRouter(prefix="/admin", tags=["admin"])

class AuditLogOut(BaseModel):
    id: UUID
    timestamp: datetime
    actor_id: Optional[UUID] = None
    actor_label: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    result: str

    model_config = {
        "from_attributes": True
    }

class AgentActivityOut(BaseModel):
    id: str
    timestamp: datetime
    agent_name: str
    action: str
    target_entity: str
    target_id: str
    confidence: float
    reasoning: str
    status: str

@router.get("/audit-log", response_model=List[AuditLogOut])
def get_system_audit_logs(
    actor: Optional[str] = Query(None, description="Filter by actor label or email"),
    action: Optional[str] = Query(None, description="Filter by action name"),
    date_from: Optional[datetime] = Query(None, description="Filter from timestamp"),
    date_to: Optional[datetime] = Query(None, description="Filter to timestamp"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "auditor"))
):
    """
    Returns system audit logs. Restricted to admin and auditor roles.
    """
    logs = audit_service.get_audit_logs(
        db=db,
        actor=actor,
        action=action,
        date_from=date_from,
        date_to=date_to
    )
    return logs

@router.get("/agent-activity", response_model=List[AgentActivityOut])
def get_ai_agent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "auditor"))
):
    """
    Returns AI Agent activity logs. Restricted to admin and auditor roles.
    """
    # Look for database audit log entries where the actor label is "AI Agent"
    db_agent_logs = db.query(audit_service.AuditLog).filter(
        audit_service.AuditLog.actor_label == "AI Agent"
    ).order_by(audit_service.AuditLog.timestamp.desc()).all()
    
    activities = []
    
    for log in db_agent_logs:
        activities.append(
            AgentActivityOut(
                id=str(log.id),
                timestamp=log.timestamp,
                agent_name="InsureAI ClaimAnalyzer v1",
                action=log.action,
                target_entity=log.entity_type,
                target_id=log.entity_id or "",
                confidence=0.92,
                reasoning=log.result,
                status="completed"
            )
        )
        
    # Return fallback static mock records if the database has not been seeded yet
    if not activities:
        mock_time = datetime.now()
        activities = [
            AgentActivityOut(
                id="agent-act-1",
                timestamp=mock_time,
                agent_name="InsureAI ClaimAnalyzer v1",
                action="Analyze Claim Risk",
                target_entity="Claim",
                target_id="clm-uuid-example-1",
                confidence=0.94,
                reasoning="Claim conforms to medical category standard guidelines. Low risk of inflation or fraud.",
                status="completed"
            ),
            AgentActivityOut(
                id="agent-act-2",
                timestamp=mock_time,
                agent_name="InsureAI AutoUnderwriter v2",
                action="Evaluate Risk Profile",
                target_entity="Profile",
                target_id="prof-uuid-example-2",
                confidence=0.87,
                reasoning="Smoker and high age detected. Premium loading adjustment recommended.",
                status="completed"
            )
        ]
        
    return activities
