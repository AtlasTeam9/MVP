import json
from typing import Annotated

from fastapi import Depends, File, HTTPException, UploadFile
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.application.interfaces.session_service_interface import ISessionService
from app.application.use_cases.session.create_session_with_file_upload import (
    CreateSessionWithDeviceRequest,
    CreateSessionWithDeviceUseCase,
)

from ..dependencies import get_session_service
from .schema import (
    AssetSchema,
    SessionResponseSchema,
)

router = InferringRouter(prefix="/session", tags=["session"])


@cbv(router)
class SessionController:
    # Dipendenza
    service: ISessionService = Depends(get_session_service)

    @router.post("/", status_code=201)
    async def create_session_with_device_upload(
        self, file: Annotated[UploadFile, File(...)]
    ) -> SessionResponseSchema:
        """
        carica file, crea sessione → mostra device + assets
        """
        try:
            content = await file.read()
            device_data = json.loads(content)
        except json.JSONDecodeError:
            raise HTTPException(400, "File JSON non valido.")

        use_case = CreateSessionWithDeviceUseCase(self.service)
        result = await use_case.execute(CreateSessionWithDeviceRequest(device_data=device_data))

        return SessionResponseSchema(
            session_id=result.session_id,
            device_name=result.device_name,
            assets=[
                AssetSchema(id=asset["id"], name=asset["name"], type=asset["type"])
                for asset in result.assets
            ],
            position={
                "current_asset_index": result.current_asset_index,
                "current_tree_index": result.current_tree_index,
            },
        )
