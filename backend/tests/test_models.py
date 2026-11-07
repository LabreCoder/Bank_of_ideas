"""B06 — importar só `models` já registra todos os models e relacionamentos."""
import os
import subprocess
import sys


def test_importing_models_alone_registers_planning_cycles():
    # Processo separado: no processo do pytest o main.py já importou todas as rotas,
    # o que mascarava o problema (Planning.cycles só existia via backref de Cycle).
    code = (
        "import models\n"
        "from sqlalchemy.orm import configure_mappers\n"
        "configure_mappers()\n"
        "from models.planning import Planning\n"
        "assert hasattr(Planning, 'cycles'), 'Planning.cycles ausente'\n"
    )
    app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    result = subprocess.run(
        [sys.executable, "-c", code], cwd=app_dir, capture_output=True, text=True
    )
    assert result.returncode == 0, result.stderr


def test_created_at_is_timezone_aware(client, make_planning):
    """B07 — created_at sai com fuso (Z/+00:00). Obs.: o banco de teste é criado pelos
    models (já timestamptz), então este teste protege contra regressão no model/schema
    de resposta; a coluna do banco principal foi migrada por database/migrations/001."""
    planning = make_planning()
    for created_at in (
        planning["created_at"],
        client.get(f"/ideas/{planning['idea']['id']}").json()["created_at"],
    ):
        assert created_at.endswith("Z") or created_at[-6] in "+-", created_at


def test_models_match_schema_sql():
    """X02 — models alinhados ao database/schema.sql (limites, cascade, NOT NULL)."""
    from models.checklist import PlanningChecklistItem
    from models.cycle import Cycle
    from models.idea import Idea
    from models.planning import Planning

    assert Cycle.__table__.c.name.type.length == 255
    fk = next(iter(PlanningChecklistItem.__table__.c.planning_id.foreign_keys))
    assert fk.ondelete == "CASCADE"
    assert Idea.__table__.c.created_at.nullable is False
    assert Planning.__table__.c.created_at.nullable is False


def test_deleting_planning_in_db_cascades_to_checklist(client, make_planning):
    """ON DELETE CASCADE no banco (não só no ORM): DELETE direto em SQL remove os itens."""
    from sqlalchemy import text
    from database.connection import engine

    planning = make_planning(checklist_items=[{"description": "a"}])
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM planning WHERE id = :id"), {"id": planning["id"]})
        left = conn.execute(text("SELECT count(*) FROM checklist")).scalar()
    assert left == 0
