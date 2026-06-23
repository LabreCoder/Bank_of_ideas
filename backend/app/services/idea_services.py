# Guarda a lógica de negócio, como a regra que você mencionou de validar se uma ideia já existe antes de salvá-la.

from backend.app.models.category import Category
from backend.app.models.owner import Owner
from backend.app.models.idea import Idea

def main():
    
    # Tests sessions

    ## Category
    caterogia = Category()
    category_id = caterogia.setCategoryId(1)
    category_description = caterogia.setCategoryDescription(id,"Descrição bem detalhada")
    category_name = caterogia.setCategoryName("Cyber")

    ## Owner
    owner = Owner()
    owner_id = owner.setOwnerId("Identificação-1")
    owner_name = owner.setOwnerName(owner_id, "João")

    ## Idea
    ideia = Idea(
        1,   
        "Banco de Ideias",
        "Iniciando a programação para o Banco e estudando POO e BD",
        category_id,
        "waiting",
        owner_id,
        "2026-05-27"
    )

    print(ideia.owner)
    print()
    print(caterogia.description)
    print()
    print(owner.name)

if __name__ == "__main__":
    main()