import csv
import io


class CsvExporter:
    @property
    def media_type(self) -> str:
        return "text/csv"

    @property
    def filename(self) -> str:
        return "results.csv"

    def export(self, results: dict[str, dict[str, str]], device_name: str) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["Device", "Asset ID", "Tree ID", "Result"])
        for asset_id, trees in results.items():
            for tree_id, result in trees.items():
                writer.writerow([device_name, asset_id, tree_id, result])

        return output.getvalue().encode("utf-8")
