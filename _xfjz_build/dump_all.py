import pypdfium2 as pdfium, re, json

pdf = pdfium.PdfDocument("xfjz.pdf")
n = len(pdf)
pat_q = re.compile(r"^\s*(\d{1,4})\s*[、\.．]\s*[【\[]?\s*(判断|单选|多选|安全|scenario)?", re.M)

pages = []
for i in range(n):
    tp = pdf[i].get_textpage()
    t = tp.get_text_bounded()
    pages.append(t)

# save full dump
with open("full_dump.txt", "w", encoding="utf-8") as f:
    for i, t in enumerate(pages):
        f.write(f"\n@@@PAGE {i+1}@@@\n")
        f.write(t)

# per-page stats: first question number seen, count of question starts, any section-ish headings
stats = []
for i, t in enumerate(pages):
    nums = [int(x) for x in re.findall(r"^(\d{1,4})\s*[、\.．]", t, re.M)]
    # section headings like 第X章 or big titles
    heads = re.findall(r"^(第[一二三四五六七八九十百千\d]+[章节部分篇].{0,30}|[一二三四五六七八九十]{1,3}、\s*\S.{0,30})$", t, re.M)
    stats.append({"page": i+1, "qnums": nums[:5], "nq": len(nums), "heads": heads[:4], "len": len(t)})

with open("stats.json", "w", encoding="utf-8") as f:
    json.dump(stats, f, ensure_ascii=False, indent=1)

# Print transitions: where first question number decreases (section restarts)
prev = None
for s in stats:
    first = s["qnums"][0] if s["qnums"] else None
    if first and prev and first < prev - 3:
        print("RESTART at page", s["page"], "first qnum", first, "prev", prev, "heads:", s["heads"])
    if first:
        prev = first

print("done, pages:", n)
