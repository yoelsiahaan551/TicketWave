"""
Model Booking - transaksi pembelian tiket.
Status: pending_payment -> paid / cancelled / expired
"""

from datetime import datetime, timedelta
from app.config.extensions import db


class Booking(db.Model):
    """
    Booking = 1 transaksi pembelian tiket.
    Bisa beli multiple tickets dalam 1 booking.
    """
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    booking_code = db.Column(db.String(50), unique=True, nullable=False, index=True)  # TKTW-20261103-XXXXX
    
    # User (nullable - bisa guest checkout)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    
    # Event & Ticket Info
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey("ticket_types.id"), nullable=False)
    ticket_phase_id = db.Column(db.Integer, db.ForeignKey("ticket_phases.id"), nullable=True)  # phase aktif saat checkout
    
    # Quantity & Pricing (frozen saat checkout)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Integer, nullable=False)  # harga per tiket (sudah termasuk diskon)
    discount_percent = db.Column(db.Integer, default=0)  # diskon yang didapat
    total_price = db.Column(db.Integer, nullable=False)  # unit_price * quantity
    
    # Buyer Info
    buyer_name = db.Column(db.String(120), nullable=False)
    buyer_email = db.Column(db.String(120), nullable=False)
    buyer_phone = db.Column(db.String(20), nullable=False)
    
    # Payment Info
    payment_method = db.Column(db.String(50), nullable=True)  # gopay, ovo, bank_transfer, dll
    payment_url = db.Column(db.String(500), nullable=True)  # snap URL dari Midtrans
    
    # Status & Timestamps
    status = db.Column(
        db.String(20), 
        nullable=False, 
        default="pending_payment"
    )  # pending_payment, paid, cancelled, expired
    
    expired_at = db.Column(db.DateTime, nullable=False)  # booking expired kalau tidak bayar
    paid_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relasi
    user = db.relationship("User", backref="bookings")
    event = db.relationship("Event", backref="bookings")
    ticket_type = db.relationship("TicketType", backref="bookings")
    ticket_phase = db.relationship("TicketPhase", backref="bookings")
    tickets = db.relationship("Ticket", back_populates="booking", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "booking_code": self.booking_code,
            "user_id": self.user_id,
            "event_id": self.event_id,
            "ticket_type_id": self.ticket_type_id,
            "ticket_phase_id": self.ticket_phase_id,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "discount_percent": self.discount_percent,
            "total_price": self.total_price,
            "buyer_name": self.buyer_name,
            "buyer_email": self.buyer_email,
            "buyer_phone": self.buyer_phone,
            "payment_method": self.payment_method,
            "status": self.status,
            "expired_at": self.expired_at.isoformat() if self.expired_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    def is_expired(self):
        """Check apakah booking sudah expired"""
        return datetime.utcnow() > self.expired_at and self.status == "pending_payment"
    
    def mark_as_paid(self, payment_method=None):
        """Mark booking sebagai paid"""
        self.status = "paid"
        self.paid_at = datetime.utcnow()
        if payment_method:
            self.payment_method = payment_method
    
    def cancel(self):
        """Cancel booking & return stock"""
        if self.status != "pending_payment":
            raise ValueError("Can only cancel pending bookings")
        
        self.status = "cancelled"
        
        # Return stock
        ticket_type = self.ticket_type
        ticket_type.sold_count -= self.quantity
