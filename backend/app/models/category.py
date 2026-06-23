#from pydantic import BaseModel

# Category class model
class Category():
    def __init__(self):
        self.id = None
        self.name = None
        self.description = None

    def setCategoryId(self, id: int):
        self.id = id
        #print('Id added successfully')

        return self.id
    
    def setCategoryName(self, name: str):
        self.name = name

        #print('Name added successfully')
        return self.name
    
    def setCategoryDescription(
        self,
        id: int,
        description: str
    ):
        self.description = description
