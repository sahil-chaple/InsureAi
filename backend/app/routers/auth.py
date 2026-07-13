from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import Token, LoginSchema, RefreshTokenSchema, RefreshResponse
from app.schemas.user import UserCreate, UserOut
from app.services import auth_service, audit_service
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.models.user import User
from app.middleware.rate_limit import rate_limit
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=Token, dependencies=[Depends(rate_limit)])
def signup(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user, hashes password, and returns JWT token pair.
    """
    db_user = auth_service.get_user_by_email(db, email=user_in.email)
    if db_user:
        audit_service.create_audit_entry(
            db=db,
            action="Signup",
            entity_type="User",
            actor_label=user_in.email,
            ip_address=request.client.host if request.client else None,
            result="Failed - Email already exists"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
        
    user = auth_service.create_user(db, user_in)
    
    # Generate token pair
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    audit_service.create_audit_entry(
        db=db,
        action="Signup",
        entity_type="User",
        entity_id=user.id,
        actor_id=user.id,
        actor_label=user.email,
        ip_address=request.client.host if request.client else None,
        result="Success"
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/login", response_model=Token, dependencies=[Depends(rate_limit)])
def login(request: Request, login_in: LoginSchema, db: Session = Depends(get_db)):
    """
    Verifies user credentials and returns JWT token pair.
    """
    user = auth_service.authenticate_user(db, email=login_in.email, password=login_in.password)
    if not user:
        audit_service.create_audit_entry(
            db=db,
            action="Login",
            entity_type="User",
            actor_label=login_in.email,
            ip_address=request.client.host if request.client else None,
            result="Failed - Invalid credentials"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    audit_service.create_audit_entry(
        db=db,
        action="Login",
        entity_type="User",
        entity_id=user.id,
        actor_id=user.id,
        actor_label=user.email,
        ip_address=request.client.host if request.client else None,
        result="Success"
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=RefreshResponse)
def refresh(refresh_in: RefreshTokenSchema, db: Session = Depends(get_db)):
    """
    Validates a refresh token and issues a new access token.
    """
    try:
        payload = decode_token(refresh_in.refresh_token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
        
    user = auth_service.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user.")
        
    access_token = create_access_token(subject=user.id)
    return RefreshResponse(access_token=access_token)

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated user details.
    """
    return current_user
