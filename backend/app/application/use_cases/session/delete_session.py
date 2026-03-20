from fastapi import HTTPException

from app.application.interfaces.delete_session_use_case import IDeleteSessionUseCase
from app.application.interfaces.session_service import ISessionService


class DeleteSessionUseCase(IDeleteSessionUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, session_id: str) -> None:
        if self._session_service.get_session(session_id) is None:
            raise HTTPException(status_code=404, detail="Sessione non trovata.")

        self._session_service.delete_session(session_id)
