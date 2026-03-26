import uuid

from pydantic import ValidationError

from app.application.interfaces.session_service import ISessionService
from app.application.interfaces.use_cases.load_session import ILoadSessionUseCase
from app.application.use_cases.session.dtos.requests import LoadSessionRequest
from app.application.use_cases.session.dtos.responses import LoadSessionResponse
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.entities.result import Result
from app.domain.exceptions import InvalidDeviceFileException
from app.domain.factories.session_factory import SessionFactory
from app.presentation.api.v1.session.schema import DeviceSchema


class LoadSessionUseCase(ILoadSessionUseCase):
    def __init__(self, session_service: ISessionService, session_factory: SessionFactory):
        self._session_service = session_service
        self._factory = session_factory

    async def execute(self, request: LoadSessionRequest) -> LoadSessionResponse:
        data = request.session_data

        required_keys = {"session_id", "device", "position", "results", "is_finished"}
        missing = required_keys - data.keys()
        if missing:
            raise InvalidDeviceFileException(f"File sessione non valido: campi mancanti {missing}.")

        session_id = data["session_id"]

        try:
            uuid.UUID(session_id, version=4)
        except ValueError:
            raise InvalidDeviceFileException(
                "File sessione non valido: session_id non è un UUID v4."
            )

        try:
            validated_device = DeviceSchema(**data["device"])
        except ValidationError as e:
            raise InvalidDeviceFileException(
                f"File sessione non valido, sezione 'device': {e.errors()}"
            )

        device = Device(
            device_name=validated_device.device_name,
            assets=[
                Asset(
                    asset.id,
                    asset.name,
                    AssetType.from_string(asset.type),
                    asset.is_sensitive,
                    asset.description,
                )
                for asset in validated_device.assets
            ],
            operating_sys=validated_device.operating_system,
            firm_vers=validated_device.firmware_version,
            funcs=validated_device.functionalities,
            desc=validated_device.description,
        )

        # Ricrea sempre la sessione dal file: è un'operazione di import esplicita,
        # quindi sovrascriviamo qualsiasi stato precedente in cache o su disco.
        session = self._factory.restore(device, session_id)

        # 1. Ripristina i risultati
        for asset_id, trees in data.get("results", {}).items():
            for tree_id, result_str in trees.items():
                try:
                    session.results.record(asset_id, tree_id, Result(result_str))
                except ValueError:
                    raise InvalidDeviceFileException(
                        f"Risultato non valido '{result_str}' per asset '{asset_id}', "
                        f"tree '{tree_id}'."
                    )

        # 2. Ripristina la posizione
        position = data.get("position", {})
        session.state.current_asset_index = position.get("current_asset_index", 0)
        session.state.current_tree_index = position.get("current_tree_index", 0)
        session.state.is_finished = data.get("is_finished", False)

        # 3. Ripristina il nodo corrente nell'albero attivo (solo se la sessione non è finita)
        node_id = position.get("current_node_id", "")
        if node_id and not session.state.is_finished:
            current_tree = session.navigator.current_tree()
            if current_tree:
                for node in current_tree.nodes:
                    if node.get_id == node_id:
                        session.state.current_node = node
                        break

        # Persiste su disco e aggiorna la cache
        self._session_service.save_session(session)
        all_tree_ids = [t.get_id for t in session.get_trees]

        return LoadSessionResponse(
            session_id=session.get_id,
            device_name=session.get_device.get_name,
            device_os=session.get_device.get_operating_sys,
            device_firmw_v=session.get_device.get_firmware_vers,
            device_funcs=session.get_device.get_funcionalities,
            device_desc=session.get_device.get_description,
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
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
            current_node_id=session.state.current_node_id,
            results=session.results.to_dict(),
            aggregate_results=session.results.get_aggregated_results(all_tree_ids),
            is_finished=session.state.is_finished,
        )
