"""
Infraestrutura de testes do backend.

Os testes rodam SEMPRE contra um database separado, "<DB_NAME>_test", criado
no mesmo container `db`. O banco principal nunca é tocado:

- antes de importar a aplicação, DB_NAME é trocado para "<DB_NAME>_test";
- a fixture `_guard_test_database` confere que o engine aponta para um
  database terminado em "_test" e aborta a sessão se não apontar;
- as tabelas são criadas com Base.metadata.create_all e truncadas
  (RESTART IDENTITY CASCADE) depois de cada teste.

Rodar: docker compose exec api pytest -q
"""
import os
import sys

import pytest

# /app (código da API) no sys.path: os módulos são importados como em main.py
# ("import models", "from services import ...").
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

_MAIN_DB_NAME = os.environ.get("DB_NAME", "")
if not _MAIN_DB_NAME:
    raise RuntimeError("DB_NAME não definido no ambiente do container.")
TEST_DB_NAME = (
    _MAIN_DB_NAME if _MAIN_DB_NAME.endswith("_test") else f"{_MAIN_DB_NAME}_test"
)
os.environ["DB_NAME"] = TEST_DB_NAME


def _ensure_test_database() -> None:
    import psycopg2
    from psycopg2 import sql

    conn = psycopg2.connect(
        dbname="postgres",
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.environ["DB_HOST"],
        port=os.environ["DB_PORT"],
    )
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (TEST_DB_NAME,))
            if cur.fetchone() is None:
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(TEST_DB_NAME)))
    finally:
        conn.close()


_ensure_test_database()

# Só agora a aplicação é importada: o engine já nasce apontando para o banco de teste.
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from database.connection import Base, engine  # noqa: E402
from main import app  # noqa: E402  (importa todas as rotas e, com elas, todos os models)


@pytest.fixture(scope="session", autouse=True)
def _guard_test_database():
    db_name = engine.url.database or ""
    if not db_name.endswith("_test"):
        pytest.exit(f"Abortado: engine aponta para '{db_name}', que não é um banco de teste.", 2)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture(autouse=True)
def _clean_tables():
    yield
    tables = ", ".join(f'"{t.name}"' for t in Base.metadata.sorted_tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


# ---------- fábricas simples via API ----------

@pytest.fixture
def owner(client):
    r = client.post("/owner/", json={"name": "Owner Teste"})
    assert r.status_code == 201, r.text
    return r.json()


@pytest.fixture
def category(client):
    r = client.post("/category/", json={"name": "Categoria Teste"})
    assert r.status_code == 201, r.text
    return r.json()


@pytest.fixture
def make_idea(client, owner):
    def _make(name="Ideia", **extra):
        payload = {"name": name, "owner_id": owner["id"], **extra}
        r = client.post("/ideas/", json=payload)
        assert r.status_code == 201, r.text
        return r.json()

    return _make


@pytest.fixture
def make_planning(client, make_idea):
    def _make(idea_id=None, **extra):
        if idea_id is None:
            idea_id = make_idea()["id"]
        r = client.post("/planning/", json={"idea_id": idea_id, **extra})
        assert r.status_code == 201, r.text
        return r.json()

    return _make


@pytest.fixture
def make_cycle(client):
    def _make(name="Ciclo", start_date="2026-01-01", due_date=None, **extra):
        payload = {"name": name, "start_date": start_date, **extra}
        if due_date is not None:
            payload["due_date"] = due_date
        r = client.post("/cycle/", json=payload)
        assert r.status_code == 201, r.text
        return r.json()

    return _make
