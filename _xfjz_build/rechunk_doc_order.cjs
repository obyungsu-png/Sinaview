// 실전고사(exams)를 원본 문서(935~1070쪽) 순서 그대로 20문제씩 재구성.
// 기존 문제 객체(id·번역·이미지)는 그대로 두고 문서 순서(clean 인덱스)로만 정렬해 회차를 나눔.
const fs = require('fs');
const path = require('path');
const BASE = __dirname;
const OUT = path.join(BASE, '..', 'src', 'data', 'driverLicenseXuefa.json');

const clean = require(path.join(BASE, 'xfjz_clean.json'));
const data = require(OUT);

// clean.text → 첫 등장 인덱스 (문서 순서)
const firstIdx = new Map();
clean.forEach((q, i) => { if (!firstIdx.has(q.text)) firstIdx.set(q.text, i); });

const all = [...data.questions, ...(data.multiQuestions || [])];
let missing = 0;
const withIdx = all
  .map((q) => {
    const ci = firstIdx.get(q.q);
    if (ci === undefined) { missing += 1; return null; }
    return { id: q.id, ci };
  })
  .filter(Boolean);
if (missing) {
  console.error(`경고: 문서 순서 매칭 실패 ${missing}문제`);
  process.exit(1);
}
withIdx.sort((a, b) => a.ci - b.ci);
const ordered = withIdx.map((x) => x.id);

const EXAM = 20;
const exams = [];
for (let k = 0; k < ordered.length; k += EXAM) {
  const chunk = ordered.slice(k, k + EXAM);
  if (chunk.length < EXAM) {
    for (let j = 0; chunk.length < EXAM; j += 1) chunk.push(ordered[j]);
  }
  exams.push(chunk);
}
data.exams = exams;
fs.writeFileSync(OUT, JSON.stringify(data));
console.log(`exams=${exams.length} questionsUsed=${ordered.length}`);
