"""
Unit tests per FileStorage.
"""

import json

import pytest

from app.infrastructure.persistence.file_storage import FileStorage


class TestFileStorage:
    @pytest.fixture
    def storage(self, tmp_path):
        """FileStorage che usa una directory temporanea."""
        return FileStorage(base_dir=str(tmp_path))

    @pytest.fixture
    def sample_session_data(self):
        return {
            "session_id": "test-123",
            "device": {"device_name": "Test Device", "assets": []},
            "position": {
                "current_asset_index": 0,
                "current_tree_index": 0,
                "current_node_id": "",
            },
            "results": {},
            "is_finished": False,
        }

    def test_creates_base_directory(self, tmp_path):
        base = tmp_path / "new_dir"
        FileStorage(base_dir=str(base))
        assert base.exists()

    def test_creates_sessions_directory(self, tmp_path):
        base = tmp_path / "new_dir"
        FileStorage(base_dir=str(base))
        assert (base / "sessions").exists()

    def test_save_session_creates_file(self, storage, tmp_path, sample_session_data):
        storage.save_session("test-123", sample_session_data)
        session_file = tmp_path / "sessions" / "test-123.json"
        assert session_file.exists()

    def test_save_session_content_is_valid_json(self, storage, tmp_path, sample_session_data):
        storage.save_session("test-123", sample_session_data)
        session_file = tmp_path / "sessions" / "test-123.json"
        with open(session_file, encoding="utf-8") as f:
            data = json.load(f)
        assert data["session_id"] == "test-123"

    def test_save_session_adds_saved_at(self, storage, tmp_path, sample_session_data):
        storage.save_session("test-123", sample_session_data)
        session_file = tmp_path / "sessions" / "test-123.json"
        with open(session_file, encoding="utf-8") as f:
            data = json.load(f)
        assert "saved_at" in data

    def test_save_session_not_serializable_raises(self, storage):
        with pytest.raises(ValueError):
            storage.save_session("bad", {"data": object()})

    # --- load_session ---

    def test_load_session_returns_data(self, storage, sample_session_data):
        storage.save_session("test-123", sample_session_data)
        loaded = storage.load_session("test-123")
        assert loaded is not None
        assert loaded["session_id"] == "test-123"

    def test_load_session_not_found_returns_none(self, storage):
        result = storage.load_session("non-existent")
        assert result is None

    def test_load_session_preserves_results(self, storage, sample_session_data):
        sample_session_data["results"] = {"ASSET_01": {"ACM-1": "PASS"}}
        storage.save_session("test-123", sample_session_data)
        loaded = storage.load_session("test-123")
        assert loaded["results"]["ASSET_01"]["ACM-1"] == "PASS"

    def test_delete_session_removes_file(self, storage, tmp_path, sample_session_data):
        storage.save_session("test-123", sample_session_data)
        storage.delete_session("test-123")
        session_file = tmp_path / "sessions" / "test-123.json"
        assert not session_file.exists()

    def test_delete_session_not_existing_no_crash(self, storage):
        """Eliminare una sessione inesistente non deve lanciare eccezioni."""
        storage.delete_session("non-existent")
