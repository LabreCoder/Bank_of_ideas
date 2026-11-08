"""E02 — healthcheck da API (testa o banco) e metadados do app."""


def test_health_checks_database(client):
    r = client.get("/health")
    assert r.status_code == 200, r.text
    assert r.json() == {"status": "ok", "database": "ok"}


def test_openapi_has_title_and_version(client):
    info = client.get("/openapi.json").json()["info"]
    assert info["title"] == "Bank of Ideas API"
    assert info["version"]


def test_engine_uses_pool_pre_ping():
    from database.connection import engine

    assert engine.pool._pre_ping is True
