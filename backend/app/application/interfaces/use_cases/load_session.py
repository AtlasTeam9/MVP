from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import LoadSessionRequest
from app.application.use_cases.session.dtos.responses import LoadSessionResponse


class ILoadSessionUseCase(ABC):
    @abstractmethod
    async def execute(self, request: LoadSessionRequest) -> LoadSessionResponse: ...
