from fastapi import FastAPI

from routes.ideas import router as ideas_router
from routes.category import router as category_router
from routes.owner import router as owner_router

app = FastAPI()

app.include_router(ideas_router)
app.include_router(category_router)
app.include_router(owner_router)

@app.get("/")
def home():
    return {"message": "API Online"}