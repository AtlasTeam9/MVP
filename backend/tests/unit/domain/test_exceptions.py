from app.domain.exceptions import (
    DomainException,
    InvalidDeviceFileException,
    InvalidFileException,
    InvalidSessionIdException,
    SessionNotFoundException,
    UnsupportedExportFormatException,
)


class TestExceptions:
    """Classe che raggruppa tutti i test per le eccezioni di dominio."""

    def test_domain_exception(self):
        # Verifica che la classe base salvi correttamente il dettaglio
        exc = DomainException("Errore generico")
        assert exc.detail == "Errore generico"
        assert str(exc) == "Errore generico"

    def test_session_not_found_exception(self):
        # Verifica che il messaggio includa l'ID della sessione
        exc = SessionNotFoundException("12345")
        assert exc.detail == "Sessione '12345' non trovata."

    def test_invalid_device_file_exception_default(self):
        # Verifica il messaggio di default
        exc = InvalidDeviceFileException()
        assert exc.detail == "File dispositivo non valido."

    def test_invalid_file_exception_default(self):
        # Verifica il messaggio di default
        exc = InvalidFileException()
        assert exc.detail == "File non valido."

    def test_invalid_device_file_exception_custom(self):
        # Verifica che si possa passare un messaggio personalizzato
        exc = InvalidDeviceFileException("Manca il campo 'name'")
        assert exc.detail == "Manca il campo 'name'"

    def test_unsupported_export_format_exception(self):
        # Verifica la formattazione dei formati supportati
        exc = UnsupportedExportFormatException("xml", ["csv", "pdf"])
        assert exc.detail == "Formato 'xml' non supportato. Formati disponibili: ['csv', 'pdf']."

    def test_invalid_session_id_exception(self):
        # Verifica il messaggio di errore statico
        exc = InvalidSessionIdException()
        assert exc.detail == "session_id non valido. Deve essere un UUID v4."
