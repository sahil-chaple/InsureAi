"""
===============================================================================
SECURITY WARNING - DEV / DEMO SEED SCRIPT ONLY
===============================================================================
This seed script populates default demonstration users with known passwords
('password123') and sample policy/claim data.

CRITICAL:
1. THIS SCRIPT MUST NEVER BE RUN AGAINST A PRODUCTION DATABASE.
2. The seeded credentials (customer@insureai.com, reviewer@insureai.com,
   underwriter@insureai.com, admin@insureai.com, auditor@insureai.com) are
   strictly for local development, UI testing, and demonstration.
3. Before deploying to production, ensure these demo accounts are deleted
   and this script is excluded from deployment pipelines.
===============================================================================
"""

import uuid
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User, Profile
from app.models.policy import Policy, InsurancePlan
from app.models.claim import Claim, Document
from app.models.audit_log import AuditLog
from app.core.security import get_password_hash

def seed_db():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("Clearing existing data...")
        db.query(AuditLog).delete()
        db.query(Document).delete()
        db.query(Claim).delete()
        db.query(Policy).delete()
        db.query(InsurancePlan).delete()
        db.query(Profile).delete()
        db.query(User).delete()
        db.commit()
        
        print("Seeding Users...")
        hashed_password = get_password_hash("password123")
        
        users = [
            User(
                email="customer@insureai.com",
                hashed_password=hashed_password,
                full_name="Sarah Jenkins",
                role="customer",
                phone="+1 (555) 019-2834",
                is_active=True
            ),
            User(
                email="reviewer@insureai.com",
                hashed_password=hashed_password,
                full_name="Mark Davis",
                role="claims_reviewer",
                phone="+1 (555) 014-9988",
                is_active=True
            ),
            User(
                email="underwriter@insureai.com",
                hashed_password=hashed_password,
                full_name="Elena Rostova",
                role="underwriter",
                phone="+1 (555) 018-7766",
                is_active=True
            ),
            User(
                email="admin@insureai.com",
                hashed_password=hashed_password,
                full_name="Alex Mercer",
                role="admin",
                phone="+1 (555) 010-1122",
                is_active=True
            ),
            User(
                email="auditor@insureai.com",
                hashed_password=hashed_password,
                full_name="Robert Vance",
                role="auditor",
                phone="+1 (555) 012-3344",
                is_active=True
            )
        ]
        
        for u in users:
            db.add(u)
        db.commit()
        
        # Query users back to associate profile and policies
        db_customer = db.query(User).filter(User.role == "customer").first()
        db_reviewer = db.query(User).filter(User.role == "claims_reviewer").first()
        db_underwriter = db.query(User).filter(User.role == "underwriter").first()
        db_admin = db.query(User).filter(User.role == "admin").first()
        db_auditor = db.query(User).filter(User.role == "auditor").first()
        
        print("Seeding Profiles...")
        profile = Profile(
            user_id=db_customer.id,
            date_of_birth="1984-06-15",
            gender="female",
            marital_status="married",
            occupation="Software Engineer",
            annual_income=125000.00,
            city="Seattle",
            state="WA",
            height_cm=165.00,
            weight_kg=62.00,
            is_smoker=False,
            pre_existing_conditions=["Seasonal Allergies"],
            owns_vehicle=True,
            owns_home=True
        )
        db.add(profile)
        db.commit()
        
        print("Seeding Insurance Plans...")
        plans = [
            InsurancePlan(
                name="InsureAI Health Shield Max",
                policy_type="health",
                provider_name="InsureAI Premium Health",
                coverage_amount=1000000.00,
                premium_amount=250.00,
                description="Comprehensive medical shield covering inpatient, outpatient, and specialist care.",
                features=["Zero Deductible", "Global Coverage", "Mental Health Support", "AI Doctor Concierge"]
            ),
            InsurancePlan(
                name="Basic Care Health Plan",
                policy_type="health",
                provider_name="InsureAI Standard Health",
                coverage_amount=250000.00,
                premium_amount=95.00,
                description="Affordable medical coverage covering major accidents and inpatient hospitalization.",
                features=["Low Deductible", "Local General Hospital Network", "Emergency Ambulance Cover"]
            ),
            InsurancePlan(
                name="AutoGuard Comprehensive",
                policy_type="motor",
                provider_name="InsureAI Motor Corp",
                coverage_amount=50000.00,
                premium_amount=80.00,
                description="Full damage protection including collision, theft, natural disaster, and third-party liability.",
                features=["Roadside Assistance", "New Car Replacement", "No-Claim Bonus Protection", "Telematics Discount Ready"]
            ),
            InsurancePlan(
                name="Third-Party Starter Motor Policy",
                policy_type="motor",
                provider_name="InsureAI Motor Corp",
                coverage_amount=15000.00,
                premium_amount=35.00,
                description="Essential third-party liability cover satisfying basic road regulations.",
                features=["Basic Liability Protection", "Third-Party Property Coverage"]
            ),
            InsurancePlan(
                name="Term Life Premium Elite",
                policy_type="life",
                provider_name="InsureAI Life Assurance",
                coverage_amount=1500000.00,
                premium_amount=120.00,
                description="Term life plan ensuring full financial protection for family dependents with fast payout guarantees.",
                features=["High Payout Guarantee", "Accidental Death Benefit Booster", "Terminal Illness Fast Payout"]
            ),
            InsurancePlan(
                name="Secure Home Premium",
                policy_type="home",
                provider_name="InsureAI Properties",
                coverage_amount=500000.00,
                premium_amount=150.00,
                description="Coverage for home building structures and contents against fire, weather damage, and theft.",
                features=["Fire & Smoke damage", "Valuables Cover up to $20K", "Alternative Accommodation support"]
            ),
            InsurancePlan(
                name="Global Wanderer Travel Cover",
                policy_type="travel",
                provider_name="InsureAI Global Journeys",
                coverage_amount=100000.00,
                premium_amount=45.00,
                description="Single trip travel cover including flight delays, baggage losses, and international emergency hospitalization.",
                features=["24/7 Global Helpline", "Baggage Delay Compensation", "Medical Evacuation Cover"]
            ),
            InsurancePlan(
                name="Safe Trip Travel Basic",
                policy_type="travel",
                provider_name="InsureAI Global Journeys",
                coverage_amount=25000.00,
                premium_amount=15.00,
                description="Budget travel protection covering emergency medical incidents.",
                features=["Emergency Medical Only", "Covers up to 14 days"]
            ),
            InsurancePlan(
                name="InsureAI Home Basics",
                policy_type="home",
                provider_name="InsureAI Properties",
                coverage_amount=150000.00,
                premium_amount=60.00,
                description="Basic hazard insurance for property structure, excluding contents cover.",
                features=["Basic Fire coverage", "Storm Damage coverage"]
            )
        ]
        for p in plans:
            db.add(p)
        db.commit()
        
        print("Seeding Policies...")
        policies = [
            Policy(
                policy_number="INS-2026-HL-77892",
                user_id=db_customer.id,
                policy_type="health",
                provider_name="InsureAI Premium Health",
                coverage_amount=1000000.00,
                premium_amount=250.00,
                status="active",
                start_date=date(2026, 1, 1),
                end_date=date(2027, 1, 1)
            ),
            Policy(
                policy_number="INS-2026-MT-45812",
                user_id=db_customer.id,
                policy_type="motor",
                provider_name="InsureAI Motor Corp",
                coverage_amount=50000.00,
                premium_amount=80.00,
                status="active",
                start_date=date(2026, 3, 15),
                end_date=date(2027, 3, 15)
            ),
            Policy(
                policy_number="INS-2025-LF-11223",
                user_id=db_customer.id,
                policy_type="life",
                provider_name="InsureAI Life Assurance",
                coverage_amount=1500000.00,
                premium_amount=120.00,
                status="expiring_soon",
                start_date=date(2025, 8, 1),
                end_date=date(2026, 8, 1)
            )
        ]
        for pol in policies:
            db.add(pol)
        db.commit()
        
        db_health_policy = db.query(Policy).filter(Policy.policy_type == "health").first()
        db_motor_policy = db.query(Policy).filter(Policy.policy_type == "motor").first()
        db_life_policy = db.query(Policy).filter(Policy.policy_type == "life").first()
        
        print("Seeding Claims...")
        claims = [
            Claim(
                claim_number="CLM-2026-00384",
                policy_id=db_health_policy.id,
                user_id=db_customer.id,
                incident_type="Emergency Dental Work",
                claim_amount=1200.00,
                description="Root canal surgery completed at Seattle Dental Clinic.",
                status="paid",
                fraud_score="low",
                ai_confidence=0.97,
                ai_summary="Risk engine score: low risk. Conforms to baseline treatment costs. Auto-approved.",
                submitted_at=datetime.now(timezone.utc) - timedelta(days=45),
                resolved_at=datetime.now(timezone.utc) - timedelta(days=44),
                resolved_by=db_reviewer.id
            ),
            Claim(
                claim_number="CLM-2026-00918",
                policy_id=db_motor_policy.id,
                user_id=db_customer.id,
                incident_type="Car Accident Fender Bender",
                claim_amount=4500.00,
                description="Backed into a pole in a parking lot, minor bumper damage.",
                status="under_review",
                fraud_score="medium",
                ai_confidence=0.74,
                ai_summary="Moderate risk. Estimate exceeds average bumper replacement cost index.",
                submitted_at=datetime.now(timezone.utc) - timedelta(days=5)
            ),
            Claim(
                claim_number="CLM-2026-00445",
                policy_id=db_health_policy.id,
                user_id=db_customer.id,
                incident_type="Major Surgery Reimbursement",
                claim_amount=155000.00,
                description="Elective spinal surgery request by out-of-network clinic.",
                status="submitted",
                fraud_score="high",
                ai_confidence=0.88,
                ai_summary="High-risk flag. Request exceeds standard maximum caps for procedure. Double billing checks recommended.",
                submitted_at=datetime.now(timezone.utc) - timedelta(days=1)
            )
        ]
        for cl in claims:
            db.add(cl)
        db.commit()
        
        print("Seeding Audit Log entries...")
        audit_entries = [
            AuditLog(
                actor_id=db_customer.id,
                actor_label=db_customer.email,
                action="Signup",
                entity_type="User",
                entity_id=str(db_customer.id),
                ip_address="192.168.1.5",
                result="Success"
            ),
            AuditLog(
                actor_id=db_customer.id,
                actor_label=db_customer.email,
                action="Login",
                entity_type="User",
                entity_id=str(db_customer.id),
                ip_address="192.168.1.5",
                result="Success"
            ),
            AuditLog(
                actor_id=None,
                actor_label="System",
                action="Initialize Plans",
                entity_type="InsurancePlan",
                entity_id=None,
                ip_address="127.0.0.1",
                result="Success: Populated standard system insurance product configurations"
            ),
            AuditLog(
                actor_id=db_customer.id,
                actor_label=db_customer.email,
                action="Create Policy",
                entity_type="Policy",
                entity_id=str(db_health_policy.id),
                ip_address="192.168.1.5",
                result="Success"
            ),
            AuditLog(
                actor_id=None,
                actor_label="AI Agent",
                action="Analyze Claim Risk",
                entity_type="Claim",
                entity_id="claim-uuid-dental",
                ip_address=None,
                result="Analyzed claim CLM-2026-00384: Low risk (confidence 97%)"
            ),
            AuditLog(
                actor_id=None,
                actor_label="AI Agent",
                action="Analyze Claim Risk",
                entity_type="Claim",
                entity_id="claim-uuid-bumper",
                ip_address=None,
                result="Analyzed claim CLM-2026-00918: Medium risk (confidence 74%). Outlier estimate detected."
            ),
            AuditLog(
                actor_id=None,
                actor_label="AI Agent",
                action="Analyze Claim Risk",
                entity_type="Claim",
                entity_id="claim-uuid-spinal",
                ip_address=None,
                result="Analyzed claim CLM-2026-00445: High risk (confidence 88%). High value outlier."
            ),
            AuditLog(
                actor_id=db_reviewer.id,
                actor_label=db_reviewer.email,
                action="Claim Decision",
                entity_type="Claim",
                entity_id=str(claims[0].id),
                ip_address="10.0.2.14",
                result=f"Success: Approved claim {claims[0].claim_number} (Fast-track approved)"
            ),
            AuditLog(
                actor_id=db_customer.id,
                actor_label=db_customer.email,
                action="Renew Policy",
                entity_type="Policy",
                entity_id=str(db_life_policy.id),
                ip_address="192.168.1.5",
                result="Success"
            ),
            AuditLog(
                actor_id=db_auditor.id,
                actor_label=db_auditor.email,
                action="Query Audit Logs",
                entity_type="System",
                entity_id=None,
                ip_address="10.0.5.22",
                result="Viewed administrative system reports"
            )
        ]
        
        for entry in audit_entries:
            db.add(entry)
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
