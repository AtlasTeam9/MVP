"""
Session Repository
Gestisce persistenza delle sessioni.
"""

import logging
from typing import Any

from app.domain.entities.session import Session
from app.domain.interfaces.base_repository import BaseRepository
from app.infrastructure.persistence.file_storage import FileStorage

logger = logging.getLogger(__name__)


class SessionRepository(BaseRepository):
    def __init__(self, storage: FileStorage):
        self._storage = storage

        logger.info("SessionRepository initialized")

    def save(self, entity: Session) -> None:

        try:
            device = entity.get_device.to_dict()
            session_dict = {
                "session_id": entity.get_id,
                "device_name": device["device_name"],
                "assets": [asset for asset in device["assets"]],
            }

            self._storage.save_session(entity.get_id, session_dict)

            logger.info(f"Session saved: {entity.get_id}")

        except Exception as e:
            logger.error(f"Failed to save session {entity.get_id}: {e}")
            raise

    def get(self, entity_id: str) -> dict[str, Any] | None:
        return self._storage.load_session(entity_id)

    def update(self, session: Session) -> None:
        self.save(session)
