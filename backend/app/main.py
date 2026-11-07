import os

import models  # registra todos os ORM models no Base antes de qualquer query
from fastapi import Depends, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database.connection import get_db
from fastapi.middleware.cors import CORSMiddleware

from routes.ideas import router as ideas_router
from routes.category import router as category_router
from routes.owner import router as owner_router
from routes.planning import router as planning_router
from routes.checklist import router as checklist_router
from routes.cycle import router as cycle_router

API_VERSION = "1.0.0"

app = FastAPI(title="Bank of Ideas API", version=API_VERSION)

# E01: origens permitidas vindas do ambiente (lista separada por vírgula).
# Com o proxy /api do frontend, o navegador nem precisa de CORS; isto só vale
# para quem chamar a API direto de outra origem.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ideas_router)
app.include_router(category_router)
app.include_router(owner_router)
app.include_router(planning_router)
app.include_router(checklist_router)
app.include_router(cycle_router)

@app.get("/")
def home():
    return {"message": "API Online"}

@app.get("/health", tags=["Health"])
def health(db: Session = Depends(get_db)):
    """E02: usado pelo healthcheck do Docker. Testa o banco com SELECT 1."""
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(status_code=503, content={"status": "error", "database": "unavailable"})
    return {"status": "ok", "database": "ok"}
