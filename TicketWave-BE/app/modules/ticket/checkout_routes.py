"""
Checkout Routes - Endpoint untuk booking & payment tiket.

URL: /api/checkout
"""

from flask import Blueprint, request
from datetime import datetime, timedelta
import secrets

from app.config.extensions import db
from app.models.event import Event
from app.models.ticket_type import TicketType
from app.models.ticket_phase import TicketPhase
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.utils.responses import success_response, error_response
from app.utils.pricing import get_active_phase, calculate_final_price
from app.modules.ticket.schema import CheckoutSchema, BookingDetailSchema

checkout_bp = Blueprint("checkout", __name__)


def generate_booking_code():
    """Generate unique booking code: TKTW-YYYYMMDD-XXXXX"""
    date_str = datetime.utcnow().strftime("%Y%m%d")
    
    while True:
        random_str = secrets.token_hex(3).upper()  # 6 karakter hex
        code = f"TKTW-{date_str}-{random_str}"
        
        # Check uniqueness
        if not Booking.query.filter_by(booking_code=code).first():
            return code


# ---------- CHECKOUT ENDPOINT ----------
@checkout_bp.post("")
def create_checkout():
    """
    Buat booking baru (checkout).
    
    Flow:
    1. Validasi input
    2. Check stock availability
    3. Hitung harga (dengan diskon aktif)
    4. Create booking (status: pending_payment)
    5. Reserve stock (increment ticket_type.sold)
    6. Create individual tickets
    7. Return booking info + payment URL (nanti integrate Midtrans)
    
    Untuk sementara payment URL masih dummy, nanti akan integrate Midtrans Snap.
    """
    schema = CheckoutSchema()
    errors = schema.validate(request.json)
    
    if errors:
        return error_response(errors, 400)
    
    data = request.json
    
    # Get data
    event = Event.query.get(data["event_id"])
    ticket_type = TicketType.query.get(data["ticket_type_id"])
    quantity = data["quantity"]
    
    # Validasi
    if not event:
        return error_response("Event not found", 404)
    
    if event.status != "on_sale":
        return error_response("Event is not available for sale", 400)
    
    if not ticket_type:
        return error_response("Ticket type not found", 404)
    
    if ticket_type.event_id != event.id:
        return error_response("Ticket type does not belong to this event", 400)
    
    # Check stock
    available_stock = ticket_type.quota - ticket_type.sold_count
    
    if available_stock < quantity:
        return error_response(f"Not enough stock. Available: {available_stock}", 400)
    
    # Get active phase & calculate price
    active_phase = get_active_phase(ticket_type.id)
    
    if active_phase:
        unit_price = int(calculate_final_price(float(ticket_type.base_price), active_phase.discount_percent))
        discount_percent = active_phase.discount_percent
        ticket_phase_id = active_phase.id
    else:
        unit_price = int(ticket_type.base_price)
        discount_percent = 0
        ticket_phase_id = None
    
    total_price = unit_price * quantity
    
    # Create booking
    booking = Booking(
        booking_code=generate_booking_code(),
        user_id=None,  # TODO: set user_id if logged in (from JWT)
        event_id=event.id,
        ticket_type_id=ticket_type.id,
        ticket_phase_id=ticket_phase_id,
        quantity=quantity,
        unit_price=unit_price,
        discount_percent=discount_percent,
        total_price=total_price,
        buyer_name=data["buyer_name"],
        buyer_email=data["buyer_email"],
        buyer_phone=data["buyer_phone"],
        status="pending_payment",
        expired_at=datetime.utcnow() + timedelta(minutes=15),  # 15 menit untuk bayar
    )
    
    db.session.add(booking)
    
    # Reserve stock
    ticket_type.sold_count += quantity
    
    # Create individual tickets
    tickets = []
    for _ in range(quantity):
        ticket = Ticket(
            booking=booking,
            ticket_code=Ticket.generate_ticket_code(),
            qr_token=Ticket.generate_qr_token(),
            status="valid"
        )
        tickets.append(ticket)
        db.session.add(ticket)
    
    # TODO: Generate Midtrans Snap payment URL
    # Untuk sementara pakai dummy URL
    booking.payment_url = f"https://app.midtrans.com/snap/v2/vtweb/{booking.booking_code}"
    
    db.session.commit()
    
    return success_response(
        {
            "booking": booking.to_dict(),
            "payment_url": booking.payment_url,
            "expired_at": booking.expired_at.isoformat(),
            "tickets_preview": [t.to_dict() for t in tickets[:3]],  # preview 3 tiket pertama
            "total_tickets": len(tickets)
        },
        "Booking created successfully. Please complete payment within 15 minutes.",
        201
    )


# ---------- GET BOOKING DETAIL ----------
@checkout_bp.get("/<booking_code>")
def get_booking_detail(booking_code):
    """
    Get booking detail by booking code.
    Bisa dicek tanpa auth (pakai booking code aja).
    """
    booking = Booking.query.filter_by(booking_code=booking_code).first()
    
    if not booking:
        return error_response("Booking not found", 404)
    
    # Check if expired
    if booking.is_expired():
        booking.status = "expired"
        
        # Return stock
        ticket_type = booking.ticket_type
        ticket_type.sold_count -= booking.quantity
        
        db.session.commit()
    
    # Get related data
    event = Event.query.get(booking.event_id)
    ticket_type = TicketType.query.get(booking.ticket_type_id)
    tickets = Ticket.query.filter_by(booking_id=booking.id).all()
    
    return success_response(
        {
            "booking": booking.to_dict(),
            "event": event.to_dict(),
            "ticket_type": ticket_type.to_dict(),
            "tickets": [t.to_dict() for t in tickets]
        },
        "Booking detail retrieved successfully"
    )


# ---------- CANCEL BOOKING ----------
@checkout_bp.post("/<booking_code>/cancel")
def cancel_booking(booking_code):
    """
    Cancel booking (hanya bisa kalau status masih pending_payment).
    Stock akan dikembalikan.
    """
    booking = Booking.query.filter_by(booking_code=booking_code).first()
    
    if not booking:
        return error_response("Booking not found", 404)
    
    if booking.status != "pending_payment":
        return error_response(f"Cannot cancel booking with status: {booking.status}", 400)
    
    try:
        booking.cancel()
        db.session.commit()
        
        return success_response(
            {"booking": booking.to_dict()},
            "Booking cancelled successfully"
        )
    except ValueError as e:
        return error_response(str(e), 400)


# ---------- MIDTRANS PAYMENT NOTIFICATION (WEBHOOK) ----------
@checkout_bp.post("/payment/notification")
def payment_notification():
    """
    Webhook dari Midtrans untuk update status payment.
    
    TODO: Implement proper Midtrans signature verification.
    Docs: https://docs.midtrans.com/en/after-payment/http-notification
    
    Status mapping:
    - settlement -> paid
    - pending -> pending_payment
    - expire -> expired
    - cancel / deny -> cancelled
    """
    data = request.json
    
    # TODO: Verify Midtrans signature
    
    order_id = data.get("order_id")  # ini sama dengan booking_code
    transaction_status = data.get("transaction_status")
    payment_type = data.get("payment_type")
    
    booking = Booking.query.filter_by(booking_code=order_id).first()
    
    if not booking:
        return error_response("Booking not found", 404)
    
    # Update booking status based on Midtrans status
    if transaction_status == "settlement":
        booking.mark_as_paid(payment_method=payment_type)
        
        # TODO: Send e-ticket email ke buyer_email
        
    elif transaction_status in ["expire", "cancel", "deny"]:
        if booking.status == "pending_payment":
            booking.cancel()
    
    db.session.commit()
    
    return success_response(
        {"booking_code": booking.booking_code, "status": booking.status},
        "Payment notification processed"
    )
