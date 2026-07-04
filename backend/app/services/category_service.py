# Guarda a lógica de negócio, como a regra que você mencionou de validar se uma ideia já existe antes de salvá-la.

from sqlalchemy import text
from sqlalchemy.orm import Session

## ID verification
def id_verify(db: Session) -> int:
    try:
        category_exists = db.execute(
            text("SELECT to_regclass('public.category')")
        ).scalar()
        if category_exists is None:
            raise RuntimeError("Table 'category' not Found")
    except Exception as e:
        raise RuntimeError(f"Error while verifying table 'category': {e}")
    
    try:
        last_id = db.execute(
            text(
                "SELECT COALESCE(MAX(id), 0) + 1 FROM category"
            )
        ).scalar_one()
        return last_id

    except Exception as e:
        raise RuntimeError(f"Error while retrieving last category ID: {e}")

## Insert new category
def insert_category(db: Session, id: int, name: str, description: str):
    try:
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

    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error while inserting the category: {e}")

## Update category
def update_category(db: Session, id: int, name: str, description: str):
    try:
        db.execute(
            text(
                """
                UPDATE category
                SET name = :name, description = :description
                WHERE id = :id
                """
            ),
            {"id":id, "name": name, "description": description},
        )

        db.commit()

    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error while updating the category: {e}")

## Get category info
def get_category(db: Session, id: int):
    try:
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
    
    except Exception as e:
        raise RuntimeError(f"Error while getting category info: {e}")

## Get list of categories
def list_categories(db: Session):
    try:
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
        categories = [
            {"id": row[0], "name": row[1], "description": row[2]}
            for row in rows
        ]
        return categories
    except Exception as e:
        raise RuntimeError(f"Error while listing categories: {e}")
    
## Delete category
def delete_category(db: Session, id: int):
    try:
        db.execute(
            text(
                """
                DELETE FROM category
                WHERE id = :id
                """
            ),
            {"id": id},
        )
        db.commit()
        #checkident(db, id-1)

    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error while deleting the category: {e}")
'''
## Alter id
def checkident(db: Session, id: int):
    try:
        db.execute(
            text(
                """
                UPDATE category SET id = :id;
                """
            ),
            {"id": id},
        )
        db.commit()

    except Exception as e:
        db.rollback()
        raise RuntimeError(f"Error while altering the sequence: {e}")
'''