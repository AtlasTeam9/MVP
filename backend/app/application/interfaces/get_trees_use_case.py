from abc import ABC, abstractmethod

from app.application.use_cases.trees.dtos.responses import GetTreesResponse


class IGetTreesUseCase(ABC):
    @abstractmethod
    async def execute(self) -> list[GetTreesResponse]: ...
