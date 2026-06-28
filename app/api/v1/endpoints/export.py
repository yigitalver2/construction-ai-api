"""
Export API - generate a PDF damage-inspection report for selected photos.
"""
import io
import json
from datetime import datetime
from typing import List, Optional

import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.photo import Photo
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.photos import get_photo_url

router = APIRouter(prefix="/export", tags=["Export"])


class ExportRequest(BaseModel):
    image_ids: Optional[List[int]] = None  # None/empty = all of the user's photos
    format: str = "pdf"


def _fetch_image(url: str):
    """Download an image URL into a reportlab-friendly buffer; None on failure."""
    if not url:
        return None
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        return io.BytesIO(resp.content)
    except Exception:
        return None


def _build_pdf(photos: List[Photo]) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Image as RLImage,
        Table, TableStyle, PageBreak,
    )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("ReportTitle", parent=styles["Title"], fontSize=20)
    h2 = ParagraphStyle("PhotoHeading", parent=styles["Heading2"], fontSize=13)
    small = ParagraphStyle("Small", parent=styles["Normal"], fontSize=9, textColor=colors.grey)

    story = []
    story.append(Paragraph("Hasar Tespit Raporu", title_style))
    story.append(Paragraph(
        f"Olusturulma: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} &nbsp;|&nbsp; "
        f"{len(photos)} fotograf",
        small,
    ))
    story.append(Spacer(1, 0.6 * cm))

    for idx, photo in enumerate(photos):
        story.append(Paragraph(
            f"{idx + 1}. {photo.original_filename or photo.filename}", h2))
        story.append(Paragraph(
            f"Kategori: {photo.category or '-'} &nbsp;|&nbsp; "
            f"Guven: {f'%{photo.confidence * 100:.1f}' if photo.confidence else '-'} &nbsp;|&nbsp; "
            f"Tarih: {photo.analyzed_at.strftime('%Y-%m-%d') if photo.analyzed_at else '-'}",
            small,
        ))
        story.append(Spacer(1, 0.3 * cm))

        # Original + mask images side by side
        img_cells = []
        for label, url in (("Orijinal", get_photo_url(photo)), ("Segmentasyon", photo.mask_url)):
            data = _fetch_image(url)
            if data is not None:
                try:
                    img = RLImage(data, width=7.5 * cm, height=7.5 * cm, kind="proportional")
                    img_cells.append([Paragraph(label, small), img])
                except Exception:
                    pass
        if img_cells:
            row = [cell[1] for cell in img_cells]
            caption = [cell[0] for cell in img_cells]
            img_table = Table([row, caption])
            img_table.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(img_table)
            story.append(Spacer(1, 0.3 * cm))

        # Damage classes table from detected_objects JSON
        rows = [["Hasar Turu", "Kaplama %", "Guven %"]]
        try:
            payload = json.loads(photo.detected_objects) if photo.detected_objects else {}
            for c in payload.get("classes", []):
                rows.append([
                    c.get("label", "-"),
                    f"%{c.get('coverage', 0) * 100:.1f}",
                    f"%{c.get('confidence', 0) * 100:.1f}",
                ])
        except Exception:
            pass

        if len(rows) > 1:
            tbl = Table(rows, colWidths=[7 * cm, 4 * cm, 4 * cm])
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f4f6")]),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(tbl)
        else:
            story.append(Paragraph("Tespit edilen hasar yok.", small))

        if idx < len(photos) - 1:
            story.append(PageBreak())

    doc.build(story)
    return buf.getvalue()


@router.post("")
async def export_report(
    request: ExportRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Generate a PDF damage report for the given photos (or all of the user's)."""
    if request.format.lower() != "pdf":
        raise HTTPException(status_code=400, detail="Only 'pdf' format is supported")

    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    if request.image_ids:
        query = query.filter(Photo.id.in_(request.image_ids))
    photos = query.order_by(desc(Photo.created_at)).all()

    if not photos:
        raise HTTPException(status_code=404, detail="No photos to export")

    pdf_bytes = _build_pdf(photos)
    filename = f"hasar-raporu-{datetime.utcnow().strftime('%Y%m%d-%H%M')}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
