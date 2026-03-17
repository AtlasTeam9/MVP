# app/presentation/api/v1/health/router.py

from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.application.state import AppState

router = InferringRouter(prefix="/trees", tags=["trees"])


@cbv(router)
class TreesController:
    @router.get("/", status_code=201)
    async def get_trees(self):
        return [
            {
                "id": t.get_id,
                "title": t.get_title,
                "dependencies": t.get_dependencies,
                "nodes": {
                    node.get_id: {
                        "question": node.get_question,
                    }
                    for node in t.nodes
                },
            }
            for t in AppState.trees
        ]
