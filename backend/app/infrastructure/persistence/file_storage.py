import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class FileStorage:
    def __init__(self, base_dir: str = "./data"):
        self.base_dir = Path(base_dir).resolve()
        self.sessions_dir = self.base_dir / "sessions"
        self.trees_file = self.base_dir / "trees.json"
        self.config_file = self.base_dir / "config.json"

        self._ensure_directories()

    def _ensure_directories(self) -> None:

        directories = [
            self.base_dir,
            self.sessions_dir,
        ]

        for directory in directories:
            try:
                directory.mkdir(parents=True, exist_ok=True)
                logger.debug(f"Directory ensured: {directory}")
            except Exception as e:
                logger.error(f"Failed to create directory {directory}: {e}")
                raise OSError(f"Cannot create directory {directory}: {e}")

    # SESSION methods
    def save_session(self, session_id: str, data: dict[str, Any]) -> None:
        file_path = self._get_session_path(session_id)
        temp_path = file_path.with_suffix(".tmp")

        try:
            data["saved_at"] = datetime.now().isoformat()

            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            temp_path.replace(file_path)
            logger.info(f"Session saved: {session_id}")

        except TypeError as e:
            logger.error(f"Session data not JSON serializable: {e}")
            if temp_path.exists():
                temp_path.unlink()
            raise ValueError(f"Session data must be JSON serializable: {e}")

        except Exception as e:
            logger.error(f"Failed to save session {session_id}: {e}")
            if temp_path.exists():
                temp_path.unlink()
            raise OSError(f"Cannot save session {session_id}: {e}")

    def load_session(self, session_id: str) -> dict[str, Any] | None:
        file_path = self._get_session_path(session_id)

        if not file_path.exists():
            return None

        try:
            with open(file_path, encoding="utf-8") as f:
                data = json.load(f)

            return data

        except Exception as e:
            logger.error(f"Failed to backup corrupted file: {e}")
            return None

    def delete_session(self, session_id: str) -> None:
        session_path = self._get_session_path(session_id)
        if session_path.exists():
            session_path.unlink()
            logger.info(f"Session file deleted: {session_id}")

    def _get_session_path(self, session_id: str) -> Path:
        return self.sessions_dir / f"{session_id}.json"

    def load_trees(self) -> dict:
        with open(self.trees_file, encoding="utf-8") as f:
            return json.load(f)
