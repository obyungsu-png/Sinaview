import re, json

raw = open("full_dump.txt", encoding="utf-8").read()
parts = re.split(r"@@@PAGE (\d+)@@@", raw)
# parts: ['', '1', text1, '2', text2, ...]
pages = {}
for i in range(1, len(parts), 2):
    pages[int(parts[i])] = parts[i+1]

out = open("inspect_out.txt", "w", encoding="utf-8")

# Dump pages 920-940 heads and first lines to identify section start
for p in range(920, 941):
    t = pages.get(p, "")
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    out.write(f"--- PAGE {p} ({len(lines)} lines) first lines: {lines[:6]}\n")

# Count questions in each page range by tracking question numbers
def count_questions(lo, hi):
    # find question starts: number 、 or number . followed by 【 or content, with 参考答案 following later
    txt = "\n".join(pages.get(p, "") for p in range(lo, hi+1))
    nums = re.findall(r"^(\d{1,4})\s*[、\.．]", txt, re.M)
    return len(nums), txt

# Examine monotonic question numbering from page 927 to end
seq = []
for p in range(900, 1063):
    t = pages.get(p, "")
    for m in re.finditer(r"^(\d{1,4})\s*[、\.．]", t, re.M):
        seq.append((p, int(m.group(1))))
# print where numbering monotonic increases / resets
resets = []
prevp, prevn = None, None
for p, num in seq:
    if prevn is not None and num < prevn - 3:
        resets.append((p, num, prevn))
    prevp, prevn = p, num
out.write("\nRESETS (page, newnum, prevnum): " + json.dumps(resets, ensure_ascii=False) + "\n")

# totals per section guesses
for lo, hi in [(1,372),(373,501),(502,566),(567,907),(908,926),(927,1062)]:
    c, txt = count_questions(lo, hi)
    out.write(f"RANGE {lo}-{hi}: qstarts={c} chars={len(txt)}\n")

# what types appear per range (判断/单选/多选)
for lo, hi in [(927,1062)]:
    txt = "\n".join(pages.get(p, "") for p in range(lo, hi+1))
    out.write(f"types in {lo}-{hi}: 判断={txt.count('判断题')} 单选={txt.count('单选题')} 多选={txt.count('多选题')} 参考答案={txt.count('参考答案')}\n")

out.close()
print("written")
