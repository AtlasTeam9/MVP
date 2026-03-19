from dataclasses import dataclass


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
class CreateSessionWithFileResponse:
    session_id: str
    device_name: str
    assets: list[dict[str, str]]
    current_asset_index: int
    current_tree_index: int
    current_node_id: str


@dataclass
class ExportResultsResponse:
    content: bytes
    media_type: str
    filename: str
