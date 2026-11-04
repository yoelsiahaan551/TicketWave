"""
Helper buat bentuk response JSON yang konsisten di semua endpoint.
Format standar:
{
  "success": true/false,
  "message": "...",
  "data": {...} / [...] / null,
  "errors": {...} / null
}
"""

from flask import jsonify


def success_response(data=None, message="Success", status_code=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
    }), status_code


def error_response(message="Terjadi kesalahan", errors=None, status_code=400):
    return jsonify({
        "success": False,
        "message": message,
        "errors": errors,
    }), status_code
