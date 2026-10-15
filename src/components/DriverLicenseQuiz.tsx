import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { STAGE_INFO, type StageInfo } from '../data/driverLicenseStages';
import {
  getFavorites,
  getMockResults,
  getProgress,
  getWrongMap,
  recordAnswers,
  setFavorites as saveFavorites,
  setMockResult,
  setProgress as saveProgress,
  useDriverLicenseRecords,
} from '../utils/driverLicenseRecords';

// 과목1 문제 데이터 (원본: 2026年科目一新规2309题, 한국어 번역본)
// 과목1 공식 문제 유형은 판단형(判断题)과 단일 선택형(单选题) 두 가지뿐
export type DLQuestion = {
  id: number;
  c: number; // 단계(장) 번호
  t: 'j' | 's'; // 판단형 / 단일 선택형
  k?: 'pic' | 'sign' | 'sig'; // 그림 상황 / 교통 표지·노면 표시 / 신호등·교통경찰 수신호 (없으면 글 문제)
  q: string;
  o?: string[];
  a: number;
  e?: string;
  img?: string[];
};
export type DLKind = 'txt' | 'pic' | 'sign' | 'sig';
export type DLChapter = { id: number; title: string };
type DLData = { chapters: DLChapter[]; questions: DLQuestion[]; imgSize?: Record<string, [number, number]> };

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
const SEQUENTIAL_KEY = 'all';

// 오답 노트: 문제 id → 마지막으로 틀리게 고른 답. 나중에 다시 맞히면 빠짐
// (기록은 utils/driverLicenseRecords: 이 기기에 저장하고, 로그인한 회원은 서버에도 저장해 휴대폰·PC에서 이어서 풂)
const readWrong = getWrongMap;

const TYPE_HINT: Record<DLQuestion['t'], string> = {
  j: '판단형 문제 – 맞음/틀림을 고르세요.',
  s: '단일 선택형 문제 – 보기 중 정답 하나를 고르세요.',
};

export const KIND_LABEL: Record<DLKind, string> = {
  txt: '글 문제',
  pic: '그림 상황 판단',
  sign: '교통 표지·노면 표시',
  sig: '신호등·교통경찰 수신호',
};
const KIND_SHORT: Record<DLKind, string> = { txt: '글', pic: '그림', sign: '표지', sig: '신호·수신호' };
export const kindOf = (q: DLQuestion): DLKind => q.k ?? 'txt';

const optionsOf = (q: DLQuestion) => (q.t === 'j' ? JUDGE_OPTIONS : q.o ?? []);
const isCorrect = (q: DLQuestion, selected: number[] | undefined) => selected?.length === 1 && selected[0] === q.a;
const answerText = (q: DLQuestion) => `${LETTERS[q.a]}. ${optionsOf(q)[q.a]}`;
const imageUrl = (name: string) => `${import.meta.env.BASE_URL}driver-license/img/${name}`;

// 원본 그림이 작아서(가로 200~400px) 시험지처럼 크게 보여 줌: 상황 그림은 가로 최대 640px, 표지·계기판은 세로 최대 300px
function imageStyle(name: string, count: number, exam = false): CSSProperties | undefined {
  const size = dataCache?.imgSize?.[name];
  if (!size) return undefined;
  const [w, h] = size;
  const maxWidth = Math.min(w * 2.2, count > 1 ? 300 : 640);
  const aspectRatio = `${w} / ${h}`;
  // 모의고사 시험 화면: 스크롤 없이 한 화면에 들어오도록 화면 높이에 맞춤 (그림 높이 최대 화면의 34%)
  if (exam) return { width: `min(${Math.round(maxWidth)}px, ${(((count > 1 ? 20 : 34) * w) / h).toFixed(1)}vh)`, aspectRatio };
  return { width: Math.round(Math.min(maxWidth, ((count > 1 ? 200 : 300) * w) / h)), aspectRatio };
}

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
// exam: 모의고사 시험 화면용 - 한 화면에 들어가도록 작게, 넓은 화면에서는 보기(왼쪽)와 그림(오른쪽)을 나란히
function QuestionCard({
  q,
  label,
  selected,
  reveal,
  onSelect,
  headerRight,
  exam = false,
}: {
  q: DLQuestion;
  label: string;
  selected: number[];
  reveal: boolean;
  onSelect?: (index: number) => void;
  headerRight?: ReactNode;
  exam?: boolean;
}) {
  const images = q.img && (
    <div className={exam ? 'flex flex-wrap gap-2 lg:order-2' : 'flex flex-wrap gap-3 mb-6'}>
      {q.img.map((name) => (
        <img
          key={name}
          src={imageUrl(name)}
          alt="문제 그림"
          loading="lazy"
          style={imageStyle(name, q.img!.length, exam)}
          className="max-w-full h-auto rounded border border-gray-200 bg-white object-contain"
        />
      ))}
    </div>
  );

  const options = (
    <div className={`flex flex-col ${exam ? 'gap-2 sm:gap-2.5 lg:order-1' : 'gap-3'}`}>
      {optionsOf(q).map((text, i) => {
        const isSelected = selected.includes(i);
        const isAnswer = i === q.a;
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
            className={`w-full flex items-center gap-3 text-left px-4 border-2 rounded-lg bg-white transition-colors ${
              exam ? 'py-2 sm:py-3 text-[15px] sm:text-base' : 'py-3 sm:py-4 text-base sm:text-lg'
            } ${tone} ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span className="shrink-0 w-7 flex justify-center">{mark}</span>
            <span>
              {LETTERS[i]}. {text}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className={`flex justify-between items-start gap-4 ${exam ? 'mb-4' : 'mb-5'}`}>
        <h2 className={`${exam ? 'text-lg sm:text-xl' : 'text-lg sm:text-[22px]'} leading-relaxed text-gray-900 font-normal`}>
          {label} {q.q}
        </h2>
        {headerRight}
      </div>
      {exam ? (
        <div className={q.img ? 'flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start' : ''}>
          {images}
          {options}
        </div>
      ) : (
        <>
          {images}
          {options}
        </>
      )}
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
  onReviewWrong,
}: {
  questions: DLQuestion[];
  title: string;
  breadcrumb: string;
  storageKey?: string;
  onBack: () => void;
  backLabel: string;
  onReviewWrong?: () => void;
}) {
  const { version } = useDriverLicenseRecords();
  const [progress, setProgress] = useState<Progress>(() =>
    storageKey ? getProgress<Progress>(storageKey) ?? { index: 0, answers: {} } : { index: 0, answers: {} },
  );
  const [autoNext, setAutoNext] = useState(() => readStore('dl-auto-next', true));
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(getFavorites);
  const timer = useRef<number>();
  const loadedVersion = useRef(version);

  const index = Math.min(progress.index, questions.length - 1);
  const q = questions[index];
  const answered = progress.answers[q.id];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // 다른 기기에서 푼 기록을 받아오면 진도·즐겨찾기를 다시 읽음
  useEffect(() => {
    if (loadedVersion.current === version) return;
    loadedVersion.current = version;
    if (storageKey) setProgress(getProgress<Progress>(storageKey) ?? { index: 0, answers: {} });
    setFavorites(getFavorites());
  }, [version, storageKey]);

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
    if (storageKey) saveProgress(storageKey, { ...progress, total: questions.length, correct: stats.correct, wrong: stats.wrong });
  }, [storageKey, progress, questions.length, stats]);

  const accuracy = stats.correct + stats.wrong > 0 ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) : 0;

  const goTo = (target: number) => {
    window.clearTimeout(timer.current);
    setProgress((p) => ({ ...p, index: Math.max(0, Math.min(questions.length - 1, target)) }));
    setShowExplanation(false);
  };

  const handleSelect = (i: number) => {
    if (answered) return;
    const ok = i === q.a;
    playTone(ok);
    setProgress((p) => ({ ...p, answers: { ...p.answers, [q.id]: [i] } }));
    recordAnswers([{ id: q.id, selected: i, correct: ok }]);
    if (!ok) setShowExplanation(true);
    else if (autoNext && index < questions.length - 1) timer.current = window.setTimeout(() => goTo(index + 1), 900);
  };

  const toggleFavorite = () => {
    const next = favorites.includes(q.id) ? favorites.filter((id) => id !== q.id) : [...favorites, q.id];
    setFavorites(next);
    saveFavorites(next);
  };

  const resetProgress = () => {
    if (!window.confirm('풀이 기록을 모두 지우고 처음부터 다시 풀까요?')) return;
    window.clearTimeout(timer.current);
    setProgress({ index: 0, answers: {} });
    setShowExplanation(false);
  };

  const isFavorite = favorites.includes(q.id);
  const finished = stats.correct + stats.wrong === questions.length;
  const wrongCount = useMemo(() => {
    const wrong = readWrong();
    return questions.filter((item) => item.id in wrong).length;
  }, [questions, progress.answers, version]);

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
        selected={answered ?? []}
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

      {(showExplanation || answered) && (showExplanation || !isCorrect(q, answered)) && <ExplanationBox q={q} />}

      <div className="text-sm text-gray-400 mt-6 pb-5 border-b border-gray-100">{TYPE_HINT[q.t]}</div>

      {finished && (
        <div className="mt-6 p-5 rounded-lg bg-green-50 border border-green-200 flex flex-wrap items-center gap-3">
          <span className="text-gray-800">
            <i className="fa-solid fa-flag-checkered mr-2 text-[#2ecc71]"></i>
            {questions.length}문제를 모두 풀었어요. 정답 {stats.correct} · 오답 {stats.wrong}
          </span>
          {onReviewWrong && wrongCount > 0 && (
            <button onClick={onReviewWrong} className="sm:ml-auto px-4 py-2 rounded text-white text-sm bg-[#e74c3c] hover:opacity-90">
              틀린 문제만 보기 ({wrongCount})
            </button>
          )}
        </div>
      )}

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
          {onReviewWrong && (
            <button
              onClick={onReviewWrong}
              className="px-4 py-2 rounded border text-sm bg-white border-[#e74c3c] text-[#e74c3c] hover:bg-red-50"
            >
              틀린 문제 ({wrongCount})
            </button>
          )}
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
  const [showWrong, setShowWrong] = useState(false);
  if (!data) return <LoadingState failed={failed} onBack={onBack} />;
  if (showWrong) {
    return (
      <WrongNotes
        pool={data.questions}
        title="순서 연습"
        breadcrumb="홈 > 모의고사 > 소형차 필기(과목1)"
        onBack={() => setShowWrong(false)}
        backLabel="순서 연습으로 돌아가기"
      />
    );
  }
  return (
    <PracticeQuiz
      questions={data.questions}
      title="순서 연습"
      breadcrumb="홈 > 모의고사 > 소형차 필기(과목1)"
      storageKey={SEQUENTIAL_KEY}
      onBack={onBack}
      backLabel="필기시험으로 돌아가기"
      onReviewWrong={() => setShowWrong(true)}
    />
  );
}

// 틀린 문제만 모아 보기 → 다시 풀기 (다시 맞히면 목록에서 빠짐)
function WrongNotes({
  pool,
  title,
  breadcrumb,
  onBack,
  backLabel,
}: {
  pool: DLQuestion[];
  title: string;
  breadcrumb: string;
  onBack: () => void;
  backLabel: string;
}) {
  const [retry, setRetry] = useState<{ questions: DLQuestion[]; key: number } | null>(null);
  const [version, setVersion] = useState(0);
  const records = useDriverLicenseRecords();
  const wrong = useMemo(() => readWrong(), [retry, version, records.version]);
  const items = useMemo(() => pool.map((q, i) => ({ q, no: i + 1 })).filter(({ q }) => q.id in wrong), [pool, wrong]);

  if (retry) {
    return (
      <PracticeQuiz
        key={retry.key}
        questions={retry.questions}
        title={`${title} · 틀린 문제 다시 풀기`}
        breadcrumb={breadcrumb}
        onBack={() => setRetry(null)}
        backLabel="틀린 문제 목록으로 돌아가기"
      />
    );
  }

  const clear = () => {
    if (!window.confirm('이 목록의 틀린 문제 기록을 모두 지울까요?')) return;
    recordAnswers(items.map(({ q }) => ({ id: q.id, selected: q.a, correct: true })));
    setVersion((v) => v + 1);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label={backLabel} />
      <div className="text-sm text-gray-400 mb-6">
        현재위치: {breadcrumb}
        <span className="mx-1">&gt;</span>
        <strong className="text-gray-700">{title} 틀린 문제</strong>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#2c3e50] mr-auto">
          <i className="fa-solid fa-circle-xmark mr-2 text-[#e74c3c]"></i>틀린 문제 {items.length}개
        </h1>
        {items.length > 0 && (
          <>
            <button
              onClick={() => setRetry({ questions: items.map(({ q }) => q), key: Date.now() })}
              className="px-5 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9]"
            >
              틀린 문제 다시 풀기
            </button>
            <button onClick={clear} className="text-sm text-gray-500 hover:text-[#e74c3c]">
              기록 지우기
            </button>
          </>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-8">내가 고른 답은 빨간색, 정답은 초록색입니다. 다시 풀어서 맞히면 이 목록에서 빠집니다.</p>

      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">틀린 문제가 없어요. 잘하고 있어요!</div>
      ) : (
        <div className="flex flex-col gap-6">
          {items.map(({ q, no }) => (
            <div key={q.id} className="p-5 border border-gray-200 rounded-lg">
              <QuestionCard q={q} label={`${no}.`} selected={[wrong[q.id]]} reveal />
              <ExplanationBox q={q} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 상단 메뉴 '틀린문제': 모든 연습·모의고사에서 틀린 문제
export function WrongNotesPage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useDriverLicenseData();
  if (!data) return <LoadingState failed={failed} onBack={onBack} />;
  return <WrongNotes pool={data.questions} title="전체" breadcrumb="홈 > 틀린문제" onBack={onBack} backLabel="필기시험으로 돌아가기" />;
}

// 필기시험 홈의 통계용: 순서 연습 진행 상황
export function readSequentialStats() {
  const progress = getProgress<Progress>(SEQUENTIAL_KEY);
  if (!progress?.total) return null;
  return { total: progress.total, correct: progress.correct ?? 0, wrong: progress.wrong ?? 0 };
}

type PracticeGroup = { key: string; title: string; questions: DLQuestion[] };
type StageView =
  | { mode: 'list' }
  | { mode: 'intro'; group: PracticeGroup }
  | { mode: 'quiz'; group: PracticeGroup; random: boolean; questions: DLQuestion[]; key: number }
  | { mode: 'wrong'; group: PracticeGroup };

const STAGE_BREADCRUMB = '홈 > 모의고사 > 소형차 필기(과목1) > 주제별 연습';

// 영역 설명: 영역 소개 · 핵심 내용 · 암기 요령을 보고 풀기 시작
function StageIntro({
  group,
  info,
  onStart,
  onWrong,
  onBack,
}: {
  group: PracticeGroup;
  info?: StageInfo;
  onStart: (random: boolean) => void;
  onWrong: () => void;
  onBack: () => void;
}) {
  useDriverLicenseRecords();
  const saved = getProgress<Progress>(group.key);
  const solved = saved ? Object.keys(saved.answers).length : 0;
  const wrong = readWrong();
  const wrongCount = group.questions.filter((q) => q.id in wrong).length;
  const images = group.questions.filter((q) => q.img).length;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="주제별 연습으로 돌아가기" />
      <div className="text-sm text-gray-400 mb-6">
        현재위치: {STAGE_BREADCRUMB}
        <span className="mx-1">&gt;</span>
        <strong className="text-gray-700">{group.title}</strong>
      </div>

      <header className="mb-6">
        {info?.isNew && <span className="inline-block mb-2 px-2 py-0.5 rounded text-xs text-white bg-[#ff6b6b]">2026 신규 영역</span>}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2">{group.title}</h1>
        <div className="text-sm text-gray-500">
          {group.questions.length}문제 · 그림 문제 {images}개{solved > 0 && ` · ${solved}문제 풀이`}
          {wrongCount > 0 && <span className="text-[#e74c3c]"> · 틀린 문제 {wrongCount}개</span>}
        </div>
      </header>

      {info && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sm:p-7">
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            <i className="fa-solid fa-book-open mr-2 text-[#37a7f0]"></i>영역 설명
          </h2>
          <p className="text-[15px] text-gray-700 leading-relaxed mb-5">{info.summary}</p>
          <h3 className="text-base font-medium text-gray-800 mb-2">핵심 내용</h3>
          <ul className="flex flex-col gap-2 text-[15px] text-gray-700 leading-relaxed">
            {info.points.map((point) => (
              <li key={point} className="flex gap-2">
                <i className="fa-solid fa-check text-[#37a7f0] mt-1.5 text-xs"></i>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {info.tip && (
            <div className="mt-5 p-4 bg-[#fff8e1] border-l-4 border-[#ffc107] rounded text-[15px] text-gray-800">
              <b className="mr-2">암기 요령</b>
              {info.tip}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        <button onClick={() => onStart(false)} className="px-6 py-3 rounded-lg text-white bg-[#37a7f0] hover:bg-[#2a8bc9]">
          <i className="fa-solid fa-play mr-2"></i>
          {solved > 0 && solved < group.questions.length ? `이어서 풀기 (${solved}/${group.questions.length})` : '순서대로 풀기'}
        </button>
        <button
          onClick={() => onStart(true)}
          className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-[#37a7f0] hover:text-[#37a7f0]"
        >
          <i className="fa-solid fa-shuffle mr-2"></i>랜덤으로 풀기
        </button>
        <button
          onClick={onWrong}
          disabled={wrongCount === 0}
          className="px-6 py-3 rounded-lg border border-[#e74c3c] bg-white text-[#e74c3c] hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-white disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-circle-xmark mr-2"></i>틀린 문제만 보기 ({wrongCount})
        </button>
      </div>
    </div>
  );
}

// 주제별 연습: 영역 목록 → 영역 설명 → 문제 풀기 → 틀린 문제만 보기
export function ChapterPracticePage({ onBack, selectedCity }: { onBack: () => void; selectedCity: string }) {
  const { data, failed } = useDriverLicenseData();
  const [view, setView] = useState<StageView>({ mode: 'list' });
  useDriverLicenseRecords();

  const sections = useMemo(() => {
    if (!data) return [];
    return [
      {
        title: '',
        note: '',
        groups: data.chapters.map((chapter) => ({
          key: `a${chapter.id}`,
          title: `제${chapter.id}장 ${chapter.title}`,
          questions: data.questions.filter((q) => q.c === chapter.id),
        })),
      },
      {
        title: '그림 문제 집중 연습',
        note: '실제 시험 100문제 중 절반 이상이 그림(상황 그림·계기판), 교통 표지, 신호등·교통경찰 수신호 문제입니다.',
        groups: (['pic', 'sign', 'sig'] as DLKind[]).map((kind) => ({
          key: `k-${kind}`,
          title: KIND_LABEL[kind],
          questions: data.questions.filter((q) => kindOf(q) === kind),
        })),
      },
    ];
  }, [data]);

  if (!data) return <LoadingState failed={failed} onBack={onBack} />;

  if (view.mode === 'intro') {
    const { group } = view;
    return (
      <StageIntro
        group={group}
        info={STAGE_INFO[group.key]}
        onBack={() => setView({ mode: 'list' })}
        onWrong={() => setView({ mode: 'wrong', group })}
        onStart={(random) =>
          setView({ mode: 'quiz', group, random, questions: random ? shuffle(group.questions) : group.questions, key: Date.now() })
        }
      />
    );
  }

  if (view.mode === 'quiz') {
    const { group } = view;
    return (
      <PracticeQuiz
        key={view.key}
        questions={view.questions}
        title={`${group.title} (${view.random ? '랜덤' : '순서대로'})`}
        breadcrumb={STAGE_BREADCRUMB}
        storageKey={view.random ? undefined : group.key}
        onBack={() => setView({ mode: 'intro', group })}
        backLabel="영역 설명으로 돌아가기"
        onReviewWrong={() => setView({ mode: 'wrong', group })}
      />
    );
  }

  if (view.mode === 'wrong') {
    const { group } = view;
    return (
      <WrongNotes
        pool={group.questions}
        title={group.title}
        breadcrumb={STAGE_BREADCRUMB}
        onBack={() => setView({ mode: 'intro', group })}
        backLabel="영역 설명으로 돌아가기"
      />
    );
  }

  const wrong = readWrong();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <BackButton onClick={onBack} label="필기시험으로 돌아가기" />

      <header className="text-center mb-12">
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">{selectedCity} 소형차 필기시험(과목1) 주제별 연습</h1>
        <p className="text-sm text-gray-500">영역 설명을 읽고 문제를 푼 뒤, 틀린 문제만 모아 다시 확인하세요</p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="mb-12">
          {section.title && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#2c3e50] mb-1">
                <i className="fa-solid fa-images mr-2 text-[#37a7f0]"></i>
                {section.title}
              </h2>
              <p className="text-sm text-gray-500">{section.note}</p>
            </div>
          )}
          <div className="border-t border-gray-100">
            {section.groups.map((group) => {
              const saved = getProgress<Progress>(group.key);
              const solved = saved ? Object.keys(saved.answers).length : 0;
              const wrongCount = group.questions.filter((q) => q.id in wrong).length;
              const info = STAGE_INFO[group.key];
              return (
                <div key={group.key} className="py-6 border-b border-gray-100">
                  <button
                    onClick={() => setView({ mode: 'intro', group })}
                    className="text-left text-base sm:text-lg font-medium text-gray-800 mb-1 hover:text-[#37a7f0]"
                  >
                    {group.title}{' '}
                    <span className="text-gray-500 font-normal text-sm sm:text-base">({group.questions.length}문제)</span>
                    {info?.isNew && <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] text-white bg-[#ff6b6b] align-middle">2026 신규</span>}
                    {solved > 0 && <span className="ml-2 text-xs text-[#37a7f0] font-normal">{solved}문제 풀이</span>}
                  </button>
                  {info && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{info.summary}</p>}
                  <div className="flex flex-wrap gap-x-10 gap-y-2 pl-2.5 text-sm text-gray-600">
                    <button
                      onClick={() => setView({ mode: 'intro', group })}
                      className="flex items-center gap-2 hover:text-[#37a7f0] before:content-['•'] before:text-gray-300 hover:before:text-[#37a7f0]"
                    >
                      영역 설명 보고 풀기
                    </button>
                    {wrongCount > 0 && (
                      <button
                        onClick={() => setView({ mode: 'wrong', group })}
                        className="flex items-center gap-2 text-[#e74c3c] hover:opacity-80 before:content-['•'] before:text-[#e74c3c]"
                      >
                        틀린 문제만 보기 ({wrongCount})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// 즐겨찾기한 문제 풀이
export function FavoritesPractice() {
  const { data, failed } = useDriverLicenseData();
  const [started, setStarted] = useState(0);
  const { version } = useDriverLicenseRecords();
  const favorites = useMemo(() => {
    if (!data) return [];
    const ids = new Set(getFavorites());
    return data.questions.filter((q) => ids.has(q.id));
  }, [data, started, version]);

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

const EXAM_TOTAL = 100;
const EXAM_JUDGE = 40; // 판단형 40 + 단일 선택형 60
const EXAM_SECONDS = 45 * 60;
const PASS_SCORE = 90;
// 문제 형태별 구성: 글 45 · 그림 상황 35 · 교통 표지 10 · 신호등·교통경찰 수신호 10
const EXAM_MIX: Record<DLKind, number> = { txt: 45, pic: 35, sign: 10, sig: 10 };
const KINDS: DLKind[] = ['txt', 'pic', 'sign', 'sig'];

type MockResult = { best: number; last: number; attempts: number; date: string };

// 같은 문제(문구·보기·그림이 모두 같은 중복 문항)는 한 번만 사용
function uniquePool(questions: DLQuestion[]) {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = `${q.t}|${q.q}|${(q.o ?? []).join('|')}|${(q.img ?? []).join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 장별 출제 수: 장의 문제 수에 비례하되, 문제가 있는 장은 최소 1문제씩 (합계 = total)
function allocate(sizes: number[], total: number) {
  const sum = sizes.reduce((a, b) => a + b, 0);
  const raw = sizes.map((n) => (n * total) / sum);
  const quota = raw.map((r, i) => (sizes[i] > 0 ? Math.min(sizes[i], Math.max(1, Math.floor(r))) : 0));
  const byRemainder = raw.map((_, i) => i).sort((a, b) => (raw[b] % 1) - (raw[a] % 1));
  let diff = total - quota.reduce((a, b) => a + b, 0);
  for (let k = 0; diff > 0 && k < byRemainder.length * total; k++) {
    const i = byRemainder[k % byRemainder.length];
    if (quota[i] < sizes[i]) {
      quota[i]++;
      diff--;
    }
  }
  while (diff < 0) {
    const i = quota.indexOf(Math.max(...quota));
    quota[i]--;
    diff++;
  }
  return quota;
}

// 문제 묶음을 장별로 나누고, 회차마다 장별로 정해진 수만큼 돌아가며 뽑음
function examPlan(pool: DLQuestion[], total: number, seed: number) {
  if (pool.length === 0 || total <= 0) return () => [] as DLQuestion[];
  const chapters = [...new Set(pool.map((q) => q.c))].sort((a, b) => a - b);
  const groups = chapters.map((c) => shuffle(pool.filter((q) => q.c === c), seed + c));
  const quotas = allocate(groups.map((g) => g.length), total);
  return (round: number) =>
    groups.flatMap((group, i) => Array.from({ length: quotas[i] }, (_, j) => group[(round * quotas[i] + j) % group.length]));
}

// 형태(글·그림·표지·신호)마다 판단형/선택형 수를 정함: 그림·표지·신호는 각 묶음의 판단형 비율대로,
// 나머지 판단형은 글 문제로 채워 전체 판단형 40 · 선택형 60을 맞춤
function examDraws(questions: DLQuestion[], seed: number) {
  const pool = uniquePool(questions);
  const judges: Record<DLKind, number> = { txt: 0, pic: 0, sign: 0, sig: 0 };
  for (const kind of KINDS.slice(1)) {
    const items = pool.filter((q) => kindOf(q) === kind);
    judges[kind] = Math.round((EXAM_MIX[kind] * items.filter((q) => q.t === 'j').length) / items.length);
  }
  judges.txt = EXAM_JUDGE - judges.pic - judges.sign - judges.sig;
  return KINDS.flatMap((kind, i) =>
    (['j', 's'] as const).map((type, j) => ({
      type,
      draw: examPlan(
        pool.filter((q) => kindOf(q) === kind && q.t === type),
        type === 'j' ? judges[kind] : EXAM_MIX[kind] - judges[kind],
        seed + (i * 2 + j) * 101,
      ),
    })),
  );
}

// 판단형 40문제 → 단일 선택형 60문제 순서, 각 안에서는 섞음
function assembleExam(draws: ReturnType<typeof examDraws>, round: number, seed: number) {
  const pick = (type: DLQuestion['t'], s: number) => shuffle(draws.filter((d) => d.type === type).flatMap((d) => d.draw(round)), s);
  return [...pick('j', seed), ...pick('s', seed + 1)];
}

// 회차별 고정 문제 (전체 문제 수 ÷ 100 회분): 형태·단계별로 골고루, 큰 묶음은 회차끼리 겹치지 않음
function buildExamSets(questions: DLQuestion[]) {
  const draws = examDraws(questions, 2026);
  const count = Math.floor(uniquePool(questions).length / EXAM_TOTAL);
  return Array.from({ length: count }, (_, k) => assembleExam(draws, k, 100 + k * 2));
}

function buildRandomExam(questions: DLQuestion[]) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  return assembleExam(examDraws(questions, seed), 0, seed);
}

type ExamSession = { no: number | null; questions: DLQuestion[]; answers: Record<number, number>; startedAt: number };
type ExamOutcome = ExamSession & { score: number; seconds: number };

export function MockExamPage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useDriverLicenseData();
  const sets = useMemo(() => (data ? buildExamSets(data.questions) : []), [data]);
  const [results, setResults] = useState<Record<string, MockResult>>(() => getMockResults<MockResult>());
  const { version } = useDriverLicenseRecords();
  useEffect(() => setResults(getMockResults<MockResult>()), [version]);
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
    recordAnswers(
      finished.questions
        .map((q, i) => ({ id: q.id, selected: finished.answers[i], correct: finished.answers[i] === q.a }))
        .filter((r) => r.selected !== undefined),
    );
    const seconds = Math.min(EXAM_SECONDS, Math.round((Date.now() - finished.startedAt) / 1000));
    if (finished.no !== null) {
      const key = String(finished.no);
      const prev = getMockResults<MockResult>()[key];
      setMockResult(key, {
        best: Math.max(prev?.best ?? 0, score),
        last: score,
        attempts: (prev?.attempts ?? 0) + 1,
        date: new Date().toLocaleDateString('ko-KR'),
      });
      setResults(getMockResults<MockResult>());
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
        chapters={data.chapters}
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
        <p className="text-sm text-gray-500">
          실제 시험과 같은 방식으로 100문제를 풀어 보세요. 회차마다 주제별 연습의 모든 단계에서 골고루 출제됩니다.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { icon: 'fa-list-check', label: '문제 수', value: '100문제', sub: `판단형 ${EXAM_JUDGE} · 단일 선택형 ${EXAM_TOTAL - EXAM_JUDGE}` },
          { icon: 'fa-images', label: '문제 형태', value: `그림 포함 ${EXAM_TOTAL - EXAM_MIX.txt}문제`, sub: KINDS.map((k) => `${KIND_SHORT[k]} ${EXAM_MIX[k]}`).join(' · ') },
          { icon: 'fa-clock', label: '시험 시간', value: '45분', sub: '시간이 끝나면 자동 제출' },
          { icon: 'fa-award', label: '합격 기준', value: `${PASS_SCORE}점 이상`, sub: '100점 만점, 오답 10문제까지' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <i className={`fa-solid ${item.icon} text-xl mb-2`} style={{ color: PRIMARY }}></i>
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-sm sm:text-base font-medium text-gray-800">{item.value}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-10 leading-relaxed">
        과목1은 판단형과 단일 선택형 두 가지 유형만 출제됩니다. 2026년 개편 내용에 맞춰 그림(상황 그림·계기판), 교통 표지·노면
        표시, 신호등·교통경찰 수신호 문제를 합쳐 회차마다 55문제를 넣었고, 신에너지차·스마트 보조 주행 문제도 회차마다 포함됩니다.
      </p>

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
  const [showSheet, setShowSheet] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const latest = useRef(session);
  latest.current = session;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const remaining = EXAM_SECONDS - Math.floor((now - session.startedAt) / 1000);
  const answeredCount = Object.keys(session.answers).length;
  const q = session.questions[index];
  const total = session.questions.length;
  const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled;

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

  // 시험 화면이 열려 있는 동안 뒤 페이지가 스크롤되지 않게, 끝나면 전체 화면도 해제
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onFullscreen = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('fullscreenchange', onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const select = (i: number) => {
    onChange({ ...latest.current, answers: { ...latest.current.answers, [index]: i } });
    if (index < total - 1) window.setTimeout(() => setIndex((cur) => (cur === index ? index + 1 : cur)), 250);
  };

  // 키보드: ← → 이전·다음 문제, 1~4 또는 A~D 로 답 고르기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return;
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(total - 1, i + 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      else {
        const choice = Math.max('1234'.indexOf(e.key), 'abcd'.indexOf(e.key.toLowerCase()));
        if (choice >= 0 && choice < optionsOf(q).length) select(choice);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const submit = () => {
    const left = total - answeredCount;
    const message = left > 0 ? `아직 풀지 않은 문제가 ${left}개 있습니다. 그래도 제출할까요?` : '답안을 제출할까요?';
    if (window.confirm(message)) onSubmit(session);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else rootRef.current?.requestFullscreen().catch(() => {});
  };

  const judgeCount = session.questions.filter((item) => item.t === 'j').length;
  const sheetCell = (i: number) =>
    `aspect-square rounded border text-[11px] sm:text-xs flex items-center justify-center hover:border-[#37a7f0] ${
      i === index
        ? 'bg-[#37a7f0] border-[#37a7f0] text-white font-bold'
        : session.answers[i] !== undefined
          ? 'bg-blue-50 border-[#37a7f0] text-[#2a8bc9]'
          : 'bg-white border-gray-300 text-gray-600'
    }`;
  const sheetGroups = [
    { title: `판단형 1~${judgeCount}번`, from: 0, to: judgeCount },
    { title: `단일 선택형 ${judgeCount + 1}~${total}번`, from: judgeCount, to: total },
  ].filter((group) => group.to > group.from);

  const sheet = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-gray-800">
          답안지 <span className="text-sm font-normal text-gray-500">({answeredCount}/{total})</span>
        </span>
        <span className="text-xs text-gray-500">
          <span className="inline-block w-2.5 h-2.5 mr-1 rounded-sm bg-blue-50 border border-[#37a7f0] align-middle"></span>답함
          <span className="inline-block w-2.5 h-2.5 ml-2.5 mr-1 rounded-sm bg-white border border-gray-300 align-middle"></span>안 풂
        </span>
      </div>
      {sheetGroups.map((group) => (
        <div key={group.title} className="mb-3 last:mb-0">
          <div className="text-xs text-gray-500 mb-1.5">{group.title}</div>
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
            {session.questions.slice(group.from, group.to).map((item, offset) => {
              const i = group.from + offset;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setIndex(i);
                    setShowSheet(false);
                  }}
                  className={sheetCell(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={submit} className="w-full mt-4 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9]">
        답안 제출 ({answeredCount}/{total})
      </button>
    </>
  );

  // 시험 화면: 사이트 메뉴를 덮는 전체 화면 창 (위: 시간·제출, 왼쪽: 문제, 오른쪽: 답안지)
  return (
    <div ref={rootRef} className="fixed inset-0 z-[1000] bg-white flex flex-col" role="dialog" aria-modal="true" aria-label="모의고사 시험 화면">
      <div className="flex-none flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-2.5 border-b border-gray-200 bg-[#f7fbfe]">
        <span className="font-medium text-gray-800">{session.no === null ? '랜덤 모의고사' : `제${session.no}회 모의고사`}</span>
        <span className="hidden sm:inline text-sm text-gray-500">
          {answeredCount}/{total} 답함
        </span>
        <span
          className={`ml-auto font-mono text-lg px-3 py-1 rounded ${remaining <= 300 ? 'bg-red-50 text-[#e74c3c]' : 'bg-white text-gray-800'}`}
        >
          <i className="fa-regular fa-clock mr-1.5"></i>
          {formatTime(remaining)}
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowSheet((v) => !v)}
            className="lg:hidden flex-1 sm:flex-none whitespace-nowrap px-3 py-1.5 rounded border border-[#37a7f0] text-sm text-[#2a8bc9] bg-white"
          >
            답안지 {answeredCount}/{total}
          </button>
          {canFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="hidden sm:inline-block px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:border-[#37a7f0] hover:text-[#2a8bc9]"
            >
              <i className={`fa-solid ${fullscreen ? 'fa-compress' : 'fa-expand'} mr-1`}></i>
              {fullscreen ? '전체 화면 끝' : '전체 화면'}
            </button>
          )}
          <button onClick={submit} className="flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-1.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] text-sm">
            답안 제출
          </button>
          <button
            onClick={onExit}
            className="flex-1 sm:flex-none whitespace-nowrap px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:border-[#e74c3c] hover:text-[#e74c3c]"
          >
            그만두기
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex relative">
        <div className="flex-1 min-w-0 flex flex-col">
          <div ref={panelRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
            <div className="max-w-[1100px] mx-auto">
              <QuestionCard
                q={q}
                label={`${index + 1}.`}
                selected={session.answers[index] === undefined ? [] : [session.answers[index]]}
                reveal={false}
                onSelect={select}
                exam
              />
            </div>
          </div>
          <div className="flex-none border-t border-gray-200 px-4 sm:px-8 py-2.5">
            <div className="max-w-[1100px] mx-auto flex items-center gap-3">
              <span className="hidden md:inline text-sm text-gray-400 mr-auto">
                {TYPE_HINT[q.t]} <span className="ml-2">키보드: ← → 이동, 1~{optionsOf(q).length} 답 고르기</span>
              </span>
              <button
                onClick={() => setIndex(index - 1)}
                disabled={index === 0}
                className="flex-1 md:flex-none px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                이전 문제
              </button>
              <button
                onClick={() => setIndex(index + 1)}
                disabled={index === total - 1}
                className="flex-1 md:flex-none px-6 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음 문제
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block w-[340px] shrink-0 overflow-y-auto p-5 bg-gray-50 border-l border-gray-200">{sheet}</aside>

        {showSheet && (
          <div className="lg:hidden absolute inset-0 z-10 bg-black/30" onClick={() => setShowSheet(false)}>
            <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto p-4 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
              {sheet}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExamResult({
  outcome,
  chapters,
  onRetry,
  onList,
}: {
  outcome: ExamOutcome;
  chapters: DLChapter[];
  onRetry: () => void;
  onList: () => void;
}) {
  const passed = outcome.score >= PASS_SCORE;
  const tally = (key: string, label: string, match: (q: DLQuestion) => boolean) => {
    const items = outcome.questions.map((q, i) => ({ q, i })).filter(({ q }) => match(q));
    return { key, label, total: items.length, correct: items.filter(({ q, i }) => outcome.answers[i] === q.a).length };
  };
  const byKind = KINDS.map((kind) => tally(kind, KIND_LABEL[kind], (q) => kindOf(q) === kind)).filter((row) => row.total > 0);
  const byChapter = chapters
    .map((chapter) => tally(String(chapter.id), `제${chapter.id}장 ${chapter.title}`, (q) => q.c === chapter.id))
    .filter((row) => row.total > 0);
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

      {[
        { title: '문제 형태별 결과', rows: byKind },
        { title: '단계별 결과', rows: byChapter },
      ].map((section) => (
        <div key={section.title}>
          <h3 className="text-lg font-medium text-gray-800 mb-3">{section.title}</h3>
          <div className="mb-8 border border-gray-200 rounded-lg divide-y divide-gray-100">
            {section.rows.map(({ key, label, total, correct }) => (
              <div key={key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="flex-1 text-gray-700">{label}</span>
                <div className="hidden sm:block w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${correct === total ? 'bg-[#2ecc71]' : 'bg-[#37a7f0]'}`}
                    style={{ width: `${(correct / total) * 100}%` }}
                  ></div>
                </div>
                <span className="w-16 text-right text-gray-600">
                  {correct}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

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
