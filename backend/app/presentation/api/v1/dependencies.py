import uuid

from fastapi import Depends

from app.application.interfaces.answer_use_case import IAnswerUseCase
from app.application.interfaces.create_session_with_file_use_case import (
    ICreateSessionWithFileUseCase,
)
from app.application.interfaces.delete_session_use_case import IDeleteSessionUseCase
from app.application.interfaces.get_trees_use_case import IGetTreesUseCase
from app.application.interfaces.go_back_use_case import IGoBackUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.state import AppState
from app.application.use_cases.session.answer import AnswerUseCase
from app.application.use_cases.session.create_session_with_file import CreateSessionWithFileUseCase
from app.application.use_cases.session.delete_session import DeleteSessionUseCase
from app.application.use_cases.session.export_results import ExportResultsUseCase
from app.application.use_cases.session.export_session import ExportSessionUseCase
from app.application.use_cases.session.go_back import GoBackUseCase
from app.application.use_cases.trees.get_trees import GetTreesUseCase
from app.domain.entities.session import Session
from app.domain.entities.tree import DecisionTree
from app.domain.exceptions import InvalidSessionIdException
from app.domain.interfaces.tree_provider import TreeProvider
from app.domain.services.session_service import SessionService
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.repositories.session_repository import SessionRepository


def validate_session_id(session_id: str) -> str:
    try:
        uuid.UUID(session_id, version=4)
    except ValueError:
        raise InvalidSessionIdException()
    return session_id


def get_trees() -> list[DecisionTree]:
    return AppState.trees


def get_session() -> dict[str, Session]:
    return AppState.sessions


def get_file_storage() -> FileStorage:
    return FileStorage()


def get_tree_provider() -> TreeProvider:
    class InMemoryTreeProvider:
        def get_all(self) -> list[DecisionTree]:
            return get_trees()

    return InMemoryTreeProvider()


def get_session_repository() -> SessionRepository:
    return SessionRepository(get_file_storage())


def get_session_service(
    repo: SessionRepository = Depends(get_session_repository),
    tree_provider: TreeProvider = Depends(get_tree_provider),
    cache: dict[str, Session] = Depends(get_session),
) -> SessionService:
    return SessionService(repo, tree_provider, cache)


def get_create_session_with_file_use_case(
    service: ISessionService = Depends(get_session_service),
) -> ICreateSessionWithFileUseCase:
    return CreateSessionWithFileUseCase(service)


def get_answer_use_case(
    service: ISessionService = Depends(get_session_service),
) -> IAnswerUseCase:
    return AnswerUseCase(service)


def get_go_back_use_case(
    service: ISessionService = Depends(get_session_service),
) -> IGoBackUseCase:
    return GoBackUseCase(service)


def get_export_results_use_case(
    service: ISessionService = Depends(get_session_service),
) -> ExportResultsUseCase:
    return ExportResultsUseCase(service)


def get_export_session_use_case(
    service: ISessionService = Depends(get_session_service),
) -> ExportSessionUseCase:
    return ExportSessionUseCase(service)


def get_delete_session_use_case(
    service: ISessionService = Depends(get_session_service),
) -> IDeleteSessionUseCase:
    return DeleteSessionUseCase(service)


def get_trees_use_case(trees: list[DecisionTree] = Depends(get_trees)) -> IGetTreesUseCase:
    return GetTreesUseCase(trees)
