from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import ExportSessionRequest
from app.application.use_cases.session.dtos.responses import ExportSessionResponse


class IExportSessionUseCase(ABC):
    @abstractmethod
    async def execute(self, request: ExportSessionRequest) -> ExportSessionResponse: ...
