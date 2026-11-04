from datetime import datetime
from app.config.extensions import db


class Transaction(db.Model):
    """
    Satu transaksi Midtrans bisa mencakup 1+ tiket (dipisah di TransactionTicket).
    payment_status ngikutin status dari Midtrans: pending, settlement, expire, cancel, deny, refund.
    """
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("tickets.id"), nullable=False)

    midtrans_order_id = db.Column(db.String(60), unique=True, nullable=True)
    payment_method = db.Column(db.String(30), nullable=True)  # qris | va | bank_transfer | ewallet
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    payment_status = db.Column(db.String(20), nullable=False, default="pending")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "midtrans_order_id": self.midtrans_order_id,
            "payment_method": self.payment_method,
            "amount": float(self.amount) if self.amount is not None else None,
            "payment_status": self.payment_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        }
