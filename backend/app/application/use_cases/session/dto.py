from dataclasses import dataclass


@dataclass
class AnswerRequest:
    session_id: str
    answer: bool


@dataclass
class AnswerResponse:
    next_node_id: str | None
    tree_completed: bool
    tree_result: str | None
    session_finished: bool
    results: dict | None


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
    current_node_id: str
