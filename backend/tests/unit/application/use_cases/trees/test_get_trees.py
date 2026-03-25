import pytest

from app.application.use_cases.trees.get_trees import GetTreesUseCase


class TestGetTreesUseCase:
    """Classe che raggruppa i test per il caso d'uso GetTrees."""

    @pytest.mark.asyncio
    async def test_execute_returns_serialized_trees(self, sample_trees_objects):

        use_case = GetTreesUseCase(sample_trees_objects)

        result = await use_case.execute()
        trees = result.trees
        assert len(trees) == 2

        assert trees[0].id == "tree_01"
        assert trees[0].title == "Test Tree 1"
        assert trees[0].dependencies == []
        assert "node1" in trees[0].nodes

        assert trees[1].id == "tree_02"
        assert trees[1].title == "Test Tree 2"
        assert trees[1].dependencies == ["tree_01"]
        assert trees[1].nodes == {"node3": {"question": "Q3?"}}
