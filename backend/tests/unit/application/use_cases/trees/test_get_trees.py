import pytest

from app.application.use_cases.trees.get_trees import GetTreesUseCase


class TestGetTreesUseCase:
    """Classe che raggruppa i test per il caso d'uso GetTrees."""

    @pytest.mark.asyncio
    async def test_execute_returns_serialized_trees(self, sample_trees_objects):

        use_case = GetTreesUseCase(sample_trees_objects)

        result = await use_case.execute()

        assert len(result) == 2

        assert result[0]["id"] == "tree_01"
        assert result[0]["title"] == "Test Tree 1"
        assert result[0]["dependencies"] == []
        assert "node1" in result[0]["nodes"]
        assert result[0]["nodes"]["node1"]["question"] == "Q1?"

        assert result[1]["id"] == "tree_02"
        assert result[1]["title"] == "Test Tree 2"
        assert result[1]["dependencies"] == ["tree_01"]
        assert result[1]["nodes"] == {"node3": {"question": "Q3?"}}
