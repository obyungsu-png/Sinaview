# -*- coding: utf-8 -*-
"""xfjz_clean + xfjz_translated + xfjz_resources → src/data/driverLicenseXuefa.json"""
import re, json

BASE = r"C:\Users\matan\Desktop\seojun\Sinaview\_xfjz_build"
OUT = r"C:\Users\matan\Desktop\seojun\Sinaview\src\data\driverLicenseXuefa.json"

clean = json.load(open(f"{BASE}/xfjz_clean.json", encoding="utf-8"))
res = json.load(open(f"{BASE}/xfjz_resources.json", encoding="utf-8"))
WORDS = res["words"]
TOPICS = res["topics"]
CARDS = res["cards"]
CARD_MATCH = {c["title"]: pat for c in CARDS for pat in [c.get("match", "")]}

# 번역 로드
trans = {}
with open(f"{BASE}/xfjz_translated.jsonl", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        o = json.loads(line)
        trans[o["i"]] = o

# ── 1. 사용 가능 문제 선별 (단일 정답) ─────────────────────────
usable = []
seen = set()
for i, q in enumerate(clean):
    if q.get("a") is None or q.get("multi"):
        continue
    tr = trans.get(i)
    if not tr or not tr.get("q"):
        continue
    # 중복 제거 (문제+보기 정규화)
    norm = re.sub(r"[\s。．，,？?！!]", "", q["text"])
    opt_norm = "".join(re.sub(r"[\s]", "", t) for _, t in q["opts"])
    key = q["kind"] + "|" + norm[:60] + "|" + norm[-20:] + "|" + opt_norm[:40]
    if key in seen:
        continue
    seen.add(key)
    usable.append((q, tr))

usable.sort(key=lambda x: (x[0]["page"], x[0].get("num") or 0))

# ── 2. kw 매칭 ─────────────────────────
def match_words(text):
    hits = []
    for w in WORDS:
        if w["zh"] in text and len(w["zh"]) >= 2:
            hits.append(w)
    # 길이순 정렬 후 최대 4개
    hits.sort(key=lambda w: -len(w["zh"]))
    out, used = [], set()
    for w in hits:
        if w["zh"] not in used:
            used.add(w["zh"])
            out.append([w["zh"], w["pinyin"], w["ko"]])
    return out[:4]

# ── 3. 문제 조립 ─────────────────────────
KEY_RULES = [
    (1, r"学法减分|减分|满分教育|满分学习|减免|公益"),
    (2, r"记\s*\d+\s*分|记分|累积记分|一次记"),
    (3, r"罚款|吊销|拘留|刑事责任|伪造|变造|犯罪|处罚|没收|拘役"),
    (4, r"驾驶证|实习期|审验|换证|补发|申领|身体条件|增驾|暂扣|扣留|年检|检验"),
    (5, r"高速公路|城市快速路|匝道|减速车道|加速车道|应急车道|能见度"),
    (6, r"信号灯|信号|标志|标线|手势|灯光|雾灯|远光|近光|转向灯|仪表|指示灯"),
    (7, r"事故|伤员|急救|心肺|止血|骨折|中毒|烧伤|灭火|逃逸|碰撞|护栏|落水|翻车"),
    (8, r"超车|会车|跟车|倒车|掉头|逆行|超速|停车|让行|转向|制动|轮胎|冰雪|雨天|雾天|泥泞|安全带|头盔|车速|速度|距离"),
]
def classify(text):
    for c, pat in KEY_RULES:
        if re.search(pat, text):
            return c
    return 8

questions = []
for n, (q, tr) in enumerate(usable):
    kind = q["kind"]
    oz = [t.strip() for _, t in q["opts"]]
    ko_o = [str(x) for x in (tr.get("o") or [])]
    questions.append({
        "id": 70001 + n,
        "c": classify(q["text"]),
        "t": "j" if kind == "j" else "s",
        "q": q["text"],
        "o": oz,
        "a": int(q["a"]),
        "e": tr.get("e", ""),
        "ko": {"q": tr["q"], "o": ko_o if ko_o else None} if ko_o or tr["q"] else None,
        "kw": match_words(q["text"]),
        "ez": q.get("exp_zh") or None,
    })
# ko.o가 빈 배열이면 제거
for q in questions:
    if q.get("ko") and not q["ko"].get("o"):
        q["ko"].pop("o", None)

by_id = {q["id"]: q for q in questions}

# ── 4. 실전 고사: 20문제씩 (마지막 회차가 부족하면 앞에서 채워 20문제 유지) ─────────────────────────
EXAM_SIZE = 20
ids = [q["id"] for q in questions]
exams = []
for i in range(0, len(ids), EXAM_SIZE):
    chunk = ids[i:i + EXAM_SIZE]
    if len(chunk) < EXAM_SIZE:
        chunk += ids[: EXAM_SIZE - len(chunk)]
    exams.append(chunk)

# ── 5. 카드 체크 문제 매칭 ─────────────────────────
# ── 5. 핵심 정리 카드 (암기구결) + 체크 문제 매칭 ─────────────────────────
cards_out = []
for card in CARDS:
    pat = card.get("match", "")
    checks = []
    if pat:
        for q in questions:
            blob = q["q"] + " ".join(q["o"])
            if re.search(pat, blob) and q["id"] not in checks:
                checks.append(q["id"])
            if len(checks) >= 8:
                break
    cards_out.append({
        "topic": card["topic"],
        "title": card["title"],
        "zh": card["zh"],
        "new": False,
        "lines": card["lines"],
        "memo": card["memo"],
        "check": checks,
    })

# ── 6. 카드 소속 주제 집계 (topics cards 인덱스) ─────────────────────────
topics_out = []
for t in TOPICS:
    t_name = t["title"].split("·")[0].split(" ")[0]  # '처벌·벌금' → '처벌', '벌점 기준' → '벌점'
    idxs = [i for i, c in enumerate(cards_out) if c["topic"].startswith(t_name)]
    topics_out.append({**t, "count": sum(1 for q in questions if q["c"] == t["c"]), "cards": idxs})

data = {
    "topics": topics_out,
    "questions": questions,
    "cards": cards_out,
    "exams": exams,
    "imgSize": {},
}
json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)

# 통계
from collections import Counter
c_cnt = Counter(q["c"] for q in questions)
t_cnt = Counter(q["t"] for q in questions)
kw_cnt = sum(1 for q in questions if q["kw"])
rep = [
    f"questions={len(questions)} exams={len(exams)} cards={len(cards_out)}",
    f"judge={t_cnt.get('j', 0)} single={t_cnt.get('s', 0)}",
    "per topic: " + json.dumps(dict(sorted(c_cnt.items()))),
    f"kw coverage={kw_cnt}/{len(questions)}",
    f"no-ko={sum(1 for q in questions if not q.get('ko'))}",
]
open(f"{BASE}/build_report.txt", "w", encoding="utf-8").write("\n".join(rep))
print("done")
