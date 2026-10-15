import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

// 과목1 문제 데이터 (원본: 2026年科目一新规2309题, 한국어 번역본)
export type DLQuestion = {
  id: number;
  c: number; // 장 번호 (1~6)
  t: 'j' | 's' | 'm'; // 판단형 / 선택형 / 복수 선택형
  q: string;
  o?: string[];
  a: number | number[];
  e?: string;
  img?: string[];
};
export type DLChapter = { id: number; title: string };
type DLData = { chapters: DLChapter[]; questions: DLQuestion[] };

let dataCache: DLData | null = null;
let dataPromise: Promise<DLData> | null = null;

function loadData(): Promise<DLData> {
  if (dataCache) return Promise.resolve(dataCache);
  if (!dataPromise) {
    dataPromise = import('../data/driverLicenseQuestions.json')
      .then((m) => {
        dataCache = m.default as unknown as DLData;
        return dataCache;
      })
      .catch((err) => {
        dataPromise = null;
        throw err;
      });
  }
  return dataPromise;
}

export function useDriverLicenseData() {
  const [data, setData] = useState<DLData | null>(dataCache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (data) return;
    loadData().then(setData).catch(() => setFailed(true));
  }, [data]);
  return { data, failed };
}

function readStore<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간을 쓸 수 없는 환경(사생활 보호 모드 등)에서는 저장하지 않음
  }
}

const JUDGE_OPTIONS = ['맞음', '틀림'];
const LETTERS = 'ABCD';
const PRIMARY = '#37a7f0';
const FAVORITES_KEY = 'dl-favorites';
const SEQUENTIAL_KEY = 'dl-progress-all';
const MOCK_RESULTS_KEY = 'dl-mock-results';

const TYPE_HINT: Record<DLQuestion['t'], string> = {
  j: '판단형 문제 – 맞음/틀림을 고르세요.',
  s: '선택형 문제 – 보기 중 정답 하나를 고르세요.',
  m: '복수 선택형 문제 – 정답을 모두 고른 뒤 「답 확인」을 누르세요.',
};

const optionsOf = (q: DLQuestion) => (q.t === 'j' ? JUDGE_OPTIONS : q.o ?? []);
const correctOf = (q: DLQuestion) => (Array.isArray(q.a) ? q.a : [q.a]);
const isCorrect = (q: DLQuestion, selected: number[] | undefined) => {
  if (!selected) return false;
  const correct = correctOf(q);
  return selected.length === correct.length && correct.every((i) => selected.includes(i));
};
const answerText = (q: DLQuestion) => {
  const options = optionsOf(q);
  return correctOf(q)
    .map((i) => `${LETTERS[i]}. ${options[i]}`)
    .join(', ');
};
const imageUrl = (name: string) => `${import.meta.env.BASE_URL}driver-license/img/${name}`;

let audioContext: AudioContext | null = null;

// 정답: 딩동댕(상승하는 3음), 오답: 짧은 경고음
function playTone(correct: boolean) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioContext = audioContext ?? new Ctx();
    const ctx = audioContext;
    const notes = correct ? [523.25, 659.25, 783.99] : [800];
    const duration = correct ? 0.3 : 0.4;
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(correct ? 0.3 : 0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      oscillator.start(start);
      oscillator.stop(start + duration);
    });
  } catch {
    // 소리를 낼 수 없는 환경이면 무시
  }
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed = Math.floor(Math.random() * 2 ** 32)): T[] {
  const result = items.slice();
  const random = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function formatTime(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function LoadingState({ failed, onBack }: { failed: boolean; onBack: () => void }) {
  return (
    <div className="max-w-[1000px] mx-auto px-5 py-20 text-center text-gray-500">
      {failed ? (
        <>
          <p className="mb-4">문제를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          <button onClick={onBack} className="px-5 py-2 border border-gray-300 rounded hover:border-[#37a7f0] hover:text-[#37a7f0]">
            돌아가기
          </button>
        </>
      ) : (
        <p>
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>문제를 불러오는 중...
        </p>
      )}
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 mb-5 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:border-[#37a7f0] hover:text-[#37a7f0] transition-colors"
    >
      <i className="fa-solid fa-arrow-left"></i>
      {label}
    </button>
  );
}

// 문제 한 개 (연습·모의고사·결과 화면 공통)
function QuestionCard({
  q,
  label,
  selected,
  reveal,
  onSelect,
  headerRight,
}: {
  q: DLQuestion;
  label: string;
  selected: number[];
  reveal: boolean;
  onSelect?: (index: number) => void;
  headerRight?: ReactNode;
}) {
  const correct = correctOf(q);
  return (
    <div>
      <div className="flex justify-between items-start gap-4 mb-5">
        <h2 className="text-lg sm:text-[22px] leading-relaxed text-gray-900 font-normal">
          {label} {q.q}
        </h2>
        {headerRight}
      </div>

      {q.img && (
        <div className="flex flex-wrap gap-3 mb-6">
          {q.img.map((name) => (
            <img
              key={name}
              src={imageUrl(name)}
              alt="문제 그림"
              loading="lazy"
              className="max-h-56 max-w-full rounded border border-gray-200 bg-white object-contain"
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {optionsOf(q).map((text, i) => {
          const isSelected = selected.includes(i);
          const isAnswer = correct.includes(i);
          let tone = 'border-gray-200 hover:bg-gray-50';
          let mark: ReactNode = <span className="w-6 h-6 rounded-full border-2 border-gray-300"></span>;
          if (reveal && isAnswer) {
            tone = 'border-green-500 bg-green-50';
            mark = <i className="fa-solid fa-circle-check text-green-500 text-[28px]"></i>;
          } else if (reveal && isSelected) {
            tone = 'border-red-500 bg-red-50';
            mark = <i className="fa-solid fa-circle-xmark text-red-500 text-[28px]"></i>;
          } else if (isSelected) {
            tone = 'border-[#37a7f0] bg-blue-50';
            mark = <i className="fa-solid fa-circle-check text-[#37a7f0] text-[28px]"></i>;
          }
          return (
            <button
              key={i}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(i)}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 sm:py-4 border-2 rounded-lg bg-white text-base sm:text-lg transition-colors ${tone} ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="shrink-0 w-7 flex justify-center">{mark}</span>
              <span>
                {LETTERS[i]}. {text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExplanationBox({ q }: { q: DLQuestion }) {
  return (
    <div className="mt-5 p-5 bg-[#e3f2fd] border-l-4 border-[#37a7f0] rounded">
      <h4 className="text-base font-medium text-gray-800 mb-2">
        <i className="fa-solid fa-lightbulb mr-2 text-[#37a7f0]"></i>정답: {answerText(q)}
      </h4>
      {q.e && <p className="text-[15px] text-gray-600 leading-relaxed">{q.e}</p>}
    </div>
  );
}

type Progress = { index: number; answers: Record<number, number[]>; total?: number; correct?: number; wrong?: number };

// 연습 문제 풀이 (순서 연습, 주제별 연습, 즐겨찾기 공통)
export function PracticeQuiz({
  questions,
  title,
  breadcrumb,
  storageKey,
  onBack,
  backLabel,
}: {
  questions: DLQuestion[];
  title: string;
  breadcrumb: string;
  storageKey?: string;
  onBack: () => void;
  backLabel: string;
}) {
  const [progress, setProgress] = useState<Progress>(() =>
    storageKey ? readStore<Progress>(storageKey, { index: 0, answers: {} }) : { index: 0, answers: {} },
  );
  const [pending, setPending] = useState<number[]>([]);
  const [autoNext, setAutoNext] = useState(() => readStore('dl-auto-next', true));
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => readStore<number[]>(FAVORITES_KEY, []));
  const timer = useRef<number>();

  const index = Math.min(progress.index, questions.length - 1);
  const q = questions[index];
  const answered = progress.answers[q.id];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    for (const item of questions) {
      const selected = progress.answers[item.id];
      if (!selected) continue;
      if (isCorrect(item, selected)) correct++;
      else wrong++;
    }
    return { correct, wrong };
  }, [questions, progress.answers]);
  useEffect(() => {
    if (storageKey) writeStore(storageKey, { ...progress, total: questions.length, correct: stats.correct, wrong: stats.wrong });
  }, [storageKey, progress, questions.length, stats]);

  const accuracy = stats.correct + stats.wrong > 0 ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) : 0;

  const goTo = (target: number) => {
    window.clearTimeout(timer.current);
    setProgress((p) => ({ ...p, index: Math.max(0, Math.min(questions.length - 1, target)) }));
    setPending([]);
    setShowExplanation(false);
  };

  const submit = (selected: number[]) => {
    if (answered || selected.length === 0) return;
    const ok = isCorrect(q, selected);
    playTone(ok);
    setProgress((p) => ({ ...p, answers: { ...p.answers, [q.id]: selected } }));
    if (!ok) setShowExplanation(true);
    else if (autoNext && index < questions.length - 1) timer.current = window.setTimeout(() => goTo(index + 1), 900);
  };

  const handleSelect = (i: number) => {
    if (answered) return;
    if (q.t === 'm') setPending((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i].sort()));
    else submit([i]);
  };

  const toggleFavorite = () => {
    const next = favorites.includes(q.id) ? favorites.filter((id) => id !== q.id) : [...favorites, q.id];
    setFavorites(next);
    writeStore(FAVORITES_KEY, next);
  };

  const resetProgress = () => {
    if (!window.confirm('풀이 기록을 모두 지우고 처음부터 다시 풀까요?')) return;
    window.clearTimeout(timer.current);
    setProgress({ index: 0, answers: {} });
    setPending([]);
    setShowExplanation(false);
  };

  const isFavorite = favorites.includes(q.id);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label={backLabel} />

      <div className="text-sm text-gray-400 mb-6">
        현재위치: {breadcrumb}
        <span className="mx-1">&gt;</span>
        <strong className="text-gray-700">{title}</strong>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#37a7f0] transition-all"
          style={{ width: `${((stats.correct + stats.wrong) / questions.length) * 100}%` }}
        ></div>
      </div>

      <QuestionCard
        q={q}
        label={`${index + 1}/${questions.length}.`}
        selected={answered ?? pending}
        reveal={!!answered}
        onSelect={answered ? undefined : handleSelect}
        headerRight={
          <button
            onClick={toggleFavorite}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
              isFavorite ? 'bg-[#fff3cd] border-[#ffc107] text-[#856404]' : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`}></i> 즐겨찾기
          </button>
        }
      />

      {q.t === 'm' && !answered && (
        <button
          onClick={() => submit(pending)}
          disabled={pending.length === 0}
          className="mt-4 px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          답 확인
        </button>
      )}

      {(showExplanation || answered) && (showExplanation || !isCorrect(q, answered)) && <ExplanationBox q={q} />}

      <div className="text-sm text-gray-400 mt-6 pb-5 border-b border-gray-100">{TYPE_HINT[q.t]}</div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-5 py-6 border-b border-gray-200 mb-8">
        <div className="flex gap-3">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="px-5 sm:px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            이전 문제
          </button>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === questions.length - 1}
            className="px-5 sm:px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            다음 문제
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <label className="flex items-center gap-1.5 cursor-pointer text-gray-800 font-medium">
            <input
              type="checkbox"
              checked={autoNext}
              onChange={(e) => {
                setAutoNext(e.target.checked);
                writeStore('dl-auto-next', e.target.checked);
              }}
            />
            정답 시 자동 넘김
          </label>
          <span>
            정답: <b className="text-[#2ecc71]">{stats.correct}</b>문제
          </span>
          <span>
            오답: <b className="text-[#e74c3c]">{stats.wrong}</b>문제
          </span>
          <span>정답률: {accuracy}%</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <button
            onClick={() => setShowExplanation((v) => !v)}
            className={`px-4 py-2 rounded border text-sm transition-colors ${
              showExplanation ? 'bg-[#37a7f0] border-[#37a7f0] text-white' : 'bg-white border-gray-300 text-gray-800 hover:border-[#37a7f0] hover:text-[#37a7f0]'
            }`}
          >
            해설 보기
          </button>
          <button
            onClick={() => setShowSheet((v) => !v)}
            className={`px-4 py-2 rounded border text-sm transition-colors ${
              showSheet ? 'bg-[#37a7f0] border-[#37a7f0] text-white' : 'bg-white border-gray-300 text-gray-800 hover:border-[#37a7f0] hover:text-[#37a7f0]'
            }`}
          >
            답안지 보기
          </button>
          {storageKey && (
            <button onClick={resetProgress} className="text-sm text-gray-500 hover:text-[#e74c3c]">
              처음부터 다시
            </button>
          )}
        </div>
      </div>

      {showSheet && (
        <div className="mb-10 p-5 sm:p-8 bg-gray-50 rounded-lg">
          <div className="text-lg font-medium text-gray-800 mb-4">답안지 ({questions.length}문제)</div>
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(40px,1fr))] max-h-[420px] overflow-y-auto pr-1">
            {questions.map((item, i) => {
              const selected = progress.answers[item.id];
              let tone = 'bg-white border-gray-300 text-gray-600';
              if (i === index) tone = 'bg-[#37a7f0] border-[#37a7f0] text-white font-bold';
              else if (selected) tone = isCorrect(item, selected) ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-400 text-red-600';
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(i)}
                  className={`aspect-square rounded border text-xs sm:text-[13px] flex items-center justify-center hover:border-[#37a7f0] ${tone}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg sm:text-xl text-gray-800 mb-4">아직 운전학원에 등록 안 하셨나요? 인기 학원 확인하기</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>•</span>
          <span>C1/C2 1종/2종 보통</span>
          <span className="text-[#ffc107]">★★★★★</span>
          <span className="text-[#ffa502] font-medium">상담 문의</span>
        </div>
      </div>
    </div>
  );
}

// 순서 연습: 전체 문제를 처음부터 차례대로
export function SequentialPracticePage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useDriverLicenseData();
  if (!data) return <LoadingState failed={failed} onBack={onBack} />;
  return (
    <PracticeQuiz
      questions={data.questions}
      title="순서 연습"
      breadcrumb="홈 > 모의고사 > 소형차 필기(과목1)"
      storageKey={SEQUENTIAL_KEY}
      onBack={onBack}
      backLabel="필기시험으로 돌아가기"
    />
  );
}

// 필기시험 홈의 통계용: 순서 연습 진행 상황
export function readSequentialStats() {
  const progress = readStore<Progress | null>(SEQUENTIAL_KEY, null);
  if (!progress?.total) return null;
  return { total: progress.total, correct: progress.correct ?? 0, wrong: progress.wrong ?? 0 };
}

// 주제별 연습: 장별 순서대로 / 랜덤으로 풀기
export function ChapterPracticePage({ onBack, selectedCity }: { onBack: () => void; selectedCity: string }) {
  const { data, failed } = useDriverLicenseData();
  const [session, setSession] = useState<{ chapter: DLChapter; random: boolean; questions: DLQuestion[]; key: number } | null>(null);

  const chapters = useMemo(
    () =>
      data?.chapters.map((chapter) => ({
        ...chapter,
        questions: data.questions.filter((q) => q.c === chapter.id),
      })) ?? [],
    [data],
  );

  if (!data) return <LoadingState failed={failed} onBack={onBack} />;

  if (session) {
    return (
      <PracticeQuiz
        key={session.key}
        questions={session.questions}
        title={`제${session.chapter.id}장 ${session.chapter.title} (${session.random ? '랜덤' : '순서대로'})`}
        breadcrumb="홈 > 모의고사 > 소형차 필기(과목1) > 주제별 연습"
        storageKey={session.random ? undefined : `dl-progress-ch${session.chapter.id}`}
        onBack={() => setSession(null)}
        backLabel="주제별 연습으로 돌아가기"
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <BackButton onClick={onBack} label="필기시험으로 돌아가기" />

      <header className="text-center mb-12">
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">{selectedCity} 소형차 필기시험(과목1) 주제별 연습</h1>
        <p className="text-sm text-gray-500">법규 챕터에 따라 단계별로 분류</p>
      </header>

      <div className="border-t border-gray-100">
        {chapters.map((chapter) => {
          const saved = readStore<Progress | null>(`dl-progress-ch${chapter.id}`, null);
          const solved = saved ? Object.keys(saved.answers).length : 0;
          return (
            <div key={chapter.id} className="py-6 border-b border-gray-100">
              <div className="text-base sm:text-lg font-medium text-gray-800 mb-4">
                제{chapter.id}장 {chapter.title}{' '}
                <span className="text-gray-500 font-normal text-sm sm:text-base">({chapter.questions.length}문제)</span>
                {solved > 0 && <span className="ml-2 text-xs text-[#37a7f0] font-normal">{solved}문제 풀이</span>}
              </div>
              <div className="flex gap-6 sm:gap-10 pl-2.5 text-sm text-gray-600">
                <button
                  onClick={() => setSession({ chapter, random: false, questions: chapter.questions, key: Date.now() })}
                  className="flex items-center gap-2 hover:text-[#37a7f0] before:content-['•'] before:text-gray-300 hover:before:text-[#37a7f0]"
                >
                  순서대로 풀기
                </button>
                <button
                  onClick={() => setSession({ chapter, random: true, questions: shuffle(chapter.questions), key: Date.now() })}
                  className="flex items-center gap-2 hover:text-[#37a7f0] before:content-['•'] before:text-gray-300 hover:before:text-[#37a7f0]"
                >
                  랜덤으로 풀기
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 즐겨찾기한 문제 풀이
export function FavoritesPractice() {
  const { data, failed } = useDriverLicenseData();
  const [started, setStarted] = useState(0);
  const favorites = useMemo(() => {
    if (!data) return [];
    const ids = new Set(readStore<number[]>(FAVORITES_KEY, []));
    return data.questions.filter((q) => ids.has(q.id));
  }, [data, started]);

  if (!data) return <LoadingState failed={failed} onBack={() => setStarted((n) => n + 1)} />;

  if (started > 0 && favorites.length > 0) {
    return (
      <PracticeQuiz
        key={started}
        questions={favorites}
        title="즐겨찾기 문제"
        breadcrumb="홈 > 즐겨찾기"
        onBack={() => setStarted(0)}
        backLabel="즐겨찾기로 돌아가기"
      />
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      <div className="py-4 text-sm text-gray-500 border-b mb-6">현재 위치: 홈 &gt; 즐겨찾기</div>
      <h2 className="text-2xl mb-3">즐겨찾기 문제 풀이</h2>
      {favorites.length === 0 ? (
        <p className="text-gray-600 leading-relaxed">
          아직 즐겨찾기한 문제가 없습니다. 순서 연습이나 주제별 연습에서 문제 오른쪽 위의
          <span className="mx-1 px-2 py-0.5 border border-gray-300 rounded text-xs bg-gray-50">
            <i className="fa-regular fa-star"></i> 즐겨찾기
          </span>
          를 누르면 여기에 모입니다.
        </p>
      ) : (
        <>
          <p className="text-gray-600 mb-6">즐겨찾기한 문제 {favorites.length}개를 다시 풀어 보세요.</p>
          <button
            onClick={() => setStarted((n) => n + 1)}
            className="px-6 py-3 rounded-lg text-white bg-[#37a7f0] hover:bg-[#2a8bc9]"
          >
            즐겨찾기 문제 풀기
          </button>
        </>
      )}
    </div>
  );
}

// ───────────────── 모의고사 ─────────────────

const EXAM_JUDGE = 40;
const EXAM_SINGLE = 60;
const EXAM_SECONDS = 45 * 60;
const PASS_SCORE = 90;

type MockResult = { best: number; last: number; attempts: number; date: string };

// 같은 문제(문구·보기·그림이 모두 같은 중복 문항)는 한 번만 사용
function uniquePool(questions: DLQuestion[], type: DLQuestion['t']) {
  const seen = new Set<string>();
  return questions.filter((q) => {
    if (q.t !== type) return false;
    const key = `${q.q}|${(q.o ?? []).join('|')}|${(q.img ?? []).join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 회차별 고정 문제: 판단형 40 + 선택형 60, 회차끼리 겹치지 않음
function buildExamSets(questions: DLQuestion[]) {
  const judges = shuffle(uniquePool(questions, 'j'), 2026);
  const singles = shuffle(uniquePool(questions, 's'), 1309);
  const count = Math.min(Math.floor(judges.length / EXAM_JUDGE), Math.floor(singles.length / EXAM_SINGLE));
  return Array.from({ length: count }, (_, k) => [
    ...judges.slice(k * EXAM_JUDGE, (k + 1) * EXAM_JUDGE),
    ...singles.slice(k * EXAM_SINGLE, (k + 1) * EXAM_SINGLE),
  ]);
}

function buildRandomExam(questions: DLQuestion[]) {
  return [
    ...shuffle(uniquePool(questions, 'j')).slice(0, EXAM_JUDGE),
    ...shuffle(uniquePool(questions, 's')).slice(0, EXAM_SINGLE),
  ];
}

type ExamSession = { no: number | null; questions: DLQuestion[]; answers: Record<number, number>; startedAt: number };
type ExamOutcome = ExamSession & { score: number; seconds: number };

export function MockExamPage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useDriverLicenseData();
  const sets = useMemo(() => (data ? buildExamSets(data.questions) : []), [data]);
  const [results, setResults] = useState<Record<string, MockResult>>(() => readStore(MOCK_RESULTS_KEY, {}));
  const [session, setSession] = useState<ExamSession | null>(null);
  const [outcome, setOutcome] = useState<ExamOutcome | null>(null);

  if (!data) return <LoadingState failed={failed} onBack={onBack} />;

  const start = (no: number | null) => {
    const questions = no === null ? buildRandomExam(data.questions) : sets[no - 1];
    setOutcome(null);
    setSession({ no, questions, answers: {}, startedAt: Date.now() });
    window.scrollTo({ top: 0 });
  };

  const finish = (finished: ExamSession) => {
    const score = finished.questions.filter((q, i) => finished.answers[i] === q.a).length;
    const seconds = Math.min(EXAM_SECONDS, Math.round((Date.now() - finished.startedAt) / 1000));
    if (finished.no !== null) {
      const key = String(finished.no);
      const prev = results[key];
      const next = {
        ...results,
        [key]: {
          best: Math.max(prev?.best ?? 0, score),
          last: score,
          attempts: (prev?.attempts ?? 0) + 1,
          date: new Date().toLocaleDateString('ko-KR'),
        },
      };
      setResults(next);
      writeStore(MOCK_RESULTS_KEY, next);
    }
    setSession(null);
    setOutcome({ ...finished, score, seconds });
    window.scrollTo({ top: 0 });
  };

  if (session) {
    return (
      <ExamRunner
        session={session}
        onChange={setSession}
        onSubmit={finish}
        onExit={() => {
          if (window.confirm('시험을 그만두시겠어요? 지금까지 고른 답은 저장되지 않습니다.')) setSession(null);
        }}
      />
    );
  }

  if (outcome) {
    return (
      <ExamResult
        outcome={outcome}
        onRetry={() => start(outcome.no)}
        onList={() => setOutcome(null)}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <BackButton onClick={onBack} label="필기시험으로 돌아가기" />

      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">소형차 필기시험(과목1) 모의고사</h1>
        <p className="text-sm text-gray-500">실제 시험과 같은 방식으로 100문제를 풀어 보세요</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { icon: 'fa-list-check', label: '문제 수', value: '100문제' },
          { icon: 'fa-layer-group', label: '구성', value: `판단형 ${EXAM_JUDGE} + 선택형 ${EXAM_SINGLE}` },
          { icon: 'fa-clock', label: '시험 시간', value: '45분' },
          { icon: 'fa-award', label: '합격 기준', value: `${PASS_SCORE}점 이상` },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <i className={`fa-solid ${item.icon} text-xl mb-2`} style={{ color: PRIMARY }}></i>
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-sm sm:text-base font-medium text-gray-800">{item.value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => start(null)}
        className="w-full sm:w-auto mb-8 px-6 py-3 rounded-lg text-white bg-[#37a7f0] hover:bg-[#2a8bc9]"
      >
        <i className="fa-solid fa-shuffle mr-2"></i>랜덤 모의고사 시작 (전체 문제에서 무작위 출제)
      </button>

      <h2 className="text-lg font-medium text-gray-800 mb-4">회차별 모의고사 ({sets.length}회분)</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sets.map((_, i) => {
          const no = i + 1;
          const result = results[String(no)];
          return (
            <button
              key={no}
              onClick={() => start(no)}
              className="text-left p-4 bg-white border-2 border-gray-100 rounded-lg hover:border-[#37a7f0] hover:shadow-md transition-all"
            >
              <div className="font-medium text-gray-800 mb-1">제{no}회 모의고사</div>
              {result ? (
                <div className="text-xs text-gray-500">
                  최고 <b className={result.best >= PASS_SCORE ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}>{result.best}점</b> ·{' '}
                  {result.attempts}회 응시
                </div>
              ) : (
                <div className="text-xs text-gray-400">아직 응시하지 않음</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExamRunner({
  session,
  onChange,
  onSubmit,
  onExit,
}: {
  session: ExamSession;
  onChange: (session: ExamSession) => void;
  onSubmit: (session: ExamSession) => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const latest = useRef(session);
  latest.current = session;

  const remaining = EXAM_SECONDS - Math.floor((now - session.startedAt) / 1000);
  const answeredCount = Object.keys(session.answers).length;
  const q = session.questions[index];
  const total = session.questions.length;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      window.alert('시험 시간이 끝났습니다. 답안을 자동으로 제출합니다.');
      onSubmit(latest.current);
    }
  }, [remaining <= 0]);

  const select = (i: number) => {
    onChange({ ...session, answers: { ...session.answers, [index]: i } });
    if (index < total - 1) window.setTimeout(() => setIndex((cur) => (cur === index ? index + 1 : cur)), 250);
  };

  const submit = () => {
    const left = total - answeredCount;
    const message = left > 0 ? `아직 풀지 않은 문제가 ${left}개 있습니다. 그래도 제출할까요?` : '답안을 제출할까요?';
    if (window.confirm(message)) onSubmit(session);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
      <div className="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 py-3 mb-6 bg-white/95 backdrop-blur border-b border-gray-200 flex flex-wrap items-center gap-3">
        <span className="font-medium text-gray-800">{session.no === null ? '랜덤 모의고사' : `제${session.no}회 모의고사`}</span>
        <span className="text-sm text-gray-500">
          {answeredCount}/{total} 답함
        </span>
        <span
          className={`ml-auto font-mono text-lg px-3 py-1 rounded ${remaining <= 300 ? 'bg-red-50 text-[#e74c3c]' : 'bg-gray-50 text-gray-800'}`}
        >
          <i className="fa-regular fa-clock mr-1.5"></i>
          {formatTime(remaining)}
        </span>
        <button onClick={submit} className="px-4 py-2 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] text-sm">
          답안 제출
        </button>
        <button onClick={onExit} className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-600 hover:border-[#e74c3c] hover:text-[#e74c3c]">
          그만두기
        </button>
      </div>

      <QuestionCard
        q={q}
        label={`${index + 1}.`}
        selected={session.answers[index] === undefined ? [] : [session.answers[index]]}
        reveal={false}
        onSelect={select}
      />
      <div className="text-sm text-gray-400 mt-5">{TYPE_HINT[q.t]}</div>

      <div className="flex gap-3 my-8">
        <button
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className="px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          이전 문제
        </button>
        <button
          onClick={() => setIndex(index + 1)}
          disabled={index === total - 1}
          className="px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          다음 문제
        </button>
      </div>

      <div className="p-5 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-3">답안지 (1~40번 판단형, 41~100번 선택형)</div>
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 max-w-[560px]">
          {session.questions.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className={`aspect-square rounded border text-xs sm:text-[13px] flex items-center justify-center hover:border-[#37a7f0] ${
                i === index
                  ? 'bg-[#37a7f0] border-[#37a7f0] text-white font-bold'
                  : session.answers[i] !== undefined
                    ? 'bg-blue-50 border-[#37a7f0] text-[#2a8bc9]'
                    : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamResult({ outcome, onRetry, onList }: { outcome: ExamOutcome; onRetry: () => void; onList: () => void }) {
  const passed = outcome.score >= PASS_SCORE;
  const wrong = outcome.questions
    .map((q, i) => ({ q, i, selected: outcome.answers[i] }))
    .filter(({ q, selected }) => selected !== q.a);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className={`rounded-xl p-6 sm:p-8 text-center mb-8 ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="text-sm text-gray-500 mb-1">{outcome.no === null ? '랜덤 모의고사' : `제${outcome.no}회 모의고사`} 결과</div>
        <div className={`text-5xl font-bold mb-2 ${passed ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>{outcome.score}점</div>
        <div className={`inline-block px-4 py-1 rounded-full text-white text-sm mb-4 ${passed ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`}>
          {passed ? '합격' : '불합격'} (합격 기준 {PASS_SCORE}점)
        </div>
        <div className="text-sm text-gray-600">
          정답 {outcome.score}문제 · 오답 {wrong.length}문제 · 소요 시간 {formatTime(outcome.seconds)}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button onClick={onRetry} className="px-5 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9]">
            {outcome.no === null ? '새 랜덤 모의고사' : '이 회차 다시 풀기'}
          </button>
          <button onClick={onList} className="px-5 py-2.5 rounded border border-gray-300 bg-white text-gray-700 hover:border-[#37a7f0] hover:text-[#37a7f0]">
            모의고사 목록
          </button>
        </div>
      </div>

      {wrong.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-800 mb-4">틀린 문제 ({wrong.length}개)</h3>
          <div className="flex flex-col gap-6">
            {wrong.map(({ q, i, selected }) => (
              <div key={q.id} className="p-5 border border-gray-200 rounded-lg">
                <QuestionCard q={q} label={`${i + 1}.`} selected={selected === undefined ? [] : [selected]} reveal />
                {selected === undefined && <div className="mt-3 text-sm text-[#e74c3c]">풀지 않은 문제</div>}
                <ExplanationBox q={q} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
