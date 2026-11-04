"""
Marshmallow schemas untuk validasi checkout & booking.
"""

from marshmallow import Schema, fields, validate, validates, ValidationError


class CheckoutSchema(Schema):
    """Schema untuk checkout tiket"""
    
    # Ticket selection
    event_id = fields.Int(required=True)
    ticket_type_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1, max=10))  # max 10 tiket per transaksi
    
    # Buyer info
    buyer_name = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    buyer_email = fields.Email(required=True)
    buyer_phone = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    
    # Optional: email penerima tiket (kalau beda dengan buyer_email)
    recipient_email = fields.Email(required=False, allow_none=True)


class BookingDetailSchema(Schema):
    """Schema untuk get booking detail"""
    booking_code = fields.Str(required=True)
