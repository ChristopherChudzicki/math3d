"""Add times accessed field to metadata

Revision ID: 810ee67a18e8
Revises: ad1e4d5e54cb
Create Date: 2017-06-06 12:58:18.184460

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '810ee67a18e8'
down_revision = 'ad1e4d5e54cb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('meta', sa.Column('times_accessed', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('meta', 'times_accessed')
    # ### end Alembic commands ###
