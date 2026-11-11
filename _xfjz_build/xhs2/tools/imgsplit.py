"""같은 글로 묶인 쪽들의 그림이 서로 다른지(다른 문제인지) 확인 — 쪽마다 그림 잘라 작은 회색 지문 비교"""
import sys, json
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).parent))
ROOT = Path(sys.argv[1])
import importlib.util
spec = importlib.util.spec_from_file_location('crop2', str(Path(__file__).parent / 'crop2.py'))
c2 = importlib.util.module_from_spec(spec)
sys.argv = [sys.argv[0], str(ROOT)]
spec.loader.exec_module(c2)
G = json.loads((ROOT / 'groups.json').read_text())
P = c2.P
def fp(page, b):
    im = Image.open(ROOT / 'img' / f'p-{page - 1:03d}.jpg').convert('L').crop(b).resize((16, 10))
    return list(im.getdata())
def dist(a, b):
    return sum(abs(x - y) for x, y in zip(a, b)) / len(a)
res = []
for g in G:
    if not g['img_box'] or len(g['pages']) < 2:
        continue
    fps = []
    for pg in g['pages']:
        if P[pg].get('kind') == 'other':
            continue
        b = c2.box(pg)
        if b and (b[3] - b[1]) > 80:
            fps.append((pg, fp(pg, b)))
    if len(fps) < 2:
        continue
    base = fps[0][1]
    ds = [(pg, round(dist(base, f), 1)) for pg, f in fps[1:]]
    mx = max(d for _, d in ds)
    if mx > 25:
        res.append((g['gid'], g['cls'], fps[0][0], ds, g['q'][:40]))
for r in res:
    print(r)
print(len(res))
