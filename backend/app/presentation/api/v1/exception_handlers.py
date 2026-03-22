from fastapi import Request
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    DomainException,
    InvalidDeviceFileException,
    InvalidSessionIdException,
    SessionNotFoundException,
    UnsupportedExportFormatException,
)


def register_exception_handlers(app) -> None:
    @app.exception_handler(SessionNotFoundException)
    async def session_not_found_handler(request: Request, exc: SessionNotFoundException):
        return JSONResponse(status_code=404, content={"detail": exc.detail})

    @app.exception_handler(InvalidDeviceFileException)
    async def invalid_device_file_handler(request: Request, exc: InvalidDeviceFileException):
        return JSONResponse(status_code=422, content={"detail": exc.detail})

    @app.exception_handler(UnsupportedExportFormatException)
    async def unsupported_format_handler(request: Request, exc: UnsupportedExportFormatException):
        return JSONResponse(status_code=400, content={"detail": exc.detail})

    @app.exception_handler(InvalidSessionIdException)
    async def invalid_session_id_handler(request: Request, exc: InvalidSessionIdException):
        return JSONResponse(status_code=400, content={"detail": exc.detail})

    @app.exception_handler(DomainException)
    async def domain_exception_handler(request: Request, exc: DomainException):
        return JSONResponse(status_code=400, content={"detail": exc.detail})
