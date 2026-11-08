"""idea.name limitado a 200 caracteres (decisão do usuário sobre a B02)

Antes: VARCHAR sem limite. Os dados existentes cabem (maior nome: 25 caracteres
na data da migração). Se algum nome tiver mais de 200, o ALTER falha e nada é
alterado (transação).

Revision ID: 0002_idea_name_varchar_200
Revises: 0001_baseline
Create Date: 2026-11-07
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_idea_name_varchar_200"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "idea", "name", existing_type=sa.String(), type_=sa.String(200), existing_nullable=False
    )


def downgrade() -> None:
    op.alter_column(
        "idea", "name", existing_type=sa.String(200), type_=sa.String(), existing_nullable=False
    )
