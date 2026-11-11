import json
d = json.load(open('src/data/driverLicenseXuefa.json', encoding='utf-8'))
out = open('verify.txt', 'w', encoding='utf-8')
out.write(f"cards={len(d['cards'])} topics={len(d['topics'])} questions={len(d['questions'])}\n\n")
for i, c in enumerate(d['cards']):
    out.write(f"[{i}] {c['topic']} | {c['title']} | lines={len(c['lines'])} memo={'Y' if c['memo'] else 'N'} check={len(c['check'])}\n")
    if c['lines']:
        out.write(f"    line0: {c['lines'][0]}\n")
    out.write(f"    memo: {c['memo']}\n")
out.write("\ntopics:\n")
for t in d['topics']:
    out.write(f"  {t['title']} cards={t['cards']} count={t['count']}\n")
out.close()
print("ok")
