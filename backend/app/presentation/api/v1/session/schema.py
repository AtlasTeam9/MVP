from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AssetSchema(BaseModel):
    """
    Singolo asset
    """

    id: str = Field(..., description="Id dell'asset")
    name: str = Field(..., description="Nome dell'asset")
    type: str = Field(..., description="Tipo dell'asset")
    is_sensitive: bool = Field(..., description="Sensibilità dell'asset")
    description: str | None = Field(..., description="Descrizione dell'asset")


class DeviceSchema(BaseModel):
    device_name: str = Field(..., description="Nome del dispositivo")
    os: str = Field(..., description="Sistema operativo del dispositivo")
    firmware_version: str = Field(..., description="Firmware version del dispositivo")
    functionalities: str = Field(..., description="Funzionalità del dispositivo")
    description: str = Field(..., description="Descrizione del dispositivo")
    assets: list[AssetSchema] = Field(..., description="Lista degli asset del dispositivo")


class AnswerRequestSchema(BaseModel):
    answer: bool = Field(..., description="Risposta al nodo corrente")


class GoBackRequestSchema(BaseModel):
    target_node_id: str = Field(..., description="ID del nodo a cui tornare")


class GoBackResponseSchema(BaseModel):
    found: bool = Field(...)
    node_id: str | None = Field(None)


class AnswerResponseSchema(BaseModel):
    next_node_id: str | None = Field(None)
    tree_completed: bool = Field(...)
    tree_result: str | None = Field(None)
    session_finished: bool = Field(...)
    results: dict | None = Field(None)


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
                        {
                            "id": "ASSET_01",
                            "name": "DHCP Client",
                            "type": "Network Function",
                            "is_sensitive": False,
                            "description": "description",
                        },
                    ],
                    "operative_system": "Linux-based embedded system",
                    "firmware_version": "1.0.0",
                    "functionalities": "MQTT-based IoT device with network and security capabilities",
                    "description": "A smart coffee machine that can be controlled remotely via MQTT protocol, allowing users to brew coffee from their smartphones. It includes network functions for connectivity and security functions to protect against unauthorized access.",
                },
                "position": {
                    "current_asset_index": 0,
                    "current_tree_index": 0,
                    "current_node_id": "node1",
                },
            }
        }
    )
