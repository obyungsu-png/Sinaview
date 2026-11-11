import json, sys
sys.stdout.reconfigure(encoding='utf-8')
d = json.load(open('src/data/driverLicenseXuefa.json', encoding='utf-8'))
allq = {q['id']: q for q in d['questions'] + d.get('multiQuestions', [])}
out = open('exam_report.txt', 'w', encoding='utf-8')
out.write(f"multiQuestions={len(d.get('multiQuestions', []))} exams={len(d['exams'])}\n")
for i, exam in enumerate(d['exams']):
    kinds = [allq[q]['t'] for q in exam]
    pics = sum(1 for q in exam if allq[q].get('pic'))
    from collections import Counter
    c = Counter(kinds)
    out.write(f"제{i+1}회: total={len(exam)} 판단={c.get('j',0)} 단선={c.get('s',0)} 다선={c.get('m',0)} 사진={pics}\n")
# 다선 ma 유효성
bad = [q['id'] for q in d.get('multiQuestions', []) if not q.get('ma') or len(q['ma']) < 2]
out.write(f"multi bad={len(bad)}\n")
out.close()
print('ok')
