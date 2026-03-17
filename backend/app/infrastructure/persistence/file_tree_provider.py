from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree, Node
from app.domain.interfaces.tree_provider import TreeProvider
from app.infrastructure.persistence.file_storage import FileStorage


class FileTreeProvider(TreeProvider):
    def __init__(self, storage: FileStorage):
        self._storage = storage
        self._cache: list[DecisionTree] | None = None

    def _resolve_ref(self, ref: str, nodes: dict[str, Node]) -> Node | Result:
        if ref in nodes:
            return nodes[ref]

        result_map = {
            "result_pass": Result.PASS,
            "result_fail": Result.FAIL,
            "result_na": Result.NOT_APPLICABLE,
        }
        return result_map[ref]

    def _build_nodes(self, nodes_data: dict) -> list[Node]:
        nodes: dict[str, Node] = {}

        for key, node_data in reversed(nodes_data.items()):
            nodes[key] = Node(
                node_id=key,
                q=node_data["question"],
                y_res=self._resolve_ref(node_data["true"], nodes),
                n_res=self._resolve_ref(node_data["false"], nodes),
            )

        return [nodes[key] for key in nodes_data.keys()]

    def get_all(self) -> list[DecisionTree]:
        if self._cache is None:
            data = self._storage.load_trees()
            self._cache = [
                DecisionTree(
                    d["id"],
                    d["title"],
                    d["dependencies"],
                    list(self._build_nodes(d["nodes"])),
                )
                for d in data
            ]
        return self._cache
