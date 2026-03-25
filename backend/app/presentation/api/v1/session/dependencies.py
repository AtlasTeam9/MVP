import uuid

from fastapi import Depends

from app.application.interfaces.answer_use_case import IAnswerUseCase
from app.application.interfaces.create_session_use_case import (
    ICreateSessionUseCase,
)
from app.application.interfaces.delete_session_use_case import IDeleteSessionUseCase
from app.application.interfaces.export_results_use_case import IExportResultsUseCase
from app.application.interfaces.go_back_use_case import IGoBackUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.use_cases.session.answer import AnswerUseCase
from app.application.use_cases.session.create_session import CreateSessionUseCase
from app.application.use_cases.session.delete_session import DeleteSessionUseCase
from app.application.use_cases.session.export_results import ExportResultsUseCase
from app.application.use_cases.session.export_session import ExportSessionUseCase
from app.application.use_cases.session.go_back import GoBackUseCase
from app.application.use_cases.session.modify_device import ModifyDeviceUseCase
from app.domain.exceptions import InvalidSessionIdException
from app.domain.factories.session_factory import SessionFactory
from app.domain.services.exporters.csv_exporter import CsvExporter
from app.domain.services.exporters.pdf_exporter import PdfExporter

from ..shared_dependencies import get_session_factory, get_session_service


def validate_session_id(session_id: str) -> str:
    try:
        uuid.UUID(session_id, version=4)
    except ValueError:
        raise InvalidSessionIdException()
    return session_id


def get_create_session_use_case(
    service: ISessionService = Depends(get_session_service),
) -> ICreateSessionUseCase:
    return CreateSessionUseCase(service)


def get_answer_use_case(
    service: ISessionService = Depends(get_session_service),
) -> IAnswerUseCase:
    return AnswerUseCase(service)


def get_go_back_use_case(
    service: ISessionService = Depends(get_session_service),
) -> IGoBackUseCase:
    return GoBackUseCase(service)


def get_export_results_use_case(service=Depends(get_session_service)) -> IExportResultsUseCase:
    return ExportResultsUseCase(
        service,
        {
            "csv": CsvExporter(),
            "pdf": PdfExporter(),
        },
    )


def get_modify_device_use_case(
    session_service: ISessionService = Depends(get_session_service),
    session_factory: SessionFactory = Depends(get_session_factory),
) -> ModifyDeviceUseCase:
    return ModifyDeviceUseCase(session_service, session_factory)


def get_export_session_use_case(
    service: ISessionService = Depends(get_session_service),
) -> ExportSessionUseCase:
    return ExportSessionUseCase(service)


def get_delete_session_use_case(
    service: ISessionService = Depends(get_session_service),
) -> IDeleteSessionUseCase:
    return DeleteSessionUseCase(service)
