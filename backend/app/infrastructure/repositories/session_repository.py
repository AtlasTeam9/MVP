"""
Session Repository
Gestisce persistenza delle sessioni.
"""

from typing import Any

from app.domain.entities.session import Session
from app.domain.interfaces.base_repository import BaseRepository
from app.infrastructure.persistence.file_storage import FileStorage


class SessionRepository(BaseRepository):
    def __init__(self, storage: FileStorage):
        self._storage = storage

    def save(self, entity: Session) -> None:

        try:
            device = entity.get_device.to_dict()
            session_dict = {
                "session_id": entity.get_id,
                "device": {
                    "device_name": device["device_name"],
                    "assets": [asset for asset in device["assets"]],
                    "operating_system": device["operating_system"],
                    "firmware_version": device["firmware_version"],
                    "functionalities": device["functionalities"],
                    "description": device["description"],
                },
                "position": {
                    "current_asset_index": entity.state.current_asset_index,
                    "current_tree_index": entity.state.current_tree_index,
                    "current_node_id": entity.state.current_node_id,
                },
                "results": entity.results.to_dict(),
                "is_finished": entity.state.is_finished,
            }

            self._storage.save_session(entity.get_id, session_dict)

        except Exception as e:
            raise e

    def get(self, entity_id: str) -> dict[str, Any] | None:
        return self._storage.load_session(entity_id)

    def update(self, session: Session) -> None:
        self.save(session)

    def delete(self, entity_id: str) -> None:
        self._storage.delete_session(entity_id)
