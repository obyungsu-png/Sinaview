# -*- coding: utf-8 -*-
"""学法减分 테일 섹션(p926-1062) 파싱 → xfjz_raw.json + notes_raw.txt"""
import re, json

raw = open("full_dump.txt", encoding="utf-8").read()
parts = re.split(r"@@@PAGE (\d+)@@@", raw)
pages = {}
for i in range(1, len(parts), 2):
    pages[int(parts[i])] = parts[i + 1]

# ── 1. 라인 수집 (p926-1062) ──────────────────────────────
lines = []
for p in range(926, 1063):
    t = pages.get(p, "")
    for ln in t.splitlines():
        ln = ln.strip()
        if ln:
            lines.append((p, ln))

# ── 2. 정규식 ──────────────────────────────
RE_TYPE = re.compile(r"^[\(（【\[]?\s*(判断题|单选题|多选题)\s*[\)）】\]]?\s*$")            # (判断题) / 【判断题】
RE_TYPE_Q = re.compile(r"^[\(（【\[]?\s*(判断题|单选题|多选题)\s*[\)）】\]]?\s*(\d{1,3})\s*[、\.．]\s*(.*)$")  # 【判断题】3、...
RE_BRACKET_Q = re.compile(r"^\[\s*(判断题|单选题|多选题)\s*\]\s*(\d{1,3})\s*[、\.．]\s*(.*)$")  # [单选题]16、
RE_QNUM = re.compile(r"^(\d{1,3})\s*[、\.．]\s*(.*)$")
RE_OPT = re.compile(r"([A-D])\s*[、\.．:：]\s*")
RE_ANS = re.compile(r"^(标准答案|正确答案|答案|参考答案)\s*[:：]?\s*(.*)$")
RE_JIE = re.compile(r"^(详细)?解析\s*[:：]\s*(.*)$")
RE_TI = re.compile(r"^题目\s*[:：]\s*(.*)$")

def split_options(text):
    """한 줄에 여러 보기: 'A、xx B、yy' → [('A','xx'),('B','yy')]"""
    parts_ = RE_OPT.split(text)
    # parts_: [pre, 'A', txt, 'B', txt, ...]
    opts = []
    for i in range(1, len(parts_) - 1, 2):
        opts.append((parts_[i], parts_[i + 1].strip()))
    return opts, parts_[0].strip()

questions = []
notes = []  # 지식 노트 (카드 소재)
cur = None       # 현재 질문 dict
cur_type = None  # 직전 유형 마커
note_buf = []

def flush_note():
    global note_buf
    if note_buf:
        txt = "".join(note_buf).strip()
        if len(txt) >= 25 and not RE_ANS.match(txt):
            notes.append(txt)
        note_buf = []

def new_question(p, qtype, num, text):
    global cur
    flush_note()
    cur = {"page": p, "type": qtype, "num": num, "text": text or "", "opts": [], "answer": "", "exp": "", "raw_exp": ""}

def finish_question():
    global cur
    if cur is not None:
        if cur["text"] and cur["answer"]:
            questions.append(cur)
        elif cur["text"]:
            notes.append("[미완성] " + cur["type"] + " " + cur["text"][:80] + " ans=" + cur["answer"])
        cur = None

for p, ln in lines:
    # 유형 마커
    m = RE_TYPE.match(ln)
    if m:
        flush_note()
        cur_type = m.group(1)
        continue
    # [단선]16、 형태
    m = RE_BRACKET_Q.match(ln)
    if m:
        finish_question()
        cur_type = m.group(1)
        new_question(p, cur_type, int(m.group(2)), m.group(3))
        continue
    # 【판단】3、 형태
    m = RE_TYPE_Q.match(ln)
    if m:
        finish_question()
        cur_type = m.group(1)
        new_question(p, cur_type, int(m.group(2)), m.group(3))
        continue
    # 문제 번호
    m = RE_QNUM.match(ln)
    if m and cur is None:
        num = int(m.group(1))
        new_question(p, cur_type, num, m.group(2))
        continue
    # 题目： 형태
    m = RE_TI.match(ln)
    if m:
        finish_question()
        new_question(p, cur_type, 0, m.group(1))
        continue
    # 보기
    if cur is not None and RE_OPT.search(ln) and not RE_ANS.match(ln) and not RE_JIE.match(ln):
        opts, pre = split_options(ln)
        if pre and len(pre) >= 4 and not cur["opts"]:
            cur["text"] += pre
        for L, txt in opts:
            cur["opts"].append((L, txt))
        continue
    # 해석
    m = RE_JIE.match(ln)
    if m:
        if cur is not None:
            cur["exp"] = m.group(2).strip()
        else:
            notes.append("해설: " + m.group(2))
        continue
    # 답
    m = RE_ANS.match(ln)
    if m and cur is not None:
        ans = m.group(2).strip()
        cur["answer"] = ans
        finish_question()
        continue
    # 일반 텍스트
    if cur is not None:
        if cur["opts"]:
            # 마지막 보기에 이어 붙임 (줄바꿈된 보기)
            if cur["opts"] and len(ln) <= 20:
                L, txt = cur["opts"][-1]
                cur["opts"][-1] = (L, (txt + ln).strip())
            else:
                cur["text"] += ln
        else:
            cur["text"] += ln
    else:
        note_buf.append(ln)
        if len("".join(note_buf)) > 400:
            flush_note()

finish_question()
flush_note()

# ── 3. 후처리: 판단형 정규화, 답 인덱스, 세트 구분 ──────────────────────────────
out = []
prev_num = None
set_no = 0
set_start_page = None
for q in questions:
    num = q["num"]
    if prev_num is not None and num <= prev_num - 3:
        set_no += 1
    prev_num = num
    q["set"] = set_no

    # 답 처리
    ans = q["answer"]
    ans = ans.replace("：", "").replace(":", "").strip()
    # 판단형 판별
    opt_texts = [t for _, t in q["opts"]]
    is_judge = q["type"] == "判断题" or (
        q["type"] is None
        and len(opt_texts) == 2
        and all(re.match(r"^(正确|错误|对|错)$", t.strip()) for t in opt_texts)
    )
    if ans in ("正确", "对", "错误", "错") or (ans in ("A", "B") and is_judge):
        q["kind"] = "j"
        if ans in ("正确", "对", "A"):
            q["a"] = 0
        else:
            q["a"] = 1
    else:
        q["kind"] = "s"
        m2 = re.match(r"^([A-D]{1,4})\s*$", ans)
        if not m2:
            q["a"] = None
            q["bad_answer"] = ans
        else:
            letters = m2.group(1)
            if len(letters) > 1:
                q["a"] = None
                q["bad_answer"] = letters
                q["multi"] = True
            else:
                idx = "ABCD".index(letters)
                # 보기 순서가 A,B,C,D 순으로 저장됐는지 확인
                qs = [L for L, _ in q["opts"]]
                if qs and idx < len(qs):
                    q["a"] = idx
                else:
                    q["a"] = None
                    q["bad_answer"] = letters
    out.append(q)

# 통계
n_j = sum(1 for q in out if q["kind"] == "j")
n_s = sum(1 for q in out if q["kind"] == "s")
n_multi = sum(1 for q in out if q.get("multi"))
n_bad = sum(1 for q in out if q["a"] is None and not q.get("multi"))
with open("xfjz_raw.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
with open("notes_raw.txt", "w", encoding="utf-8") as f:
    for n in notes:
        f.write(n + "\n\n----\n\n")

report = []
report.append(f"total={len(out)} judge={n_j} single={n_s - n_multi} multi={n_multi} bad={n_bad}")
report.append(f"sets={set_no + 1}")
from collections import Counter
cnt = Counter(q["set"] for q in out)
report.append("set sizes: " + json.dumps(dict(sorted(cnt.items())), ensure_ascii=False))
pages_seen = Counter(q["page"] for q in out)
report.append("pages: " + ", ".join(f"{p}:{c}" for p, c in sorted(pages_seen.items())))
open("parse_report.txt", "w", encoding="utf-8").write("\n".join(report))
print("done")
