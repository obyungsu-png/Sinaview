import json
d = json.load(open('src/data/driverLicenseManjeom.json', encoding='utf-8'))
out = open('_xfjz_build/json_sample.txt', 'w', encoding='utf-8')
out.write("keys: " + str(list(d.keys())) + "\n")
out.write("questions: " + str(len(d['questions'])) + "\n")
out.write("q0: " + json.dumps(d['questions'][0], ensure_ascii=False) + "\n\n")
out.write("topics0: " + json.dumps(d['topics'][0], ensure_ascii=False) + "\n")
out.write("exam len: " + str(len(d['exam'])) + "\n")
out.write("card0: " + json.dumps(d['cards'][0], ensure_ascii=False) + "\n")
out.write("card_last: " + json.dumps(d['cards'][-1], ensure_ascii=False) + "\n")
# a judged question sample
for q in d['questions']:
    if q.get('t') == 'j':
        out.write("judge sample: " + json.dumps(q, ensure_ascii=False) + "\n")
        break
# words file
w = json.load(open('src/data/driverLicenseManjeomWords.json', encoding='utf-8'))
out.write("\nwords type: " + str(type(w)) + " len: " + str(len(w)) + "\n")
out.write("words sample: " + json.dumps(w[:2] if isinstance(w, list) else list(w.items())[:2], ensure_ascii=False) + "\n")
out.close()
print("ok")
