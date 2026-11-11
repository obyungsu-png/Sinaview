import pypdfium2 as pdfium, re, sys, json

pdf = pdfium.PdfDocument("xfjz.pdf")
n = len(pdf)
print("total pages:", n)

def page_text(i):
    tp = pdf[i].get_textpage()
    return tp.get_text_bounded()

# sample beginning
for i in [0, 1, 2]:
    print(f"===== PAGE {i+1} =====")
    print(page_text(i)[:600])

# find question-number patterns per page across whole doc: count "1、" style starts
pat_q = re.compile(r"^\s*(\d{1,4})\s*[、\.．]\s*\S", re.M)
pat_judge = re.compile(r"判断题|单选题|多选题")

qcounts = []
for i in range(n):
    t = page_text(i)
    nums = pat_q.findall(t)
    qcounts.append((i+1, len(nums), len(t)))

# print pages 900-1062 question counts
print("---- pages 900-1062 ----")
for p, c, ln in qcounts[899:]:
    print(p, c, ln)
