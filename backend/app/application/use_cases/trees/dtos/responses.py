from dataclasses import dataclass


@dataclass
class TreeResponse:
    id: str
    title: str
    dependencies: list[str]
    nodes: dict


@dataclass
class GetTreesResponse:
    trees: list[TreeResponse]
