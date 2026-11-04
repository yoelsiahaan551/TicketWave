"""add booking model and recreate ticket model for checkout flow

Revision ID: 0d232f4c007b
Revises: 4aca75be6652
Create Date: 2026-11-03 12:09:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0d232f4c007b'
down_revision = '4aca75be6652'
branch_labels = None
depends_on = None


def upgrade():
    # Create bookings table
    op.create_table('bookings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('booking_code', sa.String(length=50), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('ticket_type_id', sa.Integer(), nullable=False),
    sa.Column('ticket_phase_id', sa.Integer(), nullable=True),
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('unit_price', sa.Integer(), nullable=False),
    sa.Column('discount_percent', sa.Integer(), nullable=True, server_default='0'),
    sa.Column('total_price', sa.Integer(), nullable=False),
    sa.Column('buyer_name', sa.String(length=120), nullable=False),
    sa.Column('buyer_email', sa.String(length=120), nullable=False),
    sa.Column('buyer_phone', sa.String(length=20), nullable=False),
    sa.Column('payment_method', sa.String(length=50), nullable=True),
    sa.Column('payment_url', sa.String(length=500), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False, server_default='pending_payment'),
    sa.Column('expired_at', sa.DateTime(), nullable=False),
    sa.Column('paid_at', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], ),
    sa.ForeignKeyConstraint(['ticket_phase_id'], ['ticket_phases.id'], ),
    sa.ForeignKeyConstraint(['ticket_type_id'], ['ticket_types.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('booking_code')
    )
    
    with op.batch_alter_table('bookings', schema=None) as batch_op:
        batch_op.create_index('ix_bookings_booking_code', ['booking_code'], unique=True)
    
    # Drop old tickets table if exists and recreate
    op.execute('DROP TABLE IF EXISTS tickets')
    
    op.create_table('tickets',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('booking_id', sa.Integer(), nullable=False),
    sa.Column('ticket_code', sa.String(length=50), nullable=False),
    sa.Column('qr_token', sa.String(length=100), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False, server_default='valid'),
    sa.Column('checked_in_at', sa.DateTime(), nullable=True),
    sa.Column('checked_in_by', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ),
    sa.ForeignKeyConstraint(['checked_in_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('ticket_code'),
    sa.UniqueConstraint('qr_token')
    )
    
    with op.batch_alter_table('tickets', schema=None) as batch_op:
        batch_op.create_index('ix_tickets_qr_token', ['qr_token'], unique=True)
        batch_op.create_index('ix_tickets_ticket_code', ['ticket_code'], unique=True)


def downgrade():
    # Drop new tables
    op.drop_table('tickets')
    op.drop_table('bookings')
    
    # Recreate old tickets table (basic structure)
    op.create_table('tickets',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('ticket_type_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('qr_token', sa.String(length=60), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('booking_code', sa.String(length=30), nullable=False),
    sa.Column('buyer_name', sa.String(length=120), nullable=False),
    sa.Column('buyer_phone', sa.String(length=20), nullable=False),
    sa.Column('source', sa.String(length=10), nullable=False),
    sa.Column('event_day', sa.Integer(), nullable=True),
    sa.Column('checked_in_at', sa.DateTime(), nullable=True),
    sa.Column('checked_in_by', sa.Integer(), nullable=True),
    sa.Column('purchased_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['checked_in_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['ticket_type_id'], ['ticket_types.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('qr_token')
    )
