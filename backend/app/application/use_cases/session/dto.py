from dataclasses import dataclass


@dataclass
class CreateSessionWithFileRequest:
    device_data: dict


@dataclass
class CreateSessionWithFileResponse:
    session_id: str
    device_name: str
    assets: list[dict[str, str]]
    current_asset_index: int
    current_tree_index: int
