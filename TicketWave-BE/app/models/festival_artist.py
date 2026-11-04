from app.config.extensions import db


class FestivalArtist(db.Model):
    """
    Lineup artis per hari, khusus event_type=festival.
    Contoh: day_number=1, artist_name="Hindia"
    """
    __tablename__ = "festival_artists"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)

    day_number = db.Column(db.Integer, nullable=False)
    artist_name = db.Column(db.String(150), nullable=False)

    event = db.relationship("Event", back_populates="festival_artists")

    def to_dict(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "day_number": self.day_number,
            "artist_name": self.artist_name,
        }
