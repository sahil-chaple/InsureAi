from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import Token, LoginSchema, RefreshTokenSchema, RefreshResponse
from app.schemas.user import UserCreate, UserOut
from app.services import auth_service, audit_service
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user
from app.models.user import User
from app.middleware.rate_limit import rate_limit
from app.core.config import settings
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])

def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=settings.is_cookie_secure,
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth",
    )

@router.post("/signup", response_model=Token, dependencies=[Depends(rate_limit)])
def signup(request: Request, response: Response, user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user, hashes password, and returns JWT token pair (and sets HttpOnly refresh cookie).
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
    version = getattr(user, "token_version", 1)
    access_token = create_access_token(subject=user.id, token_version=version)
    refresh_token = create_refresh_token(subject=user.id, token_version=version)
    
    set_refresh_cookie(response, refresh_token)

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
def login(request: Request, response: Response, login_in: LoginSchema, db: Session = Depends(get_db)):
    """
    Verifies user credentials and returns JWT token pair (and sets HttpOnly refresh cookie).
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
        
    version = getattr(user, "token_version", 1)
    access_token = create_access_token(subject=user.id, token_version=version)
    refresh_token = create_refresh_token(subject=user.id, token_version=version)
    
    set_refresh_cookie(response, refresh_token)

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
def refresh(request: Request, response: Response, refresh_in: Optional[RefreshTokenSchema] = None, db: Session = Depends(get_db)):
    """
    Validates a refresh token (from request body or HttpOnly cookie) and issues a new access token.
    """
    token_str = (refresh_in.refresh_token if refresh_in and refresh_in.refresh_token else None) or request.cookies.get("refresh_token")
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )

    try:
        payload = decode_token(token_str)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        token_version: Optional[int] = payload.get("v")
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

    # Server-side invalidation check: compare token version with user's current version in DB
    current_version = getattr(user, "token_version", 1)
    if token_version is not None and token_version != current_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or session invalidated."
        )
        
    access_token = create_access_token(subject=user.id, token_version=current_version)
    new_refresh_token = create_refresh_token(subject=user.id, token_version=current_version)
    set_refresh_cookie(response, new_refresh_token)
    return RefreshResponse(access_token=access_token)

@router.post("/logout")
def logout(request: Request, response: Response, refresh_in: Optional[RefreshTokenSchema] = None, db: Session = Depends(get_db)):
    """
    Clears HttpOnly cookie and invalidates server-side user tokens by incrementing token_version.
    """
    # Attempt to extract token from body, cookie, or auth header to find the user to invalidate
    token_str = (refresh_in.refresh_token if refresh_in and refresh_in.refresh_token else None) or request.cookies.get("refresh_token")
    if not token_str:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token_str = auth_header.split(" ")[1]

    if token_str:
        try:
            payload = decode_token(token_str)
            user_id = payload.get("sub")
            if user_id:
                user = auth_service.get_user_by_id(db, user_id=user_id)
                if user:
                    user.token_version = (getattr(user, "token_version", 1) or 1) + 1
                    db.commit()
        except Exception:
            pass

    response.delete_cookie(key="refresh_token", path="/auth", httponly=True, samesite="lax", secure=settings.is_cookie_secure)
    return {"detail": "Successfully logged out and session revoked"}

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated user details.
    """
    return current_user
