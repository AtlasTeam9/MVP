from uuid import uuid4

from app.domain.entities.device import Device
from app.domain.entities.session import Session
from app.domain.interfaces.tree_provider import TreeProvider
from app.domain.utils.dependency_evaluator import DependencyEvaluator
from app.domain.utils.result_store import ResultStore
from app.domain.utils.session_navigator import SessionNavigator
from app.domain.utils.session_state import SessionState


class SessionFactory:
    def __init__(self, tree_provider: TreeProvider):
        self._tree_provider = tree_provider

    def create(self, device: Device, session_id: str | None = None) -> Session:
        trees = self._tree_provider.get_all()
        state = SessionState()
        results = ResultStore(device.get_assets)
        navigator = SessionNavigator(state, device.get_assets, trees)
        evaluator = DependencyEvaluator(results)

        return Session(
            id=session_id or str(uuid4()),
            device=device,
            trees=trees,
            state=state,
            results=results,
            navigator=navigator,
            dependency_evaluator=evaluator,
        )

    def restore(self, device: Device, session_id: str) -> Session:
        """
        Crea una Session partendo da dati già persistiti.
        """
        trees = self._tree_provider.get_all()
        state = SessionState()
        results = ResultStore(device.get_assets)
        navigator = SessionNavigator(state, device.get_assets, trees)
        evaluator = DependencyEvaluator(results)

        return Session(
            id=session_id,
            device=device,
            trees=trees,
            state=state,
            results=results,
            navigator=navigator,
            dependency_evaluator=evaluator,
        )
