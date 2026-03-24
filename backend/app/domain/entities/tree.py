from app.domain.entities.result import Result


class Node:
    def __init__(self, node_id: str, q: str, y_res: "Result | Node", n_res: "Result | Node"):
        self._id: str = node_id
        self._question: str = q
        self._yes: Node | Result = y_res
        self._no: Node | Result = n_res

    def to_dict(self) -> dict:
        return {
            "id": self._id,
            "question": self._question,
            "yes": self._yes.get_id if isinstance(self._yes, Node) else self._yes.value,
            "no": self._no.get_id if isinstance(self._no, Node) else self._no.value,
        }

    @property
    def get_id(self) -> str:
        return self._id

    @property
    def get_question(self) -> str:
        return self._question

    @property
    def get_yes(self) -> "Node | Result":
        return self._yes

    @property
    def get_no(self) -> "Node | Result":
        return self._no


class DecisionTree:
    def __init__(
        self,
        id: str,
        title: str,
        dependencies: list[str] | None = None,
        nodes: list[Node] | None = None,
    ):
        self._id = id
        self._title = title
        self._dependencies = dependencies or []
        self._nodes = nodes or []

    def __iter__(self):
        for node in self._nodes:
            yield node.to_dict()

    @property
    def get_id(self) -> str:
        return self._id

    @property
    def get_title(self) -> str:
        return self._title

    @property
    def get_dependencies(self) -> list[str]:
        return list(self._dependencies)

    @property
    def nodes(self) -> list[Node]:
        return list(self._nodes)
