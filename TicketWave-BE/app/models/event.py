from datetime import datetime
from app.config.extensions import db


class Event(db.Model):
    """
    event_type: single | festival
    - single  -> pakai field artist_name, event_date, event_time
    - festival -> pakai days_count, detail artis per hari ada di FestivalArtist

    status mengikuti alur:
    draft -> published -> on_sale -> sales_closed -> ongoing -> finished -> archived

    poster_url & banner_url disimpan sebagai URL Cloudinary.
    """
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    agency_id = db.Column(db.Integer, db.ForeignKey("agencies.id"), nullable=False)

    event_type = db.Column(db.String(20), nullable=False)  # single | festival
    name = db.Column(db.String(200), nullable=False)
    artist_name = db.Column(db.String(200), nullable=True)  # dipakai kalau event_type=single

    poster_url = db.Column(db.String(500), nullable=True)
    banner_url = db.Column(db.String(500), nullable=True)

    venue = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)

    event_date = db.Column(db.Date, nullable=True)   # dipakai kalau single
    event_time = db.Column(db.Time, nullable=True)    # dipakai kalau single
    days_count = db.Column(db.Integer, nullable=True)  # dipakai kalau festival

    status = db.Column(db.String(20), nullable=False, default="draft")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    agency = db.relationship("Agency", back_populates="events")
    festival_artists = db.relationship("FestivalArtist", back_populates="event", cascade="all, delete-orphan")
    ticket_types = db.relationship("TicketType", back_populates="event", cascade="all, delete-orphan")

    def to_dict(self, include_artists=False):
        data = {
            "id": self.id,
            "agency_id": self.agency_id,
            "event_type": self.event_type,
            "name": self.name,
            "artist_name": self.artist_name,
            "poster_url": self.poster_url,
            "banner_url": self.banner_url,
            "venue": self.venue,
            "city": self.city,
            "description": self.description,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "event_time": self.event_time.isoformat() if self.event_time else None,
            "days_count": self.days_count,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_artists:
            data["festival_artists"] = [fa.to_dict() for fa in self.festival_artists]
        return data
