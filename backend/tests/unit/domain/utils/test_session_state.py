import pytest

from app.domain.utils.session_state import SessionState


class TestSessionState:
    @pytest.fixture
    def fresh_state(self) -> SessionState:
        """Fornisce un'istanza pulita di SessionState per ogni test."""
        return SessionState()

    def test_initial_state(self, fresh_state: SessionState):
        assert fresh_state.current_asset_index == 0
        assert fresh_state.current_tree_index == 0
        assert fresh_state.current_node is None
        assert fresh_state.is_finished is False
        assert fresh_state.navigation_stack == []

    def test_push(self, fresh_state: SessionState, sample_nodes):
        node1 = sample_nodes[0]

        fresh_state.push(node1, True)

        assert len(fresh_state.navigation_stack) == 1
        assert fresh_state.navigation_stack[0] == (0, node1, True)

        # Aggiungiamo un secondo elemento
        node2 = sample_nodes[1]
        fresh_state.push(node2, False)

        assert len(fresh_state.navigation_stack) == 2
        assert fresh_state.navigation_stack[1] == (0, node2, False)

    def test_clear_stack(self, fresh_state: SessionState, sample_nodes):
        fresh_state.push(sample_nodes[0], True)
        fresh_state.push(sample_nodes[1], False)

        assert len(fresh_state.navigation_stack) == 2

        fresh_state.clear_stack()
        assert fresh_state.navigation_stack == []

    def test_pop_until_node_found_in_middle(self, fresh_state: SessionState, sample_nodes):
        # Prepariamo lo stack con 3 nodi
        node1, node2, node3 = sample_nodes
        fresh_state.push(node1, True)
        fresh_state.push(node2, False)
        fresh_state.push(node3, True)

        # Vogliamo tornare a node2. Questo dovrebbe rimuovere node3 e node2 dallo stack,
        # lasciando solo node1 (perché pop_until affetta l'array fino a `i` escluso)
        found = fresh_state.pop_until(node2)

        assert found is True
        assert len(fresh_state.navigation_stack) == 1
        assert fresh_state.navigation_stack[0][1] is node1

    def test_pop_until_node_found_at_bottom(self, fresh_state: SessionState, sample_nodes):
        # Se torniamo al primissimo nodo, lo stack dovrebbe svuotarsi
        node1, node2 = sample_nodes[:2]
        fresh_state.push(node1, True)
        fresh_state.push(node2, False)

        found = fresh_state.pop_until(node1)

        assert found is True
        assert fresh_state.navigation_stack == []

    def test_pop_until_node_not_found(self, fresh_state: SessionState, sample_nodes):
        # Prepariamo lo stack con i primi due nodi
        node1, node2, node3 = sample_nodes
        fresh_state.push(node1, True)
        fresh_state.push(node2, False)

        # Cerchiamo un nodo che non è mai stato inserito nello stack
        found = fresh_state.pop_until(node3)

        assert found is False
        # Lo stack deve rimanere intatto
        assert len(fresh_state.navigation_stack) == 2

    def test_next_tree(self, fresh_state: SessionState, sample_nodes):
        # "Sporchiamo" lo stato per simulare di essere a metà di un albero
        fresh_state.current_tree_index = 0
        fresh_state.current_node = sample_nodes[0]
        fresh_state.push(sample_nodes[0], True)

        fresh_state.next_tree()

        assert fresh_state.current_tree_index == 1
        assert fresh_state.current_node is None
        assert fresh_state.navigation_stack == [(0, sample_nodes[0], True)]
        # current_asset_index non deve cambiare
        assert fresh_state.current_asset_index == 0

    def test_next_asset(self, fresh_state: SessionState, sample_nodes):
        # "Sporchiamo" lo stato simulando di essere avanzati parecchio
        fresh_state.current_asset_index = 1
        fresh_state.current_tree_index = 5
        fresh_state.current_node = sample_nodes[1]
        fresh_state.push(sample_nodes[1], False)

        fresh_state.next_asset()

        assert fresh_state.current_asset_index == 2
        # Il tree index si deve azzerare per il nuovo asset
        assert fresh_state.current_tree_index == 0
        assert fresh_state.current_node is None
        assert fresh_state.navigation_stack == []
