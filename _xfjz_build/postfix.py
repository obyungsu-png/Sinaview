# -*- coding: utf-8 -*-
"""xfjz_raw.json 후처리 → xfjz_clean.json"""
import re, json

qs = json.load(open("xfjz_raw.json", encoding="utf-8"))
notes = open("notes_raw.txt", encoding="utf-8").read().split("\n\n----\n\n")
notes = [n.strip() for n in notes if n.strip()]

clean = []
removed = []
for q in qs:
    text = q["text"].strip()

    # 1. 가짜 문제 제거: 주석 번호 목록이 문제로 잡힌 경우
    if text.startswith("校车在道路上停车上下学生，应当靠道路右侧停靠"):
        removed.append(("fake-note", text[:40]))
        # 노트로 되돌리기
        notes.append(text)
        continue
    # 중복 노트(44번 문제 앞의 교통법규 노트가 붙은 경우) 분리
    if "；2、校车在同方向" in text:
        text = text.split("；2、校车在同方向")[0].rstrip("；;")
        q["text"] = text

    # 2. N/Y 형식 판단형 (p929 #8)
    m = re.search(r"\s*N\s*[:：]\s*错误\s*,?\s*Y\s*[:：]\s*正确\s*$", text)
    if m or re.search(r"\s*Y\s*[:：]\s*正确\s*,?\s*N\s*[:：]\s*错误\s*$", text):
        text = re.sub(r"\s*[NY]\s*[:：]\s*[错误正确]\s*[，,]?\s*[NY]?\s*[:：]?\s*[错误正确]?\s*$", "", text).strip()
        q["kind"] = "j"
        q["a"] = 1 if q["answer"].strip().upper().startswith("N") else 0
        q["opts"] = []
        q["type"] = "判断题"
        q.pop("bad_answer", None)
        q.pop("multi", None)
        q["text"] = text
        clean.append(q)
        continue

    # 3. 보기가 正确/错误 두 개면 판단형으로 정규화
    opt_texts = [t.strip() for _, t in q["opts"]]
    if len(opt_texts) == 2 and all(t in ("正确", "错误", "对", "错") for t in opt_texts):
        q["kind"] = "j"
        q["opts"] = []
        if q["answer"].strip() in ("A", "正确", "对"):
            q["a"] = 0
        elif q["answer"].strip() in ("B", "错误", "错"):
            q["a"] = 1
        else:
            q["a"] = None
            q["bad_answer"] = q["answer"]

    # 4. 쉼표 답(A,B,C) → multi
    ans = str(q.get("bad_answer") or q["answer"])
    if q["a"] is None and re.match(r"^[A-D](\s*[，,、]\s*[A-D])+$", ans):
        q["multi"] = True

    # 5. 그림 문제 표시(참고용)
    if re.search(r"如图|图中|这个标志|该标志|仪表板上|这个信号|路面标线|标志是何含义|标线含义|手势信号|这种信号", text):
        q["pic"] = True

    # 6. 텍스트 정리: 앞쪽 [단선]/【판단】 잔여 제거
    q["text"] = re.sub(r"^\[[^\]]*\]\s*", "", q["text"]).strip()

    clean.append(q)

# ── 解析를 직전 문제에 붙이기: 원본 라인 순회로 재처리 ──
# 원본에서 解析 라인을 다시 찾아 마지막 완성 문제에 연결
raw = open("full_dump.txt", encoding="utf-8").read()
parts = re.split(r"@@@PAGE (\d+)@@@", raw)
pages = {}
for i in range(1, len(parts), 2):
    pages[int(parts[i])] = parts[i + 1]

# 페이지별 문제 순서 유지: page → list of idx
by_page = {}
for i, q in enumerate(clean):
    by_page.setdefault(q["page"], []).append(i)

exp_count = 0
cur_last = None
for p in range(926, 1063):
    t = pages.get(p, "")
    # 페이지 내 문제 순서: num 오름차순 (대략)
    idxs = by_page.get(p, [])
    local_last = None
    for ln in t.splitlines():
        ln = ln.strip()
        m = re.match(r"^(详细)?解析\s*[:：]\s*(.*)$", ln)
        if m:
            txt = m.group(2).strip()
            if txt:
                if local_last is not None and not clean[local_last].get("exp_zh"):
                    clean[local_last]["exp_zh"] = txt
                    exp_count += 1
                else:
                    notes.append("해설(미연결): " + txt)
            continue
        # 문제 시작 라인 감지(간단): 새 문제가 나오면 local_last를 그 문제로 갱신
        if re.match(r"^[\(（【\[]?\s*(判断题|单选题|多选题)", ln) or re.match(r"^\d{1,3}\s*[、\.．]", ln) or ln.startswith("题目"):
            # 이 페이지에서 아직 소진되지 않은 다음 문제
            if idxs:
                local_last = idxs.pop(0)
            # 답 라인 뒤에는 문제가 끝났으니 이후 解析은 직전 문제 것

# 문제 텍스트에 解析이 붙어버린 케이스: 별도 처리 안 함(드묾)

json.dump(clean, open("xfjz_clean.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open("notes_clean.txt", "w", encoding="utf-8").write("\n\n----\n\n".join(notes))

n_j = sum(1 for q in clean if q["kind"] == "j" and q["a"] is not None)
n_s = sum(1 for q in clean if q["kind"] == "s" and q["a"] is not None)
n_multi = sum(1 for q in clean if q.get("multi") or (q["a"] is None and q.get("bad_answer")))
n_bad = sum(1 for q in clean if q["a"] is None and not q.get("multi") and not q.get("bad_answer"))
rep = [
    f"clean={len(clean)} usable_j={n_j} usable_s={n_s} multi/other={n_multi} still_bad={n_bad}",
    f"removed={len(removed)} {removed}",
    f"exp_zh={exp_count}",
    f"pic={sum(1 for q in clean if q.get('pic'))}",
]
# 세트별 가용 수
from collections import defaultdict
d = defaultdict(int)
for q in clean:
    if q["a"] is not None and not q.get("multi"):
        d[q["set"]] += 1
rep.append("usable per set: " + json.dumps(dict(sorted(d.items()))))
open("postfix_report.txt", "w", encoding="utf-8").write("\n".join(rep))
print("done")
