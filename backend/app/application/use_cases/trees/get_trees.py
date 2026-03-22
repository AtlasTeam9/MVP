from app.application.interfaces.get_trees_use_case import IGetTreesUseCase
from app.domain.entities.tree import DecisionTree


class GetTreesUseCase(IGetTreesUseCase):
    def __init__(self, trees: list[DecisionTree]):
        self.trees = trees

    async def execute(self) -> list[dict]:
        return [
            {
                "id": t.get_id,
                "title": t.get_title,
                "dependencies": t.get_dependencies,
                "nodes": {
                    node.get_id: {
                        "question": node.get_question,
                    }
                    for node in t.nodes
                },
            }
            for t in self.trees
        ]
