"""Ciclos — comportamento atual (baseline antes das correções da Fase 1)."""


def test_update_cycle_due_date_without_conflict(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-03-15")
    assert client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]}).status_code == 200
    r = client.patch(f"/cycle/{cycle['id']}/due-date", json={"due_date": "2026-04-30"})
    assert r.status_code == 200, r.text
    assert r.json()["due_date"] == "2026-04-30"


def test_create_cycle(client, make_cycle):
    cycle = make_cycle(name="Q1", start_date="2026-01-01", due_date="2026-03-31")
    assert cycle["status"] == "Waiting Start"
    assert cycle["total_plannings"] == 0
    assert cycle["progress_percentage"] == 0.0


def test_create_cycle_due_before_start_is_400(client):
    r = client.post(
        "/cycle/", json={"name": "X", "start_date": "2026-02-01", "due_date": "2026-01-01"}
    )
    assert r.status_code == 400, r.text


def test_bind_planning_with_due_date(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-02-15")
    r = client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]})
    assert r.status_code == 200, r.text
    assert [p["id"] for p in r.json()["plannings"]] == [planning["id"]]


def test_bind_planning_outside_cycle_range_is_409(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-05-01")
    r = client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]})
    # X01: antes 400 com texto; agora 409 com a mesma estrutura de conflicts.
    assert r.status_code == 409, r.text
    conflicts = r.json()["detail"]["conflicts"]
    assert [(c["planning_id"], c["origin"], c["candidate_due_date"]) for c in conflicts] == [
        (planning["id"], "planning", "2026-05-01")
    ]


def test_bind_planning_without_due_date_requires_confirmation(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning()  # sem due_date e sem checklist -> candidata = due_date do ciclo

    r = client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]})
    assert r.status_code == 422, r.text
    detail = r.json()["detail"]
    assert detail["requires_confirmation"] is True
    assert detail["candidate_due_date"] == "2026-03-31"
    assert detail["origin"] == "cycle"

    r = client.post(
        f"/cycle/{cycle['id']}/bind",
        json={"planning_id": planning["id"], "confirm_candidate_due_date": True},
    )
    assert r.status_code == 200, r.text
    assert client.get(f"/planning/{planning['id']}").json()["due_date"] == "2026-03-31"


def test_bind_uses_checklist_date_as_candidate(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(
        checklist_items=[
            {"description": "a", "due_date": "2026-02-01"},
            {"description": "b", "due_date": "2026-02-20"},
        ]
    )
    r = client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]})
    assert r.status_code == 422, r.text
    assert r.json()["detail"]["origin"] == "checklist"
    assert r.json()["detail"]["candidate_due_date"] == "2026-02-20"


def test_bind_same_planning_twice_is_400(client, make_cycle, make_planning):
    cycle = make_cycle()  # sem due_date: vincula direto
    planning = make_planning()
    assert client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]}).status_code == 200
    assert client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]}).status_code == 400


# Antes da B03 este caso respondia 500 (date não serializável no detail do 409).
def test_update_cycle_due_date_with_conflict_is_409(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-03-15")
    assert client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]}).status_code == 200

    r = client.patch(f"/cycle/{cycle['id']}/due-date", json={"due_date": "2026-02-28"})
    assert r.status_code == 409, r.text
    conflicts = r.json()["detail"]["conflicts"]
    assert [c["planning_id"] for c in conflicts] == [planning["id"]]

    # Sem conflito: aceita.
    r = client.patch(f"/cycle/{cycle['id']}/due-date", json={"due_date": "2026-04-30"})
    assert r.status_code == 200, r.text
    assert r.json()["due_date"] == "2026-04-30"


def test_unbind_and_delete_cycle(client, make_cycle, make_planning):
    cycle = make_cycle()
    planning = make_planning()
    client.post(f"/cycle/{cycle['id']}/bind", json={"planning_id": planning["id"]})
    r = client.delete(f"/cycle/{cycle['id']}/unbind/{planning['id']}")
    assert r.status_code == 200, r.text
    assert r.json()["plannings"] == []
    assert client.delete(f"/cycle/{cycle['id']}").status_code == 204
    assert client.get(f"/cycle/{cycle['id']}").status_code == 404
    # O planning não é apagado junto com o ciclo.
    assert client.get(f"/planning/{planning['id']}").status_code == 200
