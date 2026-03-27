import json

from app.application.interfaces.session_service import ISessionService
from app.application.interfaces.use_cases.export_session import IExportSessionUseCase
from app.application.use_cases.session.dtos.requests import ExportSessionRequest
from app.application.use_cases.session.dtos.responses import ExportSessionResponse
from app.domain.exceptions import SessionNotFoundException


class ExportSessionUseCase(IExportSessionUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: ExportSessionRequest) -> ExportSessionResponse:
        session = self._session_service.get_session(request.session_id)
        if session is None:
            raise SessionNotFoundException(request.session_id)

        data = {
            "session_id": session.get_id,
            "device": session.get_device.to_dict(),
            "position": {
                "current_asset_index": session.state.current_asset_index,
                "current_tree_index": session.state.current_tree_index,
                "current_node_id": session.state.current_node_id,
            },
            "results": session.results.to_dict(),
            "answer": request.answers,
            "is_finished": session.state.is_finished,
        }

        content = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
        filename = f"session_{session.get_id}.json"

        return ExportSessionResponse(content=content, filename=filename)
