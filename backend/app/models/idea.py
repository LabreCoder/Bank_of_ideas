# Define a estrutura do objeto (os dados que vão para o banco) usando classes Python. É aqui que a Orientação a Objetos brilha inicialmente.

#from pydantic import BaseModel
from backend.app.models.category import Category
from backend.app.models.owner import Owner

# Idea class model
class Idea:

    VALID_STATUS = ["Waiting", "Doing", "Done"]

    def __init__(
        self,
        id: int,
        name: str,
        description: str,
        category_id: int,
        status: str,
        owner: int,
        date: str
    ):

        if status.strip().capitalize() not in self.VALID_STATUS:
            raise ValueError("Status inválido")

        self._id = id
        self.name = name
        self.description = description
        self.category_id = category_id
        self.status = status
        self.owner = owner
        self.date = date

    def set_status(self, status: str):

        status = status.strip().capitalize()
        if status not in self.VALID_STATUS:
            raise ValueError("Status inválido")

        if self.status.capitalize() == status:
            raise ValueError("A ideia já possui esse status")

        self.status = status

    def get_status(self):
        return f"Id: {self._id} - Status: {self.status}"