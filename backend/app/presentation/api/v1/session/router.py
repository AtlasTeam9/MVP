import json
from typing import Annotated

from fastapi import Depends, File, HTTPException, UploadFile
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.application.interfaces.create_session_with_file_use_case import (
    ICreateSessionWithFileUseCase,
)
from app.application.use_cases.session.create_session_with_file import (
    CreateSessionWithFileRequest,
)

from ..dependencies import get_create_session_with_file_use_case
from .schema import (
    AssetSchema,
    SessionResponseSchema,
)

router = InferringRouter(prefix="/session", tags=["session"])


@cbv(router)
class SessionController:
    create_session_use_case: ICreateSessionWithFileUseCase = Depends(
        get_create_session_with_file_use_case
    )

    @router.post("/", status_code=201)
    async def create_session_with_file(
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

        result = await self.create_session_use_case.execute(
            CreateSessionWithFileRequest(device_data=device_data)
        )

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
