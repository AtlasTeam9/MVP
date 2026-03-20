import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# Colori
HEADER_BG = colors.HexColor("#1A3A6B")  # blu scuro
HEADER_FG = colors.white
ROW_ALT_BG = colors.HexColor("#EEF2F8")  # blu chiarissimo per righe alternate
ROW_BG = colors.white
PASS_FG = colors.HexColor("#1D6A2E")  # verde scuro
FAIL_FG = colors.HexColor("#8B1A1A")  # rosso scuro
NA_FG = colors.HexColor("#5A5A5A")  # grigio

RESULT_COLORS = {
    "PASS": PASS_FG,
    "FAIL": FAIL_FG,
    "NOT_APPLICABLE": NA_FG,
}


class PdfExporter:
    @property
    def media_type(self) -> str:
        return "application/pdf"

    @property
    def filename(self) -> str:
        return "results.pdf"

    def export(self, results: dict[str, dict[str, str]], device_name: str) -> bytes:
        buffer = io.BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
            title=f"EN18031 Compliance Results - {device_name}",
            author="EN18031 Compliance Tool",
            subject="Compliance Results",
        )

        styles = getSampleStyleSheet()
        story = []

        title_style = styles["Title"]
        story.append(Paragraph(f"EN18031 Compliance Results - {device_name}", title_style))
        story.append(Spacer(1, 0.5 * cm))

        for asset_id, trees in results.items():
            heading_style = styles["Heading2"]
            story.append(Paragraph(f"Asset: {asset_id}", heading_style))
            story.append(Spacer(1, 0.2 * cm))

            if not trees:
                story.append(Paragraph("No results recorded.", styles["Normal"]))
                story.append(Spacer(1, 0.4 * cm))
                continue

            table_data = [["Tree ID", "Result"]]
            for tree_id, result in trees.items():
                table_data.append([tree_id, result])

            col_widths = [11 * cm, 5 * cm]
            table = Table(table_data, colWidths=col_widths)

            table_style = [
                ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
                ("TEXTCOLOR", (0, 0), (-1, 0), HEADER_FG),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                # Bordi
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
                ("BOX", (0, 0), (-1, -1), 1, HEADER_BG),
                # Testo righe dati
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("TOPPADDING", (0, 1), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
                ("ALIGN", (1, 1), (1, -1), "CENTER"),
            ]

            # Righe alternate + colore risultato
            for row_idx, (tree_id, result) in enumerate(trees.items(), start=1):
                bg = ROW_ALT_BG if row_idx % 2 == 0 else ROW_BG
                table_style.append(("BACKGROUND", (0, row_idx), (-1, row_idx), bg))

                result_color = RESULT_COLORS.get(result, NA_FG)
                table_style.append(("TEXTCOLOR", (1, row_idx), (1, row_idx), result_color))
                table_style.append(("FONTNAME", (1, row_idx), (1, row_idx), "Helvetica-Bold"))

            table.setStyle(TableStyle(table_style))
            story.append(table)
            story.append(Spacer(1, 0.6 * cm))

        doc.build(story)
        buffer.seek(0)
        return buffer.read()
