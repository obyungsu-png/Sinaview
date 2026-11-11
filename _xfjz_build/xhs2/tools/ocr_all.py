"""1122쪽 전체 OCR → xhs/ocr/p####.json (글자 상자·글자·신뢰도)"""
import sys, json
from pathlib import Path
from rapidocr_onnxruntime import RapidOCR
D = Path(sys.argv[1])
OUT = D.parent / 'ocr'
OUT.mkdir(exist_ok=True)
ocr = RapidOCR()
files = sorted(D.glob('p-*.jpg'))
for n, f in enumerate(files):
    page = int(f.stem.split('-')[1]) + 1
    dst = OUT / f'p{page:04d}.json'
    if dst.exists():
        continue
    res, _ = ocr(str(f))
    items = [[[int(b[0][0]), int(b[0][1]), int(b[2][0]), int(b[2][1])], t, round(float(c), 3)] for b, t, c in (res or [])]
    dst.write_text(json.dumps(items, ensure_ascii=False))
    if n % 100 == 0:
        print(n, flush=True)
print('done', len(list(OUT.glob('*.json'))))
