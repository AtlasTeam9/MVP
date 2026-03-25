import csv
import io


class CsvExporter:
    @property
    def media_type(self) -> str:
        return "text/csv"

    @property
    def filename(self) -> str:
        return "results.csv"

    def export(self, results: dict[str, str], device_name: str) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([f"EN18031 Compliance Results - {device_name}"])
        writer.writerow(["Device", device_name])
        writer.writerow([])

        writer.writerow(["Requirement", "Final Result"])

        for tree, result in results.items():
            writer.writerow([tree, result])

        return output.getvalue().encode("utf-8")
