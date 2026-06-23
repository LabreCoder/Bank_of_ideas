# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from fastapi import APIRouter

router = APIRouter(
    prefix="/ideas",
    tags=["Ideas"]
)

@router.get("/")
def list_ideas():
    return {"message": "Listando ideias"}

@router.post("/")
def create_idea():
    return {"message": "Ideia criada"}