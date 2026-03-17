from backend.app.application.interfaces.session_service import ISessionService

from app.application.interfaces.create_session_with_file_use_case import (
    ICreateSessionWithFileUseCase,
)
from app.application.use_cases.session.dto import (
    CreateSessionWithFileRequest,
    CreateSessionWithFileResponse,
)
from app.domain.entities.device import Asset, AssetType, Device


class CreateSessionWithFileUseCase(ICreateSessionWithFileUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: CreateSessionWithFileRequest) -> CreateSessionWithFileResponse:
        device_data = request.device_data

        device = Device(
            device_name=device_data["device_name"],
            assets=[
                Asset(asset["id"], asset["name"], AssetType.from_string(asset["type"]))
                for asset in device_data["assets"]
            ],
        )
        session = self._session_service.create_session(device)

        return CreateSessionWithFileResponse(
            session_id=session.get_id,
            device_name=session.get_device.get_name,
            assets=[
                {"id": asset.get_id, "name": asset.get_name, "type": asset.get_type.value}
                for asset in session.get_assets
            ],
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
        )
