from fastapi import Depends

from app.application.state import AppState
from app.domain.entities.session import Session
from app.domain.entities.tree import DecisionTree
from app.domain.factories.session_factory import SessionFactory
from app.domain.interfaces.tree_provider import TreeProvider
from app.domain.services.session_service import SessionService
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.repositories.session_repository import SessionRepository


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


def get_session_factory(
    tree_provider: TreeProvider = Depends(get_tree_provider),
) -> SessionFactory:
    return SessionFactory(tree_provider)


def get_session_repository() -> SessionRepository:
    return SessionRepository(get_file_storage())


def get_session_service(
    repo: SessionRepository = Depends(get_session_repository),
    factory: SessionFactory = Depends(get_session_factory),
    cache: dict[str, Session] = Depends(get_session),
) -> SessionService:
    return SessionService(repo, factory, cache)
