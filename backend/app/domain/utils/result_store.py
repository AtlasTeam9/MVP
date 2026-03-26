from ..entities.device import Asset
from ..entities.result import Result


class ResultStore:
    def __init__(self, assets: list[Asset]):
        self._results: dict[str, dict[str, Result | None]] = {asset.get_id: {} for asset in assets}

    def record(self, asset_id: str, tree_id: str, result: Result) -> None:
        self._results[asset_id][tree_id] = result

    def reset(self, asset_id: str, tree_id: str) -> None:
        # Keep the tree key but mark it as pending recalculation.
        self._results[asset_id][tree_id] = None

    def get(self, asset_id: str, tree_id: str) -> Result | None:
        return self._results[asset_id].get(tree_id)

    def to_dict(self) -> dict[str, dict[str, str]]:
        return {
            asset_id: {
                tree_id: result.value if result is not None else ""
                for tree_id, result in trees.items()
            }
            for asset_id, trees in self._results.items()
        }

    def get_aggregated_results(self, all_tree_ids: list[str]) -> dict[str, str]:
        """
        Calcola il risultato globale per ogni requisito (albero) basandosi su tutti gli asset.
        Logica:
        - PASS: Se per quel requisito tutti gli asset sono PASS o NA (e almeno un PASS).
        - FAIL: Se c'è almeno un FAIL tra gli asset per quel requisito.
        - NOT_APPLICABLE: Se tutti gli asset sono NA per quel requisito.
        """
        aggregated = {}

        for tree_id in all_tree_ids:
            asset_results = []
            for asset_id in self._results:
                res = self._results[asset_id].get(tree_id)
                if res:
                    asset_results.append(res)

            if not asset_results:
                continue

            # Logica di decisione
            if any(r == Result.FAIL for r in asset_results):
                aggregated[tree_id] = Result.FAIL.value
            elif any(r == Result.PASS for r in asset_results):
                # Se non c'è FAIL e c'è almeno un PASS (gli altri sono NA)
                aggregated[tree_id] = Result.PASS.value
            else:
                # Sono tutti NOT_APPLICABLE
                aggregated[tree_id] = Result.NOT_APPLICABLE.value

        return aggregated
