"""Peças de validação compartilhadas pelos schemas (B01/B02)."""
from pydantic import ConfigDict


# Config base dos schemas de entrada: remove espaços nas pontas de toda string,
# para que "   " vire "" e seja barrado por min_length=1.
INPUT_CONFIG = ConfigDict(str_strip_whitespace=True)

# Config dos schemas de resposta montados a partir de objetos ORM.
ORM_CONFIG = ConfigDict(from_attributes=True)


def reject_null(value, info):
    """
    Para campos opcionais nos updates que são NOT NULL no banco.

    O campo pode ser omitido (fica fora de model_fields_set e o service não
    mexe nele), mas um `null` explícito é recusado com 422 — antes ele passava
    pela validação e estourava no banco (500). Validators de campo só rodam
    quando o valor é enviado, então `None` aqui é sempre um null explícito.
    """
    if value is None:
        raise ValueError(f"{info.field_name} cannot be null")
    return value
