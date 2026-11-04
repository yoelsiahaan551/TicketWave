"""
CRUD Kelola Ticket Phase. Fitur ini cuma boleh diakses Admin.
URL prefix resource-based.

Auth sudah dipasang: @jwt_required() + @role_required("admin").
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.config.extensions import db
from app.models.ticket_type import TicketType
from app.models.ticket_phase import TicketPhase
from app.modules.admin.ticket_phase_schema import (
    ticket_phase_create_schema,
    ticket_phase_update_schema,
)
from app.utils.responses import success_response, error_response
from app.utils.decorators import role_required

ticket_phase_bp = Blueprint("ticket_phase", __name__)


def validate_phase_overlap(ticket_type_id, start_date, end_date, exclude_phase_id=None):
    """
    Validasi apakah ada phase lain yang overlap dengan range tanggal ini.
    
    Args:
        ticket_type_id: ID ticket type
        start_date: Tanggal mulai phase baru
        end_date: Tanggal akhir phase baru
        exclude_phase_id: ID phase yang dikecualikan (untuk update)
    
    Returns:
        (is_valid, error_message)
    """
    query = TicketPhase.query.filter_by(ticket_type_id=ticket_type_id)
    
    # Kalau update, exclude phase yang sedang diedit
    if exclude_phase_id:
        query = query.filter(TicketPhase.id != exclude_phase_id)
    
    existing_phases = query.all()
    
    for phase in existing_phases:
        # Cek overlap: (StartA <= EndB) and (EndA >= StartB)
        if start_date <= phase.end_date and end_date >= phase.start_date:
            return False, f"Tanggal overlap dengan phase '{phase.phase_name}' ({phase.start_date} - {phase.end_date})"
    
    return True, None


# ---------- CREATE PHASE ----------
@ticket_phase_bp.post("/ticket-types/<int:ticket_type_id>/phases")
@jwt_required()
@role_required("admin")
def create_ticket_phase(ticket_type_id, current_user):
    """
    Tambah phase baru ke ticket type.
    Validasi: cek overlap tanggal dengan phase lain.
    """
    ticket_type = TicketType.query.get(ticket_type_id)
    if not ticket_type:
        return error_response("Ticket type tidak ditemukan", status_code=404)

    payload = request.get_json(silent=True) or {}

    try:
        data = ticket_phase_create_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    # Validasi overlap tanggal
    is_valid, error_msg = validate_phase_overlap(
        ticket_type_id,
        data["start_date"],
        data["end_date"]
    )
    if not is_valid:
        return error_response(error_msg, status_code=422)

    # Buat phase baru
    phase = TicketPhase(
        ticket_type_id=ticket_type_id,
        phase_name=data["phase_name"],
        start_date=data["start_date"],
        end_date=data["end_date"],
        discount_percent=data.get("discount_percent", 0),
    )
    db.session.add(phase)
    db.session.commit()

    return success_response(
        phase.to_dict(),
        "Phase berhasil ditambahkan",
        status_code=201
    )


# ---------- LIST PHASES ----------
@ticket_phase_bp.get("/ticket-types/<int:ticket_type_id>/phases")
@jwt_required()
@role_required("admin")
def get_ticket_phases(ticket_type_id, current_user):
    """
    List semua phases dari ticket type.
    Order by start_date ascending.
    """
    ticket_type = TicketType.query.get(ticket_type_id)
    if not ticket_type:
        return error_response("Ticket type tidak ditemukan", status_code=404)

    phases = TicketPhase.query.filter_by(
        ticket_type_id=ticket_type_id
    ).order_by(TicketPhase.start_date.asc()).all()

    return success_response({
        "ticket_type": {
            "id": ticket_type.id,
            "name": ticket_type.name,
            "base_price": float(ticket_type.base_price),
        },
        "phases": [p.to_dict() for p in phases],
        "total": len(phases),
    }, "Daftar phase berhasil diambil")


# ---------- GET PHASE DETAIL ----------
@ticket_phase_bp.get("/phases/<int:phase_id>")
@jwt_required()
@role_required("admin")
def get_phase_detail(phase_id, current_user):
    """Get detail 1 phase."""
    phase = TicketPhase.query.get(phase_id)
    if not phase:
        return error_response("Phase tidak ditemukan", status_code=404)

    return success_response(phase.to_dict(), "Detail phase berhasil diambil")


# ---------- UPDATE PHASE ----------
@ticket_phase_bp.put("/phases/<int:phase_id>")
@jwt_required()
@role_required("admin")
def update_ticket_phase(phase_id, current_user):
    """
    Update phase (partial update).
    Validasi overlap kalau tanggal diubah.
    """
    phase = TicketPhase.query.get(phase_id)
    if not phase:
        return error_response("Phase tidak ditemukan", status_code=404)

    payload = request.get_json(silent=True) or {}

    try:
        data = ticket_phase_update_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    if not data:
        return error_response("Tidak ada data yang diubah", status_code=400)

    # Tentukan start_date & end_date final (ambil dari data kalau ada, atau pakai yang lama)
    new_start = data.get("start_date", phase.start_date)
    new_end = data.get("end_date", phase.end_date)

    # Validasi overlap (exclude phase yang sedang diedit)
    is_valid, error_msg = validate_phase_overlap(
        phase.ticket_type_id,
        new_start,
        new_end,
        exclude_phase_id=phase_id
    )
    if not is_valid:
        return error_response(error_msg, status_code=422)

    # Update fields
    for field, value in data.items():
        setattr(phase, field, value)

    db.session.commit()

    return success_response(phase.to_dict(), "Phase berhasil diperbarui")


# ---------- DELETE PHASE ----------
@ticket_phase_bp.delete("/phases/<int:phase_id>")
@jwt_required()
@role_required("admin")
def delete_ticket_phase(phase_id, current_user):
    """Hapus phase."""
    phase = TicketPhase.query.get(phase_id)
    if not phase:
        return error_response("Phase tidak ditemukan", status_code=404)

    db.session.delete(phase)
    db.session.commit()

    return success_response(None, "Phase berhasil dihapus")
