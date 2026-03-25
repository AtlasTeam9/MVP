from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AssetSchema(BaseModel):
    """
    Singolo asset
    """

    model_config = ConfigDict(extra="forbid")

    id: str = Field(..., description="Id dell'asset", min_length=1)
    name: str = Field(..., description="Nome dell'asset", min_length=1)
    type: str = Field(..., description="Tipo dell'asset")
    is_sensitive: bool = Field(..., description="Sensibilità dell'asset")
    description: str | None = Field(..., description="Descrizione dell'asset")

    @field_validator("type")
    def type_must_be_valid(cls, v):
        valid = [
            "network function",
            "network function configuration",
            "security function",
            "security parameter",
        ]
        if v.lower() not in valid:
            raise ValueError(f"Tipo asset non valido: {v}")
        return v


class DeviceSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    device_name: str = Field(..., description="Nome del dispositivo", min_length=1)
    operating_system: str = Field(..., description="Sistema operativo del dispositivo")
    firmware_version: str = Field(..., description="Firmware version del dispositivo")
    functionalities: str = Field(..., description="Funzionalità del dispositivo")
    description: str | None = Field(..., description="Descrizione del dispositivo")
    assets: list[AssetSchema] = Field(
        ..., description="Lista degli asset del dispositivo", min_length=1
    )


class AnswerRequestSchema(BaseModel):
    answer: bool = Field(..., description="Risposta al nodo corrente")


class GoBackRequestSchema(BaseModel):
    target_node_id: str = Field(..., description="ID del nodo a cui tornare")
    target_tree_index: int = Field(..., description="Indice dell'albero a cui tornare")
    new_answer: bool = Field(..., description="Nuova risposta per il nodo target")


class GoBackResponseSchema(BaseModel):
    found: bool = Field(..., description="True se il nodo è stato creato False altrimenti")
    node_id: str | None = Field(None, description="Id del nodo trovato")


class AnswerResponseSchema(BaseModel):
    next_node_id: str | None = Field(None, description="Id del prossimo nodo")
    tree_completed: bool = Field(
        ..., description="True se l'albero corrente è completato False altrimenti"
    )
    tree_result: str | None = Field(None, description="Risultato dell'albero completato")
    session_finished: bool = Field(..., description="True se la sessione è finita False altrimenti")
    results: dict | None = Field(None, description="Dizionario dei risultati del test")


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
                    "operating_system": "Linux-based embedded system",
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
