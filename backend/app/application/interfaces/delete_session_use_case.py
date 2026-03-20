from abc import ABC, abstractmethod


class IDeleteSessionUseCase(ABC):
    @abstractmethod
    async def execute(self, session_id: str) -> None: ...
