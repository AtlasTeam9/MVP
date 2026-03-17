from abc import ABC, abstractmethod

from app.domain.entities.device import Device
from app.domain.entities.session import Session


class ISessionService(ABC):
    @abstractmethod
    def create_session(self, device: Device) -> Session: ...
