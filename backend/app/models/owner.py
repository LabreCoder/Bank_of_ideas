#from pydantic import BaseModel

# Owner class model
class Owner():
    def __init__(self):
        self.id = None
        self.name = None

    def setOwnerId(self, id: int):
        self.id = id

        return self.id

    def setOwnerName(self, id: int, name: str):

        if id == self.id:
            self.name = name

            return self.name
        else:
            print("Is not the same Id")
            raise InvalidIdeaError("Ideia inválida")

class InvalidIdeaError(Exception):
    pass