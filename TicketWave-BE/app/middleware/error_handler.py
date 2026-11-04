from werkzeug.exceptions import HTTPException
from app.utils.responses import error_response


def register_error_handlers(app):

    @app.errorhandler(404)
    def not_found(e):
        return error_response("Resource tidak ditemukan", status_code=404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("Method tidak diizinkan", status_code=405)

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return error_response(e.description, status_code=e.code)

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        app.logger.exception(e)
        return error_response("Terjadi kesalahan pada server", status_code=500)
