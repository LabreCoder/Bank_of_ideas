# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from services.category_service import id_verify, insert_category, get_category, list_categories

router = APIRouter(
    prefix="/category",
    tags=["Category"]
)

@router.get("/list-categories")
def list_category(db: Session = Depends(get_db)):
    lista = list_categories(db)
    for item in lista:
        print(f"ID: {item[0]} - Name: {item[1]} - Description: {item[2]}")
    return {"message": "List finished"}

@router.get("/category-get")
def get_category_info(db: Session = Depends(get_db)):
    name_category, description_category = get_category(db, 1)
    return {"Category": 1, "Name": name_category, "Descritpion": description_category}

@router.get("/")
def create_category():
    return {"message": "Category created"}

@router.post("/category-insert")
def create_idea(db: Session = Depends(get_db)):
    category_id = id_verify(db)
    name_category = "Cyber"
    description_category = "It is a bank of ideas to my new portifolio"
    insert_category(db, category_id, name_category, description_category)

    return {"message": "Category created", "category_id": category_id}
    name_category, description_category = get_category(db, 1)
    return {"Category": 1, "Name": name_category, "Descritpion": description_category}

@router.post("/")
def create_category():
    return {"message": "Category created"}

@router.post("/category-insert")
def create_idea(db: Session = Depends(get_db)):
    category_id = id_verify(db)
    name_category = "Cyber"
    description_category = "It is a bank of ideas to my new portifolio"
    insert_category(db, category_id, name_category, description_category)

    return {"message": "Category created", "category_id": category_id}