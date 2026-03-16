from fastapi import Depends

from app.domain.interfaces.tree_provider import TreeProvider
from app.domain.services.session_service import SessionService
from app.infrastructure.persistence.file_storage import FileStorage
from app.infrastructure.persistence.file_tree_provider import FileTreeProvider
from app.infrastructure.repositories.session_repository import SessionRepository


def get_file_storage() -> FileStorage:
    return FileStorage()


def get_tree_provider(
    storage: FileStorage = Depends(get_file_storage),
) -> TreeProvider:
    return FileTreeProvider(storage)


def get_session_repository() -> SessionRepository:
    return SessionRepository(get_file_storage())


def get_session_service(
    repo: SessionRepository = Depends(get_session_repository),
    tree_provider: TreeProvider = Depends(get_tree_provider),
) -> SessionService:
    return SessionService(repo, tree_provider)
