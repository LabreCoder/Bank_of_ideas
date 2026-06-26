# Guarda a lógica de negócio, como a regra que você mencionou de validar se uma ideia já existe antes de salvá-la.

from sqlalchemy import text
from sqlalchemy.orm import Session

## ID verification
def id_verify(db: Session) -> int:
    category_exists = db.execute(
        text("SELECT to_regclass('public.category')")
    ).scalar()
    if category_exists is None:
        raise RuntimeError("Table 'category' not Found")
    
    last_id = db.execute(
        text(
            "SELECT COALESCE(MAX(id), 0) + 1 FROM category"
        )
    ).scalar_one()

    return last_id

## Insert new category
def insert_category(db: Session, id: int, name: str, description: str):

    db.execute(
        text(
            """
            INSERT INTO category (id, name, description)
            VALUES (
                :id,
                :name,
                :description
            )
            """
        ),
        {"id":id, "name": name, "description": description},
    )

    db.commit()

## Get category info
def get_category(db: Session, id: int):

    result = db.execute(
        text(
            """
            SELECT name, description
            FROM category
            WHERE id = :id
            """
        ),
        {"id": id},
    )
    row = result.fetchone()
    name = row[0]
    description = row[1]

    return name, description

## Get list of categories
def list_categories(db: Session):
    list = []
    result = db.execute(
        text(
            """
            SELECT id, name, description
            FROM category
            ORDER BY id
            """
        )
    )
    rows = result.fetchall()
    
    for row in rows:
        list.append(row)

    return list