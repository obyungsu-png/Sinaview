# -*- coding: utf-8 -*-
"""테일 구간(925-1062쪽) 사진문제 이미지 재추출 — 위치 기반 매칭
규칙(사용자 지정): 이미지가 문제 N과 문제 N+1 사이에 있으면 문제 N(위쪽 번호)에 귀속.
- 각 페이지의 글자 줄과 이미지를 위→아래 순서로 정렬
- 문제 시작 줄(RE_QSTART)이 나오면 그 문제 블록 전체 텍스트를 모아 xfjz_clean 문제와 매칭
- 매칭 성공한 문제 시작 줄에서만 '현재 문제'를 갱신하고, 이미지는 항상 '현재 문제'에 배정
  (매칭 실패한 시작 줄/마커 뒤의 이미지는 이전 문제에 그대로 귀속 = 사용자 규칙)
결과: img_map.json {clean_index: [{file,w,h,page}]} + public/driver-license/img/xf/*.webp
"""
import pypdfium2 as pdfium
import pypdfium2.raw as pdfium_c
import re, json, os, sys
sys.stdout.reconfigure(encoding="utf-8")

BASE = r"C:\Users\matan\Desktop\seojun\Sinaview\_xfjz_build"
OUT_DIR = r"C:\Users\matan\Desktop\seojun\Sinaview\public\driver-license\img\xf"
SCALE = 2

os.makedirs(OUT_DIR, exist_ok=True)
pdf = pdfium.PdfDocument(os.path.join(BASE, "xfjz.pdf"))
clean = json.load(open(os.path.join(BASE, "xfjz_clean.json"), encoding="utf-8"))

def norm(s):
    return re.sub(r"[\s。．，,、；：？！?！()\[\]【】\"\"'']", "", s)

# clean: 문서 순서, 앞 24자 정규화 텍스트로 식별
clean_norm = [(i, norm(q["text"])[:24]) for i, q in enumerate(clean) if q.get("text")]

RE_QSTART = re.compile(r"^\s*(\d{1,3}\s*[、\.．]|[【\[（(]?\s*(判断题|单选题|多选题)|题目\s*[:：]|(详细)?解析\s*[:：]|(标准答案|正确答案|答案)\s*[:：])")
RE_JUNK = re.compile(r"^\s*(标准答案|正确答案|答案|参考答案|解析|详细解析)")

# ── 패스 1: 페이지별로 글자 줄·이미지 수집 (위→아래) ──
pages = []
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
    if not rects and not imgs:
        continue

    # 글자 조각을 줄로 재조립
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

    items = [{"kind": "t", "top": ln["top"], "text": ln["text"]} for ln in lines] + [
        {"kind": "i", "top": im["t"], "im": im} for im in imgs
    ]
    items.sort(key=lambda x: (-x["top"], x["im"]["l"] if x["kind"] == "i" else 0))
    pages.append({"pageno": pageno, "H": H, "items": items})

# ── 패스 2: 문제 시작 줄 찾고 블록 전체 텍스트로 clean 매칭 (문서 순서 보장) ──
# qstart: (page_idx, item_idx) → 블록 텍스트는 다음 문제 시작 줄까지(페이지 넘어감)
qstarts = []  # {"pi": page_index, "ii": item_index, "texts": [...]}
open_block = None
for pi, pd in enumerate(pages):
    for ii, it in enumerate(pd["items"]):
        if it["kind"] != "t":
            continue
        txt = it["text"]
        if RE_QSTART.match(txt) and not RE_JUNK.match(txt):
            if open_block:
                qstarts.append(open_block)
            open_block = {"pi": pi, "ii": ii, "texts": [txt]}
        elif open_block is not None:
            open_block["texts"].append(txt)
if open_block:
    qstarts.append(open_block)

prev_ci = -1
for qs in qstarts:
    bnorm = norm("".join(qs["texts"]))
    cands = [ci for ci, ctext in clean_norm if ctext and ctext in bnorm]
    if cands:
        ahead = [ci for ci in cands if ci >= prev_ci]
        qs["ci"] = min(ahead) if ahead else max(cands)
    else:
        qs["ci"] = None  # 매칭 실패 → 현재 문제 유지(이전 문제에 귀속)
    if qs["ci"] is not None:
        prev_ci = qs["ci"]

# (page_idx, item_idx) → ci 조회용
qstart_lookup = {(qs["pi"], qs["ii"]): qs["ci"] for qs in qstarts if qs["ci"] is not None}

# ── 패스 3: 이미지를 '현재 문제'(위쪽 문제)에 배정 ──
img_map = {}
total_imgs = 0
unmatched = 0
current_ci = None  # 페이지를 넘어 유지
for pi, pd in enumerate(pages):
    page_imgs = [it for it in pd["items"] if it["kind"] == "i"]
    if not page_imgs:
        # 이미지 없어도 문제 시작 줄 갱신은 해야 함
        for ii, it in enumerate(pd["items"]):
            if it["kind"] == "t" and (pi, ii) in qstart_lookup:
                current_ci = qstart_lookup[(pi, ii)]
        continue
    page = pdf[pd["pageno"]]
    pil = page.render(scale=SCALE).to_pil()
    W, Hp = pil.size

    def crop(rect):
        x0 = max(0, int(rect["l"] * SCALE) - 2)
        x1 = min(W, int(rect["r"] * SCALE) + 2)
        y0 = max(0, int((pd["H"] - rect["t"]) * SCALE) - 2)
        y1 = min(Hp, int((pd["H"] - rect["b"]) * SCALE) + 2)
        if x1 - x0 < 10 or y1 - y0 < 10:
            return None
        return pil.crop((x0, y0, x1, y1))

    for ii, it in enumerate(pd["items"]):
        if it["kind"] == "t":
            if (pi, ii) in qstart_lookup:
                current_ci = qstart_lookup[(pi, ii)]
            continue
        total_imgs += 1
        if current_ci is None:
            unmatched += 1
            continue
        im = crop(it["im"])
        if im is None:
            continue
        ci = current_ci
        lst = img_map.setdefault(ci, [])
        fname = f"xf_c{ci}_{len(lst)}.webp"
        w, h = im.size
        if w > 500:
            im = im.resize((500, int(h * 500 / w)))
        w, h = im.size
        im.save(os.path.join(OUT_DIR, fname), "WEBP", quality=82)
        lst.append({"file": "xf/" + fname, "w": w, "h": h, "page": pd["pageno"] + 1})

json.dump(img_map, open(os.path.join(BASE, "img_map.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
n_with = len(img_map)
multi_img = sum(1 for v in img_map.values() if len(v) > 1)
max_img = max((len(v) for v in img_map.values()), default=0)
matched_qstarts = sum(1 for qs in qstarts if qs["ci"] is not None)
print(f"images={total_imgs} questions_with_img={n_with} unmatched={unmatched} multi={multi_img} maxPerQ={max_img} qstarts={len(qstarts)} qstartMatched={matched_qstarts}")
