# -*- coding: utf-8 -*-
"""Draft assembly PDF preview for Alice Lifter — Front-Right corner."""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak,
    Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(r"c:\Users\ivayl\Documents\3_Projects\Lifter-4Q-Gadjet1\Lifter_3Dprints\Print_3D")
OUT = Path(r"c:\Users\ivayl\Documents\3_Projects\Lifter-4Q-Gadjet1\Lifter_3Dprints\Alice_Lifter_Assembly_DRAFT.pdf")

# Prefer a Windows font that supports Bulgarian Cyrillic
FONT = "Helvetica"
FONT_B = "Helvetica-Bold"
for name, path in [
    ("DejaVu", r"C:\Windows\Fonts\DejaVuSans.ttf"),
    ("DejaVu", r"C:\Windows\Fonts\segoeui.ttf"),
    ("DejaVuB", r"C:\Windows\Fonts\segoeuib.ttf"),
    ("DejaVu", r"C:\Windows\Fonts\arial.ttf"),
    ("DejaVuB", r"C:\Windows\Fonts\arialbd.ttf"),
]:
    p = Path(path)
    if p.exists():
        try:
            pdfmetrics.registerFont(TTFont(name, str(p)))
            if name.endswith("B") or "bd" in path or "segoeuib" in path:
                FONT_B = name
            else:
                FONT = name
                if FONT_B == "Helvetica-Bold":
                    FONT_B = name
        except Exception:
            pass

# If only one registered as DejaVu, set both
if FONT != "Helvetica":
    if FONT_B == "Helvetica-Bold":
        FONT_B = FONT

W, H = A4
MARGIN = 16 * mm
ACCENT = HexColor("#2d5a3d")
MUTED = HexColor("#555555")
LIGHT = HexColor("#f4f6f4")


def img(name, max_w=170 * mm, max_h=95 * mm):
    path = ROOT / name
    if not path.exists():
        return Paragraph(f"<i>[missing: {name}]</i>", styles["body"])
    im = Image(str(path))
    iw, ih = im.imageWidth, im.imageHeight
    scale = min(max_w / iw, max_h / ih)
    im.drawWidth = iw * scale
    im.drawHeight = ih * scale
    im.hAlign = "CENTER"
    return im


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="title_bg", fontName=FONT_B, fontSize=18, leading=22,
    textColor=ACCENT, spaceAfter=4, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    name="sub", fontName=FONT, fontSize=10, leading=13,
    textColor=MUTED, spaceAfter=10, alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    name="sec", fontName=FONT_B, fontSize=13, leading=16,
    textColor=ACCENT, spaceBefore=8, spaceAfter=6
))
styles.add(ParagraphStyle(
    name="body", fontName=FONT, fontSize=9.5, leading=13,
    textColor=black, spaceAfter=4
))
styles.add(ParagraphStyle(
    name="caption", fontName=FONT, fontSize=8, leading=10,
    textColor=MUTED, alignment=TA_CENTER, spaceBefore=2, spaceAfter=8
))
styles.add(ParagraphStyle(
    name="warn", fontName=FONT, fontSize=8.5, leading=11,
    textColor=HexColor("#6b3a00"), spaceBefore=6, spaceAfter=6
))
styles.add(ParagraphStyle(
    name="foot", fontName=FONT, fontSize=8, leading=10,
    textColor=MUTED, alignment=TA_CENTER
))


def section(title, picture, caption, bullets):
    bits = [Paragraph(title, styles["sec"]), img(picture), Paragraph(caption, styles["caption"])]
    for b in bullets:
        bits.append(Paragraph(f"• {b}", styles["body"]))
    bits.append(Spacer(1, 4))
    return KeepTogether(bits)


def build():
    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=14 * mm, bottomMargin=14 * mm,
        title="Alice Lifter — Assembly draft (Front-Right)",
        author="Ivo / draft preview",
    )
    story = []

    story.append(Paragraph("Alice Lifter", styles["title_bg"]))
    story.append(Paragraph(
        "Assembly preview — Front-Right corner<br/>DRAFT — for look &amp; feel only · 2026-07-24",
        styles["sub"]
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=8))
    story.append(Paragraph(
        "Това е <b>чернова</b>, за да видим как изглежда ръководството. "
        "Hardware от бележките + GRÖBE heat-set. Не е финална поръчка.",
        styles["body"]
    ))
    story.append(Paragraph(
        "BE AWARE — electrical motor inside. RAISE only as designed. Motor warning on printed parts.",
        styles["warn"]
    ))

    # Overview
    story.append(Paragraph("1. Overview — Front-Right corner", styles["sec"]))
    story.append(img("BodyCaseCover.png", max_h=85 * mm))
    story.append(Paragraph(
        "Brand face: enchanted botanical analysis · alice-botanyca.COM · Front-Right Corner",
        styles["caption"]
    ))
    story.append(img("Body_FR.png", max_h=80 * mm))
    story.append(Paragraph("Printed body — Front-Right Corner (structure)", styles["caption"]))

    story.append(PageBreak())

    # Motor case
    story.append(Paragraph("2. Motor case + cover", styles["sec"]))
    story.append(img("MotorCase.png", max_h=70 * mm))
    story.append(Paragraph("MotorCase — JOIN WOLF TEAM", styles["caption"]))
    story.append(img("MotorCaseCover.png", max_h=70 * mm))
    story.append(Paragraph("MotorCaseCover — MOTOR inside · 4 holes around shaft", styles["caption"]))
    story.append(Paragraph(
        "• Motor is held on <b>MotorCaseCover</b> with <b>4× M3</b> bolts.<br/>"
        "• Thread length without head: <b>6 mm</b>.<br/>"
        "• If round head: head Ø <b>max 6 mm</b>, head height ~<b>2 mm</b>.",
        styles["body"]
    ))

    story.append(Paragraph("3. Motor assembly on Body", styles["sec"]))
    story.append(img("GrowBoxMotor_Assembled.png", max_h=75 * mm))
    story.append(Paragraph("GrowBox / motor assembled (ghost view)", styles["caption"]))
    story.append(img("Motor_Body_Assembled.png", max_h=75 * mm))
    story.append(Paragraph("Motor seated in Front-Right body", styles["caption"]))
    story.append(Paragraph(
        "• Whole motor unit → Body with <b>2× M4</b> bolts, length <b>max 10 mm</b>, "
        "<b>countersunk</b> head, head width <b>max 8 mm</b>.<br/>"
        "• Into Body (heat-set, GRÖBE): <b>2× #8-32 Short</b> (hole Ø5.6 · L 4.7 mm) for those M4 bolts.",
        styles["body"]
    ))

    story.append(PageBreak())

    # Axis / inserts
    story.append(Paragraph("4. Axis (AxZ) + more Body inserts", styles["sec"]))
    story.append(img("Body_AxZ_Assembled.png", max_h=75 * mm))
    story.append(Paragraph("Body + AxZ guide / bushing", styles["caption"]))
    story.append(img("AxZ_Final_Cconnected.png", max_h=70 * mm))
    story.append(Paragraph("AxZ connected through Front-Right Corner", styles["caption"]))
    story.append(Paragraph(
        "• Also in Body: <b>4× M6</b> heat-set — hole ~Ø8 · length ~12.7–13.7 mm "
        "(confirm M6 vs M6 Short on GRÖBE chart).<br/>"
        "• Also in Body: <b>4×</b> M4-thread inserts — <b>2× #8-32 Short</b> + <b>2× #8-32</b> (long L 8.1).",
        styles["body"]
    ))

    story.append(Paragraph("5. Body cover + stopper", styles["sec"]))
    story.append(img("BodyCase.png", max_h=70 * mm))
    story.append(Paragraph("BodyCase (side / mount view)", styles["caption"]))
    story.append(img("BodyCase_Stopper.png", max_h=65 * mm))
    story.append(Paragraph("BodyCase + stopper zone (pink = keep-out / fit)", styles["caption"]))
    story.append(Paragraph(
        "• Body cover: <b>2× M4</b> countersunk — head ~<b>8 mm</b> · ~<b>2.4 mm</b> (from note).<br/>"
        "• Stopper capture: <b>M3 / #6-32 Short</b> heat-set — hole ~Ø<b>4.8</b> · L ~<b>4.8</b> "
        "(max related 8 mm) — confirm against GRÖBE #6-32 Short.",
        styles["body"]
    ))

    story.append(PageBreak())

    # Full assembly + BOM table
    story.append(Paragraph("6. Full corner assembly", styles["sec"]))
    story.append(img("GrowBoxMotor_Assembled1.png", max_h=90 * mm))
    story.append(Paragraph(
        "Front-Right Corner + motor unit + AxZ · RANGE sixty cm label on lower block",
        styles["caption"]
    ))

    story.append(Paragraph("7. Hardware cheat-sheet (1 corner — draft)", styles["sec"]))
    data = [
        [Paragraph("<b>Qty</b>", styles["body"]),
         Paragraph("<b>Item</b>", styles["body"]),
         Paragraph("<b>Use</b>", styles["body"])],
        ["4", "M3 · 6 mm thread (round head OK)", "Motor → MotorCaseCover"],
        ["2", "M4 · ≤10 mm countersunk", "Motor unit → Body"],
        ["2+", "#8-32 Short insert (Ø5.6 / L4.7)", "Body (for M4)"],
        ["2", "#8-32 long insert (L8.1)", "Body"],
        ["4", "M6 insert (confirm short/full)", "Body"],
        ["2", "M4 countersunk (~8 / 2.4 head)", "Body cover"],
        ["?", "#6-32 Short / M3 insert (~Ø4.8)", "Stopper capture"],
    ]
    t = Table(data, colWidths=[18 * mm, 85 * mm, 65 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
        ("FONTNAME", (0, 0), (-1, -1), FONT),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, HexColor("#cccccc")),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "×4 corners for full lifter when ordering. Films / pre-order invite = later. "
        "This PDF is only a visual draft.",
        styles["body"]
    ))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MUTED, spaceAfter=6))
    story.append(Paragraph(
        "Alice Botanyca · Lifter-4Q · Local draft — not Printables final",
        styles["foot"]
    ))

    doc.build(story)
    print("Wrote", OUT)


if __name__ == "__main__":
    build()
