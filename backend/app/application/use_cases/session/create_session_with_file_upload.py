from dataclasses import dataclass

from app.domain.entities.device import Asset, AssetType, Device
from app.domain.services.session_service import SessionService


@dataclass
class CreateSessionWithUploadRequest:
    device_data: dict


@dataclass
class CreateSessionWithUploadResponse:
    session_id: str
    device_name: str
    assets: list[dict[str, str]]
    current_asset_index: int
    current_tree_index: int


class CreateSessionWithUploadUseCase:
    def __init__(self, session_service: SessionService):
        self._session_service = session_service

    async def execute(
        self, request: CreateSessionWithUploadRequest
    ) -> CreateSessionWithUploadResponse:
        device_data = request.device_data

        device = Device(
            device_name=device_data["device_name"],
            assets=[
                Asset(asset["id"], asset["name"], AssetType.from_string(asset["type"]))
                for asset in device_data["assets"]
            ],
        )
        session = self._session_service.create_session(device)

        return CreateSessionWithUploadResponse(
            session_id=session.get_id,
            device_name=session.get_device.get_name,
            assets=[
                {"id": asset.get_id, "name": asset.get_name, "type": asset.get_type.value}
                for asset in session.get_assets
            ],
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
        )
