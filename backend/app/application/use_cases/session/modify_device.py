from app.application.interfaces.modify_device import IModifyDeviceUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.use_cases.session.dtos.requests import ModifyDeviceRequest
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.exceptions import SessionNotFoundException
from app.domain.factories.session_factory import SessionFactory


class ModifyDeviceUseCase(IModifyDeviceUseCase):
    def __init__(self, session_service: ISessionService, session_factory: SessionFactory):
        self._session_service = session_service
        self._factory = session_factory

    async def execute(self, request: ModifyDeviceRequest) -> None:

        if self._session_service.get_session(request.session_id) is None:
            raise SessionNotFoundException(request.session_id)

        device_data = request.device_data

        new_device = Device(
            device_name=device_data["device_name"],
            assets=[
                Asset(
                    asset["id"],
                    asset["name"],
                    AssetType.from_string(asset["type"]),
                    asset["is_sensitive"],
                    asset.get("description", None),
                )
                for asset in device_data["assets"]
            ],
            operating_sys=device_data["operating_system"],
            firm_vers=device_data["firmware_version"],
            funcs=device_data["functionalities"],
            desc=device_data["description"],
        )

        updated_session = self._factory.create(device=new_device, session_id=request.session_id)

        _ = updated_session.current_node

        self._session_service.save_session(updated_session)
