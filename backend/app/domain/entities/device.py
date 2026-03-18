from enum import Enum
from typing import Any


class AssetType(Enum):
    NETWORK = "Network"
    SECURITY = "Security"

    @staticmethod
    def from_string(value: str) -> "AssetType":
        value = value.lower()

        if value.startswith("network"):
            return AssetType.NETWORK
        if value.startswith("security"):
            return AssetType.SECURITY

        raise ValueError(f"Unknown asset type: {value}")


class Asset:
    def __init__(
        self,
        asset_id: str,
        name: str,
        type: AssetType,
        is_sensitive: bool,
        desc: str | None = None,
    ):
        self._asset_id: str = asset_id
        self._name: str = name
        self._type: AssetType = type
        self._is_sensitive = is_sensitive
        self._desc = desc

    @property
    def get_id(self) -> str:
        return self._asset_id

    @property
    def get_name(self) -> str:
        return self._name

    def set_name(self, name: str) -> None:
        self._name = name

    @property
    def get_type(self) -> AssetType:
        return self._type

    def set_type(self, type: str) -> None:
        self._type = AssetType.from_string(type)

    @property
    def get_sensitivity(self) -> bool | str:
        return self._is_sensitive

    def set_sensitivity(self, is_sensitive: bool) -> None:
        self._is_sensitive = is_sensitive

    @property
    def get_description(self) -> str:
        return self._desc or "Description not inserted"

    def set_description(self, desc: str) -> None:
        self._desc = desc

    def to_dict(self) -> dict:
        return {
            "id": self.get_id,
            "name": self.get_name,
            "type": self.get_type.value,
            "sensitive": self.get_sensitivity,
        }


class Device:
    # Per il momento ho inserito le informazioni come: sistema operativo, versione firmware, funzionalità e descrizione come opzionali
    def __init__(
        self,
        device_name: str,
        assets: list[Asset],
        operative_sys: str | None = None,
        firm_vers: str | None = None,
        funcs: str | None = None,
        desc: str | None = None,
    ):
        self._device_name = device_name
        self._assets = assets
        self._os = operative_sys
        self._firm_vers = firm_vers
        self._funcs = funcs
        self._desc = desc

    @property
    def get_name(self) -> str:
        return self._device_name

    def set_name(self, name: str) -> None:
        self._device_name = name

    @property
    def get_assets(self) -> list[Asset]:
        return list(self._assets)

    @property
    def get_operative_sys(self) -> str:
        return self._os or "Operative System not inserted"

    def set_operative_sys(self, op_sys: str) -> None:
        self._os = op_sys

    @property
    def get_firmware_vers(self) -> str:
        return self._firm_vers or "Firmware version not inserted"

    def set_firmware_vers(self, firm_vers: str) -> None:
        self._firm_vers = firm_vers

    @property
    def get_funcionalities(self) -> str:
        return self._funcs or "Functionalities not inserted"

    def set_funcionalities(self, funcs: str) -> None:
        self._funcs = funcs

    @property
    def get_description(self) -> str:
        return self._desc or "Description not inserted"

    def set_description(self, desc: str) -> None:
        self._desc = desc

    def to_dict(self) -> dict[str, Any]:
        return {
            "device_name": self._device_name,
            "assets": [asset.to_dict() for asset in self._assets],
        }
