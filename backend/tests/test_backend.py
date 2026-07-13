import io
import pytest
from sqlalchemy import text
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, Profile
from app.models.policy import Policy
from app.models.claim import Claim
from app.models.audit_log import AuditLog
from datetime import date, datetime, timezone

def create_test_user(db, email, role, full_name="Test User"):
    user = User(
        email=email,
        hashed_password=get_password_hash("password123"),
        full_name=full_name,
        role=role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_auth_header(user_id):
    token = create_access_token(subject=str(user_id))
    return {"Authorization": f"Bearer {token}"}

# ==========================================
# RBAC REQUIRED TESTS
# ==========================================

def test_customer_cannot_access_claims_queue(client, db):
    """
    Test 1: customer token -> 403 on GET /claims/queue
    """
    customer = create_test_user(db, "customer_test@insureai.com", "customer")
    headers = get_auth_header(customer.id)
    
    response = client.get("/claims/queue", headers=headers)
    assert response.status_code == 403
    assert "Action forbidden" in response.json()["detail"]

def test_reviewer_cannot_decide_high_fraud_claim(client, db):
    """
    Test 2: claims_reviewer token -> 403 on PATCH a high-fraud claim decision
    """
    # Create users
    reviewer = create_test_user(db, "reviewer_test@insureai.com", "claims_reviewer")
    admin = create_test_user(db, "admin_test@insureai.com", "admin")
    customer = create_test_user(db, "customer_claim@insureai.com", "customer")
    
    # Create policy
    policy = Policy(
        policy_number="INS-2026-HL-11111",
        user_id=customer.id,
        policy_type="health",
        provider_name="InsureAI Health",
        coverage_amount=150000.00,
        premium_amount=200.00,
        status="active",
        start_date=date(2026, 1, 1),
        end_date=date(2027, 1, 1)
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    
    # Create a high-fraud-score claim
    claim = Claim(
        claim_number="CLM-2026-88888",
        policy_id=policy.id,
        user_id=customer.id,
        incident_type="Major Hospitalization",
        claim_amount=120000.00,
        description="High value claim description",
        status="submitted",
        fraud_score="high" # High fraud score
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    
    # 1. Reviewer tries to approve -> Expected 403
    rev_headers = get_auth_header(reviewer.id)
    response = client.patch(
        f"/claims/{claim.id}/decision",
        headers=rev_headers,
        json={"decision": "approve", "notes": "Approved by reviewer"}
    )
    assert response.status_code == 403
    assert "High-fraud-score claims require administrator approval" in response.json()["detail"]
    
    # 2. Admin tries to approve -> Expected 200
    admin_headers = get_auth_header(admin.id)
    response = client.patch(
        f"/claims/{claim.id}/decision",
        headers=admin_headers,
        json={"decision": "approve", "notes": "Approved by Admin"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

def test_customer_cannot_view_other_users_policy(client, db):
    """
    Test 3: customer token -> 403 on GET /policies/{other_user_policy_id}
    """
    customer_1 = create_test_user(db, "customer1@insureai.com", "customer")
    customer_2 = create_test_user(db, "customer2@insureai.com", "customer")
    underwriter = create_test_user(db, "underwriter_test@insureai.com", "underwriter")
    
    # Create policy for customer_2
    policy = Policy(
        policy_number="INS-2026-HL-22222",
        user_id=customer_2.id,
        policy_type="health",
        provider_name="InsureAI Health",
        coverage_amount=50000.00,
        premium_amount=100.00,
        status="active",
        start_date=date(2026, 1, 1),
        end_date=date(2027, 1, 1)
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    
    # 1. Customer 1 tries to read Customer 2's policy -> Expected 403
    headers_c1 = get_auth_header(customer_1.id)
    response = client.get(f"/policies/{policy.id}", headers=headers_c1)
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
    
    # 2. Customer 2 tries to read their own policy -> Expected 200
    headers_c2 = get_auth_header(customer_2.id)
    response = client.get(f"/policies/{policy.id}", headers=headers_c2)
    assert response.status_code == 200
    assert response.json()["policy_number"] == "INS-2026-HL-22222"
    
    # 3. Underwriter tries to read Customer 2's policy -> Expected 200
    headers_uw = get_auth_header(underwriter.id)
    response = client.get(f"/policies/{policy.id}", headers=headers_uw)
    assert response.status_code == 200

# ==========================================
# EXTRA SECURITY & CONSTRAINTS TESTS
# ==========================================

def test_sensitive_field_encryption(db):
    """
    Test 4: Fields are encrypted in DB but decrypted transparently by ORM.
    """
    customer = create_test_user(db, "customer_encrypt@insureai.com", "customer")
    
    # Create profile
    profile = Profile(
        user_id=customer.id,
        date_of_birth="1995-10-31",
        pre_existing_conditions=["Asthma", "High Blood Pressure"],
        gender="male",
        annual_income=85000.00
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    # Check that ORM reads them back correctly (decrypted)
    assert profile.date_of_birth == "1995-10-31"
    assert profile.pre_existing_conditions == ["Asthma", "High Blood Pressure"]
    
    # Query database using raw SQL to verify they are stored as ciphertext
    raw_record = db.execute(text("SELECT date_of_birth, pre_existing_conditions FROM profiles WHERE user_id = :uid"), {"uid": str(customer.id)}).first()
    assert raw_record is not None
    
    dob_in_db = raw_record[0]
    conditions_in_db = raw_record[1]
    
    # Ensure they are encrypted (not plaintext)
    assert dob_in_db != "1995-10-31"
    assert "Asthma" not in conditions_in_db
    
    # Verify Fernet signature (usually starts with 'gAAAAA')
    assert dob_in_db.startswith("gAAAAA")
    assert conditions_in_db.startswith("gAAAAA")

def test_audit_log_is_append_only(db):
    """
    Test 5: Audit logs cannot be updated or deleted at the ORM level.
    """
    log = AuditLog(
        actor_label="System",
        action="Test Action",
        entity_type="System",
        result="Success"
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    # Attempting to update should raise PermissionError
    log.action = "Modified Action"
    with pytest.raises(PermissionError) as exc_info:
        db.commit()
    assert "Audit log entries are read-only and cannot be modified" in str(exc_info.value)
    
    db.rollback()
    
    # Attempting to delete should raise PermissionError
    db.delete(log)
    with pytest.raises(PermissionError) as exc_info:
        db.commit()
    assert "Audit log entries are read-only and cannot be deleted" in str(exc_info.value)

def test_document_upload_validation(client, db):
    """
    Test 6: Accept only PDF, JPG, PNG under 10MB.
    """
    customer = create_test_user(db, "customer_doc@insureai.com", "customer")
    headers = get_auth_header(customer.id)
    
    # 1. Valid PDF upload -> Expected 201
    pdf_file = io.BytesIO(b"%PDF-1.4 mock pdf contents")
    response = client.post(
        "/documents/upload",
        headers=headers,
        files={"file": ("test.pdf", pdf_file, "application/pdf")}
    )
    assert response.status_code == 201
    assert response.json()["file_name"] == "test.pdf"
    assert response.json()["verification_status"] == "pending"
    
    # 2. Invalid Executable upload -> Expected 400
    exe_file = io.BytesIO(b"MZ... executable bytes")
    response = client.post(
        "/documents/upload",
        headers=headers,
        files={"file": ("malware.exe", exe_file, "application/x-msdownload")}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]
    
    # 3. Oversized file upload -> Expected 400 (exceeds 10MB limit)
    large_file = io.BytesIO(b"0" * (10 * 1024 * 1024 + 100)) # 10MB + 100 bytes
    response = client.post(
        "/documents/upload",
        headers=headers,
        files={"file": ("huge.png", large_file, "image/png")}
    )
    assert response.status_code == 400
    assert "File size exceeds the maximum limit" in response.json()["detail"]
