from fastapi import Depends

from app.application.interfaces.get_trees_use_case import IGetTreesUseCase
from app.application.use_cases.trees.get_trees import GetTreesUseCase
from app.domain.entities.tree import DecisionTree

from ..shared_dependencies import get_trees


def get_trees_use_case(trees: list[DecisionTree] = Depends(get_trees)) -> IGetTreesUseCase:
    return GetTreesUseCase(trees)
