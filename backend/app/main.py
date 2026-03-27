from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.application.state import AppState
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.persistence.file_tree_provider import FileTreeProvider
from app.presentation.api.v1.device.router import router as device_router
from app.presentation.api.v1.exception_handlers import register_exception_handlers
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
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router, prefix="/api/v1")
app.include_router(trees_router, prefix="/api/v1")
app.include_router(device_router, prefix="/api/v1")
register_exception_handlers(app)
