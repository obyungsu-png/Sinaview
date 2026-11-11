# -*- coding: utf-8 -*-
"""학법감점 단어장(driverLicenseXuefaWords.json) 생성
- d: 만점 단어 사전 재사용 + 학법 단어(xfjz_resources WORDS) 추가
- t: 문제 id별 토큰 (문제 + 보기) — 그리팅 longest-match
- k: 문제·보기별 핵심 단어 목록 (1단계 한국어 인라인 표시용)
- c/ct: 카드별 단어 목록/라인 토큰 (카드 단어 팝업용)
"""
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = r"C:\Users\matan\Desktop\seojun\Sinaview\_xfjz_build"
MJ_WORDS = r"C:\Users\matan\Desktop\seojun\Sinaview\src\data\driverLicenseManjeomWords.json"
XF_DATA = r"C:\Users\matan\Desktop\seojun\Sinaview\src\data\driverLicenseXuefa.json"
OUT = r"C:\Users\matan\Desktop\seojun\Sinaview\src\data\driverLicenseXuefaWords.json"

mj = json.load(open(MJ_WORDS, encoding='utf-8'))
xf = json.load(open(XF_DATA, encoding='utf-8'))
res = json.load(open(f"{BASE}/xfjz_resources.json", encoding='utf-8'))

d = dict(mj["d"])  # {word: [pinyin, ko, key]}
# 학법 전용 단어 추가 (isKey=1)
for w in res["words"]:
    if w["zh"] not in d:
        d[w["zh"]] = [w["pinyin"], w["ko"], 1]

keys = sorted(d.keys(), key=len, reverse=True)
KLEN = max(len(k) for k in keys)

def tokenize(text):
    """dict 키 longest-match 토큰화 (매칭 안 된 글자는 한 글자씩)"""
    toks, i, n = [], 0, len(text)
    while i < n:
        ch = text[i]
        if ch in "。，、；：？！（）【】,.:;?!()[] \u3000":
            toks.append(ch)
            i += 1
            continue
        end = min(i + KLEN, n)
        matched = None
        while end > i:
            seg = text[i:end]
            if seg in d:
                matched = seg
                break
            end -= 1
        toks.append(matched if matched else ch)
        i += len(matched) if matched else 1
    return toks

def words_in(text):
    """문장에 실제로 나오는 dict 단어(2글자 이상) 목록, 길이순"""
    toks = tokenize(text)
    out, seen = [], set()
    for t in toks:
        if len(t) >= 2 and t in d and t not in seen:
            seen.add(t)
            out.append(t)
    out.sort(key=len, reverse=True)
    return out[:4]

# ── 문제 t/k ──
t, k = {}, {}
for q in xf["questions"]:
    qid = str(q["id"])
    opts = q["o"] if q["t"] == "s" else []
    t[qid] = [tokenize(q["q"])] + [tokenize(o) for o in opts]
    k[qid] = [words_in(q["q"])] + [words_in(o) for o in opts]

# ── 카드 c/ct ──
c, ct = [], []
for card in xf["cards"]:
    card_words, lines_toks = set(), []
    for line in card["lines"]:
        zh = line[0]
        lines_toks.append(tokenize(zh))
        for tok in tokenize(zh):
            if len(tok) >= 2 and tok in d:
                card_words.add(tok)
    lines_toks.append(tokenize(card["memo"][0]))  # memo 라인 토큰 (lines.length 인덱스)
    c.append(sorted(card_words, key=len, reverse=True))
    ct.append(lines_toks)

data = {"d": d, "k": k, "c": c, "t": t, "kt": {}, "st": {}, "ct": ct}
json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)

# 커버리지 리포트
def cov(sample):
    total_chars = sum(len(q["q"]) for q in xf["questions"])
    matched = sum(sum(len(t_) for t_ in tokenize(q["q"]) if len(t_) >= 2) for q in xf["questions"])
    return f"{matched}/{total_chars} chars in words"
rep = [
    f"dict={len(d)} questions={len(xf['questions'])} cards={len(xf['cards'])}",
    f"t entries={len(t)} k entries={len(k)}",
    cov(None),
]
open(f"{BASE}/words_report.txt", "w", encoding="utf-8").write("\n".join(rep))
print("done")
