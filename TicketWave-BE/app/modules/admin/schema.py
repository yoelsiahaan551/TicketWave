from marshmallow import Schema, fields, validate


class AgencyCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=150))
    pic_name = fields.String(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True)
    phone = fields.String(required=True, validate=validate.Length(min=8, max=20))
    address = fields.String(required=False, allow_none=True)


class AgencyUpdateSchema(Schema):
    name = fields.String(validate=validate.Length(min=2, max=150))
    pic_name = fields.String(validate=validate.Length(min=2, max=120))
    email = fields.Email()
    phone = fields.String(validate=validate.Length(min=8, max=20))
    address = fields.String(allow_none=True)


agency_create_schema = AgencyCreateSchema()
agency_update_schema = AgencyUpdateSchema()
