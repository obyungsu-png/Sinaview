import json
qs = json.load(open("xfjz_raw.json", encoding="utf-8"))
out = open("check_raw.txt", "w", encoding="utf-8")

# 1. bad answers
out.write("=== BAD ===\n")
for q in qs:
    if q["a"] is None and not q.get("multi"):
        out.write(json.dumps(q, ensure_ascii=False) + "\n")

# 2. samples: first of each set
out.write("\n=== SET FIRSTS ===\n")
seen = set()
for q in qs:
    if q["set"] not in seen:
        seen.add(q["set"])
        out.write(f"set{q['set']} p{q['page']} {q['kind']} #{q['num']}: {q['text'][:60]} | opts={q['opts'][:2]} | ans={q['answer']}\n")

# 3. suspicious: very short text or no opts for 's'
out.write("\n=== SUSPICIOUS ===\n")
for q in qs:
    if q["kind"] == "s" and len(q["opts"]) < 3:
        out.write(f"p{q['page']} set{q['set']} #{q['num']} opts={len(q['opts'])}: {q['text'][:70]} | {q['opts']} ans={q['answer']}\n")
    if len(q["text"]) < 8:
        out.write(f"SHORT p{q['page']} set{q['set']} #{q['num']}: {q['text']} | {q['opts']} ans={q['answer']}\n")

# 4. judge with weird opts
out.write("\n=== JUDGE OPTS ===\n")
for q in qs:
    if q["kind"] == "j" and q["opts"]:
        t0 = q["opts"][0][1].strip()
        if t0 not in ("正确", "错误", "对", "错"):
            out.write(f"p{q['page']} set{q['set']} #{q['num']}: opts={q['opts']} ans={q['answer']} text={q['text'][:50]}\n")

# 5. per-set page ranges
out.write("\n=== SET PAGE RANGES ===\n")
from collections import defaultdict
d = defaultdict(list)
for q in qs:
    d[q["set"]].append(q["page"])
for s in sorted(d):
    out.write(f"set{s}: pages {min(d[s])}-{max(d[s])} n={len(d[s])}\n")

# 6. exp coverage
out.write("\n=== EXP ===\n")
out.write(f"with exp: {sum(1 for q in qs if q['exp'])}\n")
for q in qs:
    if q["exp"]:
        out.write(f"p{q['page']} set{q['set']} #{q['num']} exp={q['exp'][:70]}\n")
out.close()
print("ok")
