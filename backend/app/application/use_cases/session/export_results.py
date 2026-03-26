from app.application.interfaces.session_service import ISessionService
from app.application.interfaces.use_cases.export_results import IExportResultsUseCase
from app.application.use_cases.session.dtos.requests import ExportResultsRequest
from app.application.use_cases.session.dtos.responses import ExportResultsResponse
from app.domain.exceptions import SessionNotFoundException, UnsupportedExportFormatException
from app.domain.interfaces.export_strategy import ExportStrategy


class ExportResultsUseCase(IExportResultsUseCase):
    def __init__(self, session_service: ISessionService, exporters: dict[str, ExportStrategy]):
        self._session_service = session_service
        self._exporters = exporters

    async def execute(self, request: ExportResultsRequest) -> ExportResultsResponse:
        session = self._session_service.get_session(request.session_id)
        if session is None:
            raise SessionNotFoundException(request.session_id)

        exporter = self._exporters.get(request.format)
        if exporter is None:
            raise UnsupportedExportFormatException(request.format, list(self._exporters.keys()))

        content = exporter.export(
            results=session.results.get_aggregated_results(
                [tree.get_id for tree in session.get_trees]
            ),
            device_name=session.get_device.get_name,
        )

        return ExportResultsResponse(
            content=content,
            media_type=exporter.media_type,
            filename=exporter.filename,
        )
