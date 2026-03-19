import io

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


class PdfExporter:
    @property
    def media_type(self) -> str:
        return "application/pdf"

    @property
    def filename(self) -> str:
        return "results.pdf"

    def export(self, results: dict[str, dict[str, str]], device_name: str) -> bytes:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, f"EN18031 Compliance Results — {device_name}")

        c.setFont("Helvetica", 11)
        y = height - 90

        for asset_id, trees in results.items():
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y, f"Asset: {asset_id}")
            y -= 20

            c.setFont("Helvetica", 11)
            for tree_id, result in trees.items():
                c.drawString(70, y, f"{tree_id}: {result}")
                y -= 18

                if y < 60:
                    c.showPage()
                    y = height - 50

            y -= 10

        c.save()
        buffer.seek(0)
        return buffer.read()
