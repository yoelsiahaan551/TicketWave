"""
Marshmallow schema untuk validasi input di modul auth.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError


class RegisterSchema(Schema):
    """Schema untuk register user baru"""
    name = fields.String(
        required=True,
        validate=validate.Length(min=2, max=120),
        error_messages={"required": "Name is required"}
    )
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required", "invalid": "Invalid email format"}
    )
    phone = fields.String(
        required=True,
        validate=validate.Length(min=10, max=20),
        error_messages={"required": "Phone number is required"}
    )
    password = fields.String(
        required=True,
        validate=validate.Length(min=8),
        error_messages={
            "required": "Password is required",
            "invalid": "Password must be at least 8 characters"
        }
    )
    
    @validates("phone")
    def validate_phone(self, value, **kwargs):
        """Validasi format phone number (harus angka)"""
        if not value.replace("+", "").replace("-", "").replace(" ", "").isdigit():
            raise ValidationError("Phone number must contain only numbers")


class LoginSchema(Schema):
    """Schema untuk login"""
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required", "invalid": "Invalid email format"}
    )
    password = fields.String(
        required=True,
        error_messages={"required": "Password is required"}
    )


class RefreshTokenSchema(Schema):
    """Schema untuk refresh token (optional, kalau mau validasi refresh token di body)"""
    pass  # refresh token biasanya di-handle otomatis oleh @jwt_required(refresh=True)


class VerifyEmailSchema(Schema):
    """Schema untuk verify email via token"""
    token = fields.String(
        required=True,
        error_messages={"required": "Verification token is required"}
    )


class RequestPasswordResetSchema(Schema):
    """Schema untuk request reset password"""
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required", "invalid": "Invalid email format"}
    )


class ResetPasswordSchema(Schema):
    """Schema untuk reset password"""
    token = fields.String(
        required=True,
        error_messages={"required": "Reset token is required"}
    )
    new_password = fields.String(
        required=True,
        validate=validate.Length(min=8),
        error_messages={
            "required": "New password is required",
            "invalid": "Password must be at least 8 characters"
        }
    )
