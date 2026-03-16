import pytest

from app.domain.entities.device import Asset, AssetType
from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree, Node
from app.domain.utils.session_navigator import AnswerResult, GoBackResult, SessionNavigator
from app.domain.utils.session_state import SessionState


class TestAnswerResult:
    def test_answer_result_initialization(self):
        # Testiamo i valori di default
        res1 = AnswerResult()
        assert res1.next_node is None
        assert res1.tree_result is None
        assert res1.tree_completed is False
        assert res1.session_finished is False

        # Testiamo i valori custom
        node = Node("Q?", Result.PASS, Result.FAIL)
        res2 = AnswerResult(
            next_node=node, tree_result=Result.PASS, tree_completed=True, session_finished=True
        )
        assert res2.next_node == node
        assert res2.tree_result == Result.PASS
        assert res2.tree_completed is True
        assert res2.session_finished is True


class TestGoBackResult:
    def test_go_back_result_initialization(self):
        # Default
        res1 = GoBackResult()
        assert res1.node is None
        assert res1.found is False

        # Custom
        node = Node("Q?", Result.PASS, Result.FAIL)
        res2 = GoBackResult(node=node, found=True)
        assert res2.node == node
        assert res2.found is True


class TestSessionNavigator:
    @pytest.fixture
    def sample_assets(self):
        return [
            Asset("a1", "Router", AssetType.NETWORK),
            Asset("a2", "Firewall", AssetType.SECURITY),
        ]

    @pytest.fixture
    def fresh_state(self):
        return SessionState()

    @pytest.fixture
    def navigator(self, fresh_state, sample_assets, sample_trees_objects):
        return SessionNavigator(fresh_state, sample_assets, sample_trees_objects)

    # --- Test per current_asset e current_tree ---

    def test_current_asset(self, navigator: SessionNavigator):

        current_asset = navigator.current_asset()
        if current_asset:
            assert current_asset.get_id == "a1"

        # Avanziamo all'asset 1
        navigator.state.current_asset_index = 1
        current_asset = navigator.current_asset()
        if current_asset:
            assert current_asset.get_id == "a2"

        # Fuori range
        navigator.state.current_asset_index = 2
        assert navigator.current_asset() is None

    def test_current_tree(self, navigator: SessionNavigator):
        # Inizialmente al tree 0
        current_tree = navigator.current_tree()
        if current_tree:
            assert current_tree.get_id == "tree_01"

        # Avanziamo al tree 1
        navigator.state.current_tree_index = 1
        current_tree = navigator.current_tree()

        if current_tree:
            assert current_tree.get_id == "tree_02"

        # Fuori range
        navigator.state.current_tree_index = 2
        assert navigator.current_tree() is None

    def test_current_node_initial(self, navigator: SessionNavigator):
        # Se current_node è None, prende il primo nodo del tree corrente
        node = navigator.current_node()
        assert node is not None
        assert node._question == "Q1?"
        # Verifica che sia stato salvato nello stato
        assert navigator.state.current_node == node

    def test_current_node_already_set(
        self, navigator: SessionNavigator, sample_trees_objects: list[DecisionTree]
    ):
        # Se lo stato ha già un nodo, restituisce quello
        target_node = sample_trees_objects[0].nodes[1]  # Q2
        navigator.state.current_node = target_node

        assert navigator.current_node() == target_node

    def test_current_node_empty_tree(self, fresh_state, sample_assets):
        # Se il tree corrente non ha nodi, restituisce None
        empty_tree = DecisionTree("t3", "Empty")
        nav_empty = SessionNavigator(fresh_state, sample_assets, [empty_tree])

        assert nav_empty.current_node() is None

    # --- Test per answer() e avanzamento ---

    def test_answer_session_already_finished(self, navigator: SessionNavigator):
        navigator.state.is_finished = True
        result = navigator.answer(True)
        assert result.session_finished is True

    def test_answer_no_current_node(self, navigator: SessionNavigator):
        # Forziamo una situazione in cui non c'è nodo
        navigator.state.current_tree_index = 99
        result = navigator.answer(True)
        assert result.session_finished is False  # Non necessariamente finita, ma senza nodo
        assert result.next_node is None

    def test_answer_branch_to_next_node(self, navigator: SessionNavigator):
        # Q1 -> False (porta a Q2)
        initial_node = navigator.current_node()
        result = navigator.answer(False)

        if result.next_node and navigator.state.current_node:
            assert result.next_node.get_question == "Q2?"
            assert result.tree_completed is False
            assert navigator.state.current_node.get_question == "Q2?"

        assert len(navigator.state.navigation_stack) == 1
        assert navigator.state.navigation_stack[0] == (initial_node, False)

    def test_answer_branch_to_result(self, navigator: SessionNavigator):
        # Q1 -> True (porta a Result.NOT_APPLICABLE)
        result = navigator.answer(True)

        assert result.tree_result == Result.NOT_APPLICABLE
        assert result.tree_completed is True
        assert result.session_finished is False
        # Ha avanzato il tree? (Assumendo che next_tree() incrementi l'indice)
        assert navigator.state.current_tree_index == 1

    def test_answer_completes_session(self, navigator: SessionNavigator):
        # Facciamo una run completa per finire la sessione
        # Asset 1, Tree 1 -> Q1: Yes
        navigator.answer(True)
        # Asset 1, Tree 2 -> Q3: Yes
        navigator.answer(True)
        # Asset 2, Tree 1 -> Q1: Yes
        navigator.answer(True)
        # Asset 2, Tree 2 -> Q3: Yes
        final_result = navigator.answer(True)

        assert final_result.tree_result == Result.PASS
        assert final_result.tree_completed is True
        assert final_result.session_finished is True
        assert navigator.state.is_finished is True

    def test_advance_tree_when_finished(self, navigator: SessionNavigator):
        navigator.state.is_finished = True
        # Non dovrebbe lanciare eccezioni o cambiare stato inaspettatamente
        navigator._advance_tree()
        assert navigator.state.is_finished is True

    def test_next_method(self, navigator: SessionNavigator):
        assert navigator.state.current_tree_index == 0
        navigator.next()
        assert navigator.state.current_tree_index == 1

    def test_go_back_not_found(self, navigator: SessionNavigator):
        target_node = Node("Fake", Result.PASS, Result.FAIL)
        # Assumiamo che pop_until ritorni False se non trova il nodo
        navigator.state.pop_until(target_node)
        result = navigator.go_back(target_node)
        assert result.found is False
        assert result.node is None

    def test_go_back_found(
        self, navigator: SessionNavigator, sample_trees_objects: list[DecisionTree]
    ):
        target_node = sample_trees_objects[0].nodes[0]

        # 1. Popoliamo lo stack REALE inserendo il target_node
        navigator.state.push(target_node, True)

        # 2. Ora chiamiamo go_back, che internamente userà pop_until
        result = navigator.go_back(target_node)

        # 3. Ora lo troverà sicuramente!
        assert result.found is True
        assert result.node == target_node
        assert navigator.state.current_node == target_node

    def test_navigation_history(
        self, navigator: SessionNavigator, sample_trees_objects: list[DecisionTree]
    ):
        # Prepariamo uno stack finto
        node1 = sample_trees_objects[0].nodes[0]
        node2 = sample_trees_objects[0].nodes[1]
        navigator.state.navigation_stack = [(node1, True), (node2, False)]

        history = navigator.navigation_history()

        assert len(history) == 2
        assert history[0] == {"question": "Q1?", "answer": True}
        assert history[1] == {"question": "Q2?", "answer": False}
