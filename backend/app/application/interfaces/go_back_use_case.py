from abc import ABC, abstractmethod

from app.application.use_cases.session.dto import GoBackRequest, GoBackResponse


class IGoBackUseCase(ABC):
    @abstractmethod
    async def execute(self, request: GoBackRequest) -> GoBackResponse: ...
