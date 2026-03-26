from app.domain.utils.dependency_evaluator import DependencyEvaluator
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
            self._skip_invalid_trees()

            # Aggiorniamo il risultato ritornato per riflettere lo stato corretto
            # della sessione dopo eventuali salti (es. se abbiamo saltato tutti gli
            # alberi rimanenti, la sessione è finita)
            answer_result.session_finished = self.state.is_finished

        return answer_result

    def go_back(self, target_node: Node) -> GoBackResult:
        return self.navigator.go_back(target_node)

    def reset_changed_tree_and_dependents(self, asset_index: int, tree_index: int) -> None:
        """
        Resetta il risultato del tree modificato e dei tree successivi che
        dipendono (direttamente o indirettamente) da esso, limitatamente
        all'asset indicato.
        """
        assets = self.get_assets
        trees = self.get_trees

        if asset_index < 0 or asset_index >= len(assets):
            return
        if tree_index < 0 or tree_index >= len(trees):
            return

        asset_id = assets[asset_index].get_id
        affected_tree_ids = {trees[tree_index].get_id}

        # Propagazione in avanti: solo i tree successivi possono dipendere da uno precedente.
        for i in range(tree_index + 1, len(trees)):
            tree = trees[i]
            if any(dep in affected_tree_ids for dep in tree.get_dependencies):
                affected_tree_ids.add(tree.get_id)

        for tree_id in affected_tree_ids:
            self.results.reset(asset_id, tree_id)

    def _skip_invalid_trees(self) -> None:
        """
        Scorre in avanti gli alberi se le loro dipendenze non sono soddisfatte.
        Registra Result.NOT_APPLICABLE per gli alberi saltati, permettendo
        l'effetto a catena.
        """
        while not self.state.is_finished:
            asset = self.current_asset
            tree = self.current_tree

            if not asset or not tree:
                break

            # Se le dipendenze sono OK, ci fermiamo e facciamo rispondere l'utente
            if self.dependencies.check(asset.get_id, tree):
                break

            self.results.record(asset.get_id, tree.get_id, Result.NOT_APPLICABLE)

            self.navigator.next()
