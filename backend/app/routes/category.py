# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from services.category_service import id_verify, insert_category, update_category, get_category, list_categories, delete_category

router = APIRouter(
    prefix="/category",
    tags=["Category"]
)

@router.get("/")
def check():
    return {"message": "Server category is running"}

@router.get("/list-category")
def list_category(db: Session = Depends(get_db)):
    lista = list_categories(db)
    for item in lista:
        print(f"ID: {item[0]} - Name: {item[1]} - Description: {item[2]}")
    return {"message": "List finished"}
    # tem que converter para json, mas não sei como fazer isso ainda.

@router.get("/category-get/{category_id}")
def get_category_info(category_id: int, db: Session = Depends(get_db)):
    name_category, description_category = get_category(db, category_id)
    return {"Category": category_id, "Name": name_category, "Descritpion": description_category}

@router.post("/category-insert")
def create_category(db: Session = Depends(get_db)):
    category_id = id_verify(db)
    name_category = "Cyber"
    description_category = "It is a bank of ideas to my new portifolio"
    insert_category(db, category_id, name_category, description_category)

    return {"message": "Category created", "category_id": category_id}

@router.post("/category-update/{category_id}")
def update_category_info(category_id: int, db: Session = Depends(get_db)):
    name_category = "Pentest"
    description_category = "It a beautiful job for hackers and security professionals"
    update_category(db, category_id, name_category, description_category)

    return {"message": "Category updated", "category_id": category_id}

# Depois criar uma rota para ativar e desativar uma categoria, mas não sei se é necessário, pois a ideia é que o usuário possa criar uma ideia e depois apagar, então não sei se é necessário desativar uma categoria.

@router.delete("/category-delete/{category_id}")
def delete(category_id: int, db: Session = Depends(get_db)):
    delete_category(db, category_id)

    return {"message": "Category deleted", "category_id": category_id}