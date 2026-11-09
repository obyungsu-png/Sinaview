import { useEffect, useMemo, useRef, useState } from 'react';

// ────────────────────────────────────────────────────────────
// 만점교육: 중국어 원문 600문제 + 한국어 번역 학습
// 데이터: src/data/driverLicenseManjeom.json (빌드 스크립트로 생성)
// ────────────────────────────────────────────────────────────

export type ManjeomKeyword = { zh: string; pinyin: string; ko: string };
export type ManjeomQuestion = {
  id: number;
  t: 's' | 'j';        // s: 단선, j: 판단
  qz: string;          // 중국어 문제
  oz: string[];        // 중국어 보기 (판단형 [])
  az: number;          // 정답 인덱스
  ez: string;          // 중국어 해설
  mnemonic: string;    // 중국어 암기구결
  qk: string;          // 한국어 문제 번역
  ok: string[];        // 한국어 보기 번역
  ek: string;          // 한국어 해설 번역
  mk: string;          // 한국어 암기구결 번역
  keywords: ManjeomKeyword[];
  img?: string[];
};
export type ManjeomData = { questions: ManjeomQuestion[]; examIds: number[] };

let cache: ManjeomData | null = null;
let promise: Promise<ManjeomData> | null = null;
function loadData(): Promise<ManjeomData> {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = import('../data/driverLicenseManjeom.json')
      .then((m) => {
        cache = m.default as unknown as ManjeomData;
        return cache;
      })
      .catch((e) => {
        promise = null;
        throw e;
      });
  }
  return promise;
}
export function useManjeomData() {
  const [data, setData] = useState<ManjeomData | null>(cache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (data) return;
    loadData().then(setData).catch(() => setFailed(true));
  }, [data]);
  return { data, failed };
}

const IMG_BASE = `${import.meta.env.BASE_URL}manjeom/img/`;
const imageUrl = (name: string) => IMG_BASE + name;
const LETTERS = 'ABCD';
const JUDGE_OPTIONS = ['正确', '错误'];

function readStore<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}
function shuffle<T>(items: T[]): T[] {
  const r = items.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// ── 중국어 TTS (读题) ──
let zhVoice: SpeechSynthesisVoice | null = null;
function pickVoice() {
  if (zhVoice) return zhVoice;
  const voices = speechSynthesis.getVoices();
  const preferred = ['Microsoft Huihui', 'Ting-Ting', 'Sin-Ji', 'Google 普通话'];
  for (const p of preferred) {
    const v = voices.find((v) => v.name.includes(p));
    if (v) { zhVoice = v; return v; }
  }
  zhVoice = voices.find((v) => v.lang.startsWith('zh')) || null;
  return zhVoice;
}
if (typeof window !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => { zhVoice = null; };
}
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.9;
  const v = pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

// ── 저장 키 ──
const KEY_CARDS = 'manjeom-cards-done';
const KEY_QUIZ = 'manjeom-600-progress';
const KEY_EXAM = 'manjeom-exam-result';
const KEY_MOCK = 'manjeom-mock-result';

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-4 py-2 mb-5 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:border-[#37a7f0] hover:text-[#37a7f0] transition-colors">
      <i className="fa-solid fa-arrow-left"></i>{label}
    </button>
  );
}

function LoadingState({ failed, onBack }: { failed: boolean; onBack: () => void }) {
  return (
    <div className="max-w-[1000px] mx-auto px-5 py-20 text-center text-gray-500">
      {failed ? (
        <>
          <p className="mb-4">만점교육 데이터를 불러오지 못했어요.</p>
          <button onClick={onBack} className="text-[#37a7f0] underline">돌아가기</button>
        </>
      ) : (
        <p>만점교육 문제를 불러오는 중…</p>
      )}
    </div>
  );
}

// ── 문제 카드 (중국어 원문 + 한국어 번역 + 读题 + 해설/구결) ──
function ManjeomQuestionView({
  q,
  index,
  total,
  selected,
  onSelect,
  showKo,
  onToggleKo,
  revealed,
}: {
  q: ManjeomQuestion;
  index: number;
  total: number;
  selected: number | undefined;
  onSelect: (i: number) => void;
  showKo: boolean;
  onToggleKo: () => void;
  revealed: boolean;
}) {
  const opts = q.t === 'j' ? JUDGE_OPTIONS : q.oz;
  const optsKo = q.t === 'j' ? ['맞음', '틀림'] : q.ok;
  const [imgZoom, setImgZoom] = useState<string | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-0.5 rounded bg-[#eef7fe] text-[#2a8bc9] text-xs font-medium">
          {q.t === 's' ? '单选题' : '判断题'}
        </span>
        <span className="text-xs text-gray-400">{index + 1} / {total}</span>
      </div>

      {/* 문제 원문 */}
      <div className="flex items-start gap-2 mb-1">
        <p className="flex-1 text-[17px] text-gray-900 leading-relaxed">{q.qz}</p>
        <button
          onClick={() => speak(q.qz + (q.t === 'j' ? '' : ' ' + opts.join(' ')))}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eef7fe] text-[#2a8bc9] text-xs hover:bg-[#d9edfb]"
          title="문제 읽어주기"
        >
          <i className="fa-solid fa-volume-high"></i>读题
        </button>
      </div>

      {/* 한국어 번역 토글 */}
      <button onClick={onToggleKo} className="text-xs text-[#37a7f0] hover:underline mb-2">
        {showKo ? '한국어 번역 숨기기 ▲' : '한국어 번역 보기 ▼'}
      </button>
      {showKo && <p className="text-[15px] text-gray-600 leading-relaxed mb-3 bg-gray-50 rounded-lg p-3">{q.qk}</p>}

      {/* 핵심 단어 */}
      {q.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {q.keywords.map((k) => (
            <span key={k.zh} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#fff8e6] border border-[#f5d58a] text-xs text-gray-700">
              <b className="text-[#b9560e]">{k.zh}</b>
              <span className="text-[#c98b2f]">{k.pinyin}</span>
              <span className="text-gray-500">{k.ko}</span>
            </span>
          ))}
        </div>
      )}

      {/* 그림 */}
      {q.img && q.img.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {q.img.map((name) => (
            <img key={name} src={imageUrl(name)} alt="문제 그림" loading="lazy"
              onClick={() => setImgZoom(name)}
              className="max-w-[200px] max-h-40 rounded border border-gray-200 bg-white object-contain cursor-zoom-in" />
          ))}
        </div>
      )}
      {imgZoom && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={() => setImgZoom(null)}>
          <img src={imageUrl(imgZoom)} alt="확대" className="max-w-[92vw] max-h-[80vh] object-contain rounded bg-white" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* 보기 */}
      <div className="flex flex-col gap-2 mt-3">
        {opts.map((o, i) => {
          const isSel = selected === i;
          const isCorrect = revealed && i === q.az;
          const isWrongSel = revealed && isSel && i !== q.az;
          return (
            <button key={i} onClick={() => onSelect(i)} disabled={revealed}
              className={`flex items-start gap-2 text-left px-3 py-2.5 rounded-lg border transition-colors ${
                isCorrect ? 'border-green-400 bg-green-50' : isWrongSel ? 'border-red-400 bg-red-50' : isSel ? 'border-[#37a7f0] bg-[#eef7fe]' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}>
              <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm flex items-center justify-center">{LETTERS[i]}</span>
              <span className="flex-1 text-[15px] text-gray-800 leading-relaxed">
                {o}
                {showKo && <span className="block text-[13px] text-gray-500 mt-0.5">{optsKo[i] ?? ''}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* 해설 + 암기구결 */}
      {revealed && (
        <div className="mt-4 space-y-3">
          {q.mnemonic && (
            <div className="px-3 py-2.5 rounded-lg bg-[#fff8e1] border border-[#f5d58a]">
              <p className="text-xs font-bold text-[#b9560e] mb-1"><i className="fa-solid fa-bolt"></i> 速记口诀 (암기구결)</p>
              <p className="text-sm text-gray-800 leading-relaxed">{q.mnemonic}</p>
              {showKo && q.mk && <p className="text-[13px] text-gray-600 mt-1">{q.mk}</p>}
            </div>
          )}
          <div className="px-3 py-2.5 rounded-lg bg-gray-50">
            <p className="text-xs font-bold text-gray-600 mb-1"><i className="fa-solid fa-book-open"></i> 题目解析 (해설)</p>
            <p className="text-sm text-gray-700 leading-relaxed">{q.ez}</p>
            {showKo && q.ek && <p className="text-[13px] text-gray-600 mt-1 border-t border-gray-200 pt-1">{q.ek}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 암기 구결·요령 카드 ──
function MnemonicCards({ data, onBack }: { data: ManjeomData; onBack: () => void }) {
  const [done, setDone] = useState<number[]>(() => readStore<number[]>(KEY_CARDS, []));
  const cards = useMemo(() => {
    const map = new Map<string, ManjeomQuestion>();
    for (const q of data.questions) {
      if (q.mnemonic && !map.has(q.mnemonic)) map.set(q.mnemonic, q);
    }
    return Array.from(map.values());
  }, [data]);
  const toggle = (id: number) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeStore(KEY_CARDS, next);
      return next;
    });
  };
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="속성 과정으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">① 암기 구결·요령</h1>
      <p className="text-sm text-gray-500 mb-5">만점교육 600문제에서 뽑은 암기 구결(速记口诀)입니다. 외운 구결은 "외웠어요"로 표시하세요. ({done.length}/{cards.length})</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((q) => (
          <div key={q.id} className={`p-4 rounded-lg border ${done.includes(q.id) ? 'border-green-300 bg-green-50/40' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start gap-2 mb-2">
              <span className="shrink-0 px-2 py-0.5 rounded bg-[#fff4e0] text-[#d35400] text-xs">口诀</span>
              <button onClick={() => speak(q.mnemonic)} className="ml-auto text-xs text-[#2a8bc9] hover:underline"><i className="fa-solid fa-volume-high"></i> 듣기</button>
            </div>
            <p className="text-[15px] text-gray-800 leading-relaxed">{q.mnemonic}</p>
            <button onClick={() => toggle(q.id)} className={`mt-3 text-sm px-3 py-1.5 rounded-full border ${done.includes(q.id) ? 'border-green-500 text-green-700 bg-white' : 'border-gray-300 text-gray-600 bg-white hover:border-[#37a7f0]'}`}>
              {done.includes(q.id) ? '✓ 외웠어요' : '외웠어요'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 문제 풀이 (핵심 600) ──
function QuizRunner({ questions, title, onBack, storageKey }: { questions: ManjeomQuestion[]; title: string; onBack: () => void; storageKey?: string }) {
  const [idx, setIdx] = useState(() => {
    if (!storageKey) return 0;
    const p = readStore<{ index: number }>(storageKey, { index: 0 });
    return Math.min(p.index, questions.length - 1);
  });
  const [answers, setAnswers] = useState<Record<number, number>>(() => storageKey ? readStore<Record<number, number>>(`${storageKey}:answers`, {}) : {});
  const [showKo, setShowKo] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const save = (idx2: number, ans2: Record<number, number>) => {
    if (!storageKey) return;
    writeStore(storageKey, { index: idx2 });
    writeStore(`${storageKey}:answers`, ans2);
  };

  if (finished) {
    const correct = questions.filter((q, i) => answers[i] === q.az).length;
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-12 text-center">
        <p className="text-5xl mb-4">🏁</p>
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">풀이 완료!</h1>
        <p className="text-gray-600 mb-6">맞힌 문제 <b className="text-green-600">{correct}</b> / {questions.length}문제</p>
        <button onClick={() => { setIdx(0); setAnswers({}); setFinished(false); setRevealed(false); save(0, {}); }} className="px-6 py-2.5 rounded-lg bg-[#37a7f0] text-white hover:bg-[#2a8bc9]">다시 풀기</button>
        <button onClick={onBack} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 ml-2">목록으로</button>
      </div>
    );
  }

  const q = questions[idx];
  const selected = answers[idx];

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="속성 과정으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-4">{title}</h1>
      <ManjeomQuestionView q={q} index={idx} total={questions.length}
        selected={selected}
        onSelect={(i) => { if (!revealed) { const a = { ...answers, [idx]: i }; setAnswers(a); save(idx, a); } }}
        showKo={showKo} onToggleKo={() => setShowKo((v) => !v)} revealed={revealed} />
      <div className="flex items-center justify-between mt-4">
        <button disabled={idx === 0} onClick={() => { setIdx(idx - 1); setRevealed(false); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40">이전</button>
        {!revealed ? (
          <button disabled={selected === undefined} onClick={() => setRevealed(true)} className="px-6 py-2.5 rounded-lg bg-[#37a7f0] text-white disabled:opacity-40 hover:bg-[#2a8bc9]">정답 확인</button>
        ) : idx < questions.length - 1 ? (
          <button onClick={() => { setIdx(idx + 1); setRevealed(false); save(idx + 1, answers); }} className="px-6 py-2.5 rounded-lg bg-[#37a7f0] text-white hover:bg-[#2a8bc9]">다음 문제</button>
        ) : (
          <button onClick={() => setFinished(true)} className="px-6 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600">결과 보기</button>
        )}
      </div>
    </div>
  );
}

// ── 모의고사 / 실전 100문제 (타이머 포함) ──
function ExamRunner({ questions, title, seconds, onBack, onFinish, resultKey }: {
  questions: ManjeomQuestion[]; title: string; seconds: number; onBack: () => void;
  onFinish?: () => void; resultKey: string;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showKo, setShowKo] = useState(false);
  const [left, setLeft] = useState(seconds);
  const [phase, setPhase] = useState<'exam' | 'result'>('exam');
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (phase !== 'exam') return;
    const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (left === 0 && phase === 'exam') setPhase('result');
  }, [left, phase]);

  if (phase === 'result') {
    const correct = questions.filter((q, i) => answers[i] === q.az).length;
    const score = Math.round((correct / questions.length) * 100);
    const prev = readStore<{ best: number; last: number; attempts: number }>(resultKey, { best: 0, last: 0, attempts: 0 });
    const next = { best: Math.max(prev.best, score), last: score, attempts: prev.attempts + 1 };
    writeStore(resultKey, next);
    const mm = String(Math.floor((seconds - left) / 60)).padStart(2, '0');
    const ss = String((seconds - left) % 60).padStart(2, '0');
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-12 text-center">
        <p className="text-5xl mb-4">🏆</p>
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">{title} 결과</h1>
        <p className="text-3xl font-bold text-[#37a7f0] mb-2">{score}점</p>
        <p className="text-gray-600 mb-6">{correct}/{questions.length}문제 · {mm}:{ss}</p>
        <button onClick={() => { setIdx(0); setAnswers({}); setLeft(seconds); setPhase('exam'); startedAt.current = Date.now(); }} className="px-6 py-2.5 rounded-lg bg-[#37a7f0] text-white hover:bg-[#2a8bc9]">다시 보기</button>
        <button onClick={() => { onFinish?.(); onBack(); }} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 ml-2">목록으로</button>
      </div>
    );
  }

  const q = questions[idx];
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-4">
        <BackButton onClick={() => { if (window.confirm('시험을 그만두시겠어요? 지금까지 고른 답은 저장되지 않습니다.')) onBack(); }} label="종료" />
        <div className="text-lg font-mono font-bold text-[#2c3e50]">{mm}:{ss}</div>
      </div>
      <ManjeomQuestionView q={q} index={idx} total={questions.length}
        selected={answers[idx]}
        onSelect={(i) => setAnswers((a) => ({ ...a, [idx]: i }))}
        showKo={showKo} onToggleKo={() => setShowKo((v) => !v)} revealed={false} />
      <div className="flex items-center justify-between mt-4">
        <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40">이전</button>
        {idx < questions.length - 1 ? (
          <button onClick={() => setIdx(idx + 1)} className="px-6 py-2.5 rounded-lg bg-[#37a7f0] text-white hover:bg-[#2a8bc9]">다음</button>
        ) : (
          <button onClick={() => setPhase('result')} className="px-6 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600">제출하기</button>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──
export function ManjeomCoursePage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useManjeomData();
  const [screen, setScreen] = useState<'home' | 'cards' | 'quiz' | 'exam' | 'mock'>('home');

  const examIds = useMemo(() => (data ? data.examIds : []), [data]);
  const examQuestions = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.questions.map((q) => [q.id, q]));
    return examIds.map((id) => byId.get(id)).filter((q): q is ManjeomQuestion => !!q);
  }, [data, examIds]);

  if (!data) return <LoadingState failed={failed} onBack={onBack} />;

  const solved = Object.keys(readStore<Record<number, number>>(`${KEY_QUIZ}:answers`, {})).length;
  const cardsDone = readStore<number[]>(KEY_CARDS, []).length;

  if (screen === 'cards') return <MnemonicCards data={data} onBack={() => setScreen('home')} />;
  if (screen === 'quiz') return <QuizRunner questions={data.questions} title="⚡ 핵심 600문제" storageKey={KEY_QUIZ} onBack={() => setScreen('home')} />;
  if (screen === 'exam') return <ExamRunner questions={examQuestions.length ? examQuestions : shuffle(data.questions).slice(0, 100)} title="⚡ 시험 전날 실전 100문제" seconds={2700} resultKey={KEY_EXAM} onBack={() => setScreen('home')} />;
  if (screen === 'mock') return <ExamRunner questions={shuffle(data.questions).slice(0, 100)} title="만점교육 모의고사" seconds={2700} resultKey={KEY_MOCK} onBack={() => setScreen('home')} />;

  const cardsTotal = useMemo(() => new Set(data.questions.filter((q) => q.mnemonic).map((q) => q.mnemonic)).size, [data]);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="필기시험으로 돌아가기" />
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2">🎯 만점교육</h1>
        <p className="text-[15px] text-gray-600 leading-relaxed">
          중국어 원문 600문제로 실제 시험 그대로 익히고, 한국어 번역·병음으로 뜻을 확실히 이해하세요.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* 속성 과정 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-lg font-bold text-gray-800">속성 과정</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">암기 구결 → 핵심 600문제 → 실전 100문제, 3단계로 빠르게.</p>
          <div className="space-y-2 text-sm text-gray-700 mb-4">
            <div className="flex justify-between"><span>① 암기 구결·요령</span><span className="text-gray-400">{cardsDone}/{cardsTotal}</span></div>
            <div className="flex justify-between"><span>② 핵심 600문제</span><span className="text-gray-400">{solved}/600</span></div>
            <div className="flex justify-between"><span>③ 실전 100문제</span><span className="text-gray-400">{readStore<{best:number}>(KEY_EXAM, {best:0}).best}점</span></div>
          </div>
          <button onClick={() => setScreen('cards')} className="w-full px-4 py-2.5 rounded-lg bg-[#f39c12] text-white hover:bg-[#e08e0b] mb-2">① 암기 구결·요령</button>
          <button onClick={() => setScreen('quiz')} className="w-full px-4 py-2.5 rounded-lg bg-[#37a7f0] text-white hover:bg-[#2a8bc9] mb-2">② 핵심 600문제</button>
          <button onClick={() => setScreen('exam')} className="w-full px-4 py-2.5 rounded-lg border border-[#37a7f0] text-[#37a7f0] hover:bg-[#eef7fe]">③ 시험 전날 실전 100문제</button>
        </div>

        {/* 모의고사 */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📝</span>
            <h2 className="text-lg font-bold text-gray-800">모의고사</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">600문제 중 100문제를 랜덤 출제, 실제 시험처럼 45분.</p>
          <div className="text-sm text-gray-700 mb-4">
            최근 {readStore<{last:number}>(KEY_MOCK, {last:0}).last}점 · 최고 {readStore<{best:number}>(KEY_MOCK, {best:0}).best}점
          </div>
          <button onClick={() => setScreen('mock')} className="w-full px-4 py-2.5 rounded-lg bg-[#37a7f0] text-white hover:bg-[#2a8bc9]">모의고사 시작</button>
        </div>
      </div>
    </div>
  );
}
