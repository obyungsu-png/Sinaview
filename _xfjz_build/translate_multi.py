# -*- coding: utf-8 -*-
"""다선(多选) 문제 한국어 번역 (python translate_multi.py <start> <end>)"""
import json, os, re, sys, time, urllib.request

BASE = r"C:\Users\matan\Desktop\seojun\Sinaview\_xfjz_build"
SRC = os.path.join(BASE, "xfjz_clean.json")
OUT = os.path.join(BASE, "xfjz_multi_translated.jsonl")
API = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
KEY = "dc2213720f4b4a88ae06ddbd434ab1dd.qDGcLtBM9gGqp6ff"
MODEL = "glm-4-flash"

PROMPT = """중국 교통법규(学法减分) 시험 문제를 한국어로 번역하세요. JSON만 반환하세요.

필드:
- "q": 문제 번역 (자연스러운 한국어. "如图所示" 등 그림 표현은 "그림과 같이"로)
- "o": 보기 번역 배열 (중국어 보기와 같은 순서·개수)
- "e": 한국어 해설 1~2문장. 왜 이 답들이 맞는지 핵심 규정(점수·금액·거리 등 숫자는 정확히)을 설명하세요.

문제(중국어): {q}
보기(중국어): {o}
정답: {a}"""

def call_glm(prompt, max_tokens=1200):
    body = {"model": MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": max_tokens, "response_format": {"type": "json_object"}}
    req = urllib.request.Request(API, data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {KEY}"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))["choices"][0]["message"]["content"]

def robust_json(s):
    try:
        return json.loads(s)
    except Exception:
        pass
    m = re.search(r"\{[\s\S]*\}", s)
    if m:
        body = m.group(0)
        for candidate in (body, re.sub(r",\s*([}\]])", r"\1", body)):
            try:
                return json.loads(candidate)
            except Exception:
                continue
    try:
        from json_repair import repair_json
        fixed = repair_json(s, return_objects=True)
        if isinstance(fixed, dict):
            return fixed
    except Exception:
        pass
    raise ValueError("bad json")

def main():
    lo, hi = int(sys.argv[1]), int(sys.argv[2])
    qs = json.load(open(SRC, encoding="utf-8"))
    multi = [(i, q) for i, q in enumerate(qs) if q.get("multi") or (q.get("bad_answer") and re.match(r"^[A-D]{2,4}\s*$", str(q["bad_answer"]).replace(" ", "").replace(",", "").replace("，", "")))]
    done = set()
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            for line in f:
                try:
                    done.add(json.loads(line)["i"])
                except Exception:
                    pass
    for i, q in multi[lo:hi]:
        if i in done:
            continue
        oz = [t for _, t in q["opts"]]
        ans = str(q.get("bad_answer") or q["answer"]).replace(" ", "").replace(",", "").replace("，", "")
        prompt = PROMPT.format(q=q["text"], o=json.dumps(oz, ensure_ascii=False), a=ans)
        ok = False
        for attempt in range(3):
            try:
                obj = robust_json(call_glm(prompt))
                rec = {"i": i,
                       "q": str(obj.get("q", "")).strip(),
                       "o": [str(x).strip() for x in (obj.get("o") or [])],
                       "e": str(obj.get("e", "")).strip()}
                if rec["q"] and rec["o"]:
                    with open(OUT, "a", encoding="utf-8") as f:
                        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    ok = True
                    break
            except Exception:
                time.sleep(2 + attempt * 3)
        if not ok:
            with open(os.path.join(BASE, "xfjz_multi_failed.txt"), "a", encoding="utf-8") as f:
                f.write(f"{i}\t{q['text'][:60]}\n")
        time.sleep(0.3)

if __name__ == "__main__":
    main()
