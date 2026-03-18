from app.domain.entities.tree import DecisionTree


class AppState:
    trees: list[DecisionTree] = []
