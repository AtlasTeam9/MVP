from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import AnswerRequest
from app.application.use_cases.session.dtos.responses import AnswerResponse


class IAnswerUseCase(ABC):
    @abstractmethod
    async def execute(self, request: AnswerRequest) -> AnswerResponse: ...
