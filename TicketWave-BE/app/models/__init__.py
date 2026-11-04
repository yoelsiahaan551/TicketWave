"""
Import semua model di sini supaya Flask-Migrate bisa detect seluruh tabel
saat `flask db migrate` dijalankan.
"""

from app.models.user import User
from app.models.agency import Agency
from app.models.event import Event
from app.models.festival_artist import FestivalArtist
from app.models.ticket_type import TicketType
from app.models.ticket_phase import TicketPhase
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.models.transaction import Transaction

__all__ = [
    "User",
    "Agency",
    "Event",
    "FestivalArtist",
    "TicketType",
    "TicketPhase",
    "Booking",
    "Ticket",
    "Transaction",
]
