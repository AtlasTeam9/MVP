from dataclasses import dataclass


@dataclass
class GetTreesResponse:
    id: str
    title: str
    dependencies: list[str]
    nodes: dict
