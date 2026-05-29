from datetime import datetime, timezone, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models import User, OtpCode, Session
from src.email_utils import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])


class SendCodeRequest(BaseModel):
    email: str
    username: str | None = None


class VerifyCodeRequest(BaseModel):
    email: str
    code: str


@router.post("/send-code")
async def send_code(req: SendCodeRequest, db: AsyncSession = Depends(get_db)):
    email = req.email.strip().lower()

    code = f"{secrets.randbelow(1000000):06d}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    otp = OtpCode(email=email, code=code, expires_at=expires_at)
    db.add(otp)
    await db.commit()

    try:
        send_otp_email(email, code)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {e}",
        )

    return {"message": "Verification code sent to email"}


@router.post("/verify-code")
async def verify_code(req: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    email = req.email.strip().lower()
    code = req.code.strip()

    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(OtpCode).where(
            OtpCode.email == email,
            OtpCode.code == code,
            OtpCode.used == False,
            OtpCode.expires_at > now,
        ).order_by(OtpCode.created_at.desc()).limit(1)
    )
    otp = result.scalar_one_or_none()

    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    otp.used = True

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        username = email.split("@")[0]
        user = User(username=username, email=email, verified=True)
        db.add(user)
        await db.flush()

    user.verified = True

    session = Session(user_id=user.id)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {"token": session.token, "user": {"id": user.id, "username": user.username, "email": user.email}}


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )
    token = authorization.removeprefix("Bearer ")

    result = await db.execute(
        select(Session).where(Session.token == token)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )

    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
