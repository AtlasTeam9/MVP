from app.domain.entities.session import Session
from app.domain.entities.tree import DecisionTree


class AppState:
    trees: list[DecisionTree] = []
    sessions: dict[str, Session] = {}
