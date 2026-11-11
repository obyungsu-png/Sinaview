# -*- coding: utf-8 -*-
"""xhs 스크린샷 PDF에서 9쪽~ 끝까지 추출해 JPEG 재압축 단일 PDF로 저장 (GitHub 100MB 제한 대응)"""
import pypdfium2 as pdfium
import io, sys
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")

SRC = r"C:\Users\matan\Desktop\새 폴더 (2)\Screenshot_2026-11-10-04-57-15-259_com.xingin.xhs.pdf"
DST = r"C:\Users\matan\Desktop\seojun\Sinaview\_xfjz_build\xhs_questions.pdf"
SCALE = 1.5
Q = 72

src = pdfium.PdfDocument(SRC)
out = pdfium.PdfDocument.new()
n = 0
for pageno in range(8, len(src)):  # 1-based 9쪽부터 끝까지
    page = src[pageno]
    pil = page.render(scale=SCALE).to_pil()
    buf = io.BytesIO()
    pil.save(buf, format="JPEG", quality=Q)
    buf.seek(0)
    im = Image.open(buf)
    t = io.BytesIO()
    im.save(t, format="PDF")
    t.seek(0)
    chunk = pdfium.PdfDocument(bytes(t.read()))
    out.import_pages(chunk)
    chunk.close()
    n += 1
    if n % 100 == 0:
        print(n, "pages done", flush=True)
out.save(DST)
print("saved", n, "pages ->", DST)
