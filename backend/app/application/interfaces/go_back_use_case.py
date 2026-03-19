from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import GoBackRequest
from app.application.use_cases.session.dtos.responses import GoBackResponse


class IGoBackUseCase(ABC):
    @abstractmethod
    async def execute(self, request: GoBackRequest) -> GoBackResponse: ...
