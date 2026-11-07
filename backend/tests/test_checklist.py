"""B04 — posições do checklist sem duplicidade."""


def _add(client, planning_id, description, **extra):
    r = client.post(f"/planning/{planning_id}/checklist", json={"description": description, **extra})
    assert r.status_code == 201, r.text
    return r.json()


def _items(client, planning_id):
    return client.get(f"/planning/{planning_id}").json()["checklist_items"]


def test_delete_middle_then_add_keeps_positions_unique(client, make_planning):
    planning = make_planning()
    for d in ("a", "b", "c"):
        _add(client, planning["id"], d)
    middle = _items(client, planning["id"])[1]

    r = client.delete(f"/planning/{planning['id']}/checklist/{middle['id']}")
    assert r.status_code == 200, r.text
    assert [i["position"] for i in r.json()["checklist_items"]] == [0, 1]

    body = _add(client, planning["id"], "d")
    items = body["checklist_items"]
    assert [i["position"] for i in items] == [0, 1, 2]
    assert [i["description"] for i in items] == ["a", "c", "d"]


def test_add_respects_payload_position(client, make_planning):
    planning = make_planning()
    for d in ("a", "b"):
        _add(client, planning["id"], d)
    items = _add(client, planning["id"], "primeiro", position=0)["checklist_items"]
    assert [i["description"] for i in items] == ["primeiro", "a", "b"]
    assert [i["position"] for i in items] == [0, 1, 2]


def test_add_with_position_beyond_end_appends(client, make_planning):
    planning = make_planning()
    _add(client, planning["id"], "a")
    items = _add(client, planning["id"], "b", position=99)["checklist_items"]
    assert [(i["description"], i["position"]) for i in items] == [("a", 0), ("b", 1)]


def test_toggle_and_update_item(client, make_planning):
    planning = make_planning()
    item = _add(client, planning["id"], "a")["checklist_items"][0]
    r = client.patch(f"/planning/{planning['id']}/checklist/{item['id']}/toggle")
    assert r.json()["checklist_items"][0]["is_done"] is True
    r = client.put(f"/planning/{planning['id']}/checklist/{item['id']}", json={"description": "a2"})
    assert r.json()["checklist_items"][0]["description"] == "a2"
