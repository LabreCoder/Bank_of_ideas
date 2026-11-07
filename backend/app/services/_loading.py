"""
Opções de carregamento compartilhadas (B08).

PlanningResponse inclui idea -> category/owner e checklist_items. Sem carregar
tudo junto, cada planning disparava consultas extras para categoria e owner
(N+1). Fica num módulo próprio porque planning_service e cycle_service usam e
planning_service já importa cycle_service.
"""
from sqlalchemy.orm import joinedload

from models.idea import Idea
from models.planning import Planning


def planning_load_options(*parent_path):
    """
    joinedloads para montar um PlanningResponse numa única consulta.

    `parent_path` é o caminho até os plannings quando eles não são a entidade
    principal da query, ex.: planning_load_options(Cycle.plannings).
    """

    def _from_parent(attr):
        option = None
        for step in parent_path:
            option = joinedload(step) if option is None else option.joinedload(step)
        return joinedload(attr) if option is None else option.joinedload(attr)

    return [
        _from_parent(Planning.idea).joinedload(Idea.category),
        _from_parent(Planning.idea).joinedload(Idea.owner),
        _from_parent(Planning.checklist_items),
    ]
