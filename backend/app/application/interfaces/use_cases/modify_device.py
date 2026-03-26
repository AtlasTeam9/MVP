from abc import ABC, abstractmethod

from app.application.use_cases.session.dtos.requests import ModifyDeviceRequest


class IModifyDeviceUseCase(ABC):
    @abstractmethod
    async def execute(self, request: ModifyDeviceRequest) -> None: ...
