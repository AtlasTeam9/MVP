from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AssetSchema(BaseModel):
    """
    Singolo asset
    """

    id: str
    name: str
    type: str


class DeviceSchema(BaseModel):
    device_name: str = Field(..., description="Nome del dispositivo")
    assets: list[AssetSchema] = Field(..., description="Lista degli asset del dispositivo")


class SessionResponseSchema(BaseModel):
    """
    Response alla creazione di una sessione
    Usata per /start
    """

    session_id: str = Field(..., description="ID univoco della sessione")
    device: DeviceSchema = Field(..., description="Oggetto del dispositivo")
    position: dict[str, Any] = Field(
        ..., description="Dizionario che mostra lo stato di avanzamento del test nella sessione"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "device": {
                    "device_name": "Dispositivo Medico XYZ",
                    "assets": [
                        {"id": "ASSET_01", "name": "DHCP Client", "type": "Network Function"},
                    ],
                },
                "position": {
                    "current_asset_index": 0,
                    "current_tree_index": 0,
                    "current_node_id": "node1",
                },
            }
        }
    )
