# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from fastapi import APIRouter

router = APIRouter(
    prefix="/category",
    tags=["Category"]
)

@router.get("/")
def list_category():
    return {"message": "Listing categories"}

@router.post("/")
def create_category():
    return {"message": "Category created"}