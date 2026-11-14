// 운전면허 단어 시험 — 만점 교육·학법 감점 문제의 핵심 단어(한자 · 병음 · 뜻)
// - 단어장: 카드/목록, 뜻 가리기, 검색(한자·병음·한글), PDF(단어 목록·시험지)
// - 단어 시험: 단어 → 뜻 · 뜻 → 단어 · 듣고 고르기 · 섞어서 (4지선다), 맞으면 딩동댕 · 틀리면 삐
// - 범위: 과정(만점 교육 / 학법 감점 / 둘 다) · 주제 · 단어(전체 / 내가 틀린 문제의 단어 / 시험에서 틀린 단어 / 이 문제들의 단어)
// - 단어는 문제 데이터의 kw(핵심 단어)에서 모음 → 문제 데이터를 고치면 단어 시험도 같이 바뀜
import { useEffect, useMemo, useState } from 'react';
import { BackButton, LoadingState, shuffle, speakZh, type DLQuestion } from './DriverLicenseQuiz';
import { getWrongMap, useDriverLicenseRecords } from '../utils/driverLicenseRecords';

export type VocabCourse = 'a' | 'b'; // a 만점 교육, b 학법 감점
type Course = VocabCourse | 'ab';
type Topic = { c: number; title: string };
type Bank = { topics: Topic[]; questions: DLQuestion[] };
type Word = { id: number; w: string; p: string; m: string; a: number; b: number; ta: number; tb: number };
type VocabData = { words: Word[]; qWords: Map<number, string[]>; qCourse: Map<number, VocabCourse>; topics: Record<VocabCourse, Topic[]> };
type Source = 'all' | 'wrongq' | 'wrongw' | 'these';
type Mode = 'wm' | 'mw' | 'aw';

const COURSE_NAME: Record<Course, string> = { a: '만점 교육', b: '학법 감점', ab: '만점 교육 · 학법 감점' };

// ───────── 단어 모으기 (두 과정 문제의 kw) ─────────
function buildVocab(banks: Record<VocabCourse, Bank>): VocabData {
  type Acc = { a: number; b: number; ta: number; tb: number; cand: { n: number; p: string; m: string }[] };
  const acc = new Map<string, Acc>();
  const qWords = new Map<number, string[]>();
  const qCourse = new Map<number, VocabCourse>();
  for (const course of ['a', 'b'] as const) {
    const freq = new Map<string, number>();
    const topic = new Map<string, Map<number, number>>();
    const info = new Map<string, Map<string, number>>();
    for (const q of banks[course].questions) {
      const seen = new Set<string>();
      for (const item of q.kw ?? []) {
        const [w, p, m] = item.map((s) => String(s).trim());
        if (!w || !p || !m || seen.has(w)) continue;
        seen.add(w);
        freq.set(w, (freq.get(w) ?? 0) + 1);
        const t = topic.get(w) ?? new Map<number, number>();
        t.set(q.c, (t.get(q.c) ?? 0) + 1);
        topic.set(w, t);
        const key = `${p}\u0000${m}`;
        const inf = info.get(w) ?? new Map<string, number>();
        inf.set(key, (inf.get(key) ?? 0) + 1);
        info.set(w, inf);
      }
      if (seen.size) {
        qWords.set(q.id, [...seen]);
        qCourse.set(q.id, course);
      }
    }
    for (const [w, n] of freq) {
      const e = acc.get(w) ?? { a: 0, b: 0, ta: 0, tb: 0, cand: [] };
      e[course] = n;
      e[course === 'a' ? 'ta' : 'tb'] = [...topic.get(w)!].sort((x, y) => y[1] - x[1])[0][0];
      const [pm] = [...info.get(w)!].sort((x, y) => y[1] - x[1])[0];
      const [p, m] = pm.split('\u0000');
      e.cand.push({ n, p, m });
      acc.set(w, e);
    }
  }
  const words = [...acc]
    .map(([w, e]) => {
      const best = e.cand.slice().sort((x, y) => y.n - x.n)[0];
      return { w, p: best.p, m: best.m, a: e.a, b: e.b, ta: e.ta, tb: e.tb };
    })
    .sort((x, y) => y.a + y.b - (x.a + x.b))
    .map((v, id) => ({ ...v, id }));
  return { words, qWords, qCourse, topics: { a: banks.a.topics, b: banks.b.topics } };
}

let cache: VocabData | null = null;
let pending: Promise<VocabData> | null = null;
function loadVocab() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = Promise.all([import('../data/driverLicenseManjeom.json'), import('../data/driverLicenseXuefa.json')])
      .then(([m, x]) => {
        cache = buildVocab({ a: m.default as unknown as Bank, b: x.default as unknown as Bank });
        return cache;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

// ───────── 기록 (이 기기) ─────────
const WRONG_KEY = 'dl-vocab-wrong';
const SOUND_KEY = 'dl-vocab-sound';
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장 못 해도 시험은 계속 */
  }
}

// ───────── 효과음: 맞으면 딩·동·댕, 틀리면 삐 (소리 파일 없이 브라우저가 만듦) ─────────
let actx: AudioContext | null = null;
function audio() {
  const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null;
  if (!actx) actx = new C();
  if (actx.state === 'suspended') actx.resume().catch(() => {});
  return actx;
}
function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function sfxOk() {
  try {
    [[523.25, 0, 0.42], [659.25, 0.17, 0.42], [783.99, 0.34, 0.75]].forEach(([f, s, d]) => {
      tone(f, s, d, 'sine', 0.32);
      tone(f * 2, s, d * 0.6, 'sine', 0.06);
    });
  } catch {
    /* 소리를 못 내는 기기 */
  }
}
function sfxBad() {
  try {
    tone(440, 0, 0.5, 'square', 0.09);
  } catch {
    /* 소리를 못 내는 기기 */
  }
}
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

// ───────── PDF (인쇄 → PDF로 저장) ─────────
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
function printHtml(html: string) {
  let el = document.getElementById('dlv-print');
  if (!el) {
    el = document.createElement('div');
    el.id = 'dlv-print';
    document.body.appendChild(el);
  }
  el.innerHTML = html;
  document.body.classList.add('dlv-printing');
  const off = () => {
    document.body.classList.remove('dlv-printing');
    window.removeEventListener('afterprint', off);
  };
  window.addEventListener('afterprint', off);
  window.print();
  setTimeout(off, 1500);
}
const pw = (v: Word) => `<span class="dlv-zh" lang="zh-CN">${esc(v.w)}</span><span class="dlv-py">${esc(v.p)}</span>`;

const STYLE = `
.dlv-zh{font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC","Source Han Sans SC",sans-serif;font-weight:600;color:#1F3A68;letter-spacing:.02em}
.dlv-py{font-family:Arial,"Helvetica Neue",Helvetica,sans-serif;color:#2E7D7A;font-weight:500;margin-left:.45em;white-space:nowrap}
.dlv-blur{filter:blur(7px);user-select:none}
#dlv-print{display:none}
@media print{
  body.dlv-printing > *:not(#dlv-print){display:none!important}
  body.dlv-printing #dlv-print{display:block!important;padding:20px}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
#dlv-print{font-size:12.5px;line-height:1.55;color:#000}
#dlv-print h1{font-size:1.15rem;margin:0 0 2px}
#dlv-print .sub{margin:0 0 10px;color:#555}
#dlv-print .who{display:flex;gap:28px;justify-content:flex-end;font-size:.9rem;margin:6px 0 10px}
#dlv-print .who span{display:inline-block;min-width:110px;border-bottom:1px solid #000}
#dlv-print .ins{border:1px solid #999;border-radius:6px;padding:6px 10px;margin:0 0 14px;font-size:.9rem}
#dlv-print table{width:100%;border-collapse:collapse}
#dlv-print th,#dlv-print td{border:1px solid #bbb;padding:5px 7px;text-align:left;vertical-align:top}
#dlv-print th{background:#eef1f7;font-size:.85rem}
#dlv-print tr{break-inside:avoid}
#dlv-print td.no{width:2.4em;color:#555}
#dlv-print .dlv-zh{color:#000;font-size:1.08em}#dlv-print .dlv-py{color:#333}
#dlv-print .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px}
#dlv-print .it{break-inside:avoid;display:flex;gap:6px;align-items:flex-end}
#dlv-print .it .bl{flex:1;min-width:70px;border-bottom:1px solid #000;min-height:20px}
#dlv-print .hint{color:#555;font-size:.85em;white-space:nowrap;margin-left:4px}
#dlv-print .key{page-break-before:always}
#dlv-print .kg{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:.92em}
`;

// ───────── 작은 조각 ─────────
function WordView({ v, size = 'md', say = true }: { v: Word; size?: 'sm' | 'md' | 'lg' | 'xl'; say?: boolean }) {
  const zh = { sm: 'text-[17px]', md: 'text-[20px]', lg: 'text-[22px]', xl: 'text-[36px] sm:text-[40px]' }[size];
  const py = { sm: 'text-[14px]', md: 'text-[15px]', lg: 'text-[16px]', xl: 'text-[18px] sm:text-[20px]' }[size];
  return (
    <span className="inline min-w-0 [overflow-wrap:anywhere]">
      <span lang="zh-CN" className={`dlv-zh ${zh}`}>
        {v.w}
      </span>
      <span className={`dlv-py ${py}`}>{v.p}</span>
      {say && canSpeak && (
        <button
          type="button"
          aria-label="발음 듣기"
          onClick={(e) => {
            e.stopPropagation();
            speakZh(v.w);
          }}
          className="ml-1 inline-grid place-items-center w-7 h-7 rounded-full align-middle text-[14px] text-gray-500 hover:bg-[#eef7fe] hover:text-[#37a7f0]"
        >
          🔊
        </button>
      )}
    </span>
  );
}

function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <span className="inline-flex flex-wrap max-w-full rounded-lg border border-gray-300 overflow-hidden bg-white">
      {options.map(([v, label], i) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={v === value}
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 text-[13.5px] font-semibold whitespace-nowrap ${i ? 'border-l border-gray-300' : ''} ${
            v === value ? 'bg-[#37a7f0] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </span>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} className="inline-flex items-center gap-2 text-[14px] font-semibold text-gray-700">
      <span className={`relative w-[38px] h-[22px] rounded-full transition-colors ${on ? 'bg-[#2ecc71]' : 'bg-gray-300'}`}>
        <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-[19px]' : 'left-[3px]'}`}></span>
      </span>
      {children}
    </button>
  );
}

const Label = ({ children }: { children: string }) => <span className="w-12 shrink-0 text-[12px] font-semibold tracking-wide text-gray-500">{children}</span>;
const btnPrimary = 'px-4 py-2 rounded-lg text-[15px] font-semibold text-white bg-[#37a7f0] hover:bg-[#2a8bc9]';
const btnPlain = 'px-4 py-2 rounded-lg text-[15px] border border-gray-300 text-gray-700 bg-white hover:border-[#37a7f0] hover:text-[#37a7f0]';

// 뜻이 같거나 겹치는 단어(오답 보기로 쓰면 정답이 둘이 됨)
const norm = (s: string) => s.replace(/\(.*?\)|（.*?）/g, '').replace(/[\s~·,]/g, '');
const plainPy = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function conflict(a: Word, b: Word, mode: Mode) {
  if (a.w === b.w) return true;
  const x = norm(a.m);
  const y = norm(b.m);
  if (x === y || (x.length >= 2 && y.length >= 2 && (x.includes(y) || y.includes(x)))) return true;
  if (mode === 'aw' && plainPy(a.p) === plainPy(b.p)) return true;
  return false;
}

type QItem = { it: Word; m: Mode; opts: Word[]; pick: number | null };

// ───────── 화면 ─────────
export function VocabPage({
  home,
  onBack,
  backLabel,
  startView = 'dict',
  questionIds,
  questionsTitle,
}: {
  home: VocabCourse;
  onBack: () => void;
  backLabel: string;
  startView?: 'dict' | 'test';
  questionIds?: number[]; // 틀린 문제 화면에서 넘어온 문제들 → 그 문제들의 단어로 바로 시험
  questionsTitle?: string;
}) {
  const [data, setData] = useState<VocabData | null>(cache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (data) return;
    let alive = true;
    loadVocab()
      .then((d) => alive && setData(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [data]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  if (!data) return <LoadingState failed={failed} onBack={onBack} />;
  return <VocabInner data={data} home={home} onBack={onBack} backLabel={backLabel} startView={startView} questionIds={questionIds} questionsTitle={questionsTitle} />;
}

function VocabInner({
  data,
  home,
  onBack,
  backLabel,
  startView,
  questionIds,
  questionsTitle,
}: {
  data: VocabData;
  home: VocabCourse;
  onBack: () => void;
  backLabel: string;
  startView: 'dict' | 'test';
  questionIds?: number[];
  questionsTitle?: string;
}) {
  const { words, qWords, qCourse, topics } = data;
  const records = useDriverLicenseRecords();
  const [course, setCourse] = useState<Course>(home);
  const [topic, setTopic] = useState(0);
  const [source, setSource] = useState<Source>(questionIds?.length ? 'these' : 'all');
  const [view, setView] = useState<'dict' | 'test'>(startView);
  const [vwrong, setVwrong] = useState<Record<string, number>>(() => readJSON(WRONG_KEY, {}));
  const [soundOn, setSoundOn] = useState(() => readJSON(SOUND_KEY, true));
  const [running, setRunning] = useState(false); // 시험을 푸는 중·결과 화면이면 범위 고르기 칸을 숨김
  const busy = view === 'test' && running;

  const inCourse = (v: Word, c: Course) => (c === 'ab' ? true : v[c] > 0);
  const freqOf = (v: Word, c: Course) => (c === 'ab' ? v.a + v.b : v[c]);
  const topicOf = (v: Word) => (course === 'a' ? v.ta : course === 'b' ? v.tb : v.ta || v.tb);
  const topicName = (v: Word) => {
    if (course === 'a' || (course === 'ab' && v.ta)) return topics.a.find((t) => t.c === v.ta)?.title;
    return topics.b.find((t) => t.c === v.tb)?.title;
  };
  const count = (c: Course) => words.filter((v) => inCourse(v, c)).length;

  // 틀린 문제(문제 풀이 기록)에 나온 단어
  const wrongQWords = useMemo(() => {
    const set = new Set<string>();
    for (const id of Object.keys(getWrongMap()).map(Number)) {
      const c = qCourse.get(id);
      if (!c || (course !== 'ab' && c !== course)) continue;
      for (const w of qWords.get(id) ?? []) set.add(w);
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records.version, course, qCourse, qWords]);
  const theseWords = useMemo(() => new Set((questionIds ?? []).flatMap((id) => qWords.get(id) ?? [])), [questionIds, qWords]);

  const base = useMemo(() => {
    const sortFn = (x: Word, y: Word) => freqOf(y, course) - freqOf(x, course) || x.id - y.id;
    if (source === 'these') return words.filter((v) => theseWords.has(v.w)).sort(sortFn);
    return words.filter((v) => inCourse(v, course) && (!topic || topicOf(v) === topic)).sort(sortFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, course, topic, source, theseWords]);
  const nWrongQ = base.filter((v) => wrongQWords.has(v.w)).length;
  const nWrongW = base.filter((v) => vwrong[v.w]).length;
  const scope = useMemo(() => {
    if (source === 'wrongq') return base.filter((v) => wrongQWords.has(v.w));
    if (source === 'wrongw') return base.filter((v) => vwrong[v.w]);
    return base;
  }, [base, source, wrongQWords, vwrong]);

  const changeCourse = (c: Course) => {
    setCourse(c);
    setTopic(0);
    if (source === 'these') setSource('all');
  };
  const recordWrong = (w: string) =>
    setVwrong((prev) => {
      const next = { ...prev, [w]: (prev[w] ?? 0) + 1 };
      writeJSON(WRONG_KEY, next);
      return next;
    });
  const clearWrong = () => {
    if (!window.confirm('단어 시험에서 틀린 단어 기록을 모두 지울까요?')) return;
    setVwrong({});
    writeJSON(WRONG_KEY, {});
    if (source === 'wrongw') setSource('all');
  };
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    writeJSON(SOUND_KEY, next);
    if (next) audio();
  };

  const sourceOptions: [Source, string][] = [
    ['all', `전체 ${base.length}`],
    ['wrongq', `내가 틀린 문제의 단어 ${nWrongQ}`],
    ['wrongw', `시험에서 틀린 단어 ${nWrongW}`],
  ];
  if (questionIds?.length) sourceOptions.unshift(['these', `${questionsTitle ?? '이 문제들'}의 단어 ${theseWords.size}`]);

  const scopeTitle = source === 'these' ? `${questionsTitle ?? '고른 문제'}의 단어` : `${COURSE_NAME[course]}${topic ? ` · ${(course === 'a' ? topics.a : topics.b).find((t) => t.c === topic)?.title}` : ''} 단어`;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
      <style>{STYLE}</style>
      <BackButton onClick={onBack} label={backLabel} />
      <header className="flex flex-wrap items-end gap-x-4 gap-y-2 mb-4">
        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#2c3e50] mr-auto">📘 단어 시험</h1>
        <Seg
          value={view}
          options={[
            ['dict', '단어장'],
            ['test', '단어 시험'],
          ]}
          onChange={setView}
        />
      </header>
      {!busy && (
        <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
          문제에 나오는 핵심 단어를 <b>한자 + 병음 + 뜻</b>으로 외우고 4지선다로 확인해요. 🔊를 누르면 발음을 들을 수 있어요.
        </p>
      )}

      {/* 범위 (단어장·시험 공통) — 시험을 푸는 동안은 숨김 */}
      <div className={`grid gap-3 p-4 mb-5 rounded-xl border border-[#bfe2fa] bg-[#eef7fe] ${busy ? 'hidden' : ''}`}>
        {source !== 'these' && (
          <div className="flex flex-wrap items-center gap-2">
            <Label>과정</Label>
            <Seg
              value={course}
              options={[
                ['a', `만점 교육 ${count('a')}`],
                ['b', `학법 감점 ${count('b')}`],
                ['ab', `둘 다 ${count('ab')}`],
              ]}
              onChange={changeCourse}
            />
          </div>
        )}
        {source !== 'these' && course !== 'ab' && (
          <div className="flex flex-wrap items-start gap-2">
            <Label>주제</Label>
            <div className="flex flex-1 min-w-0 gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" style={{ scrollbarWidth: 'none' }}>
              {[{ c: 0, title: '전체' }, ...topics[course]].map((t) => (
                <button
                  key={t.c}
                  type="button"
                  aria-pressed={topic === t.c}
                  onClick={() => setTopic(t.c)}
                  className={`shrink-0 px-3 py-1 rounded-full border text-[13px] font-semibold whitespace-nowrap ${
                    topic === t.c ? 'border-[#37a7f0] bg-white text-[#2a8bc9]' : 'border-gray-300 bg-white/70 text-gray-600'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Label>단어</Label>
          <Seg value={source} options={sourceOptions} onChange={setSource} />
        </div>
        {source === 'wrongq' && !nWrongQ && <p className="text-[13px] text-gray-500 m-0">아직 틀린 문제가 없어요. 주제별 연습이나 법규학습은행에서 문제를 풀면 틀린 문제의 단어가 여기에 모여요.</p>}
        {source === 'wrongw' && !nWrongW && <p className="text-[13px] text-gray-500 m-0">아직 단어 시험에서 틀린 단어가 없어요.</p>}
      </div>

      {view === 'dict' ? (
        <Dictionary list={scope} scopeTitle={scopeTitle} vwrong={vwrong} freqText={(v) => freqText(v, course, topicName(v))} />
      ) : (
        <Quiz
          key={`${course}-${topic}-${source}`}
          scope={scope}
          pool={words.filter((v) => inCourse(v, course === 'ab' || source === 'these' ? 'ab' : course))}
          topicOf={topicOf}
          autoStart={source === 'these'}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onWrong={recordWrong}
          nWrongW={Object.keys(vwrong).length}
          onClearWrong={clearWrong}
          onRunning={setRunning}
        />
      )}
    </div>
  );
}

function freqText(v: Word, course: Course, topic?: string) {
  const parts: string[] = [];
  if (v.a && course !== 'b') parts.push(`만점 ${v.a}문제`);
  if (v.b && course !== 'a') parts.push(`학법 ${v.b}문제`);
  return parts.join(' · ') + (topic ? ` · ${topic}` : '');
}

// ───────── 단어장 ─────────
function Dictionary({ list, scopeTitle, vwrong, freqText }: { list: Word[]; scopeTitle: string; vwrong: Record<string, number>; freqText: (v: Word) => string }) {
  const [layout, setLayout] = useState<'card' | 'list'>('card');
  const [order, setOrder] = useState<'freq' | 'py'>('freq');
  const [hide, setHide] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [q, setQ] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);

  const items = useMemo(() => {
    const query = q.trim().toLowerCase();
    let out = list;
    if (query) {
      const qp = plainPy(query).replace(/\s+/g, '');
      out = out.filter((v) => v.w.includes(query) || v.m.toLowerCase().includes(query) || v.p.toLowerCase().includes(query) || plainPy(v.p).includes(qp));
    }
    if (order === 'py') out = out.slice().sort((x, y) => plainPy(x.p).localeCompare(plainPy(y.p)));
    return out;
  }, [list, q, order]);

  const toggleShow = (id: number) =>
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const hidden = (v: Word) => hide && !shown.has(v.id);
  const num = (i: number) => String(i + 1).padStart(2, '0');
  const mark = (v: Word) => (vwrong[v.w] ? <span className="ml-1.5 text-[#e74c3c]">✗{vwrong[v.w]}</span> : null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-3">
        <Seg
          value={layout}
          options={[
            ['card', '카드'],
            ['list', '목록'],
          ]}
          onChange={setLayout}
        />
        <Seg
          value={order}
          options={[
            ['freq', '자주 나오는 순'],
            ['py', '병음 순'],
          ]}
          onChange={setOrder}
        />
        <Toggle
          on={hide}
          onClick={() => {
            setHide(!hide);
            setShown(new Set());
          }}
        >
          뜻 가리기
        </Toggle>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="한자·병음·한글 뜻으로 검색"
          className="flex-1 min-w-[180px] h-10 px-3 rounded-lg border border-gray-300 text-[16px] outline-none focus:border-[#37a7f0]"
        />
        <button type="button" onClick={() => setPdfOpen(!pdfOpen)} aria-pressed={pdfOpen} className={`${btnPlain} ${pdfOpen ? 'border-[#37a7f0] text-[#37a7f0]' : ''}`}>
          PDF 만들기 ▾
        </button>
      </div>
      {pdfOpen && <PdfPanel items={items} scopeTitle={scopeTitle} hideMeaning={hide} />}
      <p className="text-[13px] text-gray-500 mb-2">
        {items.length}개 단어{hide ? (layout === 'list' ? ' · 가려진 뜻을 누르면 보여요' : ' · 카드를 누르면 뜻이 보여요') : ''}
      </p>
      {!items.length ? (
        <p className="py-14 text-center text-[15px] text-gray-500">{q ? '검색 결과가 없어요.' : '이 범위에는 단어가 없어요.'}</p>
      ) : layout === 'card' ? (
        <div className="grid sm:grid-cols-2 gap-2.5">
          {items.map((v, i) => (
            <div
              key={v.id}
              onClick={() => hide && toggleShow(v.id)}
              className={`grid gap-1 p-3.5 rounded-xl border border-gray-200 bg-white ${hide ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="min-w-0 flex-1">
                  <WordView v={v} />
                </span>
                <span className="shrink-0 pt-1 text-[11.5px] text-gray-400 font-mono">
                  {num(i)}
                  {mark(v)}
                </span>
              </div>
              <div className={`text-[16px] font-semibold text-gray-900 ${hidden(v) ? 'dlv-blur' : ''}`}>{v.m}</div>
              <div className="text-[12.5px] text-gray-500">{freqText(v)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-t border-gray-200">
          {items.map((v, i) => (
            <div key={v.id} className="grid grid-cols-[2.6em_minmax(0,1fr)] sm:grid-cols-[2.6em_minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-x-2 gap-y-0.5 py-2.5 border-b border-gray-200 items-start">
              <span className="row-span-3 sm:row-span-1 pt-1 text-[11.5px] text-gray-400 font-mono">
                {num(i)}
                {mark(v)}
              </span>
              <span className="min-w-0">
                <WordView v={v} size="sm" />
              </span>
              <span onClick={() => hide && toggleShow(v.id)} className={`text-[15.5px] font-semibold text-gray-900 ${hidden(v) ? 'dlv-blur cursor-pointer' : ''}`}>
                {v.m}
              </span>
              <span className="text-[12px] text-gray-500 sm:text-right sm:pt-1">{freqText(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PdfPanel({ items, scopeTitle, hideMeaning }: { items: Word[]; scopeTitle: string; hideMeaning: boolean }) {
  const [kind, setKind] = useState<'list' | 'test'>('list');
  const [type, setType] = useState<'wm' | 'mw' | 'mix'>('wm');
  const [cnt, setCnt] = useState(0);
  const [order, setOrder] = useState<'seq' | 'rand'>('seq');
  const [hint, setHint] = useState(true);
  const [key, setKey] = useState(true);
  const TT = { wm: '단어 → 뜻 쓰기', mw: '뜻 → 단어 쓰기', mix: '섞어서' };
  const TI = { wm: '한자와 병음을 보고 우리말 뜻을 쓰세요.', mw: '우리말 뜻을 보고 한자와 병음을 쓰세요.', mix: '문제마다 뜻 또는 한자·병음을 쓰세요.' };

  const make = () => {
    let list = items.slice();
    if (!list.length) {
      window.alert('PDF로 만들 단어가 없어요.');
      return;
    }
    if (order === 'rand') list = shuffle(list);
    if (kind === 'list') {
      printHtml(`<h1>${esc(scopeTitle)} · 단어 목록</h1><p class="sub">${list.length}개 단어 · 한자 · 병음 · 뜻${hideMeaning ? ' · 뜻 칸 비움 (셀프 테스트)' : ''}</p>
        <table><thead><tr><th>#</th><th>단어 · 병음</th><th>뜻</th></tr></thead>
        <tbody>${list.map((v, j) => `<tr><td class="no">${j + 1}</td><td>${pw(v)}</td><td>${hideMeaning ? '' : esc(v.m)}</td></tr>`).join('')}</tbody></table>`);
      return;
    }
    if (cnt) list = list.slice(0, cnt);
    const qs = list.map((v) => ({ v, t: type === 'mix' ? (Math.random() < 0.5 ? 'wm' : 'mw') : type }));
    const hintText = (v: Word) => `<span class="hint">[${hint ? `${esc(v.p[0])}… · ` : ''}${v.w.length}글자]</span>`;
    printHtml(`<h1>${esc(scopeTitle)} · 단어 시험</h1><p class="sub">${TT[type]} · ${qs.length}문항</p>
      <div class="who">이름 <span></span> 점수 <span></span> / ${qs.length}</div>
      <div class="ins">${TI[type]}</div>
      <div class="g2">${qs.map(({ v, t }, j) => `<div class="it"><span>${j + 1}. ${t === 'wm' ? pw(v) : `<b>${esc(v.m)}</b>${hintText(v)}`}</span><span class="bl"></span></div>`).join('')}</div>
      ${key ? `<section class="key"><h1>정답</h1><p class="sub">${TT[type]} · ${qs.length}문항</p><div class="kg">${qs.map(({ v }, j) => `<div>${j + 1}. ${pw(v)} — ${esc(v.m)}</div>`).join('')}</div></section>` : ''}`);
  };

  return (
    <div className="grid gap-3 p-4 mb-4 rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex flex-wrap items-center gap-2">
        <Label>종류</Label>
        <Seg
          value={kind}
          options={[
            ['list', '단어 목록 (암기용)'],
            ['test', '시험지'],
          ]}
          onChange={setKind}
        />
      </div>
      {kind === 'list' ? (
        <p className="text-[13px] text-gray-500 m-0">한자 · 병음 · 뜻이 들어가요. ‘뜻 가리기’를 켜고 뽑으면 뜻 칸이 빈 셀프 테스트용이 돼요.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Label>유형</Label>
            <Seg value={type} options={Object.entries(TT) as ['wm' | 'mw' | 'mix', string][]} onChange={setType} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Label>문항</Label>
            <Seg
              value={cnt}
              options={[
                [0, '전부'],
                [20, '20'],
                [30, '30'],
                [50, '50'],
              ]}
              onChange={setCnt}
            />
            {type !== 'wm' && (
              <Toggle on={hint} onClick={() => setHint(!hint)}>
                병음 첫 글자 힌트
              </Toggle>
            )}
            <Toggle on={key} onClick={() => setKey(!key)}>
              정답지 포함
            </Toggle>
          </div>
        </>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Label>순서</Label>
        <Seg
          value={order}
          options={[
            ['seq', '목록 순'],
            ['rand', '무작위'],
          ]}
          onChange={setOrder}
        />
        <button type="button" onClick={make} className={btnPrimary}>
          PDF 다운 ({items.length}개) →
        </button>
      </div>
      <p className="text-[12.5px] text-gray-500 m-0">인쇄 창이 열리면 ‘PDF로 저장’을 고르세요.</p>
    </div>
  );
}

// ───────── 단어 시험 ─────────
const MODE_NAME: Record<Mode, string> = { wm: '단어 → 뜻', mw: '뜻 → 단어', aw: '듣고 고르기' };
const MODE_ASK: Record<Mode, string> = { wm: '알맞은 뜻을 고르세요', mw: '알맞은 단어를 고르세요', aw: '들리는 단어를 고르세요' };

function Quiz({
  scope,
  pool,
  topicOf,
  autoStart,
  soundOn,
  onToggleSound,
  onWrong,
  nWrongW,
  onClearWrong,
  onRunning,
}: {
  scope: Word[];
  pool: Word[];
  topicOf: (v: Word) => number;
  autoStart: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onWrong: (w: string) => void;
  nWrongW: number;
  onClearWrong: () => void;
  onRunning: (running: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode | 'mix'>(() => readJSON('dl-vocab-mode', 'wm'));
  const [cnt, setCnt] = useState(20);
  const [list, setList] = useState<QItem[]>([]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'done'>('setup');

  // 오답 보기: 같은 주제·비슷한 길이 단어를 먼저 (헷갈리게)
  const distractors = (it: Word, m: Mode) => {
    const cands = pool.filter((v) => !conflict(it, v, m));
    const t = topicOf(it);
    const score = (v: Word) => (topicOf(v) === t ? 2 : 0) + (Math.abs(v.w.length - it.w.length) <= 1 ? 1 : 0);
    const ordered = [...shuffle(cands.filter((v) => score(v) >= 2)), ...shuffle(cands.filter((v) => score(v) < 2))];
    const out: Word[] = [];
    for (const v of ordered) {
      if (out.length === 3) break;
      if (out.every((o) => !conflict(o, v, m))) out.push(v);
    }
    return out;
  };
  const start = (items: Word[]) => {
    if (!items.length) {
      window.alert('시험 볼 단어가 없어요.');
      return;
    }
    const modes: Mode[] = canSpeak ? ['wm', 'mw', 'aw'] : ['wm', 'mw'];
    setList(
      items.map((it) => {
        const m = mode === 'mix' ? modes[Math.floor(Math.random() * modes.length)] : mode;
        return { it, m, opts: shuffle([it, ...distractors(it, m)]), pick: null };
      }),
    );
    setI(0);
    setPhase('quiz');
    window.scrollTo({ top: 0 });
  };
  const startFromScope = () => {
    let items = shuffle(scope.slice());
    if (cnt) items = items.slice(0, cnt);
    start(items);
  };
  // 틀린 문제 화면에서 넘어오면 바로 시작 (최대 30단어)
  useEffect(() => {
    if (autoStart && scope.length) start(shuffle(scope.slice()).slice(0, 30));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onRunning(phase !== 'setup');
    return () => onRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const item = list[i];
  const score = list.filter((q) => q.pick !== null && q.opts[q.pick] === q.it).length;
  const answer = (k: number) => {
    if (!item || item.pick !== null) return;
    const ok = item.opts[k] === item.it;
    if (soundOn) (ok ? sfxOk : sfxBad)();
    if (!ok) onWrong(item.it.w);
    setList((prev) => prev.map((q, j) => (j === i ? { ...q, pick: k } : q)));
  };
  const next = () => {
    if (i + 1 >= list.length) setPhase('done');
    else setI(i + 1);
    window.scrollTo({ top: 0 });
  };

  // 듣고 고르기: 문제가 나오면 발음
  useEffect(() => {
    if (phase === 'quiz' && item && item.m === 'aw' && item.pick === null) {
      const t = setTimeout(() => speakZh(item.it.w), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, i, item]);
  // 키보드: 1–4 고르기 · Enter 다음 · Space 발음
  useEffect(() => {
    if (phase !== 'quiz') return undefined;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input,textarea')) return;
      if (!item) return;
      if (item.pick === null && /^[1-4]$/.test(e.key)) {
        answer(+e.key - 1);
        e.preventDefault();
      } else if (item.pick !== null && e.key === 'Enter') {
        next();
        e.preventDefault();
      } else if (e.key === ' ' && canSpeak) {
        speakZh(item.it.w);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (phase === 'setup') {
    const desc: Record<Mode | 'mix', string> = {
      wm: '한자 + 병음을 보고 알맞은 뜻을 4개 중에서 골라요.',
      mw: '우리말 뜻을 보고 알맞은 한자 + 병음을 골라요. 실제 시험처럼 한자를 알아보는 연습이에요.',
      aw: '🔊 발음을 듣고 알맞은 한자 + 병음을 골라요.',
      mix: '문제마다 세 가지 방식 중 하나가 나와요.',
    };
    const modes: [Mode | 'mix', string][] = [
      ['wm', '단어 → 뜻'],
      ['mw', '뜻 → 단어'],
      ...(canSpeak ? ([['aw', '듣고 고르기']] as [Mode, string][]) : []),
      ['mix', '섞어서'],
    ];
    return (
      <div className="grid gap-5 max-w-[720px]">
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold tracking-wide text-gray-500">시험 방식</span>
          <div>
            <Seg
              value={mode}
              options={modes}
              onChange={(m) => {
                setMode(m);
                writeJSON('dl-vocab-mode', m);
              }}
            />
          </div>
          <p className="text-[13.5px] text-gray-500 m-0">{desc[mode]}</p>
          {(mode === 'aw' || mode === 'mix') && <p className="text-[12.5px] text-gray-400 m-0">소리가 안 나면 기기 설정의 ‘음성 출력(TTS)’에서 중국어를 추가해 주세요.</p>}
        </div>
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold tracking-wide text-gray-500">문항 수 (위에서 고른 범위 {scope.length}개 중)</span>
          <div>
            <Seg
              value={cnt}
              options={[
                [10, '10'],
                [20, '20'],
                [30, '30'],
                [0, '전부'],
              ]}
              onChange={setCnt}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <span className="text-[12px] font-semibold tracking-wide text-gray-500">소리</span>
          <div>
            <Toggle on={soundOn} onClick={onToggleSound}>
              효과음 (맞으면 딩동댕 · 틀리면 삐)
            </Toggle>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={startFromScope} className={btnPrimary}>
            시험 시작 →
          </button>
          {nWrongW > 0 && (
            <button type="button" onClick={onClearWrong} className="px-3 text-[14px] text-gray-500 hover:text-[#e74c3c]">
              틀린 단어 기록 지우기
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const wrong = list.filter((q) => q.pick !== null && q.opts[q.pick] !== q.it).map((q) => q.it);
    const pct = Math.round((score / list.length) * 100);
    return (
      <div className="grid gap-3 max-w-[720px] mx-auto text-center">
        <div className="text-[12px] font-semibold tracking-wide text-gray-500">시험 결과</div>
        <div className="text-[40px] font-bold font-mono text-[#2c3e50]">
          {score} / {list.length}
        </div>
        <div className="text-gray-500">
          정답률 {pct}%{pct === 100 ? ' · 만점이에요! 🎉' : ''}
        </div>
        {wrong.length > 0 && (
          <>
            <div className="mt-2 text-left text-[12px] font-semibold tracking-wide text-gray-500">틀린 단어 {wrong.length}개</div>
            <ul className="grid gap-1.5 text-left">
              {wrong.map((v) => (
                <li key={v.id} className="px-3 py-2 rounded-lg border border-[#f5c6c1] bg-[#fdf0ef]">
                  <WordView v={v} size="sm" />
                  <div className="text-[14px] text-gray-600">{v.m}</div>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {wrong.length > 0 && (
            <button type="button" onClick={() => start(shuffle(wrong))} className={btnPrimary}>
              틀린 단어만 다시
            </button>
          )}
          <button type="button" onClick={() => start(shuffle(list.map((q) => q.it)))} className={btnPlain}>
            같은 단어로 다시
          </button>
          <button type="button" onClick={() => setPhase('setup')} className={btnPlain}>
            설정으로
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;
  const done = item.pick !== null;
  const ok = done && item.opts[item.pick!] === item.it;
  return (
    <div className="grid gap-4 max-w-[720px] mx-auto">
      <div className="flex items-center justify-between text-[13px] font-mono text-gray-500">
        <span>
          {i + 1} / {list.length}
        </span>
        <span className="flex items-center gap-1">
          맞힌 단어 <b className="text-gray-800">{score}</b>
          <button type="button" onClick={onToggleSound} aria-label={soundOn ? '효과음 끄기' : '효과음 켜기'} className="ml-1 w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100">
            {soundOn ? '🔔' : '🔕'}
          </button>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-[#37a7f0] transition-all" style={{ width: `${(i / list.length) * 100}%` }}></div>
      </div>
      <div className="text-center mt-1 leading-snug">
        {item.m === 'wm' && <WordView v={item.it} size="xl" />}
        {item.m === 'mw' && <span className="text-[26px] sm:text-[28px] font-bold text-[#2c3e50]">{item.it.m}</span>}
        {item.m === 'aw' && (
          <>
            <button
              type="button"
              onClick={() => speakZh(item.it.w)}
              aria-label="다시 듣기"
              className="w-[84px] h-[84px] rounded-full border-2 border-[#37a7f0] bg-[#eef7fe] text-[32px] inline-grid place-items-center"
            >
              🔊
            </button>
            {done && (
              <div className="mt-2">
                <WordView v={item.it} size="lg" say={false} />
              </div>
            )}
          </>
        )}
      </div>
      <div className="text-center text-[14px] text-gray-500">
        <span className="inline-block mr-1.5 px-2.5 py-0.5 rounded-full bg-[#eef7fe] text-[12px] font-bold text-[#2a8bc9]">{MODE_NAME[item.m]}</span>
        {MODE_ASK[item.m]}
      </div>
      <div className="grid gap-2.5">
        {item.opts.map((o, k) => {
          const cls = done ? (o === item.it ? 'border-[#2ecc71] bg-[#e8f8ef]' : k === item.pick ? 'border-[#e74c3c] bg-[#fdf0ef]' : 'border-gray-200') : 'border-gray-200 hover:border-[#37a7f0]';
          const dot = done ? (o === item.it ? 'bg-[#2ecc71] border-[#2ecc71] text-white' : k === item.pick ? 'bg-[#e74c3c] border-[#e74c3c] text-white' : 'border-gray-400') : 'border-gray-400';
          return (
            <button key={k} type="button" disabled={done} onClick={() => answer(k)} className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border text-left bg-white ${cls}`}>
              <span className={`shrink-0 w-7 h-7 rounded-full border-[1.5px] grid place-items-center text-[13px] font-mono ${dot}`}>{k + 1}</span>
              <span className="min-w-0 text-[17px] text-gray-900">{item.m === 'wm' ? o.m : <WordView v={o} size="md" say={false} />}</span>
            </button>
          );
        })}
      </div>
      <div className={`min-h-[1.6em] text-center text-[15px] font-semibold ${ok ? 'text-[#27ae60]' : 'text-[#e74c3c]'}`}>
        {done && (
          <>
            {ok ? '정답이에요! ' : '오답이에요. 정답: '}
            <WordView v={item.it} size="sm" say={false} /> — {item.it.m}
          </>
        )}
      </div>
      <div className="flex justify-center gap-2">
        <button type="button" onClick={() => setPhase('setup')} className={btnPlain}>
          그만하기
        </button>
        {done && (
          <button type="button" onClick={next} className={btnPrimary} autoFocus>
            {i === list.length - 1 ? '결과 보기' : '다음 단어 →'}
          </button>
        )}
      </div>
      <p className="text-center text-[12px] text-gray-400 m-0">키보드: 1–4 선택 · Enter 다음{canSpeak ? ' · Space 발음 듣기' : ''}</p>
    </div>
  );
}
