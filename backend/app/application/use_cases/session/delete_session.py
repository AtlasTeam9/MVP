from app.application.interfaces.delete_session_use_case import IDeleteSessionUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.use_cases.session.dtos.requests import DeleteSessionRequest
from app.domain.exceptions import SessionNotFoundException


class DeleteSessionUseCase(IDeleteSessionUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: DeleteSessionRequest) -> None:
        if self._session_service.get_session(request.session_id) is None:
            raise SessionNotFoundException(request.session_id)

        self._session_service.delete_session(request.session_id)
