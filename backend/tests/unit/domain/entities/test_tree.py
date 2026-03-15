import pytest

from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree, Node


class TestNode:
    def test_node_initialization_with_results(self):
        node = Node("Is the device powered on?", Result.PASS, Result.FAIL)

        assert node.get_question == "Is the device powered on?"
        assert node.get_yes == Result.PASS
        assert node.get_no == Result.FAIL

    def test_node_initialization_with_other_nodes(self):
        leaf_yes = Node("Is it connected to network?", Result.PASS, Result.FAIL)
        leaf_no = Node("Plug it in. Does it turn on?", Result.PASS, Result.FAIL)

        root_node = Node("Is it powered?", leaf_yes, leaf_no)

        assert root_node.get_yes == leaf_yes
        assert root_node.get_no == leaf_no

    def test_node_to_dict(self):
        node = Node("Simple question?", Result.PASS, Result.NOT_APPLICABLE)
        expected_dict = {
            "question": "Simple question?",
            "yes": Result.PASS,
            "no": Result.NOT_APPLICABLE,
        }

        assert node.to_dict() == expected_dict


class TestDecisionTree:
    @pytest.fixture
    def sample_nodes(self):
        node1 = Node("Question 1?", Result.PASS, Result.FAIL)
        node2 = Node("Question 2?", Result.NOT_APPLICABLE, Result.FAIL)
        return [node1, node2]

    def test_tree_initialization_and_getters(self, sample_nodes):
        tree = DecisionTree(
            id="t_01", title="Network Check", dependencies=["t_00"], nodes=sample_nodes
        )

        assert tree.get_id == "t_01"
        assert tree.get_title == "Network Check"
        assert tree.get_dependencies == ["t_00"]
        assert len(tree.nodes) == 2
        assert tree.nodes == sample_nodes

    def test_tree_initialization_defaults(self):
        tree = DecisionTree(id="t_02", title="Empty Tree")

        assert tree.get_dependencies == []
        assert tree.nodes == []

    def test_tree_iteration(self, sample_nodes):
        tree = DecisionTree(id="t_03", title="Iter Tree", nodes=sample_nodes)

        iterated_data = list(tree)

        assert len(iterated_data) == 2
        assert iterated_data[0] == sample_nodes[0].to_dict()
        assert iterated_data[1] == sample_nodes[1].to_dict()

    def test_tree_properties_return_copies(self, sample_nodes):
        tree = DecisionTree(id="t_04", title="Copy Test", dependencies=["dep1"], nodes=sample_nodes)

        deps = tree.get_dependencies
        deps.append("hacked_dep")

        retrieved_nodes = tree.nodes
        retrieved_nodes.clear()

        assert tree.get_dependencies == ["dep1"]
        assert len(tree.nodes) == 2
