# app/application/interfaces/i_create_session_use_case.py
from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import CreateSessionWithFileRequest
from app.application.use_cases.session.dtos.responses import CreateSessionWithFileResponse


class ICreateSessionWithFileUseCase(ABC):
    @abstractmethod
    async def execute(
        self, request: CreateSessionWithFileRequest
    ) -> CreateSessionWithFileResponse: ...
