"""OCR 결과 + 화면 픽셀 → 쪽마다 {kind, type, num, q, opts, marks, grid}
kind: exam(시험 중) / review(回顾试卷) / other
marks: 보기마다 'blue'(칠해진 표시: 시험 중=고른 답, 다시 보기=정답(체크·漏)) / 'red'(다시 보기: 잘못 고른 답) / ''"""
import sys, json, re
from pathlib import Path
from PIL import Image
ROOT = Path(sys.argv[1])
IMG = ROOT / 'img'
OCR = ROOT / 'ocr'
TYPE = {'判断': 'j', '单选': 's', '多选': 'm'}
OPT_RE = re.compile(r'^([A-D])\s*[:：;；]?\s*(.+)$')
JUDGE_RE = re.compile(r'^([YN])\s*[:：;；]?\s*(正确|错误|正|错).*$')


def fix(t):
    t = t.replace('：', ':').strip()
    return t


def marker(px, y0, y1):
    blue = red = 0
    for y in range(max(0, y0 - 6), y1 + 6):
        for x in range(196, 232):
            r, g, b = px[x, y]
            if b > 200 and r < 120 and 110 < g < 185:
                blue += 1
            elif r > 200 and g < 100 and b < 110:
                red += 1
    return 'red' if red > 120 else 'blue' if blue > 260 else '', blue, red


def grid_colors(px, w):
    """번호 칸 20개 색: 'g'(맞음) 'r'(틀림) '.'(아직) — 칸 줄을 못 찾으면 None"""
    xs = [214 + i * 51.6 for i in range(10)]
    def cell(c):
        r, g, b = c
        if g > 170 and r < 150 and b < 200 and g - r > 50: return 'g'
        if r > 220 and g < 140 and b < 140: return 'r'
        if 205 < r < 235 and abs(r - g) < 8 and abs(g - b) < 10: return '.'
        return None
    rows = []
    for y in range(100, 260):
        cs = [cell(px[int(x) + 8, y]) for x in xs]
        if sum(1 for c in cs if c) >= 9:
            rows.append((y, cs))
    if not rows:
        return None
    bands, cur = [], [rows[0]]
    for r in rows[1:]:
        if r[0] - cur[-1][0] <= 2: cur.append(r)
        else: bands.append(cur); cur = [r]
    bands.append(cur)
    bands = [b for b in bands if len(b) >= 8]
    if len(bands) < 2:
        return None
    out = []
    for band in bands[:2]:
        mid = band[len(band) // 2][1]
        out += [c or '?' for c in mid]
    return ''.join(out)


def merge_lines(raw):
    """같은 줄(세로 가운데가 가까운) 글자 상자를 왼→오로 이어 붙임 — 'D:' + '9分'처럼 갈라진 보기 복원"""
    raw = sorted(raw, key=lambda it: ((it[0][1] + it[0][3]) / 2, it[0][0]))
    lines = []
    for b, t, c in raw:
        cy = (b[1] + b[3]) / 2
        h = b[3] - b[1]
        for ln in lines:
            lb = ln[0]
            lcy = (lb[1] + lb[3]) / 2
            # 같은 줄: 가운데 높이 차이가 작고, 가로로 겹치지 않으며 가까움(문제 글 영역 x>180만)
            if abs(lcy - cy) < min(h, lb[3] - lb[1]) * 0.45 and b[0] > 180 and lb[0] > 180 and (b[0] >= lb[2] - 14 or b[2] <= lb[0] + 14) and min(abs(b[0] - lb[2]), abs(lb[0] - b[2])) < 60:
                parts = ln[1] + [(b, t)]
                parts.sort(key=lambda bt: bt[0][0])
                ln[1] = parts
                ln[0] = [min(lb[0], b[0]), min(lb[1], b[1]), max(lb[2], b[2]), max(lb[3], b[3])]
                break
        else:
            lines.append([list(b), [(b, t)], c])
    out = [[ln[0], ''.join(t for _, t in ln[1]), ln[2]] for ln in lines]
    out.sort(key=lambda it: (it[0][1], it[0][0]))
    return out


def parse(page):
    raw = json.loads((OCR / f'p{page:04d}.json').read_text())
    items = merge_lines(raw)
    head = ' '.join(t for b, t, c in items if b[1] < 120)
    kind = 'exam' if '学法减分考试' in head else 'review' if '回顾试卷' in head else 'other'
    ti = next((i for i, (b, t, c) in enumerate(items) if re.search(r'(判断|单选|多选)题', t)), None)
    res = {'page': page, 'kind': kind}
    if ti is None:
        res['kind'] = 'other'
        res['text'] = ' '.join(t for b, t, c in items)[:120]
        return res
    res['type'] = TYPE[re.search(r'(判断|单选|多选)题', items[ti][1]).group(1)]
    im = Image.open(IMG / f'p-{page - 1:03d}.jpg').convert('RGB')
    px = im.load()
    stem, opts, cur, end_y = [], [], None, None
    for b, t, c in items[ti + 1:]:
        t = fix(t)
        if '下一题' in t or '交卷' in t or '还剩余' in t or '答错机会' in t:
            end_y = b[1]
            break
        m = (JUDGE_RE.match(t) if res['type'] == 'j' else OPT_RE.match(t))
        if m and b[0] > 235:  # 보기 첫 줄 (표시 동그라미 오른쪽에서 시작)
            cur = {'k': m.group(1), 't': m.group(2), 'y': (b[1], b[3])}
            opts.append(cur)
        elif opts and b[0] < 235 and abs(b[1] - opts[-1]['y'][1]) < 60 and not stem_only_after(opts):
            opts[-1]['t'] += t  # 보기 이어지는 줄
            opts[-1]['y'] = (opts[-1]['y'][0], b[3])
        elif not opts:
            stem.append(t)
        else:
            # 보기 다음의 다른 글(그림 속 글자 등)은 버림
            pass
    q = ''.join(stem)
    m = re.match(r'^(\d{1,2})\s*[、,，.．]\s*(.*)$', q)
    res['num'] = int(m.group(1)) if m else None
    res['q'] = (m.group(2) if m else q).strip()
    for o in opts:
        mk, bl, rd = marker(px, o['y'][0], o['y'][0] + 26)
        o['mark'] = mk
    res['opts'] = [{'k': o['k'], 't': o['t'], 'mark': o['mark'], 'y': o['y']} for o in opts]
    res['grid'] = grid_colors(px, im.width) if kind == 'exam' else None
    res['opt_bottom'] = max((o['y'][1] for o in opts), default=None)
    res['end_y'] = end_y
    text_rows = [(b[1] - 4, b[3] + 4) for b, t, c in items[ti:] if not end_y or b[1] < end_y]
    res['img_box'] = find_picture(px, items[ti][0][3], end_y or 1070, text_rows)
    return res


def find_picture(px, top, bottom, text_rows):
    """문제 글과 아래 버튼 사이에서 글자 줄을 뺀 가장 큰 그림 덩어리 (x0,y0,x1,y1) — 없으면 None"""
    def is_text(y):
        return any(a <= y <= b for a, b in text_rows)
    rows = []
    for y in range(top + 4, bottom - 4):
        if is_text(y):
            rows.append(0)
            continue
        n = 0
        for x in range(170, 724, 2):
            r, g, b = px[x, y]
            if abs(r - 249) + abs(g - 250) + abs(b - 255) > 45:
                n += 1
        rows.append(n)
    blocks, cur = [], None
    for i, n in enumerate(rows):
        y = top + 4 + i
        if n >= 20:
            if cur is None: cur = [y, y]
            else: cur[1] = y
        elif cur and y - cur[1] > 6:
            blocks.append(cur); cur = None
    if cur: blocks.append(cur)
    blocks = [b for b in blocks if b[1] - b[0] >= 70]
    if not blocks:
        return None
    y0, y1 = max(blocks, key=lambda b: b[1] - b[0])
    xs = [x for x in range(166, 728) if sum(1 for y in range(y0, y1, 3) if abs(px[x, y][0] - 249) + abs(px[x, y][1] - 250) + abs(px[x, y][2] - 255) > 45) > 3]
    if not xs:
        return None
    return [xs[0], y0, xs[-1] + 1, y1 + 1]


def stem_only_after(opts):
    return False


if __name__ == '__main__':
    pages = sorted(int(p.stem[1:]) for p in OCR.glob('p*.json'))
    out = [parse(p) for p in pages]
    (ROOT / 'parsed.json').write_text(json.dumps(out, ensure_ascii=False))
    import collections
    print('pages', len(out), collections.Counter(o['kind'] for o in out), collections.Counter(o.get('type') for o in out))
    for o in out[:8] + [x for x in out if x['kind'] == 'review'][:3]:
        print(o['page'], o['kind'], o.get('type'), o.get('num'), o.get('q', o.get('text', ''))[:40], [(x['k'], x['t'][:12], x['mark']) for x in o.get('opts', [])], o.get('grid'))
