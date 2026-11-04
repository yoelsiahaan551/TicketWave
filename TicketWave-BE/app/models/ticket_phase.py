from app.config.extensions import db


class TicketPhase(db.Model):
    """
    phase_name: early_bird | presale | normal
    discount_percent = 0 untuk phase normal.
    Harga aktif dihitung dari TicketType.base_price - discount_percent (dilakukan di service, bukan di sini).
    """
    __tablename__ = "ticket_phases"

    id = db.Column(db.Integer, primary_key=True)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey("ticket_types.id"), nullable=False)

    phase_name = db.Column(db.String(20), nullable=False)  # early_bird | presale | normal
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    discount_percent = db.Column(db.Numeric(5, 2), nullable=False, default=0)

    ticket_type = db.relationship("TicketType", back_populates="phases")

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_type_id": self.ticket_type_id,
            "phase_name": self.phase_name,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "discount_percent": float(self.discount_percent) if self.discount_percent is not None else 0,
        }
