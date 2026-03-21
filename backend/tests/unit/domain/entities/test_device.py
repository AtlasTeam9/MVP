"""
Unit tests per Device entity.
"""

import pytest

from app.domain.entities.device import (
    Asset,
    AssetType,
    Device,
)


class TestAssetType:
    def test_from_string_valid_network(self):
        assert AssetType.from_string("network") == AssetType.NETWORK
        assert AssetType.from_string("NetWork switch") == AssetType.NETWORK

    def test_from_string_valid_security(self):
        assert AssetType.from_string("security") == AssetType.SECURITY
        assert AssetType.from_string("SECURITY firewall") == AssetType.SECURITY

    def test_from_string_invalid_raises_error(self):
        with pytest.raises(ValueError, match="Unknown asset type: unknown"):
            AssetType.from_string("unknown")


class TestAsset:
    def test_asset_initialization_and_getters(self):
        asset = Asset(
            asset_id="a1",
            name="Firewall",
            type=AssetType.SECURITY,
            is_sensitive=True,
            desc="Main firewall",
        )
        assert asset.get_id == "a1"
        assert asset.get_name == "Firewall"
        assert asset.get_type == AssetType.SECURITY
        assert asset.get_sensitivity is True
        assert asset.get_description == "Main firewall"

    def test_asset_default_properties(self):
        # Testiamo i fallback ("... not inserted") quando i valori opzionali sono None
        asset = Asset("a2", "Switch", AssetType.NETWORK, True)
        assert asset.get_description == "Description not inserted"

    def test_asset_setters(self):
        asset = Asset("a3", "Router", AssetType.NETWORK, False)

        asset.set_name("Core Router")
        assert asset.get_name == "Core Router"

        asset.set_type("security")
        assert asset.get_type == AssetType.SECURITY

        asset.set_sensitivity(True)
        assert asset.get_sensitivity is True

        asset.set_description("Updated desc")
        assert asset.get_description == "Updated desc"

    def test_asset_to_dict(self):
        asset = Asset("a4", "Server", AssetType.NETWORK, False)
        expected = {
            "id": "a4",
            "name": "Server",
            "type": "Network",
            "is_sensitive": False,
            "description": "Description not inserted",
        }
        assert asset.to_dict() == expected


class TestDevice:
    @pytest.fixture
    def sample_assets(self):
        return [
            Asset("1", "Asset 1", AssetType.NETWORK, True),
            Asset("2", "Asset 2", AssetType.SECURITY, False),
        ]

    def test_device_initialization_and_getters(self, sample_assets):
        device = Device(
            device_name="Core Switch",
            assets=sample_assets,
            operative_sys="Cisco IOS",
            firm_vers="15.2",
            funcs="Routing and Switching",
            desc="Main building switch",
        )

        assert device.get_name == "Core Switch"
        assert len(device.get_assets) == 2
        assert device.get_operative_sys == "Cisco IOS"
        assert device.get_firmware_vers == "15.2"
        assert device.get_funcionalities == "Routing and Switching"
        assert device.get_description == "Main building switch"

    def test_device_default_properties(self, sample_assets):
        device = Device("Basic Device", sample_assets)

        assert device.get_operative_sys == "Operative System not inserted"
        assert device.get_firmware_vers == "Firmware version not inserted"
        assert device.get_funcionalities == "Functionalities not inserted"
        assert device.get_description == "Description not inserted"

    def test_device_setters(self, sample_assets):
        device = Device("Temp Device", sample_assets)

        device.set_name("New Name")
        assert device.get_name == "New Name"

        device.set_operative_sys("Linux")
        assert device.get_operative_sys == "Linux"

        device.set_firmware_vers("v2.0")
        assert device.get_firmware_vers == "v2.0"

        device.set_funcionalities("Firewalling")
        assert device.get_funcionalities == "Firewalling"

        device.set_description("Updated device")
        assert device.get_description == "Updated device"

    def test_device_to_dict(self, sample_assets):
        device = Device("Test Device", sample_assets)
        result = device.to_dict()

        assert result["device_name"] == "Test Device"
        assert len(result["assets"]) == 2
        assert result["assets"][0] == {
            "id": "1",
            "name": "Asset 1",
            "type": "Network",
            "is_sensitive": True,
            "description": "Description not inserted",
        }
        assert result["assets"][1] == {
            "id": "2",
            "name": "Asset 2",
            "type": "Security",
            "is_sensitive": False,
            "description": "Description not inserted",
        }
