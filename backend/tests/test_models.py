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
