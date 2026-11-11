"""parsed.json → 문제 묶기(중복 제거) + 정답 근거 + 기존 은행 맞추기 → groups.json"""
import sys, json, re, difflib, collections
from pathlib import Path
ROOT = Path(sys.argv[1])
REPO = Path('/home/user/Sinaview')
FS = Path(sys.argv[2])  # scratchpad/fullscore (필기 은행 중국어)
pages = json.loads((ROOT / 'parsed.json').read_text())
P = {p['page']: p for p in pages}
LET = 'ABCD'


def norm(s):
    s = re.sub(r'[\s，。、,.:：;；？?！!（）()“”"\'·…]', '', s or '')
    return s.replace('Ｙ', 'Y')


def opt_list(p):
    if p['type'] == 'j':
        return ['正确', '错误']
    return [o['t'] for o in p['opts']]


def letters_of(p, mark):
    ks = []
    for i, o in enumerate(p['opts']):
        if o['mark'] == mark:
            ks.append(i)
    return ks


# ── 1. 쪽마다 정답 근거 ──
# 시험 중 화면: 다음 쪽 번호칸(g/r)이 이 문제의 결과. 고른 보기(파란 표시)가 안 찍혔으면
# 사용자가 거의 늘 A(판단은 Y)를 골랐음(기존 은행과 맞춰 본 결과 ~95%) → 'assumed'로 따로 표시
ev = collections.defaultdict(list)  # page → [(kind, sel, assumed)]
qpages = [p for p in pages if p.get('type') and p.get('opts')]
order = [p['page'] for p in pages]
pos = {x: i for i, x in enumerate(order)}
for p in qpages:
    if p['kind'] == 'review':
        correct = set(letters_of(p, 'blue'))
        if correct:
            ev[p['page']].append(('review', tuple(sorted(correct)), False))
        continue
    if p.get('num') is None:
        continue
    sel = tuple(sorted(letters_of(p, 'blue')))
    assumed = False
    if not sel:
        if p['type'] == 'm':
            continue
        sel, assumed = (0,), True
    n = p['num']
    i = pos[p['page']]
    for nxt in order[i + 1:i + 8]:
        q = P[nxt]
        if q.get('kind') != 'exam':
            continue
        if q.get('num') is not None and q['num'] < n:
            break  # 새 시험
        g = q.get('grid')
        if g and len(g) == 20 and g[n - 1] in 'gr':
            ev[p['page']].append(('right' if g[n - 1] == 'g' else 'wrong', sel, assumed))
            break

# ── 2. 같은 문제 묶기 ──
groups = []
def key_text(p):
    return norm(p['q'])
for p in qpages:
    if not p['q'] or len(p['opts']) < 2:
        continue
    k = key_text(p)
    ok = sorted(norm(t) for t in opt_list(p))
    best = None
    for g in groups:
        if g['type'] != p['type']:
            continue
        r = difflib.SequenceMatcher(None, g['key'], k).ratio()
        if r < 0.88:
            continue
        ro = difflib.SequenceMatcher(None, '|'.join(g['okey']), '|'.join(ok)).ratio()
        if ro >= 0.8 and (best is None or r > best[0]):
            best = (r, g)
    if best:
        best[1]['pages'].append(p['page'])
    else:
        groups.append({'type': p['type'], 'key': k, 'okey': ok, 'pages': [p['page']]})

# ── 3. 묶음마다 대표 글·정답 ──
def votes_to_answer(g):
    reps = [P[x] for x in g['pages']]
    base = max(reps, key=lambda p: (len(p['opts']), len(p['q'])))
    opts = opt_list(base)
    known = None
    wrong_sets = set()
    src = None
    votes = collections.Counter()  # (kind, mapped, assumed)
    for x in g['pages']:
        for kind, sel, assumed in ev.get(x, []):
            # 그 쪽의 보기 순서를 대표 보기 순서로 바꿈
            po = opt_list(P[x])
            mapped = []
            for i in sel:
                if i < len(po):
                    t = norm(po[i])
                    j = max(range(len(opts)), key=lambda j: difflib.SequenceMatcher(None, t, norm(opts[j])).ratio())
                    mapped.append(j)
            mapped = tuple(sorted(set(mapped)))
            if mapped:
                votes[(kind, mapped, assumed)] += 1
    for (kind, mapped, assumed), c in votes.items():
        if kind in ('review', 'right') and (known is None or (src or '').endswith('?')):
            known, src = mapped, kind + ('?' if assumed else '')
        elif kind == 'wrong':
            wrong_sets.add(mapped)
    if known is None and base['type'] == 'j' and wrong_sets:
        w = next(iter(wrong_sets))
        if len(w) == 1:
            known, src = (1 - w[0],), 'wrong-flip'
    if known is None and base['type'] == 's' and wrong_sets:
        out = {w[0] for w in wrong_sets if len(w) == 1}
        left = [i for i in range(len(opts)) if i not in out]
        if len(left) == 1:
            known, src = (left[0],), 'eliminated'
    return base, opts, known, src, sorted(wrong_sets)

result = []
for g in groups:
    base, opts, known, src, wrong = votes_to_answer(g)
    img_pages = [x for x in g['pages'] if P[x].get('img_box')]
    result.append({'type': base['type'], 'q': base['q'], 'o': opts if base['type'] != 'j' else [], 'pages': g['pages'],
                   'answer': list(known) if known else None, 'src': src, 'wrong': [list(w) for w in wrong], 'img_page': img_pages[0] if img_pages else None,
                   'img_box': P[img_pages[0]]['img_box'] if img_pages else None, 'needs_img': bool(re.search(r'如图|下图|图中|这个标志|这种|此图|图示', base['q']))})

# ── 4. 기존 은행 맞추기 ──
xf = json.loads((REPO / 'src/data/driverLicenseXuefa.json').read_text())
mj = json.loads((REPO / 'src/data/driverLicenseManjeom.json').read_text())
bank = json.loads((REPO / 'src/data/driverLicenseQuestions.json').read_text())
bz = {int(k): v for k, v in json.loads((FS / 'bank_zh.json').read_text()).items()}
refs = []
for q in xf['questions'] + xf['multiQuestions']:
    refs.append(('xf', q['id'], q['t'], q['q'], q.get('o') or [], q.get('ma') or (LET[q['a']] if q['t'] != 'j' else ('Y' if q['a'] == 0 else 'N'))))
for q in mj['questions']:
    refs.append(('mj', q['id'], q['t'], q['q'], q.get('o') or [], LET[q['a']] if q['t'] != 'j' else ('Y' if q['a'] == 0 else 'N')))
bk = {q['id']: q for q in bank['questions']}
for i, v in bz.items():
    b = bk.get(i)
    if not b:
        continue
    refs.append(('km', i, b['t'], v[0], v[1] if len(v) > 1 else [], LET[b['a']] if b['t'] != 'j' else ('Y' if b['a'] == 0 else 'N')))
ref_norm = [(r, norm(r[3])) for r in refs]
for it in result:
    k = norm(it['q'])
    best = (0, None)
    for r, rn in ref_norm:
        if abs(len(rn) - len(k)) > max(8, len(k) * 0.3):
            continue
        ratio = difflib.SequenceMatcher(None, k, rn).ratio()
        if ratio > best[0]:
            best = (ratio, r)
    it['match'] = None
    if best[1] and best[0] >= 0.85:
        r = best[1]
        # 보기도 비슷해야 같은 문제
        if it['type'] == 'j' or not r[4] or difflib.SequenceMatcher(None, '|'.join(sorted(norm(x) for x in it['o'])), '|'.join(sorted(norm(x) for x in r[4]))).ratio() >= 0.7:
            it['match'] = {'src': r[0], 'id': r[1], 'ratio': round(best[0], 3), 'ans': r[5], 'o': r[4]}
(ROOT / 'groups.json').write_text(json.dumps(result, ensure_ascii=False))
c = collections.Counter
print('문제 쪽', len(qpages), '→ 서로 다른 문제', len(result), c(r['type'] for r in result))
print('정답 근거', c(r['src'] for r in result))
print('기존과 겹침', c(r['match']['src'] if r['match'] else None for r in result))
print('새 문제(학법에 없음)', sum(1 for r in result if not (r['match'] and r['match']['src'] == 'xf')), c(r['type'] for r in result if not (r['match'] and r['match']['src'] == 'xf')))
print('새 문제 중 정답 모름', sum(1 for r in result if not (r['match'] and r['match']['src'] == 'xf') and not r['answer'] and not r['match']))

# ── 5. 학법(xf)만 따로 맞추기 (km/mj가 더 비슷해서 xf 중복을 놓치지 않게) ──
xref = [r for r, rn in ref_norm if r[0] == 'xf']
for it in result:
    k = norm(it['q'])
    cands = []
    for r in xref:
        rn = norm(r[3])
        ratio = difflib.SequenceMatcher(None, k, rn).ratio()
        if ratio < 0.7:
            continue
        orat = 1.0 if it['type'] == 'j' or not r[4] else difflib.SequenceMatcher(None, '|'.join(sorted(norm(x) for x in it['o'])), '|'.join(sorted(norm(x) for x in r[4]))).ratio()
        cands.append((round(ratio, 3), round(orat, 3), r[1], r[2]))
    cands.sort(reverse=True)
    it['xf'] = cands[:3]
(ROOT / 'groups.json').write_text(json.dumps(result, ensure_ascii=False))
dup = [it for it in result if it['xf'] and it['xf'][0][0] >= 0.85 and it['xf'][0][1] >= 0.7 and it['xf'][0][3] == it['type']]
amb = [it for it in result if it['xf'] and it not in dup]
print('xf 중복(엄격)', len(dup), '애매', len(amb))
for it in amb:
    print(' ', it['type'], it['xf'][0], it['q'][:50], '|', [o[:8] for o in it['o']])
