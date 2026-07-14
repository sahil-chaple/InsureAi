from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, Profile
from app.schemas.user import UserCreate, ProfileCreate
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    """
    Creates a new user. Default role is always 'customer'.
    """
    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role="customer"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticates user. Returns User object if verified, otherwise None.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_or_update_profile(db: Session, user_id: str, profile_in: ProfileCreate) -> Profile:
    """
    Creates or updates the 1:1 onboarding profile for a user.
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        # Update existing fields
        for key, val in profile_in.model_dump(exclude_unset=True).items():
            setattr(profile, key, val)
    else:
        # Create a new profile
        profile = Profile(
            user_id=user_id,
            **profile_in.model_dump()
        )
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
