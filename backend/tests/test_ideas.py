"""CRUD de ideia — comportamento atual (baseline antes das correções da Fase 1)."""


def test_create_idea(client, owner, category):
    r = client.post(
        "/ideas/",
        json={
            "name": "Nova ideia",
            "description": "desc",
            "owner_id": owner["id"],
            "category_id": category["id"],
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["name"] == "Nova ideia"
    assert body["owner"]["id"] == owner["id"]
    assert body["category"]["id"] == category["id"]
    assert body["is_active"] is True
    assert body["execution_status"] == "Free"


def test_get_and_list_ideas(client, make_idea):
    idea = make_idea("Listada")
    assert client.get(f"/ideas/{idea['id']}").json()["name"] == "Listada"
    names = [i["name"] for i in client.get("/ideas/list").json()]
    assert "Listada" in names


def test_update_idea(client, make_idea):
    idea = make_idea("Antes")
    r = client.put(f"/ideas/{idea['id']}", json={"name": "Depois", "description": "nova"})
    assert r.status_code == 200, r.text
    assert r.json()["name"] == "Depois"
    assert r.json()["description"] == "nova"


def test_toggle_active_and_filter(client, make_idea):
    idea = make_idea("Alternar")
    r = client.patch(f"/ideas/{idea['id']}/toggle-active")
    assert r.status_code == 200, r.text
    assert r.json()["is_active"] is False

    inactive_ids = [i["id"] for i in client.get("/ideas/list", params={"active": False}).json()]
    active_ids = [i["id"] for i in client.get("/ideas/list", params={"active": True}).json()]
    assert idea["id"] in inactive_ids
    assert idea["id"] not in active_ids

    r = client.patch(f"/ideas/{idea['id']}/toggle-active")
    assert r.json()["is_active"] is True


def test_idea_not_found(client):
    assert client.get("/ideas/999999").status_code == 404
