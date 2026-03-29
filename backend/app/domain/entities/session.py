from app.domain.utils.dependency_evaluator import DependencyEvaluator
from app.domain.utils.dependency_manager import DependencyManager
from app.domain.utils.result_store import ResultStore
from app.domain.utils.session_navigator import AnswerResult, GoBackResult, SessionNavigator
from app.domain.utils.session_state import SessionState

from .device import Asset, Device
from .result import Result
from .tree import DecisionTree, Node


class Session:
    """
    Rappresenta una sessione.
    Contiene lo stato e la logica per l'avanzamento.
    """

    def __init__(
        self,
        id: str,
        device: Device,
        trees: list[DecisionTree],
        state: SessionState,
        results: ResultStore,
        navigator: SessionNavigator,
        dependency_evaluator: DependencyEvaluator,
    ):
        self._id = id
        self._device = device
        self._trees = trees
        self.state = state
        self.results = results
        self.navigator = navigator
        self.dependencies = dependency_evaluator
        self._dependency_manager = DependencyManager(
            results=results,
            navigator=navigator,
            dependency_evaluator=dependency_evaluator,
            trees=trees,
        )

    @property
    def get_id(self) -> str:
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

    @property
    def navigation_history(self) -> list[dict]:
        return self.navigator.navigation_history()

    @property
    def get_trees(self) -> list[DecisionTree]:
        return self._trees

    def record_result(self, result: Result) -> None:

        asset = self.current_asset
        tree = self.current_tree

        if asset and tree:
            self.results.record(asset.get_id, tree.get_id, result)

    def answer(self, ans: bool) -> AnswerResult:
        asset = self.current_asset
        tree = self.current_tree

        answer_result: AnswerResult = self.navigator.answer(ans)

        # Se l'albero è finito, salviamo il risultato
        if answer_result.tree_completed and answer_result.tree_result is not None:
            if asset and tree:
                self.results.record(asset.get_id, tree.get_id, answer_result.tree_result)

            # Il navigatore è passato automaticamente al prossimo albero. Controlliamo se va saltato!
            self.skip_invalid_trees()

            answer_result.session_finished = self.state.is_finished

        return answer_result

    def go_back(
        self,
        target_node: Node,
        target_asset_index: int | None = None,
        target_tree_index: int | None = None,
    ) -> GoBackResult:
        return self.navigator.go_back(
            target_node,
            target_asset_index=target_asset_index,
            target_tree_index=target_tree_index,
        )

    def reset_changed_tree_and_dependents(self, asset_index: int, tree_index: int) -> None:
        assets = self.get_assets

        if asset_index < 0 or asset_index >= len(assets):
            return

        asset_id = assets[asset_index].get_id
        self._dependency_manager.reset_changed_tree_and_dependents(asset_id, tree_index)

    def skip_invalid_trees(self) -> None:
        self._dependency_manager.skip_invalid_trees()
