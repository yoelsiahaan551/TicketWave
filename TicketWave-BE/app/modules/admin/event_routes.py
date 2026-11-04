"""
CRUD Kelola Event. Fitur ini cuma boleh diakses Admin.
URL prefix resource-based ("/api/events"), bukan role-based.

Auth sudah dipasang: @jwt_required() + @role_required("admin").
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.config.extensions import db
from app.models.event import Event
from app.models.agency import Agency
from app.models.festival_artist import FestivalArtist
from app.models.ticket_type import TicketType
from app.models.ticket_phase import TicketPhase
from app.modules.admin.event_schema import (
    event_create_schema,
    event_update_schema,
    event_status_schema,
)
from app.utils.responses import success_response, error_response
from app.utils.upload_service import upload_image, delete_image, UploadError
from app.utils.decorators import role_required

event_bp = Blueprint("event", __name__)


# ---------- CREATE EVENT ----------
@event_bp.post("")
@jwt_required()
@role_required("admin")
def create_event(current_user):
    """
    Buat event baru (single atau festival).
    Support nested create: ticket_types + phases sekaligus (opsional).
    """
    payload = request.get_json(silent=True) or {}

    try:
        data = event_create_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    # Cek agency exist
    agency = Agency.query.get(data["agency_id"])
    if not agency:
        return error_response("Agency tidak ditemukan", status_code=404)

    # Buat event
    event = Event(
        agency_id=data["agency_id"],
        event_type=data["event_type"],
        name=data["name"],
        venue=data["venue"],
        city=data["city"],
        description=data.get("description"),
        status="draft",
    )

    # Field khusus single event
    if data["event_type"] == "single":
        event.artist_name = data["artist_name"]
        event.event_date = data["event_date"]
        event.event_time = data["event_time"]

    # Field khusus festival
    if data["event_type"] == "festival":
        event.days_count = data["days_count"]

    db.session.add(event)
    db.session.flush()  # dapetin event.id sebelum commit

    # Tambah festival artists kalau ada
    if data["event_type"] == "festival" and data.get("festival_artists"):
        for artist_data in data["festival_artists"]:
            artist = FestivalArtist(
                event_id=event.id,
                day_number=artist_data["day_number"],
                artist_name=artist_data["artist_name"],
            )
            db.session.add(artist)

    # Tambah ticket types + phases kalau ada (nested create)
    if data.get("ticket_types"):
        for tt_data in data["ticket_types"]:
            ticket_type = TicketType(
                event_id=event.id,
                name=tt_data["name"],
                base_price=tt_data["base_price"],
                quota=tt_data["quota"],
                description=tt_data.get("description"),
            )
            db.session.add(ticket_type)
            db.session.flush()  # dapetin ticket_type.id

            # Tambah phases kalau ada
            if tt_data.get("phases"):
                for phase_data in tt_data["phases"]:
                    phase = TicketPhase(
                        ticket_type_id=ticket_type.id,
                        phase_name=phase_data["phase_name"],
                        start_date=phase_data["start_date"],
                        end_date=phase_data["end_date"],
                        discount_percent=phase_data.get("discount_percent", 0),
                    )
                    db.session.add(phase)

    db.session.commit()

    return success_response(
        event.to_dict(include_artists=True),
        "Event berhasil dibuat",
        status_code=201
    )


# ---------- READ (list events with filters) ----------
@event_bp.get("")
@jwt_required()
@role_required("admin")
def get_events(current_user):
    """
    List event dengan filter:
    - agency_id: filter by agency
    - status: filter by status
    - event_type: filter by single/festival
    - city: filter by city
    - search: cari di name atau artist_name
    """
    agency_id = request.args.get("agency_id", type=int)
    status = request.args.get("status")
    event_type = request.args.get("event_type")
    city = request.args.get("city")
    search = request.args.get("search", "").strip()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    query = Event.query.order_by(Event.created_at.desc())

    if agency_id:
        query = query.filter_by(agency_id=agency_id)
    if status:
        query = query.filter_by(status=status)
    if event_type:
        query = query.filter_by(event_type=event_type)
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(
            db.or_(
                Event.name.ilike(f"%{search}%"),
                Event.artist_name.ilike(f"%{search}%")
            )
        )

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        "items": [e.to_dict() for e in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total_items": pagination.total,
        "total_pages": pagination.pages,
    }, "Daftar event berhasil diambil")


# ---------- READ (detail) ----------
@event_bp.get("/<int:event_id>")
@jwt_required()
@role_required("admin")
def get_event_detail(event_id, current_user):
    """
    Detail event lengkap dengan:
    - festival_artists (kalau festival)
    - ticket_types + phases
    - info agency
    """
    event = Event.query.get(event_id)
    if not event:
        return error_response("Event tidak ditemukan", status_code=404)

    data = event.to_dict(include_artists=True)

    # Tambah info agency
    data["agency"] = event.agency.to_dict() if event.agency else None

    # Tambah ticket types + phases
    data["ticket_types"] = [tt.to_dict(include_phases=True) for tt in event.ticket_types]

    return success_response(data, "Detail event berhasil diambil")


# ---------- UPDATE EVENT ----------
@event_bp.put("/<int:event_id>")
@jwt_required()
@role_required("admin")
def update_event(event_id, current_user):
    """
    Update info event (partial update).
    Gak bisa ubah event_type setelah dibuat.
    """
    event = Event.query.get(event_id)
    if not event:
        return error_response("Event tidak ditemukan", status_code=404)

    payload = request.get_json(silent=True) or {}

    try:
        data = event_update_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    if not data:
        return error_response("Tidak ada data yang diubah", status_code=400)

    # Update field yang ada
    for field, value in data.items():
        setattr(event, field, value)

    db.session.commit()

    return success_response(event.to_dict(include_artists=True), "Event berhasil diperbarui")


# ---------- UPLOAD POSTER ----------
@event_bp.post("/<int:event_id>/poster")
@jwt_required()
@role_required("admin")
def upload_event_poster(event_id, current_user):
    """Upload poster event ke Cloudinary."""
    event = Event.query.get(event_id)
    if not event:
        return error_response("Event tidak ditemukan", status_code=404)

    file = request.files.get("poster")

    try:
        result = upload_image(file, folder="ticketwave/events/poster")
    except UploadError as err:
        return error_response(str(err), status_code=422)

    # Hapus poster lama kalau ada
    if event.poster_url:
        try:
            delete_image(event.poster_url)
        except:
            pass  # ignore error kalau gagal hapus

    event.poster_url = result["url"]
    db.session.commit()

    return success_response(event.to_dict(), "Poster event berhasil diupload")


# ---------- UPLOAD BANNER ----------
@event_bp.post("/<int:event_id>/banner")
@jwt_required()
@role_required("admin")
def upload_event_banner(event_id, current_user):
    """Upload banner event ke Cloudinary."""
    event = Event.query.get(event_id)
    if not event:
        return error_response("Event tidak ditemukan", status_code=404)

    file = request.files.get("banner")

    try:
        result = upload_image(file, folder="ticketwave/events/banner")
    except UploadError as err:
        return error_response(str(err), status_code=422)

    # Hapus banner lama kalau ada
    if event.banner_url:
        try:
            delete_image(event.banner_url)
        except:
            pass

    event.banner_url = result["url"]
    db.session.commit()

    return success_response(event.to_dict(), "Banner event berhasil diupload")


# ---------- UPDATE STATUS EVENT ----------
@event_bp.patch("/<int:event_id>/status")
@jwt_required()
@role_required("admin")
def update_event_status(event_id, current_user):
    """
    Transisi status event.
    Flow: draft -> published -> on_sale -> sales_closed -> ongoing -> finished -> archived
    """
    event = Event.query.get(event_id)
    if not event:
        return error_response("Event tidak ditemukan", status_code=404)

    payload = request.get_json(silent=True) or {}

    try:
        data = event_status_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    new_status = data["status"]

    # Validasi transisi status (opsional - bisa lebih strict kalau perlu)
    # Untuk sekarang allow semua transisi

    event.status = new_status
    db.session.commit()

    return success_response(event.to_dict(), f"Status event berhasil diubah jadi {new_status}")


# ---------- DELETE EVENT ----------
@event_bp.delete("/<int:event_id>")
@jwt_required()
@role_required("admin")
def delete_event(event_id, current_user):
    """
    Hapus event.
    Validasi: gak boleh hapus kalau sudah ada tiket terjual (sold_count > 0).
    """
    event = Event.query.get(event_id)
    if not event:
        return error_response("Event tidak ditemukan", status_code=404)

    # Cek apakah sudah ada tiket terjual
    for ticket_type in event.ticket_types:
        if ticket_type.sold_count > 0:
            return error_response(
                "Event tidak bisa dihapus karena sudah ada tiket terjual",
                status_code=409
            )

    db.session.delete(event)
    db.session.commit()

    return success_response(None, "Event berhasil dihapus")
