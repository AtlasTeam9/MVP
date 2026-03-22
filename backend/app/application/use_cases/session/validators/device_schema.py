# app/application/use_cases/session/validators/device_schema.py
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AssetInput(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    type: str = Field(..., min_length=1)
    is_sensitive: bool
    description: str | None = None

    @field_validator("type")
    def type_must_be_valid(cls, v):
        valid = [
            "network function",
            "network function configuration",
            "security function",
            "security parameter",
        ]
        if v.lower() not in valid:
            raise ValueError(f"Tipo asset non valido: {v}. Validi: {valid}")
        return v


class DeviceInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    device_name: str = Field(..., min_length=1)
    operating_system: str | None = None
    firmware_version: str | None = None
    functionalities: str | None = None
    description: str | None = None
    assets: list[AssetInput] = Field(..., min_length=1)
