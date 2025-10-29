"""
Authentication router for user registration, login, and profile management
"""
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import RedirectResponse
from datetime import datetime
from bson import ObjectId
from authlib.integrations.starlette_client import OAuth
import httpx

from models.user import UserCreate, UserResponse, UserLogin, Token, GoogleUserCreate
from utils.auth import (
    hash_password,
    create_access_token,
    authenticate_user,
    get_current_user
)
from database import get_users_collection
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Initialize OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user
    
    Args:
        user_data: User registration data (name, email, password)
        
    Returns:
        UserResponse: Created user information
        
    Raises:
        HTTPException: If email already exists
    """
    users_collection = get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user document
    user_dict = {
        "firstName": user_data.firstName,
        "lastName": user_data.lastName,
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user into database
    result = await users_collection.insert_one(user_dict)
    
    # Retrieve the created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    created_user["_id"] = str(created_user["_id"])
    
    return UserResponse(**created_user)


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """
    Log in a user and return an access token
    
    Args:
        user_credentials: User login credentials (email, password)
        
    Returns:
        Token: JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Authenticate user
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout():
    """
    Log out the current user
    
    Note: Since we're using JWT tokens, logout is primarily handled client-side
    by removing the token from storage. This endpoint is provided for consistency
    and can be extended for token blacklisting if needed.
    
    Returns:
        dict: Success message
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """
    Get the current authenticated user's information
    
    Args:
        current_user: Current authenticated user (injected by dependency)
        
    Returns:
        UserResponse: Current user information
    """
    return current_user


@router.get("/google/login")
async def google_login(request: Request):
    """
    Initiate Google OAuth login flow
    
    Returns:
        RedirectResponse: Redirect to Google OAuth consent screen
    """
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request):
    """
    Handle Google OAuth callback
    
    Args:
        request: FastAPI request object containing OAuth callback data
        
    Returns:
        RedirectResponse: Redirect to frontend with token
        
    Raises:
        HTTPException: If OAuth flow fails
    """
    try:
        # Get the access token from Google
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google"
            )
        
        users_collection = get_users_collection()
        
        # Check if user exists
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user_info['email']},
                {"google_id": user_info['sub']}
            ]
        })
        
        if existing_user:
            # Update existing user with Google info if needed
            if not existing_user.get('google_id'):
                await users_collection.update_one(
                    {"_id": existing_user["_id"]},
                    {
                        "$set": {
                            "google_id": user_info['sub'],
                            "auth_provider": "google",
                            "picture": user_info.get('picture'),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            user_id = str(existing_user["_id"])
        else:
            # Create new user - split name into firstName and lastName
            full_name = user_info.get('name', user_info['email'].split('@')[0])
            name_parts = full_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            new_user = {
                "firstName": first_name,
                "lastName": last_name,
                "email": user_info['email'],
                "google_id": user_info['sub'],
                "auth_provider": "google",
                "picture": user_info.get('picture'),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        # Redirect to frontend with token
        frontend_url = settings.CORS_ORIGINS[0] if isinstance(settings.CORS_ORIGINS, list) else settings.CORS_ORIGINS.split(',')[0]
        return RedirectResponse(
            url=f"{frontend_url}/auth/callback?token={access_token}"
        )
        
    except Exception as e:
        print(f"Google OAuth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )


@router.post("/google/token", response_model=Token)
async def google_token_login(request: Request):
    """
    Authenticate user with Google ID token (for frontend-initiated OAuth)
    
    Args:
        request: Request containing id_token in JSON body
        
    Returns:
        Token: JWT access token
        
    Raises:
        HTTPException: If token verification fails
    """
    body = await request.json()
    id_token = body.get('id_token')
    
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="id_token is required"
        )
    try:
        # Verify the Google ID token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            user_info = response.json()
            
            # Verify the token is for our app
            if user_info.get('aud') != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token not issued for this application"
                )
        
        users_collection = get_users_collection()
        
        # Check if user exists
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user_info['email']},
                {"google_id": user_info['sub']}
            ]
        })
        
        if existing_user:
            # Update existing user with Google info if needed
            if not existing_user.get('google_id'):
                await users_collection.update_one(
                    {"_id": existing_user["_id"]},
                    {
                        "$set": {
                            "google_id": user_info['sub'],
                            "auth_provider": "google",
                            "picture": user_info.get('picture'),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
            user_id = str(existing_user["_id"])
        else:
            # Create new user - split name into firstName and lastName
            full_name = user_info.get('name', user_info['email'].split('@')[0])
            name_parts = full_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            new_user = {
                "firstName": first_name,
                "lastName": last_name,
                "email": user_info['email'],
                "google_id": user_info['sub'],
                "auth_provider": "google",
                "picture": user_info.get('picture'),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id})
        
        return Token(access_token=access_token, token_type="bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Google token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )