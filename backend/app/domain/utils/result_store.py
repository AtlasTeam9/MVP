from ..entities.device import Asset
from ..entities.result import Result


class ResultStore:
    def __init__(self, assets: list[Asset]):
        self._results: dict[str, dict[str, Result]] = {asset.get_id: {} for asset in assets}

    def record(self, asset_id: str, tree_id: str, result: Result) -> None:
        self._results[asset_id][tree_id] = result

    def get(self, asset_id: str, tree_id: str) -> Result | None:
        return self._results[asset_id].get(tree_id)

    def to_dict(self) -> dict[str, dict[str, str]]:
        return {
            asset_id: {tree_id: result.value for tree_id, result in trees.items()}
            for asset_id, trees in self._results.items()
        }
