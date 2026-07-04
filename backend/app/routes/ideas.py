# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db

router = APIRouter(
    prefix="/ideas",
    tags=["Ideas"]
)

@router.get("/")
def list_ideas():
    return {"message": "Listing ideias"}

@router.post("/")
def create_idea():
    return {"message": "Ideia created"}