"""
Unit tests per Session entity.
"""

from app.domain.entities.device import Asset, AssetType, Device
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
