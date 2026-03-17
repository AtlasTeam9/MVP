from fastapi import FastAPI

from app.presentation.api.v1.session.router import router as session_router

app = FastAPI()
app.include_router(session_router, prefix="/api/v1")
