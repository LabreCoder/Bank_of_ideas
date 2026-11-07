"""B02 — limites de tamanho validados no schema (422) em vez de erro no banco (500)."""


def test_category_description_over_200_is_422(client, category):
    assert client.post("/category/", json={"name": "c", "description": "x" * 201}).status_code == 422
    assert client.put(f"/category/{category['id']}", json={"description": "x" * 201}).status_code == 422
    assert client.post("/category/", json={"name": "c", "description": "x" * 200}).status_code == 201


def test_cycle_name_over_255_is_422(client, make_cycle):
    assert client.post("/cycle/", json={"name": "x" * 256, "start_date": "2026-01-01"}).status_code == 422
    cycle = make_cycle()
    assert client.put(f"/cycle/{cycle['id']}", json={"name": "x" * 256}).status_code == 422
