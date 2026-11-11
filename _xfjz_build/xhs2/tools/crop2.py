"""그림 다시 자르기: 마지막 보기 아래 ~ '下一题' 버튼 위 영역에서 쪽 배경색과 다른 부분 전체(라벨 '图1' 포함)"""
import sys, json
from pathlib import Path
from PIL import Image
ROOT = Path(sys.argv[1])
P = {p['page']: p for p in json.loads((ROOT / 'parsed.json').read_text())}


def box(page):
    p = P[page]
    im = Image.open(ROOT / 'img' / f'p-{page - 1:03d}.jpg').convert('RGB')
    px = im.load()
    top = (p.get('opt_bottom') or 300) + 12
    bottom = (p.get('end_y') or 1075) - 24  # '下一题' 버튼 윗선 위까지
    if bottom - top < 60:
        return None
    bg = px[175, top + 5]
    def diff(c):
        return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2])
    rows = []
    for y in range(top, bottom):
        rows.append(sum(1 for x in range(166, 728, 3) if diff(px[x, y]) > 14))
    ys = [top + i for i, n in enumerate(rows) if n >= 4]
    if not ys:
        return None
    # 가장 큰 덩어리(40px 이내 틈은 이어 붙임)
    blocks, cur = [], [ys[0], ys[0]]
    for y in ys[1:]:
        if y - cur[1] <= 40:
            cur[1] = y
        else:
            blocks.append(cur); cur = [y, y]
    blocks.append(cur)
    y0, y1 = max(blocks, key=lambda b: b[1] - b[0])
    if y1 - y0 < 50:
        return None
    xs = [x for x in range(166, 728) if sum(1 for y in range(y0, y1, 2) if diff(px[x, y]) > 14) >= 3]
    return [xs[0], y0, xs[-1] + 1, y1 + 1]


def toast(page, b):
    """그림 위에 앱 안내 문구(예: '请选择…', '至少选择…')가 떠 있으면 True"""
    items = json.loads((ROOT / 'ocr' / f'p{page:04d}.json').read_text())
    for bb, t, c in items:
        cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
        if b[0] <= cx <= b[2] and b[1] <= cy <= b[3] and ('选择' in t or '答案' in t or '请' in t):
            return True
    return False


if __name__ == '__main__':
    G = json.loads((ROOT / 'groups.json').read_text())
    out = ROOT / 'crop'
    n = 0
    for g in G:
        best = None
        for pg in g['pages']:
            if P[pg].get('kind') == 'other':
                continue
            b = box(pg)
            if b and toast(pg, b):
                continue
            if b and (best is None or (b[2] - b[0]) * (b[3] - b[1]) > (best[1][2] - best[1][0]) * (best[1][3] - best[1][1])):
                best = (pg, b)
        if best:
            g['img_page'], g['img_box'] = best
            Image.open(ROOT / 'img' / f'p-{best[0] - 1:03d}.jpg').convert('RGB').crop(best[1]).save(out / f"g{g['gid']}.png")
            n += 1
        else:
            g['img_page'], g['img_box'] = None, None
    (ROOT / 'groups.json').write_text(json.dumps(G, ensure_ascii=False))
    print('groups with picture', n)
