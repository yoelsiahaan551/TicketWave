"""
Decorators untuk authorization & role-based access control.
Dipakai bersama @jwt_required() dari flask_jwt_extended.
"""

from functools import wraps
from flask_jwt_extended import get_jwt_identity
from app.models.user import User
from app.utils.responses import error_response


def role_required(allowed_roles):
    """
    Decorator buat cek role user dari JWT token.
    
    Usage:
        @jwt_required()
        @role_required("admin")
        def admin_only_route():
            ...
        
        @jwt_required()
        @role_required(["admin", "officer"])
        def admin_or_officer_route():
            ...
    
    Args:
        allowed_roles: string ("admin") atau list (["admin", "officer"])
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # allowed_roles bisa string atau list
            roles = [allowed_roles] if isinstance(allowed_roles, str) else allowed_roles
            
            # ambil user_id dari JWT token (sudah di-set saat login)
            current_user_id = get_jwt_identity()
            
            # cari user di database (convert to int karena JWT identity adalah string)
            user = User.query.get(int(current_user_id))
            
            if not user:
                return error_response("User not found", 404)
            
            # cek apakah role user ada di allowed_roles
            if user.role not in roles:
                return error_response(
                    f"Access forbidden. Required role: {', '.join(roles)}",
                    403
                )
            
            # inject user ke kwargs biar bisa dipake di route function
            kwargs['current_user'] = user
            
            return fn(*args, **kwargs)
        
        return wrapper
    return decorator


def email_verified_required(fn):
    """
    Decorator buat cek apakah email user sudah terverifikasi.
    Dipasang setelah @jwt_required() dan @role_required().
    
    Usage:
        @jwt_required()
        @role_required("user")
        @email_verified_required
        def checkout_ticket():
            # user harus verified dulu sebelum bisa checkout
            ...
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))  # convert to int
        
        if not user:
            return error_response("User not found", 404)
        
        if not user.email_verified:
            return error_response(
                "Email verification required. Please check your email and verify your account.",
                403
            )
        
        return fn(*args, **kwargs)
    
    return wrapper
