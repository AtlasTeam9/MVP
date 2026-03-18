from fastapi import Depends

from app.application.interfaces.create_session_with_file_use_case import (
    ICreateSessionWithFileUseCase,
)
from app.application.interfaces.session_service import ISessionService
from app.application.state import AppState
from app.application.use_cases.session.create_session_with_file import CreateSessionWithFileUseCase
from app.domain.entities.tree import DecisionTree
from app.domain.interfaces.tree_provider import TreeProvider
from app.domain.services.session_service import SessionService
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.repositories.session_repository import SessionRepository


def get_trees() -> list[DecisionTree]:
    return AppState.trees


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
) -> SessionService:
    return SessionService(repo, tree_provider)


def get_create_session_with_file_use_case(
    service: ISessionService = Depends(get_session_service),
) -> ICreateSessionWithFileUseCase:
    return CreateSessionWithFileUseCase(service)
