from ..entities.tree import Node


class SessionState:
    def __init__(self):
        self.current_asset_index: int = 0
        self.current_tree_index: int = 0
        self.current_node: Node | None = None
        self.is_finished = False
        self.navigation_stack: list[tuple[Node, bool]] = []

    def push(self, node: Node, answer: bool) -> None:
        self.navigation_stack.append((node, answer))

    def pop_until(self, target_node: Node) -> bool:
        """
        Rimuove dallo stack tutte le entry dal fondo fino a target_node (incluso).
        Restituisce True se il nodo è stato trovato, False se non era nello stack.
        """
        for i in range(len(self.navigation_stack) - 1, -1, -1):
            if self.navigation_stack[i][0] is target_node:
                self.navigation_stack = self.navigation_stack[:i]
                return True
        return False

    def clear_stack(self) -> None:
        self.navigation_stack = []

    def next_tree(self) -> None:
        self.current_tree_index += 1
        self.current_node = None
        self.clear_stack()

    def next_asset(self) -> None:
        self.current_asset_index += 1
        self.current_tree_index = 0
        self.current_node = None
        self.clear_stack()
