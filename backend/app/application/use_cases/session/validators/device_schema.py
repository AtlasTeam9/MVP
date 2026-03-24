from pydantic import BaseModel, ConfigDict, Field, field_validator


class AssetInput(BaseModel):
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


class DeviceInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    device_name: str = Field(..., description="Nome del dispositivo", min_length=1)
    operating_system: str = Field(..., description="Sistema operativo del dispositivo")
    firmware_version: str = Field(..., description="Firmware version del dispositivo")
    functionalities: str = Field(..., description="Funzionalità del dispositivo")
    description: str | None = Field(..., description="Descrizione del dispositivo")
    assets: list[AssetInput] = Field(
        ..., description="Lista degli asset del dispositivo", min_length=1
    )
