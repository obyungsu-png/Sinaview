"""가설 확인: 시험 중 각 문제의 결과(다음 쪽 번호칸 g/r)와 기존 은행 정답을 비교 → 사용자가 늘 같은 보기를 골랐는지"""
import sys, json, collections
from pathlib import Path
ROOT = Path(sys.argv[1])
P = json.loads((ROOT / 'parsed.json').read_text())
G = json.loads((ROOT / 'groups.json').read_text())
page2g = {}
for gi, g in enumerate(G):
    for x in g['pages']:
        page2g[x] = gi
order = [p['page'] for p in P]
byp = {p['page']: p for p in P}
stats = collections.Counter()
rows = []
for p in P:
    if p['kind'] != 'exam' or not p.get('opts') or p.get('num') is None:
        continue
    n = p['num']
    i = order.index(p['page'])
    res = None
    for nxt in order[i + 1:i + 6]:
        q = byp[nxt]
        if q.get('kind') != 'exam':
            continue
        if q.get('num') is not None and q['num'] < n:
            break
        gr = q.get('grid')
        if gr and len(gr) == 20 and gr[n - 1] in 'gr':
            res = gr[n - 1]
            break
    gi = page2g.get(p['page'])
    if gi is None or res is None:
        continue
    g = G[gi]
    m = g.get('match')
    if not m:
        continue
    ans = m['ans']
    # 대표 보기 순서와 이 쪽의 보기 순서가 같다고 가정하고, 기존 은행 정답 글자를 이 쪽의 보기 글자로 바꿈
    if g['type'] == 'j':
        key = ans
    else:
        # 은행 보기 텍스트 → 이 쪽 보기 위치
        import difflib, re
        def norm(s): return re.sub(r'[\s，。、,.:：;；？?！!（）()]', '', s)
        po = [o['t'] for o in p['opts']]
        if not m['o'] or len(po) < 2:
            continue
        letters = []
        for L in ans:
            t = norm(m['o']['ABCD'.index(L)])
            j = max(range(len(po)), key=lambda j: difflib.SequenceMatcher(None, t, norm(po[j])).ratio())
            letters.append('ABCD'[j])
        key = ''.join(sorted(letters))
    sel = ''.join(o['k'] for o in p['opts'] if o['mark'] == 'blue')
    stats[(g['type'], key, res, sel)] += 1
for k, v in sorted(stats.items(), key=lambda kv: -kv[1]):
    print(k, v)
