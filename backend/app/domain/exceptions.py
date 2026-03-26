class DomainException(Exception):
    """Base per tutte le eccezioni di dominio."""

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


class SessionNotFoundException(DomainException):
    def __init__(self, session_id: str):
        super().__init__(f"Sessione '{session_id}' non trovata.")


class InvalidDeviceFileException(DomainException):
    def __init__(self, detail: str = "File dispositivo non valido."):
        super().__init__(detail)


class InvalidFileException(DomainException):
    def __init__(self, detail: str = "File non valido."):
        super().__init__(detail)


class UnsupportedExportFormatException(DomainException):
    def __init__(self, fmt: str, supported: list[str]):
        super().__init__(f"Formato '{fmt}' non supportato. Formati disponibili: {supported}.")


class InvalidSessionIdException(DomainException):
    def __init__(self):
        super().__init__("session_id non valido. Deve essere un UUID v4.")
