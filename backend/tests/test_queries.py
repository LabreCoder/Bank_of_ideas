"""B08 — listagens sem consultas N+1 (categoria/owner da ideia carregados junto)."""
from contextlib import contextmanager

import pytest
from sqlalchemy import event

from database.connection import engine


@contextmanager
def count_selects():
    statements = []

    def _before(conn, cursor, statement, *args):
        if statement.lstrip().upper().startswith("SELECT"):
            statements.append(statement)

    event.listen(engine, "before_cursor_execute", _before)
    try:
        yield statements
    finally:
        event.remove(engine, "before_cursor_execute", _before)


@pytest.fixture
def plannings_with_distinct_relations(client):
    """N plannings, cada um com owner e categoria próprios (o identity map não ajuda)."""
    ids = []
    for i in range(4):
        owner = client.post("/owner/", json={"name": f"O{i}"}).json()
        category = client.post("/category/", json={"name": f"C{i}"}).json()
        idea = client.post(
            "/ideas/", json={"name": f"I{i}", "owner_id": owner["id"], "category_id": category["id"]}
        ).json()
        ids.append(client.post("/planning/", json={"idea_id": idea["id"]}).json()["id"])
    return ids


def test_list_plannings_constant_queries(client, plannings_with_distinct_relations):
    with count_selects() as selects:
        r = client.get("/planning/plannings")
    assert r.status_code == 200
    assert len(r.json()) == 4
    assert len(selects) == 1, f"{len(selects)} SELECTs:\n" + "\n---\n".join(selects)


def test_get_planning_single_query(client, plannings_with_distinct_relations):
    with count_selects() as selects:
        r = client.get(f"/planning/{plannings_with_distinct_relations[0]}")
    assert r.status_code == 200
    assert len(selects) == 1, f"{len(selects)} SELECTs"


def test_list_cycles_constant_queries(client, plannings_with_distinct_relations):
    cycle = client.post("/cycle/", json={"name": "C", "start_date": "2026-01-01"}).json()
    for pid in plannings_with_distinct_relations:
        assert client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": pid}).status_code == 200
    with count_selects() as selects:
        r = client.get("/cycle/")
    assert r.status_code == 200
    assert len(r.json()[0]["plannings"]) == 4
    assert len(selects) == 1, f"{len(selects)} SELECTs"
