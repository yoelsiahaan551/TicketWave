"""
Helper functions untuk pricing & discount logic.
"""

from datetime import date
from app.models.ticket_phase import TicketPhase
from app.models.ticket_type import TicketType


def get_active_phase(ticket_type_id, check_date=None):
    """
    Ambil phase yang aktif pada tanggal tertentu.
    
    Args:
        ticket_type_id: ID ticket type
        check_date: Tanggal pengecekan (default: hari ini)
    
    Returns:
        TicketPhase object atau None
    """
    if check_date is None:
        check_date = date.today()
    
    return TicketPhase.query.filter(
        TicketPhase.ticket_type_id == ticket_type_id,
        TicketPhase.start_date <= check_date,
        TicketPhase.end_date >= check_date
    ).first()


def calculate_final_price(ticket_type_id, check_date=None):
    """
    Hitung harga final berdasarkan phase yang aktif.
    
    Args:
        ticket_type_id: ID ticket type
        check_date: Tanggal pengecekan (default: hari ini)
    
    Returns:
        {
            "base_price": 750000,
            "active_phase": {...} atau None,
            "discount_amount": 150000,
            "final_price": 600000
        }
        atau None kalau ticket_type tidak ditemukan
    """
    ticket_type = TicketType.query.get(ticket_type_id)
    if not ticket_type:
        return None
    
    base_price = float(ticket_type.base_price)
    active_phase = get_active_phase(ticket_type_id, check_date)
    
    if active_phase and active_phase.discount_percent > 0:
        discount_amount = base_price * (float(active_phase.discount_percent) / 100)
        final_price = base_price - discount_amount
        
        return {
            "base_price": base_price,
            "active_phase": active_phase.to_dict(),
            "discount_amount": round(discount_amount, 2),
            "final_price": round(final_price, 2)
        }
    else:
        return {
            "base_price": base_price,
            "active_phase": None,
            "discount_amount": 0,
            "final_price": base_price
        }


def get_next_phase(ticket_type_id, current_date=None):
    """
    Ambil phase berikutnya setelah tanggal tertentu.
    
    Args:
        ticket_type_id: ID ticket type
        current_date: Tanggal referensi (default: hari ini)
    
    Returns:
        TicketPhase object atau None
    """
    if current_date is None:
        current_date = date.today()
    
    return TicketPhase.query.filter(
        TicketPhase.ticket_type_id == ticket_type_id,
        TicketPhase.start_date > current_date
    ).order_by(TicketPhase.start_date.asc()).first()
