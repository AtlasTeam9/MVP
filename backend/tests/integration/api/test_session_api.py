"""
Integration tests per le API di sessione.
Usa httpx.AsyncClient con l'app FastAPI direttamente, senza server reale.
Il filesystem viene mockato per non toccare file reali.
"""

import json
from unittest.mock import MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.application.state import AppState
from app.domain.entities.result import Result
from app.main import app

# ---------------------------------------------------------------------------
# Fixtures globali
# ---------------------------------------------------------------------------

DEVICE_JSON = {
    "device_name": "Test Device",
    "operative_system": "Linux-based embedded system",
    "firmware_version": "1.0.0",
    "functionalities": "MQTT-based IoT device with network and security capabilities",
    "description": "description",
    "assets": [
        {
            "id": "ASSET_01",
            "name": "DHCP Client",
            "type": "Network Function",
            "is_sensitive": True,
            "description": "description",
        },
        {
            "id": "ASSET_02",
            "name": "SSH Client",
            "type": "Security Function",
            "is_sensitive": False,
            "description": "description",
        },
    ],
}


@pytest.fixture(autouse=True)
def reset_app_state(sample_trees_objects):
    """
    Resetta AppState prima di ogni test.
    Inietta anche gli alberi di test al posto di quelli reali dal file.
    """
    AppState.sessions = {}
    AppState.trees = sample_trees_objects
    yield
    AppState.sessions = {}
    AppState.trees = []


@pytest_asyncio.fixture
async def client():
    """Client httpx che parla direttamente con l'app ASGI."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_storage():
    """Mock di FileStorage per evitare operazioni su disco."""
    with patch("app.presentation.api.v1.dependencies.get_file_storage") as mock_get_storage:
        storage = MagicMock()
        storage.save_session.return_value = None
        storage.load_session.return_value = None
        storage.delete_session.return_value = None
        mock_get_storage.return_value = storage
        yield storage


@pytest.fixture
def device_file(tmp_path):
    """File JSON del device da uploadare."""
    file_path = tmp_path / "device.json"
    file_path.write_text(json.dumps(DEVICE_JSON), encoding="utf-8")
    return file_path


async def create_session(client, mock_storage, device_file) -> str:
    """Helper: crea una sessione e restituisce il session_id."""
    with open(device_file, "rb") as f:
        response = await client.post(
            "/api/v1/session/create_session_with_file",
            files={"file": ("device.json", f, "application/json")},
        )
    assert response.status_code == 201
    return response.json()["session_id"]


class TestCreateSessionWithFile:
    @pytest.mark.integration
    async def test_create_session_success(self, client, mock_storage, device_file):
        """Crea una sessione con file JSON valido."""
        with open(device_file, "rb") as f:
            response = await client.post(
                "/api/v1/session/create_session_with_file",
                files={"file": ("device.json", f, "application/json")},
            )

        assert response.status_code == 201
        data = response.json()
        assert "session_id" in data
        assert data["device"]["device_name"] == "Test Device"
        assert len(data["device"]["assets"]) == 2
        assert "position" in data
        assert data["position"]["current_asset_index"] == 0
        assert data["position"]["current_tree_index"] == 0

    @pytest.mark.integration
    async def test_create_session_invalid_json(self, client, mock_storage, tmp_path):
        """Restituisce 400 se il file non è JSON valido."""
        bad_file = tmp_path / "bad.json"
        bad_file.write_text("not a json {{{", encoding="utf-8")

        with open(bad_file, "rb") as f:
            response = await client.post(
                "/api/v1/session/create_session_with_file",
                files={"file": ("bad.json", f, "application/json")},
            )

        assert response.status_code == 400

    @pytest.mark.integration
    async def test_create_session_saves_to_storage(self, client, mock_storage, device_file):
        """Verifica che la sessione venga salvata su storage."""
        with open(device_file, "rb") as f:
            await client.post(
                "/api/v1/session/create_session_with_file",
                files={"file": ("device.json", f, "application/json")},
            )

        mock_storage.save_session.assert_called_once()

    @pytest.mark.integration
    async def test_create_session_stored_in_app_state(self, client, mock_storage, device_file):
        """Verifica che la sessione venga inserita in AppState.sessions."""
        with open(device_file, "rb") as f:
            response = await client.post(
                "/api/v1/session/create_session_with_file",
                files={"file": ("device.json", f, "application/json")},
            )

        session_id = response.json()["session_id"]
        assert session_id in AppState.sessions


class TestAnswer:
    @pytest.mark.integration
    async def test_answer_true_next_node(self, client, mock_storage, device_file):
        """
        Risponde True al nodo corrente.
        Il tree di test ha Q1 -> True -> Result.NOT_APPLICABLE,
        quindi tree_completed=True.
        """
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["tree_completed"] is True
        assert data["tree_result"] == "NOT_APPLICABLE"
        assert data["session_finished"] is False

    @pytest.mark.integration
    async def test_answer_false_goes_to_next_node(self, client, mock_storage, device_file):
        """
        Risponde False al nodo Q1 -> va a Q2 (next_node presente).
        """
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": False},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["tree_completed"] is False
        assert data["next_node_id"] is not None
        assert data["session_finished"] is False

    @pytest.mark.integration
    async def test_answer_session_not_found(self, client, mock_storage):
        """Restituisce 404 per session_id inesistente."""
        response = await client.post(
            "/api/v1/session/session-inesistente/answer",
            json={"answer": True},
        )

        assert response.status_code == 404

    @pytest.mark.integration
    async def test_answer_saves_session_after_each_answer(self, client, mock_storage, device_file):
        """Verifica che save_session venga chiamato dopo ogni risposta."""
        session_id = await create_session(client, mock_storage, device_file)
        calls_before = mock_storage.save_session.call_count

        await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": False},
        )

        assert mock_storage.save_session.call_count > calls_before

    @pytest.mark.integration
    async def test_answer_session_finished_returns_results(self, client, mock_storage, device_file):
        """
        Completa tutti gli alberi e verifica che results sia presente
        nella response finale.
        """
        session_id = await create_session(client, mock_storage, device_file)

        # Rispondiamo True a tutto fino alla fine
        # Tree1 asset1 -> True -> NA -> Tree2 saltato (dipende da Tree1=NA)
        # Tree1 asset2 -> True -> NA -> Tree2 saltato
        response = None
        for _ in range(10):  # massimo 10 risposte per evitare loop infiniti
            response = await client.post(
                f"/api/v1/session/{session_id}/answer",
                json={"answer": True},
            )
            data = response.json()
            if data.get("session_finished"):
                break

        assert response is not None
        data = response.json()
        assert data["session_finished"] is True
        assert data["results"] is not None
        assert "ASSET_01" in data["results"]
        assert "ASSET_02" in data["results"]

    @pytest.mark.integration
    async def test_answer_skips_dependent_trees_on_na(self, client, mock_storage, device_file):
        """
        Se tree_01 -> NOT_APPLICABLE, tree_02 (dipendente) viene saltato
        automaticamente con NOT_APPLICABLE.
        """
        session_id = await create_session(client, mock_storage, device_file)
        session = AppState.sessions[session_id]
        asset_id = session.get_assets[0].get_id

        await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": True},  # Q1=True -> NA
        )

        # tree_02 deve essere stato saltato con NA
        skipped = session.results.get(asset_id, "tree_02")
        assert skipped == Result.NOT_APPLICABLE


class TestGoBack:
    @pytest.mark.integration
    async def test_go_back_success(self, client, mock_storage, device_file):
        """
        Risponde False (va a Q2), poi torna a node1 tramite go_back.
        """
        session_id = await create_session(client, mock_storage, device_file)

        # Avanza a Q2
        await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": False},
        )

        # Il nodo Q1 deve essere nello stack — recuperiamo il suo id
        session = AppState.sessions[session_id]
        node1_id = session.state.navigation_stack[0][0].get_id

        response = await client.post(
            f"/api/v1/session/{session_id}/go_back",
            json={"target_node_id": node1_id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["found"] is True
        assert data["node_id"] == node1_id

    @pytest.mark.integration
    async def test_go_back_node_not_found(self, client, mock_storage, device_file):
        """Restituisce found=False se il nodo non è nello stack."""
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.post(
            f"/api/v1/session/{session_id}/go_back",
            json={"target_node_id": "nodo_inesistente"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["found"] is False
        assert data["node_id"] is None

    @pytest.mark.integration
    async def test_go_back_session_not_found(self, client, mock_storage):
        """Restituisce 404 per session_id inesistente."""
        response = await client.post(
            "/api/v1/session/sessione-falsa/go_back",
            json={"target_node_id": "node1"},
        )

        assert response.status_code == 404

    @pytest.mark.integration
    async def test_go_back_resets_current_node(self, client, mock_storage, device_file):
        """Dopo go_back, il current_node della sessione torna al nodo target."""
        session_id = await create_session(client, mock_storage, device_file)

        await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": False},
        )

        session = AppState.sessions[session_id]
        node1_id = session.state.navigation_stack[0][0].get_id

        await client.post(
            f"/api/v1/session/{session_id}/go_back",
            json={"target_node_id": node1_id},
        )

        assert session.state.current_node is not None
        assert session.state.current_node.get_id == node1_id


class TestExportSession:
    @pytest.mark.integration
    async def test_export_session_returns_json(self, client, mock_storage, device_file):
        """Verifica che l'export restituisca un JSON scaricabile."""
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.get(f"/api/v1/session/{session_id}/export")

        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        assert "attachment" in response.headers["content-disposition"]

    @pytest.mark.integration
    async def test_export_session_content(self, client, mock_storage, device_file):
        """Verifica che il contenuto dell'export abbia i campi corretti."""
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.get(f"/api/v1/session/{session_id}/export")
        data = json.loads(response.content)

        assert data["session_id"] == session_id
        assert "device" in data
        assert "results" in data
        assert "position" in data
        assert "is_finished" in data

    @pytest.mark.integration
    async def test_export_session_not_found(self, client, mock_storage):
        """Restituisce 404 per session_id inesistente."""
        response = await client.get("/api/v1/session/sessione-falsa/export")
        assert response.status_code == 404


class TestExportResults:
    @pytest.mark.integration
    async def test_export_results_csv(self, client, mock_storage, device_file):
        """Verifica export CSV."""
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.get(
            f"/api/v1/session/{session_id}/export/results",
            params={"format": "csv"},
        )

        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert "attachment" in response.headers["content-disposition"]

    @pytest.mark.integration
    async def test_export_results_pdf(self, client, mock_storage, device_file):
        """Verifica export PDF."""
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.get(
            f"/api/v1/session/{session_id}/export/results",
            params={"format": "pdf"},
        )

        assert response.status_code == 200
        assert "application/pdf" in response.headers["content-type"]

    @pytest.mark.integration
    async def test_export_results_invalid_format(self, client, mock_storage, device_file):
        """Restituisce 400 per formato non supportato."""
        session_id = await create_session(client, mock_storage, device_file)

        response = await client.get(
            f"/api/v1/session/{session_id}/export/results",
            params={"format": "xlsx"},
        )

        assert response.status_code == 400

    @pytest.mark.integration
    async def test_export_results_csv_content(self, client, mock_storage, device_file):
        """Verifica che il CSV contenga header e device name."""
        session_id = await create_session(client, mock_storage, device_file)

        # Registra almeno un risultato
        await client.post(
            f"/api/v1/session/{session_id}/answer",
            json={"answer": True},
        )

        response = await client.get(
            f"/api/v1/session/{session_id}/export/results",
            params={"format": "csv"},
        )

        content = response.content.decode("utf-8")
        assert "Device" in content
        assert "Asset ID" in content
        assert "Test Device" in content

    @pytest.mark.integration
    async def test_export_results_session_not_found(self, client, mock_storage):
        """Restituisce 404 per session_id inesistente."""
        response = await client.get(
            "/api/v1/session/sessione-falsa/export/results",
            params={"format": "csv"},
        )
        assert response.status_code == 404


class TestDeleteSession:
    @pytest.mark.integration
    async def test_delete_session_success(self, client, mock_storage, device_file):
        """Elimina una sessione esistente."""
        session_id = await create_session(client, mock_storage, device_file)
        assert session_id in AppState.sessions

        response = await client.delete(f"/api/v1/session/{session_id}")

        assert response.status_code == 204
        assert session_id not in AppState.sessions

    @pytest.mark.integration
    async def test_delete_session_calls_storage(self, client, mock_storage, device_file):
        """Verifica che delete_session venga chiamato sullo storage."""
        session_id = await create_session(client, mock_storage, device_file)

        await client.delete(f"/api/v1/session/{session_id}")

        mock_storage.delete_session.assert_called_once_with(session_id)

    @pytest.mark.integration
    async def test_delete_session_not_found(self, client, mock_storage):
        """Restituisce 404 per session_id inesistente."""
        response = await client.delete("/api/v1/session/sessione-falsa")
        assert response.status_code == 404


class TestTrees:
    @pytest.mark.integration
    async def test_get_trees_returns_list(self, client):
        """Verifica che /trees/ restituisca la lista degli alberi."""
        response = await client.get("/api/v1/trees/")

        assert response.status_code == 201
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2  # tree_01 e tree_02 dai sample_trees_objects

    @pytest.mark.integration
    async def test_get_trees_structure(self, client):
        """Verifica la struttura di ogni albero restituito."""
        response = await client.get("/api/v1/trees/")
        data = response.json()
        tree = data[0]

        assert "id" in tree
        assert "title" in tree
        assert "dependencies" in tree
        assert "nodes" in tree
