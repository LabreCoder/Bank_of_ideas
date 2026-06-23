# Cria os caminhos de URL (endpoints) que o frontend vai acessar para adicionar e alterar owners.
from fastapi import APIRouter

router = APIRouter(
    prefix="/owner",
    tags=["Owner"]
)

@router.get("/")
def list_owner():
    return {"message": "Listing owners"}

@router.post("/")
def create_owner():
    return {"message": "Owner created"}