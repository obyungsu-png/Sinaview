import json
done = set()
for line in open('xfjz_translated.jsonl', encoding='utf-8'):
    line = line.strip()
    if line:
        done.add(json.loads(line)['i'])
qs = json.load(open('xfjz_clean.json', encoding='utf-8'))
need = [i for i, q in enumerate(qs) if q.get('a') is not None and not q.get('multi')]
missing = [i for i in need if i not in done]
out = open('missing.txt', 'w', encoding='utf-8')
out.write(f"need={len(need)} done={len(done & set(need))} missing={len(missing)}\n")
for i in missing:
    out.write(f"{i}\tp{qs[i]['page']}\tset{qs[i]['set']}\t{qs[i]['kind']}\t{qs[i]['text'][:50]}\n")
out.close()
print("ok")
