from abc import ABC, abstractmethod


class IGetTreesUseCase(ABC):
    @abstractmethod
    async def execute(self) -> list[dict]: ...
