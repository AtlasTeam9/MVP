from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.application.state import AppState
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.persistence.file_tree_provider import FileTreeProvider
from app.presentation.api.v1.session.router import router as session_router
from app.presentation.api.v1.trees.router import router as trees_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    storage = FileStorage()
    tree_provider = FileTreeProvider(storage)
    AppState.trees = tree_provider.get_all()

    yield

    AppState.trees = []


app = FastAPI(lifespan=lifespan)
app.include_router(session_router, prefix="/api/v1")
app.include_router(trees_router, prefix="/api/v1")
