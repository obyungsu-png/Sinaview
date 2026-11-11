"""groups.json → A(학법 중복)/B(필기·만점 은행에 있음)/C(새로 번역) 나누고 C를 묶음 파일로 출력"""
import sys, json
from pathlib import Path
ROOT = Path(sys.argv[1]); REPO = Path('/home/user/Sinaview')
G = json.loads((ROOT / 'groups.json').read_text())
bank = {q['id']: q for q in json.loads((REPO / 'src/data/driverLicenseQuestions.json').read_text())['questions']}
mj = {q['id']: q for q in json.loads((REPO / 'src/data/driverLicenseManjeom.json').read_text())['questions']}
xf = {q['id']: q for q in (lambda d: d['questions'] + d['multiQuestions'])(json.loads((REPO / 'src/data/driverLicenseXuefa.json').read_text()))}
L = 'ABCD'
def isdup(it): return it['xf'] and it['xf'][0][0] >= 0.85 and it['xf'][0][1] >= 0.7 and it['xf'][0][3] == it['type']
for i, g in enumerate(G):
    g['gid'] = i
    if isdup(g):
        g['cls'] = 'A'
        continue
    m = g['match']
    if m and m['src'] in ('km', 'mj'):
        t = (bank if m['src'] == 'km' else mj)[m['id']]['t']
        if t == g['type'] and m['ratio'] >= 0.9:
            g['cls'] = 'B'
            continue
    g['cls'] = 'C'
(ROOT / 'groups.json').write_text(json.dumps(G, ensure_ascii=False))
out = ROOT / 'review'; out.mkdir(exist_ok=True)
C = [g for g in G if g['cls'] == 'C']
C.sort(key=lambda g: ('mjs'.index(g['type']), g['gid']))
def ev(g):
    s = ''
    if g['answer']:
        s += 'ev=' + (''.join(L[i] for i in g['answer']) if g['type'] != 'j' else ('Y' if g['answer'] == [0] else 'N')) + f"({g['src']})"
    if g['wrong']:
        s += ' notsets=' + ','.join(''.join(L[i] for i in w) for w in g['wrong'])
    return s
lines = []
for g in C:
    s = f"#{g['gid']} [{g['type']}] {'IMG ' if g['img_box'] else ''}{'(needs img) ' if g['needs_img'] and not g['img_box'] else ''}{ev(g)}\n  {g['q']}\n"
    for j, o in enumerate(g['o']):
        s += f"  {L[j]}. {o}\n"
    if g['xf']:
        x = xf[g['xf'][0][2]]
        s += f"  ~xf{x['id']}({g['xf'][0][0]},{g['xf'][0][1]}): {x['q'][:60]} | {' / '.join(o[:14] for o in x['o'])} ans={x.get('ma') or x['a']}\n"
    m = g['match']
    if m and m['src'] in ('km', 'mj'):
        s += f"  ~{m['src']}{m['id']}({m['ratio']}) ans={m['ans']} {' / '.join(o[:12] for o in m['o'])}\n"
    lines.append(s)
n = 50
for k in range(0, len(lines), n):
    (out / f'c{k // n + 1:02d}.txt').write_text('\n'.join(lines[k:k + n]))
print(len(C), 'C files', (len(lines) + n - 1) // n)
