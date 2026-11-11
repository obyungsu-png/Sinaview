"""groups.json 점검: ① 근거 정답 vs 기존 은행 정답 ② 묶음끼리 비슷한 것(덜 묶인 것) ③ 학법과 애매하게 비슷한 것"""
import sys, json, re, difflib, collections
from pathlib import Path
ROOT = Path(sys.argv[1])
G = json.loads((ROOT / 'groups.json').read_text())
LET = 'ABCD'
def norm(s): return re.sub(r'[\s，。、,.:：;；？?！!（）()“”"\'·…]', '', s or '')
agree = collections.Counter()
for g in G:
    m = g['match']
    if not (m and g['answer']):
        continue
    if g['type'] == 'j':
        mine = 'Y' if g['answer'] == [0] else 'N'
        ok = mine == m['ans']
    else:
        mine = ''.join(sorted(LET[i] for i in g['answer']))
        # 은행 보기 순서 → 대표 보기 순서
        if m['o']:
            letters = []
            for L in m['ans']:
                t = norm(m['o'][LET.index(L)])
                j = max(range(len(g['o'])), key=lambda j: difflib.SequenceMatcher(None, t, norm(g['o'][j])).ratio())
                letters.append(LET[j])
            ok = ''.join(sorted(letters)) == mine
        else:
            ok = None
    agree[(g['src'], ok)] += 1
print('근거 vs 기존:', sorted(agree.items(), key=str))
# ② 덜 묶인 것
ks = [(i, g['type'], norm(g['q'])) for i, g in enumerate(G)]
near = []
for a in range(len(ks)):
    for b in range(a + 1, len(ks)):
        if ks[a][1] != ks[b][1]:
            continue
        r = difflib.SequenceMatcher(None, ks[a][2], ks[b][2]).ratio()
        if r >= 0.8:
            near.append((round(r, 2), a, b))
print('비슷한 묶음 쌍', len(near))
for r, a, b in near[:40]:
    print(r, '|', G[a]['q'][:50], '|', G[b]['q'][:50])
    print('    ', [o[:10] for o in G[a]['o']], [o[:10] for o in G[b]['o']])
