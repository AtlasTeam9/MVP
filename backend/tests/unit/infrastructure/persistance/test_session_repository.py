"""
Unit tests per SessionRepository.
"""

from unittest.mock import MagicMock

import pytest

from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.repositories.session_repository import SessionRepository


class TestSessionRepository:
    @pytest.fixture
    def mock_storage(self):
        return MagicMock(spec=FileStorage)

    @pytest.fixture
    def repo(self, mock_storage):
        return SessionRepository(mock_storage)

    @pytest.fixture
    def sample_session(self, session_factory):  # session_factory invece di mock_tree_provider
        device = Device(
            device_name="Test Device",
            assets=[
                Asset("ASSET_01", "DHCP Client", AssetType.NETWORK_FUN, True),
                Asset("ASSET_02", "SSH Client", AssetType.SECURITY_FUN, True),
            ],
            operating_sys="Linux",
            firm_vers="1.0.0",
            funcs="Routing",
        )
        return session_factory.create(
            device=device, session_id="fd74b30b-8888-43ec-b265-01b2d702d9a3"
        )

    def test_save_calls_storage(self, repo, mock_storage, sample_session):
        repo.save(sample_session)
        mock_storage.save_session.assert_called_once()

    def test_save_passes_correct_session_id(self, repo, mock_storage, sample_session):
        repo.save(sample_session)
        call_args = mock_storage.save_session.call_args
        assert call_args[0][0] == "fd74b30b-8888-43ec-b265-01b2d702d9a3"

    def test_save_includes_results(self, repo, mock_storage, sample_session):
        sample_session.results.record("ASSET_01", "ACM-1", Result.PASS)
        repo.save(sample_session)

        call_args = mock_storage.save_session.call_args
        session_dict = call_args[0][1]
        assert "results" in session_dict
        assert session_dict["results"]["ASSET_01"]["ACM-1"] == "PASS"

    def test_save_includes_position(self, repo, mock_storage, sample_session):
        repo.save(sample_session)
        call_args = mock_storage.save_session.call_args
        session_dict = call_args[0][1]
        assert "position" in session_dict
        assert "current_asset_index" in session_dict["position"]
        assert "current_tree_index" in session_dict["position"]

    def test_save_includes_device(self, repo, mock_storage, sample_session):
        repo.save(sample_session)
        call_args = mock_storage.save_session.call_args
        session_dict = call_args[0][1]
        assert "device" in session_dict
        assert session_dict["device"]["device_name"] == "Test Device"

    def test_save_raises_if_storage_fails(self, repo, mock_storage, sample_session):
        mock_storage.save_session.side_effect = OSError("Disk full")
        with pytest.raises(OSError):
            repo.save(sample_session)

    def test_get_returns_data_from_storage(self, repo, mock_storage):
        mock_storage.load_session.return_value = {
            "session_id": "fd74b30b-8888-43ec-b265-01b2d702d9a3"
        }
        result = repo.get("fd74b30b-8888-43ec-b265-01b2d702d9a3")
        assert result == {"session_id": "fd74b30b-8888-43ec-b265-01b2d702d9a3"}
        mock_storage.load_session.assert_called_once_with("fd74b30b-8888-43ec-b265-01b2d702d9a3")

    def test_get_returns_none_if_not_found(self, repo, mock_storage):
        mock_storage.load_session.return_value = None
        result = repo.get("non-existent")
        assert result is None

    def test_delete_calls_storage(self, repo, mock_storage):
        repo.delete("fd74b30b-8888-43ec-b265-01b2d702d9a3")
        mock_storage.delete_session.assert_called_once_with("fd74b30b-8888-43ec-b265-01b2d702d9a3")

    def test_update_calls_save(self, repo, mock_storage, sample_session):
        repo.update(sample_session)
        mock_storage.save_session.assert_called_once()
