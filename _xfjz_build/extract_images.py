# -*- coding: utf-8 -*-
"""테일 구간(925-1062쪽) 사진문제 이미지 추출
- PDF 페이지를 렌더링해 이미지 객체 영역을 잘라 webp로 저장
- 이미지가 속한 문제 블록 텍스트로 xfjz_clean.json 문제와 매칭
- 결과: img_map.json {clean_index: [{file,w,h}]} + public/driver-license/img/xf/*.webp
"""
import pypdfium2 as pdfium
import pypdfium2.raw as pdfium_c
import re, json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = r"C:\Users\matan\Desktop\seojun\Sinaview\_xfjz_build"
OUT_DIR = r"C:\Users\matan\Desktop\seojun\Sinaview\public\driver-license\img\xf"
SCALE = 2

os.makedirs(OUT_DIR, exist_ok=True)
pdf = pdfium.PdfDocument(os.path.join(BASE, "xfjz.pdf"))
clean = json.load(open(os.path.join(BASE, "xfjz_clean.json"), encoding="utf-8"))

def norm(s):
    return re.sub(r"[\s。．，,、；：？！?！()\[\]【】\"\"'']", "", s)

clean_norm = [(i, norm(q["text"])[:24]) for i, q in enumerate(clean) if q["text"]]

RE_QSTART = re.compile(r"^\s*(\d{1,3}\s*[、\.．]|[【\[（(]?\s*(判断题|单选题|多选题)|题目\s*[:：]|(详细)?解析\s*[:：]|(标准答案|正确答案|答案)\s*[:：])")
RE_JUNK = re.compile(r"^\s*(标准答案|正确答案|答案|参考答案|解析|详细解析)")

img_map = {}
last_match = None
total_imgs = 0
unmatched = 0

for pageno in range(924, min(1062, len(pdf))):
    page = pdf[pageno]
    H = page.get_size()[1]
    tp = page.get_textpage()
    n_rects = tp.count_rects()
    rects = []
    for r in range(n_rects):
        try:
            l, b, rt, t = tp.get_rect(r)
        except Exception:
            continue
        txt = tp.get_text_bounded(left=l, bottom=b, right=rt, top=t)
        if txt and txt.strip():
            rects.append({"l": l, "b": b, "r": rt, "t": t, "text": txt})
    imgs = []
    for obj in page.get_objects():
        if obj.type == pdfium_c.FPDF_PAGEOBJ_IMAGE:
            try:
                l, b, rt, t = obj.get_bounds()
            except Exception:
                continue
            if rt - l < 15 or t - b < 15:
                continue
            imgs.append({"l": l, "b": b, "r": rt, "t": t})
    if not imgs:
        continue
    pil = page.render(scale=SCALE).to_pil()
    W, Hp = pil.size

    def crop(rect):
        x0 = max(0, int(rect["l"] * SCALE) - 2)
        x1 = min(W, int(rect["r"] * SCALE) + 2)
        y0 = max(0, int((H - rect["t"]) * SCALE) - 2)
        y1 = min(Hp, int((H - rect["b"]) * SCALE) + 2)
        if x1 - x0 < 10 or y1 - y0 < 10:
            return None
        return pil.crop((x0, y0, x1, y1))

    # 글자 조각을 줄로 재조립 (위→아래, 같은 줄은 왼쪽→오른쪽)
    rects_sorted = sorted(rects, key=lambda r: (-r["t"], r["l"]))
    lines = []
    for r in rects_sorted:
        if lines and abs(lines[-1]["top"] - r["t"]) < 6:
            lines[-1]["parts"].append(r)
            lines[-1]["top"] = max(lines[-1]["top"], r["t"])
        else:
            lines.append({"top": r["t"], "parts": [r]})
    for ln in lines:
        ln["parts"].sort(key=lambda r: r["l"])
        ln["text"] = "".join(r["text"] for r in ln["parts"])
        ln["l"] = min(r["l"] for r in ln["parts"])

    items = [{"kind": "t", "top": ln["top"], "text": ln["text"], "l": ln["l"]} for ln in lines] + [
        {"kind": "i", "top": im["t"], "l": im["l"], "im": im} for im in imgs
    ]
    items.sort(key=lambda x: (-x["top"], x.get("l", 0)))
    block = []
    for it in items:
        if it["kind"] == "i":
            total_imgs += 1
            im = crop(it["im"])
            if im is None:
                continue
            block_norm = norm("".join(x["text"] for x in block))
            match = None
            if block_norm:
                for ci, ctext in clean_norm:
                    if ctext and ctext in block_norm:
                        match = ci
                        break
            if match is None:
                match = last_match
            if match is None:
                unmatched += 1
                continue
            last_match = match
            lst = img_map.setdefault(match, [])
            fname = f"xf_c{match}_{len(lst)}.webp"
            w, h = im.size
            if w > 500:
                im = im.resize((500, int(h * 500 / w)))
            w, h = im.size
            im.save(os.path.join(OUT_DIR, fname), "WEBP", quality=82)
            lst.append({"file": "xf/" + fname, "w": w, "h": h, "page": pageno + 1})
        else:
            txt = it["text"]
            if RE_QSTART.match(txt) and not RE_JUNK.match(txt):
                block = [it]
            else:
                block.append(it)

json.dump(img_map, open(os.path.join(BASE, "img_map.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
n_with = len(img_map)
multi_img = sum(1 for v in img_map.values() if len(v) > 1)
print(f"images={total_imgs} questions_with_img={n_with} unmatched={unmatched} multi={multi_img}")
