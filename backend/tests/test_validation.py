"""B01 — validação de entrada (null explícito, nomes vazios, IntegrityError)."""
import pytest


# ---------- B01: null explícito em campos não anuláveis ----------

@pytest.mark.parametrize("payload", [{"name": None}, {"owner_id": None}])
def test_idea_update_rejects_explicit_null(client, make_idea, payload):
    idea = make_idea()
    r = client.put(f"/ideas/{idea['id']}", json=payload)
    assert r.status_code == 422, r.text


def test_idea_update_allows_null_on_nullable_fields(client, make_idea, category):
    idea = make_idea(category_id=category["id"], description="x")
    r = client.put(f"/ideas/{idea['id']}", json={"category_id": None, "description": None})
    assert r.status_code == 200, r.text
    assert r.json()["category"] is None
    assert r.json()["description"] is None


def test_planning_update_rejects_null_status(client, make_planning):
    planning = make_planning()
    r = client.put(f"/planning/{planning['id']}", json={"status": None})
    assert r.status_code == 422, r.text


def test_owner_update_rejects_null_name(client, owner):
    assert client.put(f"/owner/{owner['id']}", json={"name": None}).status_code == 422


def test_category_update_rejects_null_name(client, category):
    assert client.put(f"/category/{category['id']}", json={"name": None}).status_code == 422


@pytest.mark.parametrize("payload", [{"name": None}, {"start_date": None}])
def test_cycle_update_rejects_explicit_null(client, make_cycle, payload):
    cycle = make_cycle()
    assert client.put(f"/cycle/{cycle['id']}", json=payload).status_code == 422


# ---------- B01: nomes vazios / só espaços ----------

@pytest.mark.parametrize("name", ["", "   "])
def test_create_with_blank_name_is_422(client, owner, name):
    assert client.post("/owner/", json={"name": name}).status_code == 422
    assert client.post("/category/", json={"name": name}).status_code == 422
    assert client.post("/ideas/", json={"name": name, "owner_id": owner["id"]}).status_code == 422
    assert client.post("/cycle/", json={"name": name, "start_date": "2026-01-01"}).status_code == 422


@pytest.mark.parametrize("name", ["", "   "])
def test_idea_update_blank_name_is_422(client, make_idea, name):
    idea = make_idea()
    assert client.put(f"/ideas/{idea['id']}", json={"name": name}).status_code == 422


def test_names_are_stripped(client):
    r = client.post("/owner/", json={"name": "  Ana  "})
    assert r.status_code == 201, r.text
    assert r.json()["name"] == "Ana"


def test_checklist_blank_description_is_422(client, make_planning):
    planning = make_planning()
    r = client.post(f"/planning/{planning['id']}/checklist", json={"description": "  "})
    assert r.status_code == 422, r.text
    r = client.post("/planning/", json={"idea_id": 999, "checklist_items": [{"description": ""}]})
    assert r.status_code == 422, r.text


# ---------- B01: IntegrityError com mensagem correta ----------

def test_idea_update_invalid_owner_is_400(client, make_idea):
    idea = make_idea()
    r = client.put(f"/ideas/{idea['id']}", json={"owner_id": 999999})
    assert r.status_code == 400, r.text


def test_category_update_valid(client, category):
    r = client.put(f"/category/{category['id']}", json={"name": "Nova", "description": "d"})
    assert r.status_code == 200, r.text
    assert r.json()["name"] == "Nova"

