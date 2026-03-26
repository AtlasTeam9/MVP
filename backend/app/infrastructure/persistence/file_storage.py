import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any


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
            except Exception as e:
                raise OSError(f"Cannot create directory {directory}: {e}")

    def save_session(self, session_id: str, data: dict[str, Any]) -> None:
        file_path = self._get_session_path(session_id)
        temp_path = file_path.with_suffix(".tmp")

        try:
            data["saved_at"] = datetime.now().isoformat()

            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            shutil.move(str(temp_path), str(file_path))

        except TypeError as e:
            if temp_path.exists():
                temp_path.unlink()
            raise ValueError(f"Session data must be JSON serializable: {e}")

        except Exception as e:
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

        except Exception:
            return None

    def delete_session(self, session_id: str) -> None:
        session_path = self._get_session_path(session_id)
        if session_path.exists():
            session_path.unlink()

    def _get_session_path(self, session_id: str) -> Path:
        path = (self.sessions_dir / f"{session_id}.json").resolve()
        if not path.is_relative_to(self.sessions_dir):
            raise ValueError(f"Invalid session_id: {session_id}")
        return path

    def load_trees(self) -> dict:
        with open(self.trees_file, encoding="utf-8") as f:
            return json.load(f)
