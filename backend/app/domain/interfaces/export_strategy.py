from typing import Protocol


class ExportStrategy(Protocol):
    @property
    def media_type(self) -> str: ...

    @property
    def filename(self) -> str: ...

    def export(self, results: dict[str, str], device_name: str) -> bytes: ...
