import pytest

from app.domain.entities.device import Asset, AssetType
from app.domain.entities.result import Result
from app.domain.utils.result_store import ResultStore


class TestResultStore:
    @pytest.fixture
    def sample_assets(self):
        """Fixture per fornire una lista di Asset reali"""
        return [
            Asset(asset_id="asset_1", name="Router", type=AssetType.NETWORK),
            Asset(asset_id="asset_2", name="Firewall", type=AssetType.SECURITY),
        ]

    def test_store_initialization(self, sample_assets):
        """Verifica che il dizionario interno si inizializzi con le chiavi degli asset vuote"""
        store = ResultStore(sample_assets)

        assert "asset_1" in store._results
        assert "asset_2" in store._results
        assert store._results["asset_1"] == {}

    def test_record_and_get(self, sample_assets):
        """Verifica la registrazione e il recupero di un risultato"""
        store = ResultStore(sample_assets)

        store.record("asset_1", "tree_01", Result.PASS)
        store.record("asset_1", "tree_02", Result.FAIL)

        assert store.get("asset_1", "tree_01") == Result.PASS
        assert store.get("asset_1", "tree_02") == Result.FAIL

        assert store.get("asset_1", "tree_unknown") is None

    def test_to_dict(self, sample_assets):
        """Verifica la corretta conversione in dizionario con i valori stringa degli enum"""
        store = ResultStore(sample_assets)
        store.record("asset_1", "tree_01", Result.PASS)
        store.record("asset_2", "tree_02", Result.NOT_APPLICABLE)

        expected_dict = {"asset_1": {"tree_01": "PASS"}, "asset_2": {"tree_02": "NOT_APPLICABLE"}}

        assert store.to_dict() == expected_dict
