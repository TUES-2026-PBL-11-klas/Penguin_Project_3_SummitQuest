from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    VerifyEmailRequest
)
from app.auth.security import get_current_user
from app.auth.service import (
    create_user,
    login_user,
    verify_email
)
from app.core.dependencies import get_db
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post("/register")
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await create_user(
            db=db,
            email=request.email,
            password=request.password,
            persona=request.persona,
            weight_kg=request.weight_kg,
            first_name=request.first_name,
            last_name=request.last_name,
        )
        
        user = result["user"]

        return {
            "id": user.id,
            "email": user.email,
            "persona": user.persona,
            "verification_token": result["verification_token"]
        }



    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/login")
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    token = await login_user(
        db,
        request.email,
        request.password
    )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/verify-email")
async def verify_email_endpoint(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    success = await verify_email(
        db,
        request.token
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired token"
        )

    return {
        "message": "Email verified successfully"
    }

@router.get("/me")
async def me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "persona": current_user.persona,
        "level": current_user.level,
        "xp": current_user.xp,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
    }
