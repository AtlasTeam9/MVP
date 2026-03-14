from app.domain.entities.tree import DecisionTree

from .result_store import ResultStore


class DependencyEvaluator:
    def __init__(self, result_store: ResultStore):
        self._results = result_store

    def check(self, asset_id: str, tree: DecisionTree) -> bool:

        deps = tree.get_dependencies

        if not deps:
            return True

        for dep in deps:
            result = self._results.get(asset_id, dep)

            if result is None:
                return False

            if result.value in ("FAIL", "NOT_APPLICABLE"):
                return False

        return True
