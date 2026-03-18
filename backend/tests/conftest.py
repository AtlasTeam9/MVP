"""
Pytest configuration e fixtures globali.
Usato da tutti i test.
"""

import json
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree, Node
from app.domain.interfaces.tree_provider import TreeProvider
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.persistence.file_tree_provider import FileTreeProvider


@pytest.fixture
def sample_device_data():
    """
    Device data di esempio.
    Usato in molti test.
    """
    return {
        "device_name": "Dispositivo Test",
        "assets": [
            {"id": "asset_001", "name": "Componente A", "type": "Network"},
            {"id": "asset_002", "name": "Componente B", "type": "Security"},
        ],
    }


@pytest.fixture
def mock_storage() -> MagicMock:
    return MagicMock(spec=FileStorage)


@pytest.fixture
def provider(mock_storage) -> FileTreeProvider:
    return FileTreeProvider(mock_storage)


@pytest.fixture
def mock_tree_provider(sample_trees_objects) -> TreeProvider:
    """Mock TreeProvider che restituisce i trees di test senza toccare file"""

    class MockTreeProvider(TreeProvider):
        def get_all(self) -> list[DecisionTree]:
            return sample_trees_objects

    return MockTreeProvider()


@pytest.fixture
def sample_nodes() -> list[Node]:
    node2 = Node("node2", "Q2?", Result.PASS, Result.FAIL)
    node1 = Node("node1", "Q1?", Result.NOT_APPLICABLE, node2)

    node3 = Node("node3", "Q3?", Result.PASS, Result.FAIL)
    return [node1, node2, node3]


@pytest.fixture
def sample_trees_objects(sample_nodes) -> list[DecisionTree]:
    """Restituisce lista di DecisionTree con nodi reali"""
    [node1, node2, node3] = sample_nodes

    nodes1 = [node1, node2]

    tree1 = DecisionTree(id="tree_01", title="Test Tree 1", nodes=nodes1, dependencies=[])
    tree2 = DecisionTree(id="tree_02", title="Test Tree 2", nodes=[node3], dependencies=["tree_01"])
    return [tree1, tree2]


@pytest.fixture
def fixtures_dir():
    """Path alla cartella fixtures"""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_device_file(tmp_path, sample_device_data) -> Path:
    """
    Crea file dispositivo temporaneo.
    tmp_path è fornito da pytest.
    """
    file_path = tmp_path / "device.json"
    with open(file_path, "w") as f:
        json.dump(sample_device_data, f)
    return file_path
