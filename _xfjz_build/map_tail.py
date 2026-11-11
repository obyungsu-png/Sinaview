import re

raw = open("full_dump.txt", encoding="utf-8").read()
parts = re.split(r"@@@PAGE (\d+)@@@", raw)
pages = {}
for i in range(1, len(parts), 2):
    pages[int(parts[i])] = parts[i+1]

# look for section boundary keywords across pages 880-1062
kws = ["易错题", "易混题", "模拟", "真题", "（一）", "（二）", "（三）", "（四）", "（五）", "（六）", "（七）", "（八）", "（九）", "（十）",
       "判断题）", "单选题）", "多选题）", "【判断题】", "【单选题】", "【多选题】", "标准答案", "正确答案", "专项", "精选", "押题"]
out = open("map_tail.txt", "w", encoding="utf-8")
for p in range(880, 1063):
    t = pages.get(p, "")
    found = []
    for kw in kws:
        c = t.count(kw)
        if c:
            found.append(f"{kw}:{c}")
    # first line
    first = [l.strip() for l in t.splitlines() if l.strip()][:2]
    out.write(f"P{p}: {' | '.join(found)}  || first: {first}\n")

# also scan pages 880-912 for what section is there
out.write("\n=== pages 905-912 full ===\n")
for p in range(905, 913):
    out.write(f"\n--- PAGE {p} ---\n" + pages.get(p, "")[:800])
out.close()
print("ok")
