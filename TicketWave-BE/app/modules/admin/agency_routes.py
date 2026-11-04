"""
CRUD Kelola Agensi. Fitur ini cuma boleh diakses Admin.
URL prefix resource-based ("/api/agencies"), bukan role-based ("/api/admin/agencies"),
biar nama role gak keliatan dari luar.

Auth sudah dipasang: @jwt_required() + @role_required("admin").
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.config.extensions import db
from app.models.agency import Agency
from app.modules.admin.schema import agency_create_schema, agency_update_schema
from app.utils.responses import success_response, error_response
from app.utils.upload_service import upload_image, delete_image, UploadError
from app.utils.decorators import role_required

agency_bp = Blueprint("agency", __name__)


# ---------- CREATE ----------
@agency_bp.post("")
@jwt_required()
@role_required("admin")
def create_agency(current_user):
    payload = request.get_json(silent=True) or {}

    try:
        data = agency_create_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    if Agency.query.filter_by(email=data["email"]).first():
        return error_response("Email agensi sudah terdaftar", status_code=409)

    agency = Agency(
        name=data["name"],
        pic_name=data["pic_name"],
        email=data["email"],
        phone=data["phone"],
        address=data.get("address"),
    )
    db.session.add(agency)
    db.session.commit()

    return success_response(agency.to_dict(), "Agensi berhasil ditambahkan", status_code=201)


# ---------- READ (list, with simple search + pagination) ----------
@agency_bp.get("")
@jwt_required()
@role_required("admin")
def get_agencies(current_user):
    search = request.args.get("search", "").strip()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    query = Agency.query.order_by(Agency.created_at.desc())
    if search:
        query = query.filter(Agency.name.ilike(f"%{search}%"))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        "items": [a.to_dict() for a in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total_items": pagination.total,
        "total_pages": pagination.pages,
    }, "Daftar agensi berhasil diambil")


# ---------- READ (detail) ----------
@agency_bp.get("/<int:agency_id>")
@jwt_required()
@role_required("admin")
def get_agency_detail(agency_id, current_user):
    agency = Agency.query.get(agency_id)
    if not agency:
        return error_response("Agensi tidak ditemukan", status_code=404)

    return success_response(agency.to_dict(), "Detail agensi berhasil diambil")


# ---------- UPDATE ----------
@agency_bp.put("/<int:agency_id>")
@jwt_required()
@role_required("admin")
def update_agency(agency_id, current_user):
    agency = Agency.query.get(agency_id)
    if not agency:
        return error_response("Agensi tidak ditemukan", status_code=404)

    payload = request.get_json(silent=True) or {}

    try:
        data = agency_update_schema.load(payload)
    except ValidationError as err:
        return error_response("Data tidak valid", errors=err.messages, status_code=422)

    if not data:
        return error_response("Tidak ada data yang diubah", status_code=400)

    if "email" in data and data["email"] != agency.email:
        if Agency.query.filter_by(email=data["email"]).first():
            return error_response("Email agensi sudah terdaftar", status_code=409)

    for field, value in data.items():
        setattr(agency, field, value)

    db.session.commit()

    return success_response(agency.to_dict(), "Agensi berhasil diperbarui")


# ---------- UPLOAD LOGO (Cloudinary) ----------
@agency_bp.post("/<int:agency_id>/logo")
@jwt_required()
@role_required("admin")
def upload_agency_logo(agency_id, current_user):
    agency = Agency.query.get(agency_id)
    if not agency:
        return error_response("Agensi tidak ditemukan", status_code=404)

    file = request.files.get("logo")

    try:
        result = upload_image(file, folder="ticketwave/agencies/logo")
    except UploadError as err:
        return error_response(str(err), status_code=422)

    agency.logo_url = result["url"]
    db.session.commit()

    return success_response(agency.to_dict(), "Logo agensi berhasil diupload")


# ---------- DELETE ----------
@agency_bp.delete("/<int:agency_id>")
@jwt_required()
@role_required("admin")
def delete_agency(agency_id, current_user):
    agency = Agency.query.get(agency_id)
    if not agency:
        return error_response("Agensi tidak ditemukan", status_code=404)

    if agency.events:
        return error_response(
            "Agensi tidak bisa dihapus karena masih punya event terkait",
            status_code=409,
        )

    db.session.delete(agency)
    db.session.commit()

    return success_response(None, "Agensi berhasil dihapus")
