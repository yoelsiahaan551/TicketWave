"""
Helper upload gambar ke Cloudinary. Dipakai oleh module yang butuh upload
file (Event -> poster/banner, Agency -> logo, dst).

Folder Cloudinary otomatis dikelompokkan per keperluan, contoh:
    upload_image(file, folder="ticketwave/agencies/logo")
    upload_image(file, folder="ticketwave/events/poster")
"""

import cloudinary.uploader
from werkzeug.datastructures import FileStorage


class UploadError(Exception):
    pass


ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE_MB = 5


def _validate_file(file: FileStorage):
    if file is None or file.filename == "":
        raise UploadError("File tidak ditemukan")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise UploadError(f"Format file harus salah satu dari: {', '.join(ALLOWED_EXTENSIONS)}")

    file.stream.seek(0, 2)  # pindah ke akhir file buat cek ukuran
    size_mb = file.stream.tell() / (1024 * 1024)
    file.stream.seek(0)  # balikin posisi cursor ke awal

    if size_mb > MAX_FILE_SIZE_MB:
        raise UploadError(f"Ukuran file maksimal {MAX_FILE_SIZE_MB}MB")


def upload_image(file: FileStorage, folder: str) -> dict:
    """
    Upload 1 gambar ke Cloudinary.
    Return dict berisi 'url' dan 'public_id' (public_id dipakai kalau nanti perlu hapus/replace).
    """
    _validate_file(file)

    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        resource_type="image",
        overwrite=True,
    )

    return {
        "url": result.get("secure_url"),
        "public_id": result.get("public_id"),
    }


def delete_image(public_id: str):
    if not public_id:
        return
    cloudinary.uploader.destroy(public_id)
