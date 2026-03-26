import json
from typing import Annotated

from fastapi import Depends, File, UploadFile
from fastapi.responses import Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.application.interfaces.use_cases.answer import IAnswerUseCase
from app.application.interfaces.use_cases.create_session import (
    ICreateSessionUseCase,
)
from app.application.interfaces.use_cases.delete_session import IDeleteSessionUseCase
from app.application.interfaces.use_cases.export_results import IExportResultsUseCase
from app.application.interfaces.use_cases.export_session import IExportSessionUseCase
from app.application.interfaces.use_cases.go_back import IGoBackUseCase
from app.application.interfaces.use_cases.load_session import ILoadSessionUseCase
from app.application.interfaces.use_cases.modify_device import IModifyDeviceUseCase
from app.application.use_cases.session.create_session import (
    CreateSessionRequest,
)
from app.application.use_cases.session.dtos.requests import (
    AnswerRequest,
    DeleteSessionRequest,
    ExportResultsRequest,
    ExportSessionRequest,
    GoBackRequest,
    LoadSessionRequest,
    ModifyDeviceRequest,
)
from app.domain.exceptions import InvalidDeviceFileException

from .dependencies import (
    get_answer_use_case,
    get_create_session_use_case,
    get_delete_session_use_case,
    get_export_results_use_case,
    get_export_session_use_case,
    get_go_back_use_case,
    get_load_session_use_case,
    get_modify_device_use_case,
    validate_session_id,
)
from .schema import (
    AnswerRequestSchema,
    AnswerResponseSchema,
    AssetSchema,
    DeviceSchema,
    GoBackRequestSchema,
    GoBackResponseSchema,
    LoadSessionResponseSchema,
    SessionResponseSchema,
)

router = InferringRouter(prefix="/session", tags=["session"])


@cbv(router)
class SessionController:
    create_session_use_case: ICreateSessionUseCase = Depends(get_create_session_use_case)
    answer_use_case: IAnswerUseCase = Depends(get_answer_use_case)
    go_back_use_case: IGoBackUseCase = Depends(get_go_back_use_case)
    export_results_use_case: IExportResultsUseCase = Depends(get_export_results_use_case)
    export_session_use_case: IExportSessionUseCase = Depends(get_export_session_use_case)
    delete_session_use_case: IDeleteSessionUseCase = Depends(get_delete_session_use_case)
    modify_device_use_case: IModifyDeviceUseCase = Depends(get_modify_device_use_case)
    load_session_use_case: ILoadSessionUseCase = Depends(get_load_session_use_case)

    @router.post("/create_session_with_file", status_code=201)
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
            raise InvalidDeviceFileException("Il file caricato non è un JSON valido.")

        result = await self.create_session_use_case.execute(
            CreateSessionRequest(device_data=device_data)
        )

        return SessionResponseSchema(
            session_id=result.session_id,
            device=DeviceSchema(
                device_name=result.device_name,
                operating_system=result.device_os,
                firmware_version=result.device_firmw_v,
                functionalities=result.device_funcs,
                description=result.device_desc,
                assets=[
                    AssetSchema(
                        id=asset["id"],
                        name=asset["name"],
                        type=asset["type"],
                        is_sensitive=asset["is_sensitive"],
                        description=asset["description"],
                    )
                    for asset in result.assets
                ],
            ),
            position={
                "current_asset_index": result.current_asset_index,
                "current_tree_index": result.current_tree_index,
                "current_node_id": result.current_node_id,
            },
        )

    @router.post("/create_session", status_code=201)
    async def create_session(
        self,
        body: DeviceSchema,
    ) -> SessionResponseSchema:
        result = await self.create_session_use_case.execute(
            CreateSessionRequest(device_data=body.model_dump())
        )

        return SessionResponseSchema(
            session_id=result.session_id,
            device=DeviceSchema(
                device_name=result.device_name,
                operating_system=result.device_os,
                firmware_version=result.device_firmw_v,
                functionalities=result.device_funcs,
                description=result.device_desc,
                assets=[
                    AssetSchema(
                        id=asset["id"],
                        name=asset["name"],
                        type=asset["type"],
                        is_sensitive=asset["is_sensitive"],
                        description=asset["description"],
                    )
                    for asset in result.assets
                ],
            ),
            position={
                "current_asset_index": result.current_asset_index,
                "current_tree_index": result.current_tree_index,
                "current_node_id": result.current_node_id,
            },
        )

    @router.post("/{session_id}/answer", status_code=200)
    async def answer(
        self,
        body: AnswerRequestSchema,
        session_id: str = Depends(validate_session_id),
    ) -> AnswerResponseSchema:
        """
        Risponde al nodo corrente con true (sì) o false (no).
        """
        result = await self.answer_use_case.execute(
            AnswerRequest(session_id=session_id, answer=body.answer)
        )
        return AnswerResponseSchema(
            next_node_id=result.next_node_id,
            tree_completed=result.tree_completed,
            tree_result=result.tree_result,
            session_finished=result.session_finished,
            results=result.results,
            current_asset_index=result.current_asset_index,
            current_tree_index=result.current_tree_index,
        )

    @router.post("/{session_id}/go_back", status_code=200)
    async def go_back(
        self, body: GoBackRequestSchema, session_id: str = Depends(validate_session_id)
    ) -> GoBackResponseSchema:
        """
        Torna a un nodo precedente nella history del tree corrente e aggiorna la nuova risposta
        """
        result = await self.go_back_use_case.execute(
            GoBackRequest(
                session_id=session_id,
                target_tree_index=body.target_tree_index,
                target_node_id=body.target_node_id,
                new_answer=body.new_answer,
            )
        )
        return GoBackResponseSchema(
            found=result.found,
            node_id=result.node_id,
            current_asset_index=result.current_asset_index,
            current_tree_index=result.current_tree_index,
        )

    @router.get("/{session_id}/export", status_code=200)
    async def export_session(self, session_id: str = Depends(validate_session_id)) -> Response:
        """
        Scarica la sessione completa come file JSON.
        """
        result = await self.export_session_use_case.execute(
            ExportSessionRequest(session_id=session_id)
        )
        return Response(
            content=result.content,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={result.filename}"},
        )

    @router.get("/{session_id}/export/results", status_code=200)
    async def export_results(
        self, session_id: str = Depends(validate_session_id), format: str = "csv"
    ) -> Response:
        """
        Scarica i risultati della sessione in CSV o PDF.
        """
        result = await self.export_results_use_case.execute(
            ExportResultsRequest(session_id=session_id, format=format)
        )
        return Response(
            content=result.content,
            media_type=result.media_type,
            headers={"Content-Disposition": f"attachment; filename={result.filename}"},
        )

    @router.delete("/{session_id}", status_code=204)
    async def delete_session(self, session_id: str = Depends(validate_session_id)) -> None:
        """
        Rimuove la sessione dalla memoria e cancella il file JSON dal server.
        """
        await self.delete_session_use_case.execute(DeleteSessionRequest(session_id=session_id))

    @router.post("/{session_id}/device/modify", status_code=200)
    async def modify_device(
        self, body: DeviceSchema, session_id: str = Depends(validate_session_id)
    ) -> None:
        """
        Modifica il device della Sessione (usato prima dell'inizio del test)
        """

        await self.modify_device_use_case.execute(
            ModifyDeviceRequest(session_id=session_id, device_data=body.model_dump())
        )

    @router.post("/load_session_from_file", status_code=200)
    async def load_session_from_file(
        self, file: Annotated[UploadFile, File(...)]
    ) -> LoadSessionResponseSchema:
        """
        Carica una sessione precedentemente esportata da file JSON.
        Restituisce lo stato completo della sessione (device, posizione, risultati).
        """
        try:
            content = await file.read()
            session_data = json.loads(content)
        except json.JSONDecodeError:
            raise InvalidDeviceFileException("Il file caricato non è un JSON valido.")

        result = await self.load_session_use_case.execute(
            LoadSessionRequest(session_data=session_data)
        )

        return LoadSessionResponseSchema(
            session_id=result.session_id,
            device=DeviceSchema(
                device_name=result.device_name,
                operating_system=result.device_os,
                firmware_version=result.device_firmw_v,
                functionalities=result.device_funcs,
                description=result.device_desc,
                assets=[
                    AssetSchema(
                        id=asset["id"],
                        name=asset["name"],
                        type=asset["type"],
                        is_sensitive=asset["is_sensitive"],
                        description=asset["description"],
                    )
                    for asset in result.assets
                ],
            ),
            position={
                "current_asset_index": result.current_asset_index,
                "current_tree_index": result.current_tree_index,
                "current_node_id": result.current_node_id,
            },
            results=result.results,
            is_finished=result.is_finished,
        )
