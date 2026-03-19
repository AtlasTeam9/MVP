from dataclasses import dataclass


@dataclass
class AnswerRequest:
    session_id: str
    answer: bool


@dataclass
class GoBackRequest:
    session_id: str
    target_node_id: str


@dataclass
class CreateSessionWithFileRequest:
    device_data: dict


@dataclass
class ExportResultsRequest:
    session_id: str
    format: str  # "csv" | "pdf"
