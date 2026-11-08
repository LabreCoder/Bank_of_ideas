"""Planning com checklist — comportamento atual (baseline antes das correções da Fase 1)."""


def test_create_planning_with_checklist(client, make_idea):
    idea = make_idea("Com planning")
    r = client.post(
        "/planning/",
        json={
            "idea_id": idea["id"],
            "start_date": "2026-02-01",
            "due_date": "2026-02-28",
            "checklist_items": [
                {"description": "Passo 1"},
                {"description": "Passo 2", "due_date": "2026-02-10"},
            ],
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["status"] == "Not Started"
    assert [i["description"] for i in body["checklist_items"]] == ["Passo 1", "Passo 2"]
    assert [i["position"] for i in body["checklist_items"]] == [0, 1]

    # A ideia passa a constar como "In Planning".
    assert client.get(f"/ideas/{idea['id']}").json()["execution_status"] == "In Planning"


def test_second_planning_for_same_idea_is_409(client, make_planning):
    planning = make_planning()
    r = client.post("/planning/", json={"idea_id": planning["idea"]["id"]})
    assert r.status_code == 409, r.text


def test_planning_for_missing_idea_is_404(client):
    assert client.post("/planning/", json={"idea_id": 999999}).status_code == 404


def test_update_planning_status(client, make_planning):
    planning = make_planning()
    r = client.put(f"/planning/{planning['id']}", json={"status": "Started"})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "Started"
