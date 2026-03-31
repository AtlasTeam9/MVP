"""
Unit tests per Session entity.
"""

from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.entities.session import Session
from app.domain.entities.tree import Node


class TestSession:
    """Test suite per Session entity"""

    def test_session_creation(self, session_factory):
        """Test creazione sessione base"""
        device = Device(
            device_name="Test Device",
            assets=[
                Asset(asset_id="ASSET_1", name="a1", type=AssetType.NETWORK_FUN, is_sensitive=True)
            ],
            operating_sys="Linux",
            firm_vers="1.0.0",
            funcs="Routing",
        )

        session = session_factory.create(
            device=device,
            session_id="fd74b30b-8888-43ec-b265-01b2d702d9a3",
        )

        assert session.get_id == "fd74b30b-8888-43ec-b265-01b2d702d9a3"
        assert session.get_device.to_dict() == device.to_dict()
        assert session.current_asset == device.get_assets[0]

    def test_add_result(self, session_factory):
        """Test per l'aggiunta di un risultato"""
        session = self._create_test_session(session_factory)
        asset_id = session.current_asset.get_id if session.current_asset else None
        tree_id = session.current_tree.get_id if session.current_tree else None

        session.record_result(Result.PASS)

        if asset_id and tree_id:
            assert session.results.get(asset_id, tree_id) == Result.PASS

    def test_current_node(self, session_factory):
        session = self._create_test_session(session_factory)

        if session.current_node:
            assert session.current_node.get_question == "Q1?"
            assert session.current_node.get_yes == Result.NOT_APPLICABLE
            no_node = session.current_node.get_no
            if isinstance(no_node, Node):
                assert no_node.get_question == "Q2?"
                assert no_node.get_yes == Result.PASS
                assert no_node.get_no == Result.FAIL

    def test_answer(self, session_factory):
        session = self._create_test_session(session_factory)

        result = session.answer(True)

        assert result.next_node is None
        assert result.session_finished is False
        assert result.tree_completed is True
        assert result.tree_result == Result.NOT_APPLICABLE

    def test_auto_skip_dependent_trees_on_answer(self, session_factory):
        """
        Verifica che completando un albero con esito NOT_APPLICABLE (o FAIL),
        gli alberi dipendenti vengano saltati e l'esito N/A venga propagato.
        """
        session = self._create_test_session(session_factory)
        asset1_id = ""
        if session.current_asset:
            asset1_id = session.current_asset.get_id

        result = session.answer(True)

        assert result.tree_completed is True
        assert result.tree_result == Result.NOT_APPLICABLE

        # tree_02 dipende da tree_01. Poiché tree_01 è N/A, session.skip_invalid_trees()
        # deve aver saltato tree_02 e deve averci spostato direttamente all'Asset 2 (a2).
        if session.current_asset and session.current_tree:
            assert session.current_asset.get_id == "a2"
            assert session.current_tree.get_id == "tree_01"

        # Controlliamo che nel ResultStore sia stato registrato automaticamente N/A per il tree_02 saltato
        skipped_tree_result = session.results.get(asset1_id, "tree_02")
        assert skipped_tree_result == Result.NOT_APPLICABLE

    def test_auto_skip_finishes_session(self, session_factory):
        """
        Verifica che se l'ultimo albero dell'ultimo asset fallisce/N/A
        e i restanti alberi vengono saltati, la sessione si chiuda correttamente.
        """
        session = self._create_test_session(session_factory)

        session.navigator.state.current_asset_index = 1

        # Rispondiamo True alla Q1 del tree_01 dell'Asset 2 (esito N/A)
        result = session.answer(True)

        # Poiché il tree_02 (ultimo albero) dipende dal tree_01 appena fallito,
        # verrà saltato. Essendo l'ultimo albero dell'ultimo asset, la sessione deve finire.
        assert result.tree_completed is True
        assert result.session_finished is True
        assert session.state.is_finished is True

    def test_reset_changed_tree_and_dependents_same_asset_only(self, session_factory):
        """Resetta solo il tree cambiato e i dipendenti nello stesso asset."""
        session = self._create_test_session(session_factory)

        # Precondizioni: risultati già presenti su entrambi gli asset
        session.results.record("a1", "tree_01", Result.PASS)
        session.results.record("a1", "tree_02", Result.PASS)
        session.results.record("a2", "tree_01", Result.FAIL)
        session.results.record("a2", "tree_02", Result.PASS)

        # Modifichiamo tree_01 dell'asset a1: tree_02 dipende da tree_01 e va resettato.
        session.reset_changed_tree_and_dependents(asset_index=0, tree_index=0)

        assert session.results.to_dict()["a1"]["tree_01"] == ""
        assert session.results.to_dict()["a1"]["tree_02"] == ""

        # L'altro asset non deve essere toccato.
        assert session.results.to_dict()["a2"]["tree_01"] == "FAIL"
        assert session.results.to_dict()["a2"]["tree_02"] == "PASS"

    def _create_test_session(self, session_factory) -> Session:
        device = Device(
            device_name="Test Device",
            assets=[
                Asset("a1", "Asset 1", AssetType.NETWORK_FUN, True),
                Asset("a2", "Asset 2", AssetType.SECURITY_FUN, True),
            ],
            operating_sys="Linux",
            firm_vers="1.0.0",
            funcs="Routing",
        )
        return session_factory.create(
            device=device,
            session_id="fd74b30b-8888-43ec-b265-01b2d702d9a3",
        )
