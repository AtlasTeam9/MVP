from abc import ABC, abstractmethod

from app.application.use_cases.session.dto import AnswerRequest, AnswerResponse


class IAnswerUseCase(ABC):
    @abstractmethod
    async def execute(self, request: AnswerRequest) -> AnswerResponse: ...
