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

        writer.writerow(["REPORT SINTETICO DI CONFORMITA"])
        writer.writerow(["Device", device_name])
        writer.writerow([])

        writer.writerow(["ID Requisito", "Esito Finale"])

        for tree, result in results.items():
            writer.writerow([tree, result])

        return output.getvalue().encode("utf-8")
