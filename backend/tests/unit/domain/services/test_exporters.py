"""
Unit tests per CsvExporter e PdfExporter.
"""

import csv
import io

import pytest

from app.domain.services.exporters.csv_exporter import CsvExporter
from app.domain.services.exporters.pdf_exporter import PdfExporter

SAMPLE_RESULTS = {
    "ASSET_01": {
        "ACM-1": "PASS",
        "ACM-2": "NOT_APPLICABLE",
    },
    "ASSET_02": {
        "ACM-1": "FAIL",
    },
}

DEVICE_NAME = "Coffee Machine"


class TestCsvExporter:
    @pytest.fixture
    def exporter(self):
        return CsvExporter()

    def test_media_type(self, exporter):
        assert exporter.media_type == "text/csv"

    def test_filename(self, exporter):
        assert exporter.filename == "results.csv"

    def test_export_returns_bytes(self, exporter):
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        assert isinstance(result, bytes)

    def test_export_contains_header(self, exporter):
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        header = next(reader)
        assert header == ["Device", "Asset ID", "Tree ID", "Result"]

    def test_export_contains_device_name(self, exporter):
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        assert DEVICE_NAME in content

    def test_export_contains_all_rows(self, exporter):
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # 1 header + 3 righe di dati
        assert len(rows) == 4

    def test_export_row_values(self, exporter):
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        next(reader)  # skip header
        rows = list(reader)

        asset_ids = {row[1] for row in rows}
        tree_ids = {row[2] for row in rows}
        results = {row[3] for row in rows}

        assert "ASSET_01" in asset_ids
        assert "ASSET_02" in asset_ids
        assert "ACM-1" in tree_ids
        assert "ACM-2" in tree_ids
        assert "PASS" in results
        assert "FAIL" in results
        assert "NOT_APPLICABLE" in results

    def test_export_empty_results(self, exporter):
        result = exporter.export({}, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # solo header
        assert len(rows) == 1

    def test_export_asset_with_no_trees(self, exporter):
        results = {"ASSET_01": {}}
        result = exporter.export(results, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # solo header, nessuna riga dati
        assert len(rows) == 1


class TestPdfExporter:
    @pytest.fixture
    def exporter(self):
        return PdfExporter()

    def test_media_type(self, exporter):
        assert exporter.media_type == "application/pdf"

    def test_filename(self, exporter):
        assert exporter.filename == "results.pdf"

    def test_export_returns_bytes(self, exporter):
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        assert isinstance(result, bytes)

    def test_export_is_valid_pdf(self, exporter):
        """Verifica che l'output inizi con il magic number del PDF."""
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        assert result.startswith(b"%PDF")

    def test_export_empty_results(self, exporter):
        """Verifica che non lanci eccezioni con risultati vuoti."""
        result = exporter.export({}, DEVICE_NAME)
        assert isinstance(result, bytes)
        assert result.startswith(b"%PDF")

    def test_export_many_results_no_crash(self, exporter):
        """Verifica che il cambio pagina non causi crash."""
        many_results = {
            f"ASSET_{i:02d}": {f"TREE_{j:02d}": "PASS" for j in range(20)} for i in range(10)
        }
        result = exporter.export(many_results, DEVICE_NAME)
        assert result.startswith(b"%PDF")
