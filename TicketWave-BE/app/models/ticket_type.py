from app.config.extensions import db


class TicketType(db.Model):
    """
    Kategori tiket dalam satu event, misalnya: VIP, Regular, Festival Pass.
    base_price = harga normal sebelum kena fase (Early Bird/Presale/Normal).
    quota dipakai bareng buat online & offline (stok sama, sesuai dokumentasi).
    """
    __tablename__ = "ticket_types"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)

    name = db.Column(db.String(100), nullable=False)
    base_price = db.Column(db.Numeric(12, 2), nullable=False)
    quota = db.Column(db.Integer, nullable=False)
    sold_count = db.Column(db.Integer, nullable=False, default=0)
    description = db.Column(db.Text, nullable=True)

    event = db.relationship("Event", back_populates="ticket_types")
    phases = db.relationship("TicketPhase", back_populates="ticket_type", cascade="all, delete-orphan")

    def to_dict(self, include_phases=False):
        data = {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "base_price": float(self.base_price) if self.base_price is not None else None,
            "quota": self.quota,
            "sold_count": self.sold_count,
            "remaining": self.quota - self.sold_count,
            "description": self.description,
        }
        if include_phases:
            data["phases"] = [ph.to_dict() for ph in self.phases]
        return data
