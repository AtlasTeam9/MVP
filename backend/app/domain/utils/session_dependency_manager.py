from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree

from .dependency_evaluator import DependencyEvaluator
from .result_store import ResultStore
from .session_navigator import SessionNavigator


class SessionDependencyManager:
    """
    Gestisce le regole di dipendenza tra tree durante la navigazione
    e quando una risposta viene modificata.
    """

    def __init__(
        self,
        results: ResultStore,
        navigator: SessionNavigator,
        dependency_evaluator: DependencyEvaluator,
        trees: list[DecisionTree],
    ):
        self._results = results
        self._navigator = navigator
        self._dependencies = dependency_evaluator
        self._trees = trees

    def reset_changed_tree_and_dependents(self, asset_id: str, tree_index: int) -> None:
        if tree_index < 0 or tree_index >= len(self._trees):
            return

        affected_tree_ids = {self._trees[tree_index].get_id}

        # Propagazione in avanti: solo i tree successivi possono dipendere da uno precedente.
        for i in range(tree_index + 1, len(self._trees)):
            tree = self._trees[i]
            if any(dep in affected_tree_ids for dep in tree.get_dependencies):
                affected_tree_ids.add(tree.get_id)

        for tree_id in affected_tree_ids:
            self._results.reset(asset_id, tree_id)

    def skip_invalid_trees(self) -> None:
        """
        Scorre in avanti gli alberi se le loro dipendenze non sono soddisfatte.
        Registra Result.NOT_APPLICABLE per gli alberi saltati, permettendo
        l'effetto a catena.
        """
        while not self._navigator.state.is_finished:
            asset = self._navigator.current_asset()
            tree = self._navigator.current_tree()

            if not asset or not tree:
                break

            # Se le dipendenze sono OK, ci fermiamo e facciamo rispondere l'utente
            if self._dependencies.check(asset.get_id, tree):
                break

            self._results.record(asset.get_id, tree.get_id, Result.NOT_APPLICABLE)
            self._navigator.next()
