from app.application.interfaces.session_service import ISessionService
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.entities.session import Session
from app.domain.factories.session_factory import SessionFactory
from app.domain.interfaces.base_repository import BaseRepository


class SessionService(ISessionService):
    def __init__(self, session_repository: BaseRepository, factory: SessionFactory, cache: dict):
        self._repo = session_repository
        self._factory = factory
        self._cache = cache

    def create_session(self, device: Device) -> Session:
        session = self._factory.create(device)
        self._cache[session.get_id] = session
        self._repo.save(session)
        return session

    def get_session(self, session_id: str) -> Session | None:
        if session_id in self._cache:
            return self._cache[session_id]

        data = self._repo.get(session_id)
        if data is None:
            return None

        device_dict = data["device"]
        device = Device(
            device_name=device_dict["device_name"],
            assets=[
                Asset(
                    asset["id"],
                    asset["name"],
                    AssetType.from_string(asset["type"]),
                    asset["is_sensitive"],
                    asset.get("description", None),
                )
                for asset in device_dict["assets"]
            ],
            operating_sys=device_dict["operating_system"],
            firm_vers=device_dict["firmware_version"],
            funcs=device_dict["functionalities"],
            desc=device_dict["description"],
        )

        session = self._factory.restore(device, data["session_id"])

        for asset_id, trees in data.get("results", {}).items():
            for tree_id, result_str in trees.items():
                if result_str == "":
                    session.results.reset(asset_id, tree_id)
                    continue
                session.results.record(asset_id, tree_id, Result(result_str))

        self._cache[session.get_id] = session
        return session

    def save_session(self, session: Session) -> None:
        self._cache[session.get_id] = session
        self._repo.save(session)

    def delete_session(self, session_id: str) -> None:
        self._cache.pop(session_id, None)
        self._repo.delete(session_id)
