# app/application/interfaces/i_create_session_use_case.py
from abc import ABC, abstractmethod

from app.application.use_cases.session.dto import (
    CreateSessionWithFileRequest,
    CreateSessionWithFileResponse,
)


class ICreateSessionWithFileUseCase(ABC):
    @abstractmethod
    async def execute(
        self, request: CreateSessionWithFileRequest
    ) -> CreateSessionWithFileResponse: ...
