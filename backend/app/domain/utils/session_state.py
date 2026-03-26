from ..entities.tree import Node


class SessionState:
    def __init__(self):
        self.current_asset_index: int = 0
        self.current_tree_index: int = 0
        self.current_node: Node | None = None
        self.is_finished = False
        self.navigation_stack: list[tuple[int, int, Node, bool]] = []
        # (asset_index, tree_index, node, answer)

    @property
    def current_node_id(self) -> str:
        return self.current_node.get_id if self.current_node else ""

    def push(self, node: Node, answer: bool) -> None:
        self.navigation_stack.append(
            (self.current_asset_index, self.current_tree_index, node, answer)
        )

    def pop_until(self, target_node: Node) -> bool:
        """
        Rimuove dallo stack tutte le entry dal fondo fino a target_node (incluso).
        Ripristina anche asset e albero correnti.
        """
        for i in range(len(self.navigation_stack) - 1, -1, -1):
            asset_index, tree_index, node, _ = self.navigation_stack[i]
            if node is target_node:
                self.current_asset_index = asset_index
                self.current_tree_index = tree_index
                self.is_finished = False
                self.navigation_stack = self.navigation_stack[:i]
                return True
        return False

    def clear_stack(self) -> None:
        self.navigation_stack = []

    def next_tree(self) -> None:
        self.current_tree_index += 1
        self.current_node = None

    def next_asset(self) -> None:
        self.current_asset_index += 1
        self.current_tree_index = 0
        self.current_node = None
