"""
Model Ticket - tiket individual yang dibeli.
1 Booking bisa punya multiple Tickets (sesuai quantity).
"""

from datetime import datetime
import secrets
from app.config.extensions import db


class Ticket(db.Model):
    """
    Ticket = 1 tiket individual.
    Punya QR code unik untuk check-in.
    """
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    
    # Ticket Code & QR
    ticket_code = db.Column(db.String(50), unique=True, nullable=False, index=True)  # TKT-XXXXX
    qr_token = db.Column(db.String(100), unique=True, nullable=False, index=True)  # untuk check-in
    
    # Status
    status = db.Column(
        db.String(20), 
        nullable=False, 
        default="valid"
    )  # valid, used, cancelled
    
    # Check-in Info
    checked_in_at = db.Column(db.DateTime, nullable=True)
    checked_in_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # officer yang scan
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relasi
    booking = db.relationship("Booking", back_populates="tickets")
    checker = db.relationship("User", foreign_keys=[checked_in_by])
    
    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "ticket_code": self.ticket_code,
            "qr_token": self.qr_token,
            "status": self.status,
            "checked_in_at": self.checked_in_at.isoformat() if self.checked_in_at else None,
            "checked_in_by": self.checked_in_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    @staticmethod
    def generate_ticket_code():
        """Generate unique ticket code: TKT-XXXXX"""
        while True:
            code = f"TKT-{secrets.token_hex(4).upper()}"
            if not Ticket.query.filter_by(ticket_code=code).first():
                return code
    
    @staticmethod
    def generate_qr_token():
        """Generate unique QR token untuk check-in"""
        return secrets.token_urlsafe(32)
    
    def check_in(self, officer_user_id):
        """Mark ticket sebagai sudah di-check-in"""
        if self.status != "valid":
            raise ValueError(f"Cannot check-in ticket with status: {self.status}")
        
        if self.checked_in_at:
            raise ValueError("Ticket already checked in")
        
        self.status = "used"
        self.checked_in_at = datetime.utcnow()
        self.checked_in_by = officer_user_id
