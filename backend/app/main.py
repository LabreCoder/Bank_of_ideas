import models  # registra todos os ORM models no Base antes de qualquer query
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ideas import router as ideas_router
from routes.category import router as category_router
from routes.owner import router as owner_router
from routes.planning import router as planning_router

app = FastAPI()

app.include_router(ideas_router)
app.include_router(category_router)
app.include_router(owner_router)
app.include_router(planning_router)

@app.get("/")
def home():
    return {"message": "API Online"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)