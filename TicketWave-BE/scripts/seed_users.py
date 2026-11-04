"""
Seed script untuk generate dummy users (admin, officer, user).
Jalankan dengan: python scripts/seed_users.py
"""

import sys
import os

# Tambah parent directory ke sys.path biar bisa import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.config.extensions import db
from app.models.user import User

def seed_users():
    app = create_app()
    
    with app.app_context():
        print("Seeding users...")
        
        # Cek apakah sudah ada users
        existing_users = User.query.all()
        if len(existing_users) >= 3:
            print(f"[!] Users already exist ({len(existing_users)} users). Skipping seed.")
            return
        
        # 1. Admin user
        admin = User.query.filter_by(email="admin@ticketwave.com").first()
        if not admin:
            admin = User(
                name="Admin TicketWave",
                email="admin@ticketwave.com",
                phone="081999000001",
                role="admin",
                email_verified=True  # admin langsung verified
            )
            admin.set_password("admin123")
            db.session.add(admin)
            print("[+] Admin user created: admin@ticketwave.com / admin123")
        else:
            print("[!] Admin user already exists")
        
        # 2. Officer user
        officer = User.query.filter_by(email="officer@ticketwave.com").first()
        if not officer:
            officer = User(
                name="Officer Test",
                email="officer@ticketwave.com",
                phone="081999000002",
                role="officer",
                email_verified=True  # officer langsung verified
            )
            officer.set_password("officer123")
            db.session.add(officer)
            print("[+] Officer user created: officer@ticketwave.com / officer123")
        else:
            print("[!] Officer user already exists")
        
        # 3. Regular user
        user = User.query.filter_by(email="user@example.com").first()
        if not user:
            user = User(
                name="Regular User",
                email="user@example.com",
                phone="081999000003",
                role="user",
                email_verified=True  # user langsung verified (biar bisa langsung test)
            )
            user.set_password("user123")
            db.session.add(user)
            print("[+] Regular user created: user@example.com / user123")
        else:
            print("[!] Regular user already exists")
        
        db.session.commit()
        print("\n[SUCCESS] Seeding complete!")
        print("\nLogin credentials:")
        print("  Admin:   admin@ticketwave.com / admin123")
        print("  Officer: officer@ticketwave.com / officer123")
        print("  User:    user@example.com / user123")

if __name__ == "__main__":
    seed_users()
