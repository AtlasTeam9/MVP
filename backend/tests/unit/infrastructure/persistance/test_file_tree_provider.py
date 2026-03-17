"""
Unit tests per FileTreeProvider.
"""

import pytest

from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree, Node
from app.infrastructure.persistence.file_tree_provider import FileTreeProvider


@pytest.fixture
def single_node_tree_data():
    """Albero con un solo nodo che punta direttamente a due Result."""
    return [
        {
            "id": "tree_01",
            "title": "Single Node Tree",
            "dependencies": [],
            "nodes": {
                "node1": {
                    "question": "Is this a test?",
                    "true": "result_pass",
                    "false": "result_fail",
                }
            },
        }
    ]


@pytest.fixture
def multi_node_tree_data():
    """Albero con quattro nodi in catena, come nel JSON reale."""
    return [
        {
            "id": "tree_02",
            "title": "Multi Node Tree",
            "dependencies": [],
            "nodes": {
                "node1": {
                    "question": "Question 1?",
                    "true": "result_na",
                    "false": "node2",
                },
                "node2": {
                    "question": "Question 2?",
                    "true": "result_na",
                    "false": "node3",
                },
                "node3": {
                    "question": "Question 3?",
                    "true": "result_na",
                    "false": "node4",
                },
                "node4": {
                    "question": "Question 4?",
                    "true": "result_pass",
                    "false": "result_fail",
                },
            },
        }
    ]


@pytest.fixture
def multi_tree_data(single_node_tree_data, multi_node_tree_data):
    """Due alberi, il secondo con dipendenza dal primo."""
    data = single_node_tree_data + multi_node_tree_data
    data[1]["dependencies"] = ["tree_01"]
    return data


class TestFileTreeProvider:
    def test_resolves_existing_node(self, provider):
        node = Node(node_id="node1", q="Q?", y_res=Result.PASS, n_res=Result.FAIL)
        nodes = {"node1": node}

        result = provider._resolve_ref("node1", nodes)

        assert result is node

    def test_resolves_result_pass(self, provider):
        assert provider._resolve_ref("result_pass", {}) == Result.PASS

    def test_resolves_result_fail(self, provider):
        assert provider._resolve_ref("result_fail", {}) == Result.FAIL

    def test_resolves_result_na(self, provider):
        assert provider._resolve_ref("result_na", {}) == Result.NOT_APPLICABLE

    def test_unknown_ref_raises(self, provider):
        with pytest.raises(KeyError):
            provider._resolve_ref("result_unknown", {})

    def test_returns_correct_number_of_nodes(
        self, provider: FileTreeProvider, multi_node_tree_data
    ):
        nodes_data = multi_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        assert len(nodes) == 4

    def test_nodes_are_in_original_order(self, provider: FileTreeProvider, multi_node_tree_data):
        nodes_data = multi_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        assert [n.get_id for n in nodes] == ["node1", "node2", "node3", "node4"]

    def test_single_node_yes_resolves_to_result(
        self, provider: FileTreeProvider, single_node_tree_data
    ):
        nodes_data = single_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        assert nodes[0].get_yes == Result.PASS
        assert nodes[0].get_no == Result.FAIL

    def test_chain_node_no_resolves_to_next_node(
        self, provider: FileTreeProvider, multi_node_tree_data
    ):
        nodes_data = multi_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        # node1.no → node2
        assert isinstance(nodes[0].get_no, Node)
        assert nodes[0].get_no.get_id == "node2"

    def test_chain_is_fully_linked(self, provider: FileTreeProvider, multi_node_tree_data):
        """Verifica l'intera catena node1 → node2 → node3 → node4."""
        nodes_data = multi_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        node1, node2, node3, node4 = nodes

        assert node1.get_no is node2
        assert node2.get_no is node3
        assert node3.get_no is node4

    def test_leaf_node_resolves_to_results(self, provider: FileTreeProvider, multi_node_tree_data):
        nodes_data = multi_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        node4 = nodes[3]
        assert node4.get_yes == Result.PASS
        assert node4.get_no == Result.FAIL

    def test_intermediate_yes_resolves_to_na(
        self, provider: FileTreeProvider, multi_node_tree_data
    ):
        nodes_data = multi_node_tree_data[0]["nodes"]
        nodes = provider._build_nodes(nodes_data)

        # node1, node2, node3 hanno tutti true → result_na
        for node in nodes[:3]:
            assert node.get_yes == Result.NOT_APPLICABLE

    def test_returns_list_of_decision_trees(self, provider, mock_storage, single_node_tree_data):
        mock_storage.load_trees.return_value = single_node_tree_data

        trees = provider.get_all()

        assert len(trees) == 1
        assert isinstance(trees[0], DecisionTree)

    def test_tree_has_correct_metadata(self, provider, mock_storage, single_node_tree_data):
        mock_storage.load_trees.return_value = single_node_tree_data

        tree = provider.get_all()[0]

        assert tree.get_id == "tree_01"
        assert tree.get_title == "Single Node Tree"
        assert tree.get_dependencies == []

    def test_tree_has_correct_nodes(self, provider, mock_storage, single_node_tree_data):
        mock_storage.load_trees.return_value = single_node_tree_data

        tree = provider.get_all()[0]

        assert len(tree.nodes) == 1
        assert tree.nodes[0].get_id == "node1"

    def test_multiple_trees_returned(self, provider, mock_storage, multi_tree_data):
        mock_storage.load_trees.return_value = multi_tree_data

        trees = provider.get_all()

        assert len(trees) == 2

    def test_tree_dependencies_preserved(self, provider, mock_storage, multi_tree_data):
        mock_storage.load_trees.return_value = multi_tree_data

        trees = provider.get_all()

        assert trees[1].get_dependencies == ["tree_01"]

    def test_cache_prevents_multiple_storage_calls(
        self, provider, mock_storage, single_node_tree_data
    ):
        mock_storage.load_trees.return_value = single_node_tree_data

        provider.get_all()
        provider.get_all()
        provider.get_all()

        mock_storage.load_trees.assert_called_once()

    def test_cache_returns_same_objects(self, provider, mock_storage, single_node_tree_data):
        mock_storage.load_trees.return_value = single_node_tree_data

        first_call = provider.get_all()
        second_call = provider.get_all()

        assert first_call is second_call

    def test_empty_tree_list(self, provider, mock_storage):
        mock_storage.load_trees.return_value = []

        trees = provider.get_all()

        assert trees == []
