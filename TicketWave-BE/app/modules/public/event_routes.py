"""
Public Event Routes - Endpoint publik untuk browsing event.
Tidak perlu auth, siapa aja bisa akses.

URL: /api/public/events
"""

from flask import Blueprint, request
from datetime import datetime

from app.config.extensions import db
from app.models.event import Event
from app.models.agency import Agency
from app.models.ticket_type import TicketType
from app.models.ticket_phase import TicketPhase
from app.models.festival_artist import FestivalArtist
from app.utils.responses import success_response, error_response
from app.utils.pricing import get_active_phase, calculate_final_price

public_event_bp = Blueprint("public_event", __name__)


# ---------- LIST EVENTS (PUBLIC) ----------
@public_event_bp.get("")
def list_public_events():
    """
    List event yang statusnya on_sale (bisa dibeli).
    
    Query params:
    - city: filter by city
    - event_type: filter by single/festival
    - search: cari di name atau artist_name
    - date_from: filter event_date >= date_from (format: YYYY-MM-DD)
    - date_to: filter event_date <= date_to
    - page: pagination (default 1)
    - per_page: items per page (default 12)
    """
    # Filters
    city = request.args.get("city", "").strip()
    event_type = request.args.get("event_type", "").strip()
    search = request.args.get("search", "").strip()
    date_from = request.args.get("date_from", "").strip()
    date_to = request.args.get("date_to", "").strip()
    
    # Pagination
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    
    # Base query: hanya event yang on_sale
    query = Event.query.filter_by(status="on_sale").order_by(Event.event_date.asc())
    
    # Apply filters
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))
    
    if event_type and event_type in ["single", "festival"]:
        query = query.filter_by(event_type=event_type)
    
    if search:
        # Search di name atau artist_name
        query = query.filter(
            db.or_(
                Event.name.ilike(f"%{search}%"),
                Event.artist_name.ilike(f"%{search}%")
            )
        )
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, "%Y-%m-%d").date()
            query = query.filter(Event.event_date >= date_from_obj)
        except ValueError:
            return error_response("Invalid date_from format. Use YYYY-MM-DD", 400)
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, "%Y-%m-%d").date()
            query = query.filter(Event.event_date <= date_to_obj)
        except ValueError:
            return error_response("Invalid date_to format. Use YYYY-MM-DD", 400)
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format response
    items = []
    for event in pagination.items:
        # Get cheapest ticket untuk display harga mulai dari
        cheapest_ticket = TicketType.query.filter_by(event_id=event.id).order_by(TicketType.base_price.asc()).first()
        
        price_from = None
        if cheapest_ticket:
            active_phase = get_active_phase(cheapest_ticket.id)
            if active_phase:
                price_from = calculate_final_price(float(cheapest_ticket.base_price), active_phase.discount_percent)
            else:
                price_from = float(cheapest_ticket.base_price)
        
        items.append({
            **event.to_dict(),
            "price_from": price_from  # harga termurah untuk display "Mulai dari Rp xxx"
        })
    
    return success_response(
        {
            "items": items,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
        },
        "Event list retrieved successfully"
    )


# ---------- EVENT DETAIL (PUBLIC) ----------
@public_event_bp.get("/<int:event_id>")
def get_public_event_detail(event_id):
    """
    Detail event beserta ticket types & harga aktif.
    Return semua info yang dibutuhkan untuk halaman detail event.
    """
    event = Event.query.get(event_id)
    
    if not event:
        return error_response("Event not found", 404)
    
    # Hanya show event yang on_sale
    if event.status != "on_sale":
        return error_response("Event is not available for sale", 403)
    
    # Get agency info
    agency = Agency.query.get(event.agency_id) if event.agency_id else None
    
    # Get festival lineup kalau event_type = festival
    lineup = []
    if event.event_type == "festival":
        festival_artists = FestivalArtist.query.filter_by(event_id=event.id).order_by(FestivalArtist.day.asc()).all()
        lineup = [fa.to_dict() for fa in festival_artists]
    
    # Get ticket types dengan harga aktif
    ticket_types = TicketType.query.filter_by(event_id=event.id).order_by(TicketType.base_price.asc()).all()
    
    ticket_types_data = []
    for tt in ticket_types:
        active_phase = get_active_phase(tt.id)
        
        if active_phase:
            final_price = calculate_final_price(float(tt.base_price), active_phase.discount_percent)
            phase_info = {
                "phase_name": active_phase.phase_name,
                "discount_percent": active_phase.discount_percent,
                "end_date": active_phase.end_date.isoformat() if active_phase.end_date else None
            }
        else:
            # Tidak ada phase aktif (semua phase sudah lewat atau belum mulai)
            final_price = float(tt.base_price)
            phase_info = None
        
        ticket_types_data.append({
            **tt.to_dict(),
            "active_phase": phase_info,
            "final_price": final_price,
            "stock_available": tt.quota - tt.sold_count  # stock tersisa
        })
    
    return success_response(
        {
            "event": event.to_dict(),
            "agency": agency.to_dict() if agency else None,
            "lineup": lineup,  # kosong kalau single event
            "ticket_types": ticket_types_data
        },
        "Event detail retrieved successfully"
    )


# ---------- GET AVAILABLE CITIES (HELPER) ----------
@public_event_bp.get("/cities")
def get_available_cities():
    """
    List semua kota yang punya event on_sale.
    Untuk dropdown filter di frontend.
    """
    cities = db.session.query(Event.city).filter_by(status="on_sale").distinct().order_by(Event.city.asc()).all()
    
    city_list = [city[0] for city in cities if city[0]]  # exclude None
    
    return success_response(
        {"cities": city_list},
        "Available cities retrieved successfully"
    )
