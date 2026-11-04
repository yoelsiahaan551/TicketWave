from datetime import datetime
from app.config.extensions import db


class Agency(db.Model):
    """
    Satu agency hanya punya 1 akun Petugas (officer_id -> users.id, role=officer).
    officer_id nullable karena saat agency baru dicatat Admin, akun Petugas
    belum tentu langsung dibuat (baru dibuat otomatis pas event pertama di-publish).
    """
    __tablename__ = "agencies"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    pic_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=True)
    logo_url = db.Column(db.String(500), nullable=True)  # Cloudinary URL

    officer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, unique=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    officer = db.relationship("User", back_populates="agency")
    events = db.relationship("Event", back_populates="agency", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "pic_name": self.pic_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "logo_url": self.logo_url,
            "has_officer_account": self.officer_id is not None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
