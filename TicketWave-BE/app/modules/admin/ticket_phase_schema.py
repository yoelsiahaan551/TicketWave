"""
Schema validasi untuk CRUD Ticket Phase (Marshmallow).
"""

from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from datetime import date


class TicketPhaseCreateSchema(Schema):
    """Schema untuk create phase baru."""
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
        validate=validate.Range(min=0, max=100),
        load_default=0
    )

    @validates_schema
    def validate_dates(self, data, **kwargs):
        # Validasi end_date harus setelah start_date
        if data["start_date"] >= data["end_date"]:
            raise ValidationError(
                "end_date harus setelah start_date", 
                field_name="end_date"
            )


class TicketPhaseUpdateSchema(Schema):
    """Schema untuk update phase (semua field opsional)."""
    phase_name = fields.String(
        validate=validate.OneOf(["early_bird", "presale", "normal"])
    )
    start_date = fields.Date()
    end_date = fields.Date()
    discount_percent = fields.Decimal(
        as_string=False,
        places=2,
        validate=validate.Range(min=0, max=100)
    )

    @validates_schema
    def validate_dates(self, data, **kwargs):
        # Kalau ada start_date DAN end_date, validasi
        if "start_date" in data and "end_date" in data:
            if data["start_date"] >= data["end_date"]:
                raise ValidationError(
                    "end_date harus setelah start_date", 
                    field_name="end_date"
                )


ticket_phase_create_schema = TicketPhaseCreateSchema()
ticket_phase_update_schema = TicketPhaseUpdateSchema()
