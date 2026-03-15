from uuid import uuid4

from app.domain.interfaces.tree_provider import TreeProvider
from app.domain.utils.dependency_evaluator import DependencyEvaluator
from app.domain.utils.result_store import ResultStore
from app.domain.utils.session_navigator import SessionNavigator
from app.domain.utils.session_state import SessionState

from .device import Asset, Device
from .result import Result
from .tree import DecisionTree, Node


class Session:
    """
    Rappresenta una sessione.
    Contiene lo stato e la logica per l'avanzamento.
    """

    def __init__(self, tree_provider: TreeProvider, device: Device, session_id: str | None = None):
        self._id: str = session_id or str(uuid4())
        self._trees = tree_provider.get_all()

        self._device: Device = device

        self.state = SessionState()

        self.results = ResultStore(self.get_assets)

        self.navigator = SessionNavigator(self.state, self.get_assets, self._trees)

        self.dependencies = DependencyEvaluator(self.results)

    @property
    def get_id(self):
        return self._id

    @property
    def get_assets(self) -> list[Asset]:
        return self._device.get_assets

    @property
    def get_device(self) -> Device:
        return self._device

    @property
    def current_asset(self) -> Asset | None:
        return self.navigator.current_asset()

    @property
    def current_tree(self) -> DecisionTree | None:
        return self.navigator.current_tree()

    @property
    def current_node(self) -> Node | None:
        return self.navigator.current_node()

    def record_result(self, result: Result):

        asset = self.current_asset
        tree = self.current_tree

        if asset and tree:
            self.results.record(asset.get_id, tree.get_id, result)

    def answer(self, ans: bool):
        """
        Processa la risposta al nodo corrente.
        Se il tree si completa, registra automaticamente il risultato.
        """
        from app.domain.utils.session_navigator import AnswerResult

        asset = self.current_asset
        tree = self.current_tree

        answer_result: AnswerResult = self.navigator.answer(ans)

        if answer_result.tree_completed and answer_result.tree_result is not None:
            if asset and tree:
                self.results.record(asset.get_id, tree.get_id, answer_result.tree_result)

        return answer_result

    def advance(self):
        self.navigator.next()

    def go_back(self, target_node: Node):
        return self.navigator.go_back(target_node)

    @property
    def navigation_history(self):
        return self.navigator.navigation_history()
