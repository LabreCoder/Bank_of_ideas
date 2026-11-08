FROM python:3.11-slim

WORKDIR /app

# Só os requirements primeiro: a camada do pip fica em cache enquanto eles não
# mudarem. (E03: antes era `COPY . .` seguido de `COPY app/ .`, que copiava o
# backend inteiro — testes, requirements — para dentro de /app em duplicidade.)
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Dependências de teste (pytest, httpx). Ligado no docker-compose.yml
# (build arg INSTALL_DEV=true); desligado por padrão para imagens de produção.
ARG INSTALL_DEV=false
RUN if [ "$INSTALL_DEV" = "true" ]; then pip install --no-cache-dir -r requirements-dev.txt; fi

COPY app/ .

EXPOSE 8000

# X03: aplica as migrações pendentes do Alembic antes de subir a API.
# Em desenvolvimento usa --reload; o perfil de produção (docker-compose.prod.yml)
# sobrescreve com UVICORN_RELOAD=false e mais workers.
ENV UVICORN_RELOAD=true \
    UVICORN_WORKERS=1
CMD ["sh", "-c", "alembic upgrade head && if [ \"$UVICORN_RELOAD\" = \"true\" ]; then exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload; else exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers \"$UVICORN_WORKERS\" --proxy-headers; fi"]
