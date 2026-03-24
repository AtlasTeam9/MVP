from dataclasses import dataclass
from typing import TypedDict


class AssetResponse(TypedDict):
    id: str
    name: str
    type: str
    is_sensitive: bool
    description: str | None


@dataclass
class AnswerResponse:
    next_node_id: str | None
    tree_completed: bool
    tree_result: str | None
    session_finished: bool
    results: dict | None


@dataclass
class GoBackResponse:
    found: bool
    node_id: str | None


@dataclass
class CreateSessionResponse:
    session_id: str
    device_name: str
    device_os: str
    device_firmw_v: str
    device_funcs: str
    device_desc: str
    assets: list[AssetResponse]
    current_asset_index: int
    current_tree_index: int
    current_node_id: str


@dataclass
class ExportResultsResponse:
    content: bytes
    media_type: str
    filename: str


@dataclass
class ExportSessionResponse:
    content: bytes
    filename: str
