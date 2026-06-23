from fastapi import FastAPI

from routes.ideas import router as ideas_router

app = FastAPI()

app.include_router(ideas_router)

@app.get("/")
def home():
    return {"message": "API Online"}