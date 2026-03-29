from app.domain.entities.device import Asset
from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree, Node

from .session_state import SessionState


class AnswerResult:
    """
    Valore di ritorno di answer().
    Indica cosa è successo dopo la risposta.
    """

    def __init__(
        self,
        next_node: Node | None = None,
        tree_result: Result | None = None,
        tree_completed: bool = False,
        session_finished: bool = False,
    ):
        self.next_node = next_node
        self.tree_result = tree_result
        self.tree_completed = tree_completed
        self.session_finished = session_finished


class GoBackResult:
    """Valore di ritorno di go_back()."""

    def __init__(
        self,
        node: Node | None = None,
        found: bool = False,
    ):
        self.node = node  # nodo su cui l'utente deve rispondere di nuovo
        self.found = found  # False se il nodo richiesto non era nello stack


class SessionNavigator:
    def __init__(self, state: SessionState, assets: list[Asset], trees: list[DecisionTree]):
        self.state = state
        self._assets = assets
        self._trees = trees

    def current_asset(self) -> Asset | None:
        if self.state.current_asset_index >= len(self._assets):
            return None
        return self._assets[self.state.current_asset_index]

    def current_tree(self) -> DecisionTree | None:
        if self.state.current_tree_index >= len(self._trees):
            return None
        return self._trees[self.state.current_tree_index]

    def current_node(self) -> Node | None:
        """Nodo corrente all'interno del tree attivo."""
        if self.state.current_node is not None:
            return self.state.current_node

        tree = self.current_tree()
        if tree is None or not tree.nodes:
            return None

        self.state.current_node = tree.nodes[0]
        return self.state.current_node

    def answer(self, ans: bool) -> AnswerResult:
        """
        Processa la risposta (sì/no) al nodo corrente.

        - Se il ramo porta a un altro Node  → aggiorna current_node e lo restituisce.
        - Se il ramo porta a un Result      → il tree è completato; avanza al prossimo tree (o asset) e restituisce il risultato da registrare.
        """
        if self.state.is_finished:
            return AnswerResult(session_finished=True)

        node = self.current_node()
        if node is None:
            return AnswerResult(session_finished=self.state.is_finished)

        branch: Node | Result = node._yes if ans else node._no

        self.state.push(node, ans)

        if isinstance(branch, Node):
            # Ancora dentro il tree
            self.state.current_node = branch
            return AnswerResult(next_node=branch)

        # Foglia: branch è un Result
        result = branch
        self._advance_tree()
        return AnswerResult(
            tree_result=result,
            tree_completed=True,
            session_finished=self.state.is_finished,
        )

    def go_back(
        self,
        target_node: Node,
        target_asset_index: int | None = None,
        target_tree_index: int | None = None,
    ) -> GoBackResult:
        """
        Torna a target_node cancellando tutte le risposte successive.

        Restituisce GoBackResult con found=False se il nodo non era
        nello stack (es. il frontend ha mandato un nodo sbagliato).
        """
        found = self.state.pop_until(
            target_node,
            target_asset_index=target_asset_index,
            target_tree_index=target_tree_index,
        )

        if not found:
            return GoBackResult(found=False)

        self.state.current_node = target_node
        return GoBackResult(node=target_node, found=True)

    def navigation_history(self) -> list[dict]:
        """
        Restituisce la lista dei nodi già risposti nel tree corrente,
        """
        return [
            {
                "asset_index": asset_index,
                "tree_index": tree_index,
                "node_id": node.get_id,
                "question": node.get_question,
                "answer": answer,
            }
            for asset_index, tree_index, node, answer in self.state.navigation_stack
        ]

    def _advance_tree(self) -> None:
        """Avanza al prossimo tree (o asset se i tree sono esauriti)."""
        if self.state.is_finished:
            return

        self.state.next_tree()

        if self.state.current_tree_index >= len(self._trees):
            self.state.next_asset()

        if self.state.current_asset_index >= len(self._assets):
            self.state.is_finished = True

    def next(self) -> None:
        self._advance_tree()
