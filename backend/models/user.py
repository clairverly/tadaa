"""
User model for MongoDB
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserBase(BaseModel):
    """Base user model with common fields"""
    firstName: str = Field(..., min_length=1, max_length=255, description="User's first name")
    lastName: str = Field(..., min_length=1, max_length=255, description="User's last name")
    email: EmailStr = Field(..., description="User's email address")


class UserCreate(UserBase):
    """Model for user registration"""
    password: str = Field(..., min_length=6, description="User's password")


class GoogleUserCreate(BaseModel):
    """Model for Google OAuth user creation"""
    firstName: str
    lastName: str
    email: EmailStr
    google_id: str
    picture: Optional[str] = None


class UserResponse(UserBase):
    """Model for user response (without password)"""
    id: str = Field(..., alias="_id")
    auth_provider: Optional[str] = "email"
    google_id: Optional[str] = None
    picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class User(UserBase):
    """User model stored in database"""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    hashed_password: Optional[str] = None
    auth_provider: str = "email"
    google_id: Optional[str] = None
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserInDB(User):
    """User model with hashed password for database operations"""
    pass


class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    user_id: Optional[str] = None