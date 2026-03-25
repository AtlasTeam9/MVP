"""
Unit tests per CsvExporter e PdfExporter aggiornati alla logica sintetica.
"""

import csv
import io

import pytest

from app.domain.services.exporters.csv_exporter import CsvExporter
from app.domain.services.exporters.pdf_exporter import PdfExporter

# Risultati già aggregati (Requisito -> Esito)
SAMPLE_RESULTS = {"Autenticazione": "PASS", "Cifratura": "FAIL"}
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

    def test_export_structure(self, exporter):
        """Verifica la struttura del CSV: intestazione, device e tabella."""
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        lines = content.splitlines()

        # Verifica righe descrittive iniziali
        assert "REPORT SINTETICO DI CONFORMITA" in lines[0]
        assert f"Device,{DEVICE_NAME}" in lines[1]
        assert lines[2] == ""  # riga vuota di separazione

        # Verifica header della tabella (riga 4)
        reader = csv.reader(io.StringIO(lines[3]))
        header = next(reader)
        assert header == ["ID Requisito", "Esito Finale"]

    def test_export_contains_all_rows(self, exporter):
        """Verifica che ci sia una riga per ogni requisito nel dizionario."""
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # Righe totali: 1(Title) + 1(Device) + 1(Empty) + 1(Header) + 2(Data) = 6
        assert len(rows) == 6

    def test_export_row_values(self, exporter):
        """Verifica i valori esatti nelle righe dei dati."""
        result = exporter.export(SAMPLE_RESULTS, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # Saltiamo le prime 4 righe (metadata + header)
        data_rows = rows[4:]

        # Creiamo un dizionario dai dati del CSV per il confronto
        results_map = {row[0]: row[1] for row in data_rows}

        assert results_map["Autenticazione"] == "PASS"
        assert results_map["Cifratura"] == "FAIL"

    def test_export_empty_results(self, exporter):
        """Verifica che con risultati vuoti stampi solo l'impalcatura del CSV."""
        result = exporter.export({}, DEVICE_NAME)
        content = result.decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        rows = list(reader)

        # 4 righe di intestazione/header, 0 righe dati
        assert len(rows) == 4


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
        """Verifica che non lanci eccezioni con risultati vuoti (stampa 'No results recorded')."""
        result = exporter.export({}, DEVICE_NAME)
        assert isinstance(result, bytes)
        assert result.startswith(b"%PDF")

    def test_export_many_results_no_crash(self, exporter):
        """Verifica la gestione di molti requisiti (paginazione) senza crash."""
        many_results = {f"REQUISITO_{i:03d}": "PASS" for i in range(100)}
        result = exporter.export(many_results, DEVICE_NAME)
        assert result.startswith(b"%PDF")
        assert len(result) > 1000  # Verifica che il file abbia contenuto
