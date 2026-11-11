// 새 img_map.json(위치 기반 매칭)으로 driverLicenseXuefa.json의 q.img/imgSize 갱신.
// 문제 → clean 인덱스는 텍스트 정확 매칭(422/422 검증됨).
const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const OUT = path.join(BASE, '..', 'src', 'data', 'driverLicenseXuefa.json');

const clean = require(path.join(BASE, 'xfjz_clean.json'));
const imgMap = require(path.join(BASE, 'img_map.json'));
const data = require(OUT);

const firstIdx = new Map();
clean.forEach((q, i) => { if (!firstIdx.has(q.text)) firstIdx.set(q.text, i); });

const all = [...data.questions, ...(data.multiQuestions || [])];
let missing = 0;
const newSize = {};
all.forEach((q) => {
  const ci = firstIdx.get(q.q);
  if (ci === undefined) { missing += 1; return; }
  const imgs = imgMap[String(ci)] ?? [];
  q.img = imgs.map((im) => im.file);
  imgs.forEach((im) => { newSize[im.file] = [im.w, im.h]; });
});
if (missing) {
  console.error(`경고: clean 매칭 실패 ${missing}`);
  process.exit(1);
}
data.imgSize = newSize;
fs.writeFileSync(OUT, JSON.stringify(data));
const withImg = all.filter((q) => q.img && q.img.length).length;
console.log(`updated: questionsWithImg=${withImg} imgFiles=${Object.keys(newSize).length} exams=${data.exams.length}`);
