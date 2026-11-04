"""
Konfigurasi environment. Nilai diambil dari .env lewat python-dotenv.
"""

import os
from datetime import timedelta

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    
    # JWT Token Expiration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=2)  # access token 2 hari
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # refresh token 30 hari

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- Cloudinary ---
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

    # --- Midtrans ---
    MIDTRANS_SERVER_KEY = os.getenv("MIDTRANS_SERVER_KEY")
    MIDTRANS_CLIENT_KEY = os.getenv("MIDTRANS_CLIENT_KEY")
    MIDTRANS_IS_PRODUCTION = os.getenv("MIDTRANS_IS_PRODUCTION", "False") == "True"
    
    # --- SMTP (untuk email verification, belum disetup) ---
    # SMTP_HOST = os.getenv("SMTP_HOST")
    # SMTP_PORT = os.getenv("SMTP_PORT", 587)
    # SMTP_EMAIL = os.getenv("SMTP_EMAIL")
    # SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    # SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "True") == "True"


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    # Default pakai SQLite lokal biar CRUD bisa langsung dites tanpa setup Supabase dulu.
    # Kalau DATABASE_URL sudah diisi di .env (connection string Supabase), itu yang dipakai.
    # os.getenv("DATABASE_URL") or None -> penting, karena kalau di .env ditulis
    # "DATABASE_URL=" (kosong), getenv balikin string kosong "" (bukan None),
    # dan fallback default gak akan kepake kalau cuma pakai getenv biasa.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or (
        f"sqlite:///{os.path.join(basedir, 'instance', 'dev.db')}"
    )


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
