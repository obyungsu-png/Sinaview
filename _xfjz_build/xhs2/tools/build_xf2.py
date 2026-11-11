"""학법 감점 데이터 다시 만들기 (xhs 앱 스크린샷 문제 추가)
- 기존 학법 369+53제: 한국어 다시 번역(r*.py), 그림 바로잡기, 주제 다시 분류
- xhs 새 문제: C(새로 번역 d0*.py) + B(필기·만점 은행 글·번역 참고, b_fix.py로 정답 바로잡기)
- 학법과 같은 문제(A)는 빼고, 그 앱 그림으로 기존 문제 그림을 바꿈
- 모든 문제(판단·단선·다선)를 questions 하나로, 실전 고사는 판단5·단선10·다선5, 사진 4~8장
사용: python3 -I build_xf2.py <scratchpad> <repo>
"""
import sys, json, glob, re, random, shutil, collections, importlib.util
from pathlib import Path
from PIL import Image

SP = Path(sys.argv[1]); REPO = Path(sys.argv[2])
XHS = SP / 'xhs'
IMGDIR = REPO / 'public/driver-license/img'
sys.path.insert(0, str(SP / 'xhs_tools'))
from topic import topic  # noqa: E402

spec = importlib.util.spec_from_file_location('crop2', str(SP / 'xhs_tools/crop2.py'))
c2 = importlib.util.module_from_spec(spec)
_argv = sys.argv
sys.argv = ['crop2', str(XHS)]
spec.loader.exec_module(c2)
sys.argv = _argv

L = 'ABCD'
orig = json.loads((XHS / 'xf_orig.json').read_text())
wo = json.loads((XHS / 'xfw_orig.json').read_text())
G = json.loads((XHS / 'groups.json').read_text())
bank = {q['id']: q for q in json.loads((REPO / 'src/data/driverLicenseQuestions.json').read_text())['questions']}
mjq = {q['id']: q for q in json.loads((REPO / 'src/data/driverLicenseManjeom.json').read_text())['questions']}
bz = {int(k): v for k, v in json.loads((SP / 'fullscore/bank_zh.json').read_text()).items()}


def load(pattern, name):
    out = {}
    for f in sorted(glob.glob(str(SP / 'xhs_dec' / pattern))):
        ns = {}
        exec(Path(f).read_text(), ns)
        out.update(ns[name])
    return out


D = load('d0*.py', 'D')
BF = load('b_fix.py', 'D')
R = load('r*.py', 'R')
for i, e in load('e*.py', 'E').items():  # 기존 문제 해설 새로 쓴 것
    R.setdefault(i, {})['e'] = e


def norm(s):
    return re.sub(r'[\s，。、,.:：;；？?！!（）()“”"]', '', s or '')


def best_idx(text, opts):
    import difflib
    t = norm(text)
    return max(range(len(opts)), key=lambda j: difflib.SequenceMatcher(None, t, norm(opts[j])).ratio())


# ── 그림 ──
used_imgs = {}


def save_crop(page, box, name, trim=None):
    im = Image.open(XHS / 'img' / f'p-{page - 1:03d}.jpg').convert('RGB').crop(box)
    if trim:
        l, t, r, b = trim
        im = im.crop((l, t, im.width - r, im.height - b))
    path = IMGDIR / 'xf' / f'{name}.webp'
    im.save(path, 'WEBP', quality=82, method=6)
    used_imgs[f'xf/{name}.webp'] = [im.width, im.height]
    return f'xf/{name}.webp'


def copy_img(src, name):
    im = Image.open(IMGDIR / src)
    path = IMGDIR / 'xf' / f'{name}.webp'
    im.save(path, 'WEBP', quality=88, method=6)
    used_imgs[f'xf/{name}.webp'] = [im.width, im.height]
    return f'xf/{name}.webp'


def app_img(gid, page=None, trim=None):
    g = G[gid]
    pg = page or g['img_page']
    if not pg:
        return []
    box = c2.box(pg)
    if not box:
        return []
    return [save_crop(pg, box, f'xa_g{gid}', trim)]


# 기존 학법 문제 그림 바꾸기: 앱 화면 그림(같은 문제) / 필기 은행의 같은 표지 그림 / 그림 빼기(글 문제에 엉뚱한 그림)
OLD_IMG = {
    70269: ('app', 7), 70265: ('app', 26, 31), 70136: ('app', 44), 70068: ('app', 45), 70134: ('app', 64),
    70272: ('app', 89), 80046: ('app', 134), 70302: ('app', 138), 70128: ('app', 194), 70033: ('app', 457),
    70173: ('app', 490), 70174: ('app', 499), 80025: ('app', 536), 70052: ('app', 160), 70058: ('app', 416),
    70030: ('app', 425),
    70094: ('km', 'p1-image257.webp'), 70226: ('km', 'p2-image65.webp'), 70253: ('km', 'p1-image293.webp'),
    70126: None, 70297: None,
}
IMG_NONE = {175, 202}          # 잘린 글 줄/안내 문구만 잡힌 것
IMG_TRIM = {43: (0, 0, 0, 34)}  # 아래 안내 문구 띠 잘라냄

# ── 1. 기존 문제 ──
questions = []
for q in orig['questions'] + orig['multiQuestions']:
    q = json.loads(json.dumps(q))
    r = R.get(q['id'])
    if r:
        if 'fq' in r:
            q['q'] = r['fq']
        for i, t in r.get('fo', {}).items():
            q['o'][i] = t
        q['ko'] = {'q': r['k']} if q['t'] == 'j' else {'q': r['k'], 'o': r['ko']}
        if 'e' in r:
            q['e'] = r['e']
        if 'a' in r:  # 2022 벌점 기준으로 정답 바로잡기
            q['a'] = L.index(r['a'])
    if q['id'] in OLD_IMG:
        v = OLD_IMG[q['id']]
        if v is None:
            q['img'] = []
        elif v[0] == 'app':
            q['img'] = app_img(v[1], v[2] if len(v) > 2 else None)
        else:
            q['img'] = [copy_img(v[1], f'xk_{q["id"]}')]
    for im in q['img']:
        if im not in used_imgs:
            w, h = Image.open(IMGDIR / im).size
            used_imgs[im] = [w, h]
    q['c'] = topic(q['q'], q['o'])
    q['src'] = 'xf'
    questions.append(q)

# ── 2. xhs 새 문제 ──
new = []


def letters_to(q, a):
    if q['t'] == 'j':
        q['a'] = 0 if a == 'Y' else 1
    elif q['t'] == 'm':
        q['a'] = -1
        q['ma'] = ''.join(sorted(a))
    else:
        q['a'] = L.index(a)


for gid, d in sorted(D.items()):
    if 'drop' in d:
        continue
    g = G[gid]
    t = g['type']
    o = [] if t == 'j' else list(g['o'])
    for i, s in d.get('fo', {}).items():
        while len(o) <= i:
            o.append('')
        o[i] = s
    if t != 'j':
        o = o[:len(d['ko'])]  # OCR가 화면 글자를 보기로 잘못 더 읽은 것 버림
        o = [re.sub(r'^[:：\s]+', '', s).strip() for s in o]
    q = {'t': t, 'q': d.get('fq', g['q']), 'o': o, 'e': d['e'], 'ez': None, 'c': d['c'], 'gid': gid}
    letters_to(q, d['a'])
    q['ko'] = {'q': d['k']} if t == 'j' else {'q': d['k'], 'o': d['ko']}
    if d.get('kmimg'):
        q['img'] = [copy_img(bank[d['kmimg']]['img'][0], f'xa_g{gid}')]
    elif d.get('noimg') or gid in IMG_NONE:
        q['img'] = []
    else:
        q['img'] = app_img(gid, d.get('page'), d.get('trim') or IMG_TRIM.get(gid))
    new.append(q)

# B: 필기(km)·만점(mj) 은행에 같은 글이 있는 문제 — 그 은행의 중국어·한국어를 참고해 학법 문제로 새로 만듦
B_DROP = {486, 432}  # 같은 은행 문제에 두 번 맞춰진 묶음(글자 인식만 다름)
# 같은 은행 문제에 맞춰졌지만 앱 보기가 다른 수신호 문제 — 앱 보기 그대로
B_OWN_OPTS = {235: ['좌회전 대기 신호', '좌회전 신호', '감속·서행 신호', '우회전 신호']}
for g in G:
    if g['cls'] != 'B' or g['gid'] in B_DROP:
        continue
    gid = g['gid']
    m = g['match']
    f = BF.get(gid, {})
    if m['src'] == 'km':
        b = bank[m['id']]
        zq, zo = bz[m['id']][0], (bz[m['id']][1] if len(bz[m['id']]) > 1 else [])
        kq, ko, e = b['q'], b.get('o') or [], b['e']
        bimg = b.get('img') or []
    else:
        b = mjq[m['id']]
        zq, zo = b['q'], b.get('o') or []
        kq, ko, e = b['ko']['q'], b['ko'].get('o') or [], b['e']
        bimg = b.get('img') or []
    t = b['t']
    if gid in (100, 104):  # 앱 글이 은행 글과 다른 문제(벌점 6→1점, A차→B차)
        zq = g['q']
    q = {'t': t, 'q': zq, 'o': list(zo) if t != 'j' else [], 'e': f.get('e', e), 'ez': None, 'gid': gid, 'a': b['a']}
    if 'a' in f:
        if t == 'j':
            q['a'] = 0 if f['a'] == 'Y' else 1
        else:
            xo = list(g['o'])
            for i, s in f.get('fo', {}).items():
                while len(xo) <= i:
                    xo.append('')
                xo[i] = s
            q['a'] = best_idx(xo[L.index(f['a'])], q['o'])
    q['ko'] = {'q': f.get('k', kq)} if t == 'j' else {'q': f.get('k', kq), 'o': list(ko)}
    if gid in B_OWN_OPTS:
        q['o'] = list(g['o'])
        q['ko']['o'] = B_OWN_OPTS[gid]
        q['a'] = L.index(f['a'])
    q['c'] = topic(q['q'], q['o'])
    if f.get('page') or (g['img_box'] and gid not in IMG_NONE):
        q['img'] = app_img(gid, f.get('page'))
    elif bimg:
        q['img'] = [copy_img(bimg[0], f'xa_g{gid}')]
    else:
        q['img'] = []
    new.append(q)

# 같은 글인데 그림이 다른 문제(글 묶기에서 갈라냄)
SPEED_O = ['30公里/小时', '40公里/小时', '50公里/小时', '70公里/小时']
SPEED_KO = ['시속 30km', '시속 40km', '시속 50km', '시속 70km']
EXTRA = [
    dict(gid=447, page=778, t='s', q='在这条公路上行驶的最高速度不能超过多少？', o=SPEED_O, a=3, c=5,
         k='이 일반도로(公路)에서 최고 속도는 몇 km를 넘으면 안 되나요?', ko=SPEED_KO,
         e='중앙선이 있고 같은 방향 1차로인 일반도로의 최고 속도는 시속 70km입니다(시내 도로는 50km).'),
    dict(gid=2026, page=505, t='s', q='在这条城市道路上行驶的最高速度不能超过多少？', o=SPEED_O, a=2, c=5,
         k='이 시내 도로에서 최고 속도는 몇 km를 넘으면 안 되나요?', ko=SPEED_KO,
         e='중앙선이 있고 같은 방향 1차로인 시내 도로의 최고 속도는 시속 50km입니다. 중앙선이 없으면 30km입니다.'),
]
for x in EXTRA:
    box = c2.box(x['page'])
    img = [save_crop(x['page'], box, f'xa_g{x["gid"]}')]
    new.append({'t': x['t'], 'q': x['q'], 'o': x['o'], 'a': x['a'], 'e': x['e'], 'ez': None, 'c': x['c'], 'gid': x['gid'],
                'ko': {'q': x['k'], 'o': x['ko']}, 'img': img})

# 새 id: 판단·단선 70401~, 다선 80101~
nid = {'js': 70401, 'm': 80101}
new.sort(key=lambda q: ('jsm'.index(q['t']), q['c'], q['gid']))
for q in new:
    k = 'm' if q['t'] == 'm' else 'js'
    q['id'] = nid[k]
    nid[k] += 1
    q['src'] = 'xhs'
    q['kw'] = []
    questions.append(q)

# ── 3. 단어장(t·k)·핵심 단어(kw) ──
d = wo['d']
keys = sorted(d, key=len, reverse=True)
KLEN = max(len(k) for k in keys)
PUNCT = set('。，、；：？！（）【】,.:;?!()[] 　“”"《》～~/%·…-①②③④')


def tokenize(text):
    toks, i, n = [], 0, len(text)
    while i < n:
        ch = text[i]
        if ch in PUNCT:
            toks.append(ch); i += 1; continue
        end = min(i + KLEN, n)
        hit = None
        while end > i:
            if text[i:end] in d:
                hit = text[i:end]; break
            end -= 1
        toks.append(hit or ch)
        i += len(hit) if hit else 1
    return toks


def words_in(text, limit=4):
    out, seen = [], set()
    for tk in tokenize(text):
        if len(tk) >= 2 and tk in d and tk not in seen:
            seen.add(tk); out.append(tk)
    out.sort(key=len, reverse=True)
    return out[:limit]


wt, wk = {}, {}
for q in questions:
    opts = q['o'] if q['t'] != 'j' else []
    wt[str(q['id'])] = [tokenize(q['q'])] + [tokenize(o) for o in opts]
    wk[str(q['id'])] = [words_in(q['q'])] + [words_in(o) for o in opts]
    kws = [w for w in words_in(q['q'] + '，' + '，'.join(opts), 8) if d[w][2]] or words_in(q['q'], 3)
    q['kw'] = [[w, d[w][0], d[w][1]] for w in kws[:4]]
words = dict(wo)
words['t'], words['k'], words['kt'], words['st'] = wt, wk, {}, {}

# ── 4. 실전 고사: 판단5·단선10·다선5, 사진 4~8장, 주제 섞기 ──
rnd = random.Random(20261111)
J = [q for q in questions if q['t'] == 'j']
S = [q for q in questions if q['t'] == 's' and len(q['o']) == 4]
M = [q for q in questions if q['t'] == 'm' and len(q['o']) == 4]
N = len(M) // 5


def spread(pool):
    """주제별로 섞은 뒤 돌아가며 뽑아 한 회차에 주제가 고루 들어가게"""
    by = collections.defaultdict(list)
    for q in pool:
        by[q['c']].append(q)
    for v in by.values():
        rnd.shuffle(v)
    order = sorted(by, key=lambda c: -len(by[c]))
    out = []
    while any(by.values()):
        for c in order:
            if by[c]:
                out.append(by[c].pop())
    return out


pools = {}
for name, pool in (('j', J), ('s', S), ('m', M)):
    pic = spread([q for q in pool if q['img']])
    txt = spread([q for q in pool if not q['img']])
    pools[name] = {'pic': pic, 'txt': txt}
NEED = {'j': 5, 's': 10, 'm': 5}
exams = []
for k in range(N):
    # 회차마다 사진 문제 5·6·7장을 돌아가며(4~8 안), 판단·단선·다선에 남은 사진 문제 비율대로 나눔
    target = 5 + k % 3
    avail = {t: len(pools[t]['pic']) for t in 'jsm'}
    tot = sum(avail.values()) or 1
    want = {t: min(NEED[t], avail[t], int(target * avail[t] / tot)) for t in 'jsm'}
    while sum(want.values()) < target:
        cand = [t for t in 'sjm' if want[t] < min(NEED[t], avail[t])]
        if not cand:
            break
        t = max(cand, key=lambda t: avail[t] - want[t] * tot / target)
        want[t] += 1
    exam = []
    for t in 'jsm':
        pick = [pools[t]['pic'].pop(0) for _ in range(want[t])]
        while len(pick) < NEED[t]:
            pick.append((pools[t]['txt'] or pools[t]['pic']).pop(0))
        rnd.shuffle(pick)
        exam += pick
    exams.append([q['id'] for q in exam])

# ── 5. 쓰기 ──
img_size = {k: v for k, v in sorted(used_imgs.items())}
topics = orig['topics']
cnt = collections.Counter(q['c'] for q in questions)
for tp in topics:
    tp['count'] = cnt[tp['c']]
    if tp['c'] == 7:
        tp['desc'] = '사고 처리·사고 사례 분석·응급 상황'
questions.sort(key=lambda q: q['id'])
out_q = []
for q in questions:
    o = {k: q[k] for k in ('id', 'c', 't', 'q', 'o', 'a') if k in q}
    if q['t'] == 'm':
        o['ma'] = q['ma']
    o['e'] = q['e']
    o['ko'] = q['ko']
    o['kw'] = q['kw']
    o['ez'] = q.get('ez')
    o['img'] = q['img']
    out_q.append(o)
data = {'topics': topics, 'questions': out_q, 'cards': orig['cards'], 'exams': exams, 'imgSize': img_size}
(REPO / 'src/data/driverLicenseXuefa.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
(REPO / 'src/data/driverLicenseXuefaWords.json').write_text(json.dumps(words, ensure_ascii=False, separators=(',', ':')))

# 더 이상 안 쓰는 그림(바꾼 그림) 지우기
# (원래 데이터가 쓰던 그림 중 바꿔서 이제 안 쓰는 것만 — 다른 파일은 건드리지 않음)
all_used = set(img_size)
removed = []
for rel in sorted(orig['imgSize']):
    if rel not in all_used and (IMGDIR / rel).exists():
        removed.append(rel)
        (IMGDIR / rel).unlink()

# 보고
c = collections.Counter
print('문제', len(out_q), c(q['t'] for q in out_q), '새로', len(new), c(q['t'] for q in new))
print('주제', sorted(cnt.items()))
print('고사', len(exams), '회 · 회차별 사진', [sum(1 for i in e if next(q for q in out_q if q['id'] == i)['img']) for e in exams])
used = {i for e in exams for i in e}
print('고사에 쓴 문제', len(used), '· 은행만', len(out_q) - len(used))
print('그림', len(img_size), '· 지운 그림', len(removed), removed[:30])
