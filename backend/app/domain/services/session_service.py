from app.application.interfaces.session_service import ISessionService
from app.domain.entities.device import Asset, Device
from app.domain.entities.result import Result
from app.domain.entities.session import Session
from app.domain.interfaces.base_repository import BaseRepository
from app.domain.interfaces.tree_provider import TreeProvider


class SessionService(ISessionService):
    def __init__(self, session_repository: BaseRepository, tree_provider: TreeProvider):
        self._repo = session_repository
        self._tree_provider = tree_provider

    def create_session(self, device: Device) -> Session:
        session = Session(tree_provider=self._tree_provider, device=device)

        self._repo.save(session)
        return session

    def load_session(self, session_id: str) -> Session | None:
        data = self._repo.get(session_id)
        if data is None:
            return None

        device_dict = data["device"]
        device = Device(
            device_name=device_dict.name,
            assets=[
                Asset(asset["id"], asset["name"], asset["type"], asset["sensitive"])
                for asset in device_dict.assets
            ],
        )

        session = Session(
            tree_provider=self._tree_provider,
            device=device,
            session_id=data["session_id"],
        )

        for asset_id, trees in data.get("results", {}).items():
            for tree_id, result_str in trees.items():
                session.results.record(asset_id, tree_id, Result(result_str))

        return session

    def save_session(self, session: Session) -> None:
        self._repo.save(session)
