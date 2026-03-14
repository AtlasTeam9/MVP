from typing import Protocol

from app.domain.entities.tree import DecisionTree


class TreeProvider(Protocol):
    def get_all(self) -> list[DecisionTree]: ...
