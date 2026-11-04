"""
Auth routes: Register, Login, Refresh Token, Email Verification.

URL pattern: /api/auth/* (resource-based, bukan role-based).
Email verification belum kirim email beneran, cuma log dulu (SMTP setup nanti).
"""

from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from marshmallow import ValidationError
from datetime import datetime

from app.config.extensions import db
from app.models.user import User
from app.utils.responses import success_response, error_response
from app.modules.auth.schema import (
    RegisterSchema, 
    LoginSchema,
    RequestPasswordResetSchema,
    ResetPasswordSchema
)

auth_bp = Blueprint("auth", __name__)

# --- REGISTER ---
@auth_bp.post("/register")
def register():
    """
    Register user baru (role: user only).
    Admin & Officer dibuat lewat sistem, bukan self-register.
    
    Body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "081234567890",
        "password": "password123"
    }
    """
    try:
        # validasi input
        schema = RegisterSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return error_response("Validation failed", 400, err.messages)
    
    # cek email duplikat
    if User.query.filter_by(email=data["email"]).first():
        return error_response("Email already registered", 400)
    
    # cek phone duplikat
    if User.query.filter_by(phone=data["phone"]).first():
        return error_response("Phone number already registered", 400)
    
    # buat user baru
    new_user = User(
        name=data["name"],
        email=data["email"],
        phone=data["phone"],
        role="user",  # default role: user
        email_verified=False  # belum verified
    )
    new_user.set_password(data["password"])
    
    # generate email verification token
    verification_token = new_user.generate_email_verification_token()
    
    db.session.add(new_user)
    db.session.commit()
    
    # TODO: Kirim email verification (SMTP belum setup)
    # Untuk sekarang, cuma log token-nya
    verification_link = f"http://localhost:5000/api/auth/verify-email/{verification_token}"
    print(f"\n{'='*60}")
    print(f"EMAIL VERIFICATION (Log Only - SMTP belum setup)")
    print(f"{'='*60}")
    print(f"To: {new_user.email}")
    print(f"Subject: Verify Your TicketWave Account")
    print(f"\nVerification Link:")
    print(f"{verification_link}")
    print(f"\nToken expires: {new_user.email_verification_token_expires}")
    print(f"{'='*60}\n")
    
    return success_response(
        "Registration successful. Please check your email to verify your account.",
        {
            "user": new_user.to_dict(),
            "verification_token": verification_token  # sementara di-return, nanti dihapus pas SMTP jalan
        },
        201
    )


# --- LOGIN ---
@auth_bp.post("/login")
def login():
    """
    Login untuk semua role (admin, officer, user).
    Return access token & refresh token.
    
    Body:
    {
        "email": "john@example.com",
        "password": "password123"
    }
    """
    try:
        schema = LoginSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return error_response("Validation failed", 400, err.messages)
    
    # cari user berdasarkan email
    user = User.query.filter_by(email=data["email"]).first()
    
    if not user or not user.check_password(data["password"]):
        return error_response("Invalid email or password", 401)
    
    # cek email verification (TEMPORARY: di-skip dulu biar FE bisa development tanpa ribet)
    # nanti pas SMTP sudah jalan, uncomment ini:
    # if not user.email_verified:
    #     return error_response(
    #         "Email not verified. Please check your email and verify your account first.",
    #         403
    #     )
    
    # generate JWT tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return success_response(
        "Login successful",
        {
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    )


# --- REFRESH TOKEN ---
@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token pakai refresh token.
    Header: Authorization: Bearer <refresh_token>
    """
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    
    return success_response(
        "Token refreshed successfully",
        {"access_token": new_access_token}
    )


# --- GET CURRENT USER ---
@auth_bp.get("/me")
@jwt_required()
def get_current_user():
    """
    Get current logged-in user profile.
    Header: Authorization: Bearer <access_token>
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))  # convert back to int untuk query
    
    if not user:
        return error_response("User not found", 404)
    
    return success_response("User retrieved", user.to_dict())


# --- VERIFY EMAIL ---
@auth_bp.get("/verify-email/<token>")
def verify_email(token):
    """
    Verifikasi email via token.
    Biasanya dipanggil dari link di email.
    
    GET /api/auth/verify-email/<token>
    """
    # cari user dengan token yang cocok
    user = User.query.filter_by(email_verification_token=token).first()
    
    if not user:
        return error_response("Invalid or expired verification token", 400)
    
    # verifikasi token
    if not user.verify_email_token(token):
        return error_response("Invalid or expired verification token", 400)
    
    # aktivasi email
    user.activate_email()
    db.session.commit()
    
    return success_response("Email verified successfully. You can now login.")


# --- REQUEST PASSWORD RESET ---
@auth_bp.post("/request-password-reset")
def request_password_reset():
    """
    Request reset password (kirim email dengan reset token).
    
    Body:
    {
        "email": "john@example.com"
    }
    """
    try:
        schema = RequestPasswordResetSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return error_response("Validation failed", 400, err.messages)
    
    user = User.query.filter_by(email=data["email"]).first()
    
    # Security: jangan kasih tau kalau email gak ketemu (biar gak bisa enumerate email)
    if not user:
        return success_response(
            "If that email exists, a password reset link has been sent."
        )
    
    # generate reset token
    reset_token = user.generate_password_reset_token()
    db.session.commit()
    
    # TODO: Kirim email reset password (SMTP belum setup)
    reset_link = f"http://localhost:5000/api/auth/reset-password/{reset_token}"
    print(f"\n{'='*60}")
    print(f"PASSWORD RESET (Log Only - SMTP belum setup)")
    print(f"{'='*60}")
    print(f"To: {user.email}")
    print(f"Subject: Reset Your TicketWave Password")
    print(f"\nReset Link:")
    print(f"{reset_link}")
    print(f"\nToken expires: {user.password_reset_token_expires}")
    print(f"{'='*60}\n")
    
    return success_response(
        "If that email exists, a password reset link has been sent."
    )


# --- RESET PASSWORD ---
@auth_bp.post("/reset-password")
def reset_password():
    """
    Reset password pakai token dari email.
    
    Body:
    {
        "token": "xxx",
        "new_password": "newpassword123"
    }
    """
    try:
        schema = ResetPasswordSchema()
        data = schema.load(request.json)
    except ValidationError as err:
        return error_response("Validation failed", 400, err.messages)
    
    # cari user dengan token yang cocok
    user = User.query.filter_by(password_reset_token=data["token"]).first()
    
    if not user:
        return error_response("Invalid or expired reset token", 400)
    
    # verifikasi token
    if not user.verify_password_reset_token(data["token"]):
        return error_response("Invalid or expired reset token", 400)
    
    # reset password
    user.reset_password(data["new_password"])
    db.session.commit()
    
    return success_response("Password reset successful. You can now login with your new password.")
