"""baseline: estado de database/schema.sql (inclui a migração manual 001_timestamptz)

Ponto de partida do Alembic (X03). Não executa nada:
- bancos novos são criados por database/schema.sql (docker-entrypoint-initdb.d);
- bancos já existentes estão nesse mesmo estado.
Em ambos os casos, `alembic upgrade head` registra esta revisão e aplica só as
seguintes. Daqui para frente, toda mudança de banco vira uma revisão nova
(database/schema.sql fica como a foto do baseline).

Revision ID: 0001_baseline
Revises:
Create Date: 2026-11-07
"""

revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
