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
