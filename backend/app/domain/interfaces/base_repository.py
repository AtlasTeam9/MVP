from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar("T")


class BaseRepository(ABC, Generic[T]):
    @abstractmethod
    def save(self, entity: T) -> None: ...

    @abstractmethod
    def get(self, entity_id: str) -> T | None: ...

    @abstractmethod
    def delete(self, entity_id: str) -> None: ...
