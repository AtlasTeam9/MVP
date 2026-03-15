"""
Unit tests per Session entity.
"""

from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.entities.session import Session


class TestSession:
    """Test suite per Session entity"""

    def test_session_creation(self, mock_tree_provider):
        """Test creazione sessione base"""
        device = Device(
            device_name="Test Device",
            assets=[Asset(asset_id="ASSET_1", name="a1", type=AssetType.NETWORK)],
        )

        session = Session(
            tree_provider=mock_tree_provider,
            device=device,
            session_id="fd74b30b-8888-43ec-b265-01b2d702d9a3",
        )

        assert session.get_id == "fd74b30b-8888-43ec-b265-01b2d702d9a3"
        assert session.get_device.to_dict() == device.to_dict()
        assert session.current_asset == device.get_assets[0]

    def test_add_result(self, mock_tree_provider):
        """Helper per creare sessione di test"""
        session = self._create_test_session(mock_tree_provider)

        asset_id = session.current_asset.get_id if session.current_asset else None
        tree_id = session.current_tree.get_id if session.current_tree else None

        session.record_result(Result.PASS)

        if asset_id and tree_id:
            result = session.results.get(asset_id, tree_id)
            assert result == Result.PASS

    def _create_test_session(self, mock_tree_provider) -> Session:
        """Helper per creare sessione di test"""

        device = Device(
            device_name="Test Device",
            assets=[
                Asset(asset_id="a1", name="Asset 1", type=AssetType.NETWORK),
                Asset(asset_id="a2", name="Asset 2", type=AssetType.SECURITY),
            ],
        )

        return Session(
            tree_provider=mock_tree_provider,
            device=device,
            session_id="fd74b30b-8888-43ec-b265-01b2d702d9a3",
        )
