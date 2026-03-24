# app/application/interfaces/i_create_session_use_case.py
from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import CreateSessionRequest
from app.application.use_cases.session.dtos.responses import CreateSessionResponse


class ICreateSessionUseCase(ABC):
    @abstractmethod
    async def execute(self, request: CreateSessionRequest) -> CreateSessionResponse: ...
