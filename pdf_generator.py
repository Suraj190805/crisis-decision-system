from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

DARK_BLUE = colors.HexColor("#1E3A5F")
ACCENT_BLUE = colors.HexColor("#2E86AB")
RED = colors.HexColor("#DC2626")
ORANGE = colors.HexColor("#D97706")
GREEN = colors.HexColor("#059669")
PURPLE = colors.HexColor("#7C3AED")
LIGHT_GRAY = colors.HexColor("#F8FAFC")
DARK_GRAY = colors.HexColor("#374151")

def generate_crisis_report_pdf(event: str, region: str, report: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Title Section ─────────────────────────────────────────
    title_style = ParagraphStyle(
        'Title', parent=styles['Title'],
        fontSize=24, textColor=DARK_BLUE,
        spaceAfter=6, alignment=TA_CENTER, fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontSize=12, textColor=ACCENT_BLUE,
        spaceAfter=4, alignment=TA_CENTER
    )
    meta_style = ParagraphStyle(
        'Meta', parent=styles['Normal'],
        fontSize=9, textColor=colors.gray,
        spaceAfter=4, alignment=TA_CENTER
    )

    elements.append(Paragraph("🌐 Global Crisis Decision System", title_style))
    elements.append(Paragraph("AI-Powered Multi-Agent Crisis Analysis Report", subtitle_style))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M UTC')}", meta_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=ACCENT_BLUE, spaceAfter=20))

    # ── Event Header ──────────────────────────────────────────
    event_style = ParagraphStyle(
        'Event', parent=styles['Normal'],
        fontSize=16, textColor=DARK_BLUE,
        spaceAfter=6, fontName='Helvetica-Bold'
    )
    elements.append(Paragraph(f"Crisis Event: {event}", event_style))
    elements.append(Paragraph(f"Region: {region.title()}  |  Analysis Type: AI Multi-Agent", meta_style))
    elements.append(Spacer(1, 12))

    # ── Risk Level ────────────────────────────────────────────
    risk = report.get("overall_risk_level", 0)
    risk_color = RED if risk >= 8 else ORANGE if risk >= 5 else GREEN
    risk_label = "CRITICAL" if risk >= 8 else "MODERATE" if risk >= 5 else "LOW"

    risk_data = [[
        Paragraph(f"<font size='36' color='#{risk_color.hexval()[2:]}'><b>{risk}/10</b></font>", styles['Normal']),
        Paragraph(f"<font size='14' color='#{risk_color.hexval()[2:]}'><b>RISK LEVEL: {risk_label}</b></font><br/><font size='9' color='gray'>Based on multi-agent analysis across economic, trade, energy, and social dimensions</font>", styles['Normal'])
    ]]
    risk_table = Table(risk_data, colWidths=[1.5*inch, 5.5*inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('ROUNDEDCORNERS', [8]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
        ('BOX', (0, 0), (-1, -1), 2, risk_color),
    ]))
    elements.append(risk_table)
    elements.append(Spacer(1, 16))

    # ── Section Helper ────────────────────────────────────────
    def section_title(text, color=DARK_BLUE):
        return Paragraph(f"<font color='#{color.hexval()[2:]}'><b>{text}</b></font>",
            ParagraphStyle('SectionTitle', parent=styles['Normal'],
                fontSize=12, spaceAfter=8, spaceBefore=16,
                borderPad=4, fontName='Helvetica-Bold'))

    def body_text(text):
        return Paragraph(text, ParagraphStyle('Body', parent=styles['Normal'],
            fontSize=10, textColor=DARK_GRAY, spaceAfter=4, leading=16))

    # ── Executive Summary ─────────────────────────────────────
    elements.append(section_title("📋 Executive Summary", ACCENT_BLUE))
    elements.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE, spaceAfter=8))
    summary = report.get("executive_summary", "No summary available.")
    elements.append(body_text(summary))
    elements.append(Spacer(1, 8))

    # ── Top Impacts + Actions side by side ───────────────────
    impacts = report.get("top_5_predicted_impacts", [])
    actions = report.get("immediate_actions", [])

    impact_content = [Paragraph(f"<font color='#D97706'><b>TOP PREDICTED IMPACTS</b></font>",
        ParagraphStyle('ImpactTitle', parent=styles['Normal'], fontSize=10, spaceAfter=8))]
    for i, impact in enumerate(impacts):
        impact_content.append(Paragraph(f"→  {impact}",
            ParagraphStyle('Impact', parent=styles['Normal'],
                fontSize=9, textColor=DARK_GRAY, spaceAfter=6, leading=14,
                leftIndent=8)))

    action_content = [Paragraph(f"<font color='#059669'><b>IMMEDIATE ACTIONS</b></font>",
        ParagraphStyle('ActionTitle', parent=styles['Normal'], fontSize=10, spaceAfter=8))]
    for i, action in enumerate(actions):
        action_content.append(Paragraph(f"{i+1}.  {action}",
            ParagraphStyle('Action', parent=styles['Normal'],
                fontSize=9, textColor=DARK_GRAY, spaceAfter=6, leading=14,
                leftIndent=8)))

    two_col = Table(
        [[impact_content, action_content]],
        colWidths=[3.5*inch, 3.5*inch]
    )
    two_col.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#FFFBEB")),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#ECFDF5")),
        ('BOX', (0, 0), (0, 0), 1, ORANGE),
        ('BOX', (1, 0), (1, 0), 1, GREEN),
    ]))
    elements.append(two_col)
    elements.append(Spacer(1, 16))

    # ── 30 Day Outlook ────────────────────────────────────────
    elements.append(section_title("🔮 30-Day Outlook", PURPLE))
    elements.append(HRFlowable(width="100%", thickness=1, color=PURPLE, spaceAfter=8))
    outlook = report.get("30_day_outlook", "No outlook available.")
    elements.append(body_text(outlook))
    elements.append(Spacer(1, 16))

    # ── Footer ────────────────────────────────────────────────
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey, spaceAfter=8))
    elements.append(Paragraph(
        "Generated by Global Crisis Decision System • AI Multi-Agent Analysis • Data sourced from NewsAPI, Yahoo Finance",
        ParagraphStyle('Footer', parent=styles['Normal'],
            fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()