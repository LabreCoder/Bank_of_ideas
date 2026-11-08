"""D09 — salvar detalhes + due_date do ciclo de uma vez; is_overdue derivado."""
from datetime import date, timedelta


def _bind(client, cycle_id, planning_id):
    r = client.post(f"/cycle/{cycle_id}/bind", json={"planning_id": planning_id})
    assert r.status_code == 200, r.text


# ---------- PUT /cycle/{id} com due_date ----------

def test_update_cycle_details_and_due_date_together(client, make_cycle):
    cycle = make_cycle(name="Q1", start_date="2026-01-01", due_date="2026-03-31")
    r = client.put(
        f"/cycle/{cycle['id']}",
        json={"name": "Q1 v2", "start_date": "2026-01-05", "due_date": "2026-04-30"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert (body["name"], body["start_date"], body["due_date"]) == ("Q1 v2", "2026-01-05", "2026-04-30")


def test_update_cycle_can_clear_due_date(client, make_cycle):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    r = client.put(f"/cycle/{cycle['id']}", json={"due_date": None})
    assert r.status_code == 200, r.text
    assert r.json()["due_date"] is None


def test_update_cycle_due_before_start_is_400(client, make_cycle):
    cycle = make_cycle(start_date="2026-01-01", due_date="2026-03-31")
    r = client.put(f"/cycle/{cycle['id']}", json={"start_date": "2026-02-01", "due_date": "2026-01-15"})
    assert r.status_code == 400, r.text


def test_update_cycle_due_date_conflict_is_409_and_nothing_saved(client, make_cycle, make_planning):
    cycle = make_cycle(name="Original", start_date="2026-01-01", due_date="2026-03-31")
    planning = make_planning(due_date="2026-03-15")
    _bind(client, cycle["id"], planning["id"])

    r = client.put(f"/cycle/{cycle['id']}", json={"name": "Renamed", "due_date": "2026-02-28"})
    assert r.status_code == 409, r.text
    assert [c["planning_id"] for c in r.json()["detail"]["conflicts"]] == [planning["id"]]
    # Atômico: o nome também não foi salvo.
    current = client.get(f"/cycle/{cycle['id']}").json()
    assert (current["name"], current["due_date"]) == ("Original", "2026-03-31")


# ---------- is_overdue ----------

def test_is_overdue_when_due_date_passed_and_not_finished(client, make_cycle, make_planning):
    past = (date.today() - timedelta(days=10)).isoformat()
    start = (date.today() - timedelta(days=40)).isoformat()
    cycle = make_cycle(start_date=start, due_date=past)
    assert cycle["is_overdue"] is True  # sem plannings: "Waiting Start" e prazo vencido

    planning = make_planning(due_date=past)
    _bind(client, cycle["id"], planning["id"])
    client.put(f"/planning/{planning['id']}", json={"status": "Completed"})
    finished = client.get(f"/cycle/{cycle['id']}").json()
    assert finished["status"] == "Finished"
    assert finished["is_overdue"] is False


def test_is_not_overdue_without_due_date_or_in_future(client, make_cycle):
    assert make_cycle(start_date="2026-01-01")["is_overdue"] is False
    future = (date.today() + timedelta(days=10)).isoformat()
    assert make_cycle(start_date="2026-01-01", due_date=future)["is_overdue"] is False
