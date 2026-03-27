from dataclasses import dataclass, field


@dataclass
class AnswerRequest:
    session_id: str
    answer: bool


@dataclass
class GoBackRequest:
    session_id: str
    target_asset_index: int
    target_tree_index: int
    target_node_id: str
    new_answer: bool


@dataclass
class CreateSessionRequest:
    device_data: dict


@dataclass
class ExportResultsRequest:
    session_id: str
    format: str  # "csv" | "pdf"


@dataclass
class ExportSessionRequest:
    session_id: str
    answers: list[dict] = field(default_factory=list)


@dataclass
class DeleteSessionRequest:
    session_id: str


@dataclass
class ModifyDeviceRequest:
    session_id: str
    device_data: dict


@dataclass
class LoadSessionRequest:
    session_data: dict
