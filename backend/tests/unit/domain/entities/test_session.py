"""
Unit tests per Session entity.
"""

from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.entities.session import Session
from app.domain.entities.tree import Node


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
        """Test per l'aggiunta di un risultato"""
        session = self._create_test_session(mock_tree_provider)

        asset_id = session.current_asset.get_id if session.current_asset else None
        tree_id = session.current_tree.get_id if session.current_tree else None

        session.record_result(Result.PASS)

        if asset_id and tree_id:
            result = session.results.get(asset_id, tree_id)
            assert result == Result.PASS

    def test_current_node(self, mock_tree_provider):
        session = self._create_test_session(mock_tree_provider)

        if session.current_node:
            assert session.current_node.get_question == "Test question 1?"
            assert session.current_node.get_yes == Result.NOT_APPLICABLE
            no_node = session.current_node.get_no
            if isinstance(no_node, Node):
                assert no_node.get_question == "Test question 2?"
                assert no_node.get_yes == Result.PASS
                assert no_node.get_no == Result.FAIL

    def test_answer(self, mock_tree_provider):
        session = self._create_test_session(mock_tree_provider)

        result = session.answer(True)

        assert result.next_node is None
        assert result.session_finished is False
        assert result.tree_completed is True
        assert result.tree_result == Result.NOT_APPLICABLE

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
