import json
from unittest.mock import MagicMock

import pytest

from app.application.use_cases.session.dtos.requests import (
    ExportResultsRequest,
    ExportSessionRequest,
)
from app.application.use_cases.session.export_results import ExportResultsUseCase
from app.application.use_cases.session.export_session import ExportSessionUseCase
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.exceptions import SessionNotFoundException, UnsupportedExportFormatException
from app.domain.services.exporters.csv_exporter import CsvExporter
from app.domain.services.exporters.pdf_exporter import PdfExporter

SAMPLE_ANSWER_HISTORY = [
    {
        "asset_index": 0,
        "tree_index": 0,
        "node_id": "node1",
        "answer": True,
    }
]

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_service():
    return MagicMock()


@pytest.fixture
def sample_session(session_factory):
    device = Device(
        device_name="Coffee Machine",
        assets=[
            Asset("ASSET_01", "DHCP", AssetType.NETWORK_FUN, True),
            Asset("ASSET_02", "SSH", AssetType.SECURITY_FUN, False),
        ],
    )
    session = session_factory.create(
        device=device, session_id="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    )
    session.results.record("ASSET_01", "ACM-1", Result.PASS)
    session.results.record("ASSET_01", "ACM-2", Result.FAIL)
    session.results.record("ASSET_02", "ACM-1", Result.NOT_APPLICABLE)
    return session


@pytest.fixture
def exporters():
    return {"csv": CsvExporter(), "pdf": PdfExporter()}


@pytest.fixture
def export_results_use_case(mock_service, exporters):
    return ExportResultsUseCase(mock_service, exporters)


class TestExportResultsUseCase:
    async def test_raises_if_session_not_found(self, export_results_use_case, mock_service):
        mock_service.get_session.return_value = None
        request = ExportResultsRequest(session_id="fake-id", format="csv")

        with pytest.raises(SessionNotFoundException):
            await export_results_use_case.execute(request)

    async def test_raises_for_unsupported_format(
        self, export_results_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportResultsRequest(session_id=sample_session.get_id, format="xlsx")

        with pytest.raises(UnsupportedExportFormatException):
            await export_results_use_case.execute(request)

    async def test_unsupported_format_mentions_format_name(
        self, export_results_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportResultsRequest(session_id=sample_session.get_id, format="xml")

        with pytest.raises(UnsupportedExportFormatException) as exc_info:
            await export_results_use_case.execute(request)

        assert "xml" in exc_info.value.detail.lower()

    async def test_export_csv_returns_bytes(
        self, export_results_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportResultsRequest(session_id=sample_session.get_id, format="csv")

        response = await export_results_use_case.execute(request)

        assert isinstance(response.content, bytes)
        assert response.media_type == "text/csv"
        assert response.filename == "results.csv"

    async def test_export_pdf_returns_bytes(
        self, export_results_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportResultsRequest(session_id=sample_session.get_id, format="pdf")

        response = await export_results_use_case.execute(request)

        assert isinstance(response.content, bytes)
        assert response.media_type == "application/pdf"
        assert response.content.startswith(b"%PDF")

    async def test_csv_content_contains_device_name(
        self, export_results_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportResultsRequest(session_id=sample_session.get_id, format="csv")

        response = await export_results_use_case.execute(request)

        assert b"Coffee Machine" in response.content

    async def test_export_with_empty_results(self, mock_service, session_factory):
        """Export con una sessione senza risultati registrati."""
        device = Device(
            device_name="Empty Device",
            assets=[Asset("A1", "Asset", AssetType.NETWORK_FUN, True)],
        )
        session = session_factory.create(device=device)
        mock_service.get_session.return_value = session

        use_case = ExportResultsUseCase(mock_service, {"csv": CsvExporter()})
        request = ExportResultsRequest(session_id=session.get_id, format="csv")

        response = await use_case.execute(request)
        assert isinstance(response.content, bytes)


@pytest.fixture
def export_session_use_case(mock_service):
    return ExportSessionUseCase(mock_service)


class TestExportSessionUseCase:
    async def test_raises_if_session_not_found(self, export_session_use_case, mock_service):
        mock_service.get_session.return_value = None
        request = ExportSessionRequest(session_id="fake-id", answers=[])

        with pytest.raises(SessionNotFoundException):
            await export_session_use_case.execute(request)

    async def test_returns_json_bytes(self, export_session_use_case, mock_service, sample_session):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)

        assert isinstance(response.content, bytes)
        parsed = json.loads(response.content)
        assert isinstance(parsed, dict)

    async def test_json_contains_session_id(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)
        data = json.loads(response.content)

        assert data["session_id"] == "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"

    async def test_json_contains_device_info(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)
        data = json.loads(response.content)

        assert "device" in data
        assert data["device"]["device_name"] == "Coffee Machine"

    async def test_json_contains_results(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)
        data = json.loads(response.content)

        assert "results" in data
        assert data["results"]["ASSET_01"]["ACM-1"] == "PASS"
        assert data["results"]["ASSET_01"]["ACM-2"] == "FAIL"

    async def test_json_contains_position(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)
        data = json.loads(response.content)

        assert "position" in data
        assert "current_asset_index" in data["position"]
        assert "current_tree_index" in data["position"]
        assert "current_node_id" in data["position"]

    async def test_filename_contains_session_id(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)

        assert "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" in response.filename
        assert response.filename.endswith(".json")

    async def test_json_contains_is_finished_field(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)
        data = json.loads(response.content)

        assert "is_finished" in data
        assert isinstance(data["is_finished"], bool)

    async def test_json_is_valid_utf8(self, export_session_use_case, mock_service, sample_session):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)

        decoded = response.content.decode("utf-8")
        assert len(decoded) > 0

    async def test_json_contains_answer_history(
        self, export_session_use_case, mock_service, sample_session
    ):
        mock_service.get_session.return_value = sample_session
        request = ExportSessionRequest(
            session_id=sample_session.get_id,
            answers=SAMPLE_ANSWER_HISTORY,
        )

        response = await export_session_use_case.execute(request)
        data = json.loads(response.content)

        assert "answer" in data
        assert data["answer"] == SAMPLE_ANSWER_HISTORY
