import os
from flask import Flask
from dotenv import load_dotenv

from app.config.config import config_by_name
from app.config.extensions import db, migrate, cors, jwt, bcrypt
from app.config.cloudinary_config import init_cloudinary

load_dotenv()


def create_app(env=None):
    app = Flask(__name__, instance_relative_config=True)

    env = env or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_by_name[env])

    # --- init extensions ---
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    init_cloudinary(app)

    # --- import models (wajib sebelum migrate detect tabel) ---
    with app.app_context():
        from app import models  # noqa: F401

    # --- register blueprints ---
    register_blueprints(app)

    # --- global error handler ---
    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)

    @app.get("/health")
    def health_check():
        return {"status": "ok", "service": "TicketWave Backend"}, 200

    return app


def register_blueprints(app):
    """
    Prefix URL sengaja dibikin resource-based (bukan role-based),
    contoh: /api/agencies -- BUKAN /api/admin/agencies.
    Alasan: biar nama role (admin/officer/user) gak keliatan/ketebak dari
    struktur endpoint publik. Pengecekan siapa yang boleh akses tetap
    dilakukan di dalam kode (role_required decorator), bukan lewat penamaan URL.
    """
    from app.modules.auth.routes import auth_bp
    from app.modules.admin.agency_routes import agency_bp
    from app.modules.admin.event_routes import event_bp
    from app.modules.admin.ticket_phase_routes import ticket_phase_bp
    from app.modules.public.event_routes import public_event_bp
    from app.modules.ticket.checkout_routes import checkout_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(agency_bp, url_prefix="/api/agencies")
    app.register_blueprint(event_bp, url_prefix="/api/events")
    app.register_blueprint(ticket_phase_bp, url_prefix="/api")
    app.register_blueprint(public_event_bp, url_prefix="/api/public/events")
    app.register_blueprint(checkout_bp, url_prefix="/api/checkout")

    # blueprint lain nyusul pas modulnya udah dikerjain, pola sama (resource-based):
    # from app.modules.officer.kasir_routes import kasir_bp
    # app.register_blueprint(kasir_bp, url_prefix="/api/kasir")
    # from app.modules.officer.scan_routes import scan_bp
    # app.register_blueprint(scan_bp, url_prefix="/api/scan")
