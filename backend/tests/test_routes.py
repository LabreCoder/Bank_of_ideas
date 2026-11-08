"""B09 — listagens padronizadas em GET /<recurso>/ (rotas antigas mantidas como alias deprecated)."""
import pytest


@pytest.mark.parametrize("path", ["/ideas/", "/owner/", "/planning/", "/category/", "/cycle/"])
def test_new_list_routes(client, path):
    r = client.get(path, follow_redirects=False)
    assert r.status_code == 200, r.text
    assert isinstance(r.json(), list)


@pytest.mark.parametrize("path", ["/ideas/list", "/owner/owners", "/planning/plannings"])
def test_old_list_routes_still_work_and_are_deprecated(client, path):
    assert client.get(path, follow_redirects=False).status_code == 200
    operation = client.get("/openapi.json").json()["paths"][path]["get"]
    assert operation.get("deprecated") is True


def test_ideas_active_filter_on_new_route(client, make_idea):
    idea = make_idea()
    client.patch(f"/ideas/{idea['id']}/toggle-active")
    assert client.get("/ideas/", params={"active": True}).json() == []
    assert [i["id"] for i in client.get("/ideas/", params={"active": False}).json()] == [idea["id"]]


def test_delete_handlers_have_unique_names(client):
    operation_ids = [
        op["operationId"]
        for methods in client.get("/openapi.json").json()["paths"].values()
        for op in methods.values()
    ]
    assert len(operation_ids) == len(set(operation_ids))
    # operationId = <nome da função>_<caminho>_<método>. Antes, as funções se chamavam
    # só "delete" (delete_category__category_id__delete).
    assert "delete_category_category__category_id__delete" in operation_ids
    assert "delete_owner_owner__owner_id__delete" in operation_ids
