import re

raw = open("full_dump.txt", encoding="utf-8").read()
parts = re.split(r"@@@PAGE (\d+)@@@", raw)
pages = {}
for i in range(1, len(parts), 2):
    pages[int(parts[i])] = parts[i+1]

with open("tail_raw.txt", "w", encoding="utf-8") as f:
    for p in range(925, 1063):
        t = pages.get(p, "")
        f.write(f"\n@@@PAGE {p}@@@\n")
        f.write(t)
print("ok")
