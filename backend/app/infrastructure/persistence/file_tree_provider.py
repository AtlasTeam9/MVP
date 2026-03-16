from app.domain.entities.tree import DecisionTree
from app.domain.interfaces.tree_provider import TreeProvider
from app.infrastructure.persistence.file_storage import FileStorage


class FileTreeProvider(TreeProvider):
    def __init__(self, storage: FileStorage):
        self._storage = storage
        self._cache: list[DecisionTree] | None = None

    def get_all(self) -> list[DecisionTree]:
        if self._cache is None:
            data = self._storage.load_trees()
            self._cache = [
                DecisionTree(d["id"], d["title"], d["dependencies"], d["nodes"])
                for d in data["trees"]
            ]
        return self._cache
