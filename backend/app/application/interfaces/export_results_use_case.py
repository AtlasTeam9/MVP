from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import ExportResultsRequest
from app.application.use_cases.session.dtos.responses import ExportResultsResponse


class IExportResultsUseCase(ABC):
    @abstractmethod
    async def execute(self, request: ExportResultsRequest) -> ExportResultsResponse: ...
