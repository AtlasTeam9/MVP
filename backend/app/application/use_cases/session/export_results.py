from app.application.interfaces.export_results_use_case import IExportResultsUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.use_cases.session.dtos.requests import ExportResultsRequest
from app.application.use_cases.session.dtos.responses import ExportResultsResponse
from app.domain.exceptions import SessionNotFoundException, UnsupportedExportFormatException
from app.domain.interfaces.export_strategy import ExportStrategy
from app.domain.services.exporters.csv_exporter import CsvExporter
from app.domain.services.exporters.pdf_exporter import PdfExporter

_EXPORTERS: dict[str, ExportStrategy] = {
    "csv": CsvExporter(),
    "pdf": PdfExporter(),
}


class ExportResultsUseCase(IExportResultsUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: ExportResultsRequest) -> ExportResultsResponse:
        session = self._session_service.get_session(request.session_id)
        if session is None:
            raise SessionNotFoundException(request.session_id)

        exporter = _EXPORTERS.get(request.format)
        if exporter is None:
            raise UnsupportedExportFormatException(request.format, list(_EXPORTERS.keys()))

        content = exporter.export(
            results=session.results.to_dict(),
            device_name=session.get_device.get_name,
        )

        return ExportResultsResponse(
            content=content,
            media_type=exporter.media_type,
            filename=exporter.filename,
        )
