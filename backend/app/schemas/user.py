from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID

class ProfileBase(BaseModel):
    date_of_birth: Optional[str] = None # e.g. "1990-01-01"
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    is_smoker: Optional[bool] = False
    pre_existing_conditions: Optional[List[str]] = Field(default_factory=list)
    owns_vehicle: Optional[bool] = False
    owns_home: Optional[bool] = False

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[ProfileOut] = None

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
