from fastapi import APIRouter

from app.application.state import AppState

router = APIRouter(prefix="/trees", tags=["trees"])


@router.get("/", status_code=200)
async def get_trees():
    return [{"id": t.get_id, "title": t.get_title} for t in AppState.trees]
