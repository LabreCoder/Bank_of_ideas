"""B03 — validação de datas (planning start/due, ciclo x planning)."""


def _bind(client, cycle_id, planning_id, **extra):
    return client.post(f"/cycle/{cycle_id}/bind", json={"planning_id": planning_id, **extra})


# ---------- 1. planning: start_date <= due_date ----------

def test_create_planning_due_before_start_is_422(client, make_idea):
    idea = make_idea()
    r = client.post(
        "/planning/",
        json={"idea_id": idea["id"], "start_date": "2026-03-10", "due_date": "2026-03-01"},
    )
    assert r.status_code == 422, r.text


def test_update_planning_due_before_start_in_payload_is_422(client, make_planning):
    planning = make_planning()
    r = client.put(
        f"/planning/{planning['id']}",
        json={"start_date": "2026-03-10", "due_date": "2026-03-01"},
    )
    assert r.status_code == 422, r.text


def test_update_planning_due_before_stored_start_is_422(client, make_planning):
    planning = make_planning(start_date="2026-03-10", due_date="2026-03-20")
    r = client.put(f"/planning/{planning['id']}", json={"due_date": "2026-03-01"})
    assert r.status_code == 422, r.text
    r = client.put(f"/planning/{planning['id']}", json={"start_date": "2026-04-01"})
    assert r.status_code == 422, r.text
    # Mesma data é válida; limpar uma das datas também.
    assert client.put(f"/planning/{planning['id']}", json={"due_date": "2026-03-10"}).status_code == 200
    assert client.put(f"/planning/{planning['id']}", json={"start_date": None}).status_code == 200


# ---------- 2. update_cycle: start_date ----------

def test_update_cycle_start_after_due_is_400(client, make_cycle):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    r = client.put(f"/cycle/{cycle['id']}", json={"start_date": "2026-04-01"})
    assert r.status_code == 400, r.text


def test_update_cycle_start_conflicting_with_plannings_is_409(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-01-15")
    assert _bind(client, cycle["id"], planning["id"]).status_code == 200

    r = client.put(f"/cycle/{cycle['id']}", json={"start_date": "2026-02-01"})
    assert r.status_code == 409, r.text
    detail = r.json()["detail"]
    assert [c["planning_id"] for c in detail["conflicts"]] == [planning["id"]]
    assert client.get(f"/cycle/{cycle['id']}").json()["start_date"] == "2026-01-01"

    r = client.put(f"/cycle/{cycle['id']}", json={"start_date": "2026-01-10"})
    assert r.status_code == 200, r.text


# ---------- 3. update_planning: due_date x ciclos vinculados ----------

def test_update_planning_due_outside_bound_cycle_is_409(client, make_cycle, make_planning):
    cycle = make_cycle(name="Q1", start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-02-15")
    assert _bind(client, cycle["id"], planning["id"]).status_code == 200

    r = client.put(f"/planning/{planning['id']}", json={"due_date": "2026-05-01"})
    assert r.status_code == 409, r.text
    detail = r.json()["detail"]
    assert [c["cycle_id"] for c in detail["conflicts"]] == [cycle["id"]]
    assert "Q1" in detail["message"]
    assert client.get(f"/planning/{planning['id']}").json()["due_date"] == "2026-02-15"

    # Dentro do período: aceita.
    r = client.put(f"/planning/{planning['id']}", json={"due_date": "2026-03-31"})
    assert r.status_code == 200, r.text


def test_update_planning_due_before_cycle_start_without_cycle_due_is_409(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-01-01")  # ciclo sem due_date
    planning = make_planning(due_date="2026-02-15")
    assert _bind(client, cycle["id"], planning["id"]).status_code == 200
    r = client.put(f"/planning/{planning['id']}", json={"due_date": "2025-12-01"})
    assert r.status_code == 409, r.text


# ---------- 4. bind em ciclo sem due_date ----------

def test_bind_without_cycle_due_rejects_planning_before_start(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-02-01")
    planning = make_planning(due_date="2026-01-15")
    r = _bind(client, cycle["id"], planning["id"])
    assert r.status_code == 409, r.text  # X01
    assert r.json()["detail"]["conflicts"][0]["planning_id"] == planning["id"]


def test_bind_without_cycle_due_accepts_valid_or_undated(client, make_cycle, make_planning):
    cycle = make_cycle(start_date="2026-02-01")
    assert _bind(client, cycle["id"], make_planning(due_date="2026-02-01")["id"]).status_code == 200
    assert _bind(client, cycle["id"], make_planning()["id"]).status_code == 200
