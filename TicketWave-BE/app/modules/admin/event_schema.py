"""
Schema validasi untuk CRUD Event (Marshmallow).
Support 2 tipe event: single & festival.
"""

from marshmallow import Schema, fields, validate, validates_schema, ValidationError


class FestivalArtistSchema(Schema):
    """Nested schema buat lineup artis festival per hari."""
    day_number = fields.Integer(required=True, validate=validate.Range(min=1))
    artist_name = fields.String(required=True, validate=validate.Length(min=2, max=150))


class TicketPhaseSchema(Schema):
    """Nested schema buat fase tiket (Early Bird, Presale, Normal)."""
    phase_name = fields.String(
        required=True,
        validate=validate.OneOf(["early_bird", "presale", "normal"])
    )
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    discount_percent = fields.Decimal(
        required=False,
        as_string=False,
        places=2,
        validate=validate.Range(min=0, max=100)
    )

    @validates_schema
    def validate_dates(self, data, **kwargs):
        if data["start_date"] >= data["end_date"]:
            raise ValidationError("end_date harus setelah start_date", field_name="end_date")


class TicketTypeSchema(Schema):
    """Nested schema buat kategori tiket (VIP, Regular, dst)."""
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    base_price = fields.Decimal(required=True, as_string=False, places=2, validate=validate.Range(min=0))
    quota = fields.Integer(required=True, validate=validate.Range(min=1))
    description = fields.String(required=False, allow_none=True)
    phases = fields.List(fields.Nested(TicketPhaseSchema), required=False)


class EventCreateSchema(Schema):
    """
    Schema buat create event.
    Validasi berbeda tergantung event_type:
    - single  -> wajib: artist_name, event_date, event_time
    - festival -> wajib: days_count, festival_artists
    """
    agency_id = fields.Integer(required=True)
    event_type = fields.String(
        required=True,
        validate=validate.OneOf(["single", "festival"])
    )
    name = fields.String(required=True, validate=validate.Length(min=3, max=200))
    venue = fields.String(required=True, validate=validate.Length(min=3, max=200))
    city = fields.String(required=True, validate=validate.Length(min=2, max=100))
    description = fields.String(required=False, allow_none=True)

    # Field khusus single event
    artist_name = fields.String(validate=validate.Length(min=2, max=200))
    event_date = fields.Date()
    event_time = fields.Time()

    # Field khusus festival
    days_count = fields.Integer(validate=validate.Range(min=1, max=10))
    festival_artists = fields.List(fields.Nested(FestivalArtistSchema))

    # Ticket types (opsional saat create, bisa ditambah belakangan)
    ticket_types = fields.List(fields.Nested(TicketTypeSchema), required=False)

    @validates_schema
    def validate_event_type_fields(self, data, **kwargs):
        event_type = data.get("event_type")

        if event_type == "single":
            # Validasi field wajib untuk single event
            if not data.get("artist_name"):
                raise ValidationError("artist_name wajib diisi untuk event single", field_name="artist_name")
            if not data.get("event_date"):
                raise ValidationError("event_date wajib diisi untuk event single", field_name="event_date")
            if not data.get("event_time"):
                raise ValidationError("event_time wajib diisi untuk event single", field_name="event_time")

        elif event_type == "festival":
            # Validasi field wajib untuk festival
            if not data.get("days_count"):
                raise ValidationError("days_count wajib diisi untuk event festival", field_name="days_count")
            if not data.get("festival_artists") or len(data["festival_artists"]) == 0:
                raise ValidationError("festival_artists wajib diisi untuk event festival", field_name="festival_artists")

            # Validasi day_number pada festival_artists harus sesuai days_count
            days_count = data.get("days_count", 0)
            day_numbers = [artist["day_number"] for artist in data["festival_artists"]]
            if max(day_numbers) > days_count:
                raise ValidationError(
                    f"day_number tidak boleh lebih dari days_count ({days_count})",
                    field_name="festival_artists"
                )


class EventUpdateSchema(Schema):
    """
    Schema buat update event (semua field opsional).
    Gak bisa ubah event_type setelah dibuat.
    """
    name = fields.String(validate=validate.Length(min=3, max=200))
    venue = fields.String(validate=validate.Length(min=3, max=200))
    city = fields.String(validate=validate.Length(min=2, max=100))
    description = fields.String(allow_none=True)

    # Field single event
    artist_name = fields.String(validate=validate.Length(min=2, max=200))
    event_date = fields.Date()
    event_time = fields.Time()

    # Field festival
    days_count = fields.Integer(validate=validate.Range(min=1, max=10))

    # Status event (bisa diubah manual kalau perlu)
    status = fields.String(
        validate=validate.OneOf([
            "draft", "published", "on_sale", "sales_closed",
            "ongoing", "finished", "archived"
        ])
    )


class EventStatusUpdateSchema(Schema):
    """Schema khusus buat transisi status event."""
    status = fields.String(
        required=True,
        validate=validate.OneOf([
            "published", "on_sale", "sales_closed",
            "ongoing", "finished", "archived"
        ])
    )


# Instance schema yang siap dipakai
event_create_schema = EventCreateSchema()
event_update_schema = EventUpdateSchema()
event_status_schema = EventStatusUpdateSchema()
