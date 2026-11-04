from datetime import datetime, timedelta
import secrets
from app.config.extensions import db, bcrypt


class User(db.Model):
    """
    Role: admin | officer | user
    Password hashing pakai bcrypt.
    Email wajib & unik, phone juga unik (untuk login option).
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=True)  # unique biar bisa login pakai phone
    password_hash = db.Column(db.String(255), nullable=False)  # wajib, auth sudah jalan
    role = db.Column(db.String(20), nullable=False, default="user")  # admin | officer | user
    
    email_verified = db.Column(db.Boolean, nullable=False, default=False)  # email verification flag
    email_verification_token = db.Column(db.String(255), nullable=True)  # token untuk verifikasi email
    email_verification_token_expires = db.Column(db.DateTime, nullable=True)  # expired token
    password_reset_token = db.Column(db.String(255), nullable=True)  # token reset password
    password_reset_token_expires = db.Column(db.DateTime, nullable=True)  # expired token

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relasi: satu user (role=officer) -> satu agency
    agency = db.relationship("Agency", back_populates="officer", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "email_verified": self.email_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def set_password(self, password):
        """Hash password pakai bcrypt"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verify password dengan hash yang tersimpan"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def generate_email_verification_token(self):
        """Generate token untuk verifikasi email (expired 24 jam)"""
        self.email_verification_token = secrets.token_urlsafe(32)
        self.email_verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        return self.email_verification_token

    def verify_email_token(self, token):
        """Verifikasi token email, return True kalau valid"""
        if not self.email_verification_token or not self.email_verification_token_expires:
            return False
        if self.email_verification_token != token:
            return False
        if datetime.utcnow() > self.email_verification_token_expires:
            return False
        return True

    def activate_email(self):
        """Aktivasi email setelah verifikasi berhasil"""
        self.email_verified = True
        self.email_verification_token = None
        self.email_verification_token_expires = None

    def generate_password_reset_token(self):
        """Generate token untuk reset password (expired 1 jam)"""
        self.password_reset_token = secrets.token_urlsafe(32)
        self.password_reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        return self.password_reset_token

    def verify_password_reset_token(self, token):
        """Verifikasi token reset password, return True kalau valid"""
        if not self.password_reset_token or not self.password_reset_token_expires:
            return False
        if self.password_reset_token != token:
            return False
        if datetime.utcnow() > self.password_reset_token_expires:
            return False
        return True

    def reset_password(self, new_password):
        """Reset password & hapus token"""
        self.set_password(new_password)
        self.password_reset_token = None
        self.password_reset_token_expires = None
