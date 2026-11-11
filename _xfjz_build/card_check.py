import json
d = json.load(open('src/data/driverLicenseXuefa.json', encoding='utf-8'))
out = open('card_check.txt', 'w', encoding='utf-8')
for c in d['cards']:
    out.write(f"{c['topic']} | {c['title']} | check={len(c['check'])}\n")
out.write("topic cards:\n")
for t in d['topics']:
    out.write(f"  {t['title']} -> {t['cards']}\n")
out.close()
print("ok")
