from unittest.mock import MagicMock

import pytest

from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.services.session_service import SessionService
from app.infrastructure.repositories.session_repository import SessionRepository

SAMPLE_DEVICE = Device(
    device_name="Test Device",
    assets=[
        Asset("ASSET_01", "DHCP Client", AssetType.NETWORK_FUN, True),
        Asset("ASSET_02", "SSH Client", AssetType.SECURITY_FUN, False),
    ],
    operating_sys="Linux",
    firm_vers="1.0",
    funcs="IoT",
    desc="Test device",
)


@pytest.fixture
def mock_repo():
    return MagicMock(spec=SessionRepository)


@pytest.fixture
def service(mock_repo, session_factory):
    cache: dict = {}
    return SessionService(mock_repo, session_factory, cache)


class TestSessionServiceCreate:
    def test_create_session_returns_session(self, service):
        session = service.create_session(SAMPLE_DEVICE)
        assert session is not None
        assert session.get_device.get_name == "Test Device"

    def test_create_session_stores_in_cache(self, service):
        session = service.create_session(SAMPLE_DEVICE)
        assert session.get_id in service._cache

    def test_create_session_calls_repo_save(self, service, mock_repo):
        service.create_session(SAMPLE_DEVICE)
        mock_repo.save.assert_called_once()

    def test_create_session_different_ids(self, service):
        s1 = service.create_session(SAMPLE_DEVICE)
        s2 = service.create_session(SAMPLE_DEVICE)
        assert s1.get_id != s2.get_id


class TestSessionServiceGet:
    def test_get_session_from_cache(self, service):
        session = service.create_session(SAMPLE_DEVICE)
        result = service.get_session(session.get_id)
        assert result is session

    def test_get_session_not_found_returns_none(self, service, mock_repo):
        mock_repo.get.return_value = None
        result = service.get_session("non-existent-id")
        assert result is None

    def test_get_session_loads_from_repo_when_not_in_cache(self, mock_repo, session_factory):
        """Se la sessione non è in cache, viene caricata dal repo."""
        cache: dict = {}
        service = SessionService(mock_repo, session_factory, cache)

        mock_repo.get.return_value = {
            "session_id": "test-session-123",
            "device": {
                "device_name": "Loaded Device",
                "assets": [
                    {
                        "id": "ASSET_01",
                        "name": "DHCP",
                        "type": "Network function",
                        "is_sensitive": False,
                        "description": "desc",
                    }
                ],
                "operating_system": "Linux",
                "firmware_version": "1.0",
                "functionalities": "IoT",
                "description": "desc",
            },
            "results": {},
        }

        session = service.get_session("test-session-123")
        assert session is not None
        assert session.get_id == "test-session-123"
        assert session.get_device.get_name == "Loaded Device"

    def test_get_session_from_repo_caches_result(self, mock_repo, session_factory):
        """Dopo il caricamento dal repo, la sessione viene messa in cache."""
        cache: dict = {}
        service = SessionService(mock_repo, session_factory, cache)

        mock_repo.get.return_value = {
            "session_id": "test-session-456",
            "device": {
                "device_name": "Device",
                "assets": [
                    {
                        "id": "A1",
                        "name": "Asset",
                        "type": "Network function",
                        "is_sensitive": True,
                        "description": None,
                    }
                ],
                "operating_system": "Linux",
                "firmware_version": "1.0",
                "functionalities": "IoT",
                "description": None,
            },
            "results": {},
        }

        service.get_session("test-session-456")
        # Seconda chiamata deve usare la cache, non il repo
        mock_repo.get.reset_mock()
        service.get_session("test-session-456")
        mock_repo.get.assert_not_called()

    def test_get_session_restores_results(self, mock_repo, session_factory):
        """I risultati vengono ripristinati correttamente dal repo."""
        cache: dict = {}
        service = SessionService(mock_repo, session_factory, cache)

        mock_repo.get.return_value = {
            "session_id": "test-session-789",
            "device": {
                "device_name": "Device",
                "assets": [
                    {
                        "id": "ASSET_01",
                        "name": "Asset",
                        "type": "Network function",
                        "is_sensitive": True,
                        "description": None,
                    }
                ],
                "operating_system": "Linux",
                "firmware_version": "1.0",
                "functionalities": "IoT",
                "description": None,
            },
            "results": {"ASSET_01": {"ACM-1": "PASS", "ACM-2": "FAIL"}},
        }

        session = service.get_session("test-session-789")
        assert session is not None
        assert session.results.get("ASSET_01", "ACM-1") == Result.PASS
        assert session.results.get("ASSET_01", "ACM-2") == Result.FAIL


class TestSessionServiceSaveDelete:
    def test_save_session_calls_repo(self, service, mock_repo):
        session = service.create_session(SAMPLE_DEVICE)
        mock_repo.reset_mock()
        service.save_session(session)
        mock_repo.save.assert_called_once_with(session)

    def test_delete_session_removes_from_cache(self, service):
        session = service.create_session(SAMPLE_DEVICE)
        session_id = session.get_id
        assert session_id in service._cache

        service.delete_session(session_id)
        assert session_id not in service._cache

    def test_delete_session_calls_repo(self, service, mock_repo):
        session = service.create_session(SAMPLE_DEVICE)
        session_id = session.get_id
        mock_repo.reset_mock()

        service.delete_session(session_id)
        mock_repo.delete.assert_called_once_with(session_id)

    def test_delete_nonexistent_session_no_error(self, service, mock_repo):
        """Eliminare una sessione che non esiste non deve sollevare eccezioni."""
        service.delete_session("non-existent-id")
        mock_repo.delete.assert_called_once_with("non-existent-id")
