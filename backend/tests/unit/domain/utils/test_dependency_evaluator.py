import pytest

from app.domain.entities.device import Asset, AssetType
from app.domain.entities.result import Result
from app.domain.entities.tree import DecisionTree
from app.domain.utils.dependency_evaluator import DependencyEvaluator
from app.domain.utils.result_store import ResultStore


class TestDependencyEvaluator:
    @pytest.fixture
    def result_store(self):
        """Fixture che crea un ResultStore pre-popolato con un asset fittizio"""
        dummy_asset = Asset(asset_id="a1", name="Test", type=AssetType.NETWORK)
        return ResultStore([dummy_asset])

    def test_check_no_dependencies(self, result_store):
        """Se l'albero non ha dipendenze, deve sempre ritornare True"""
        evaluator = DependencyEvaluator(result_store)
        tree = DecisionTree(id="t1", title="Tree 1", dependencies=[])

        assert evaluator.check("a1", tree) is True

    def test_check_missing_dependency(self, result_store):
        """Se una dipendenza richiesta non è presente nello store, ritorna False"""
        evaluator = DependencyEvaluator(result_store)
        tree = DecisionTree(id="t2", title="Tree 2", dependencies=["tree_unknown"])

        assert evaluator.check("a1", tree) is False

    def test_check_dependency_failed(self, result_store):
        """Se la dipendenza c'è ma è FAIL, ritorna False"""
        evaluator = DependencyEvaluator(result_store)
        tree = DecisionTree(id="t3", title="Tree 3", dependencies=["t_dep"])

        result_store.record("a1", "t_dep", Result.FAIL)

        assert evaluator.check("a1", tree) is False

    def test_check_dependency_not_applicable(self, result_store):
        """Se la dipendenza c'è ma è NOT_APPLICABLE, ritorna False"""
        evaluator = DependencyEvaluator(result_store)
        tree = DecisionTree(id="t4", title="Tree 4", dependencies=["t_dep"])

        result_store.record("a1", "t_dep", Result.NOT_APPLICABLE)

        assert evaluator.check("a1", tree) is False

    def test_check_dependencies_all_passed(self, result_store):
        """Se tutte le dipendenze ci sono e sono PASS, ritorna True"""
        evaluator = DependencyEvaluator(result_store)

        tree = DecisionTree(id="t5", title="Tree 5", dependencies=["t_dep1", "t_dep2"])

        result_store.record("a1", "t_dep1", Result.PASS)
        result_store.record("a1", "t_dep2", Result.PASS)

        assert evaluator.check("a1", tree) is True
