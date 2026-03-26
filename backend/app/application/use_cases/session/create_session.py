from pydantic import ValidationError

from app.application.interfaces.session_service import ISessionService
from app.application.interfaces.use_cases.create_session import ICreateSessionUseCase
from app.application.use_cases.session.dtos.requests import CreateSessionRequest
from app.application.use_cases.session.dtos.responses import CreateSessionResponse
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.exceptions import InvalidDeviceFileException
from app.presentation.api.v1.session.schema import DeviceSchema


class CreateSessionUseCase(ICreateSessionUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: CreateSessionRequest) -> CreateSessionResponse:
        try:
            validated = DeviceSchema(**request.device_data)
        except ValidationError as e:
            raise InvalidDeviceFileException(f"File dispositivo non valido: {e.errors()}")

        device_data = validated

        device = Device(
            device_name=device_data.device_name,
            assets=[
                Asset(
                    asset.id,
                    asset.name,
                    AssetType.from_string(asset.type),
                    asset.is_sensitive,
                    asset.description,
                )
                for asset in device_data.assets
            ],
            operating_sys=device_data.operating_system,
            firm_vers=device_data.firmware_version,
            funcs=device_data.functionalities,
            desc=device_data.description,
        )

        session = self._session_service.create_session(device)

        return CreateSessionResponse(
            session_id=session.get_id,
            device_name=session.get_device.get_name,
            assets=[
                {
                    "id": asset.get_id,
                    "name": asset.get_name,
                    "type": asset.get_type.value,
                    "is_sensitive": asset.get_sensitivity,
                    "description": asset.get_description,
                }
                for asset in session.get_assets
            ],
            device_os=session.get_device.get_operating_sys,
            device_firmw_v=session.get_device.get_firmware_vers,
            device_funcs=session.get_device.get_funcionalities,
            device_desc=session.get_device.get_description,
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
            current_node_id=session.state.current_node_id,
        )
