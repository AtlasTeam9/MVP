from fastapi import Depends
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.application.interfaces.get_trees_use_case import IGetTreesUseCase
from app.presentation.api.v1.trees.dependencies import get_trees_use_case

from .schema import TreesSchema

router = InferringRouter(prefix="/trees", tags=["trees"])


@cbv(router)
class TreesController:
    get_trees_use_case: IGetTreesUseCase = Depends(get_trees_use_case)

    @router.get("/", status_code=201)
    async def get_trees(self) -> list[TreesSchema]:

        result = await self.get_trees_use_case.execute()

        return [
            TreesSchema(id=t.id, title=t.title, dependencies=t.dependencies, nodes=t.nodes)
            for t in result.trees
        ]
