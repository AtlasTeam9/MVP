from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import DeleteSessionRequest


class IDeleteSessionUseCase(ABC):
    @abstractmethod
    async def execute(self, request: DeleteSessionRequest) -> None: ...
