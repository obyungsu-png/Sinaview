// 만점 교육 (满分学习考试): 1년(벌점 주기)에 벌점 12점이 되면 받는 교육·시험
// - 형식은 과목1과 같지만(100문제·45분·90점) 시험은 중국어로만 보고, 법규·처벌·사고 사례·안전 문명·응급처치 비중이 큼
// - 그래서 이 탭의 문제는 모두 중국어 원문으로 내고, '번역'을 누르면 한국어가 보이게 함
// - 데이터: data/driverLicenseFullScore.json (문제은행 중국어 원문 + 만점 교육 추가 문제 + 주제 + 핵심 한자 단어)
import { useEffect, useMemo, useState } from 'react';
import {
  BackButton,
  EXAM_SECONDS,
  ExamResult,
  ExamRunner,
  LoadingState,
  PASS_SCORE,
  PracticeQuiz,
  WrongNotes,
  shuffle,
  useDriverLicenseData,
  type DLData,
  type DLQuestion,
  type ExamOutcome,
  type ExamSession,
  type MockResult,
  type Progress,
} from './DriverLicenseQuiz';
import { getMockResults, getProgress, getWrongMap, recordAnswers, setMockResult, setProgress, useDriverLicenseRecords } from '../utils/driverLicenseRecords';

type FSTopicRaw = { key: string; zh: string; ko: string; desc: string; ids: number[] };
type FSVocab = { g: string; zh: string; py: string; ko: string; n: number; tip?: string };
type FSRaw = {
  zh: Record<string, [string] | [string, string[]]>;
  extra: DLQuestion[];
  topics: FSTopicRaw[];
  mix: [string, number][];
  core: number[];
  vocab: FSVocab[];
};
type FSTopic = FSTopicRaw & { questions: DLQuestion[] };
type FSData = { questions: DLQuestion[]; topics: FSTopic[]; topicOf: Map<number, string>; mix: [string, number][]; core: DLQuestion[]; vocab: FSVocab[] };

let rawCache: FSRaw | null = null;
let rawPromise: Promise<FSRaw> | null = null;
function loadRaw() {
  if (rawCache) return Promise.resolve(rawCache);
  if (!rawPromise) {
    rawPromise = import('../data/driverLicenseFullScore.json')
      .then((m) => (rawCache = m.default as unknown as FSRaw))
      .catch((err) => {
        rawPromise = null;
        throw err;
      });
  }
  return rawPromise;
}

// 문제은행(한국어)에 중국어 원문을 입히고, 한국어는 번역(ko)으로 옮김
function buildFullScore(data: DLData, raw: FSRaw): FSData {
  const questions = data.questions
    .map((q): DLQuestion => {
      const z = raw.zh[q.id];
      if (!z) return q;
      return { ...q, q: z[0], o: q.t === 's' ? z[1] : undefined, ko: { q: q.q, o: q.o } };
    })
    .concat(raw.extra);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const pick = (ids: number[]) => ids.map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q);
  const topics = raw.topics.map((t) => ({ ...t, questions: pick(t.ids) }));
  const topicOf = new Map<number, string>();
  for (const t of topics) for (const id of t.ids) topicOf.set(id, t.key);
  return { questions, topics, topicOf, mix: raw.mix, core: pick(raw.core), vocab: raw.vocab };
}

function useFullScoreData() {
  const { data, failed } = useDriverLicenseData();
  const [raw, setRaw] = useState<FSRaw | null>(rawCache);
  const [rawFailed, setRawFailed] = useState(false);
  useEffect(() => {
    if (raw) return;
    let alive = true;
    loadRaw()
      .then((r) => alive && setRaw(r))
      .catch(() => alive && setRawFailed(true));
    return () => {
      alive = false;
    };
  }, [raw]);
  const fs = useMemo(() => (data && raw ? buildFullScore(data, raw) : null), [data, raw]);
  return { fs, failed: failed || rawFailed };
}

const BREADCRUMB = '홈 > 만점 교육';
const EXAM_KEY = 'fs-exam';
const VOCAB_KEY = 'fs-vocab';
const CORE_KEY = 'fs-core';
// 실전 모의고사: 앞쪽은 일반 과목1과 비슷한 문제, 뒤쪽은 만점 교육 중점 문제 (실제 후기와 같은 순서)
const FRONT_TOPICS = new Set(['road', 'signal', 'license']);
const FOCUS_TOPICS = new Set(['rules', 'penalty', 'cases', 'civil', 'aid']);

function buildExam(fs: FSData) {
  const byKey = new Map(fs.topics.map((t) => [t.key, t.questions]));
  const take = ([key, n]: [string, number]) => shuffle(byKey.get(key) ?? []).slice(0, n);
  const front = shuffle(fs.mix.filter(([k]) => FRONT_TOPICS.has(k)).flatMap(take));
  const back = shuffle(fs.mix.filter(([k]) => !FRONT_TOPICS.has(k)).flatMap(take));
  return [...front, ...back];
}

type View =
  | { mode: 'home' }
  | { mode: 'topics' }
  | { mode: 'exam' }
  | { mode: 'fast' }
  | { mode: 'vocab' }
  | { mode: 'quiz'; title: string; questions: DLQuestion[]; storageKey?: string; pool: DLQuestion[]; from: 'topics' | 'fast'; key: number }
  | { mode: 'wrong'; title: string; pool: DLQuestion[]; from: 'topics' | 'fast' };

const btn = {
  primary: 'px-4 py-2 rounded-lg text-[15px] text-white bg-[#37a7f0] hover:bg-[#2a8bc9]',
  plain: 'px-4 py-2 rounded-lg text-[15px] border border-gray-300 text-gray-700 bg-white hover:border-[#37a7f0] hover:text-[#37a7f0]',
  danger: 'px-4 py-2 rounded-lg text-[15px] border border-[#e74c3c] text-[#e74c3c] bg-white hover:bg-red-50',
};

export function FullScorePage({ onBack }: { onBack: () => void }) {
  const { fs, failed } = useFullScoreData();
  const [view, setView] = useState<View>({ mode: 'home' });
  const [session, setSession] = useState<ExamSession | null>(null);
  const [outcome, setOutcome] = useState<ExamOutcome | null>(null);
  useDriverLicenseRecords();

  useEffect(() => window.scrollTo({ top: 0 }), [view.mode]);

  if (!fs) return <LoadingState failed={failed} onBack={onBack} />;

  const go = (next: View) => setView(next);
  const startExam = () => {
    setOutcome(null);
    setSession({ no: null, title: '만점 교육 실전 모의고사', questions: buildExam(fs), answers: {}, startedAt: Date.now() });
  };
  const finishExam = (finished: ExamSession) => {
    const score = finished.questions.filter((q, i) => finished.answers[i] === q.a).length;
    recordAnswers(
      finished.questions
        .map((q, i) => ({ id: q.id, selected: finished.answers[i], correct: finished.answers[i] === q.a }))
        .filter((r) => r.selected !== undefined),
    );
    const prev = getMockResults<MockResult>()[EXAM_KEY];
    setMockResult(EXAM_KEY, {
      best: Math.max(prev?.best ?? 0, score),
      last: score,
      attempts: (prev?.attempts ?? 0) + 1,
      date: new Date().toLocaleDateString('ko-KR'),
    });
    setSession(null);
    setOutcome({ ...finished, score, seconds: Math.min(EXAM_SECONDS, Math.round((Date.now() - finished.startedAt) / 1000)) });
    window.scrollTo({ top: 0 });
  };

  if (session) {
    return (
      <ExamRunner
        session={session}
        onChange={setSession}
        onSubmit={finishExam}
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
        chapters={[]}
        onRetry={startExam}
        onList={() => {
          setOutcome(null);
          go({ mode: 'exam' });
        }}
        listLabel="만점 교육 모의고사로"
        groups={{ title: '주제별 결과', rows: fs.topics.map((t) => ({ key: t.key, label: `${t.ko} (${t.zh})`, ids: new Set(t.ids) })) }}
      />
    );
  }

  if (view.mode === 'quiz') {
    const backTo: View = { mode: view.from };
    return (
      <PracticeQuiz
        key={view.key}
        questions={view.questions}
        title={view.title}
        breadcrumb={view.from === 'fast' ? `${BREADCRUMB} > 속성 과정` : `${BREADCRUMB} > 주제별 연습`}
        storageKey={view.storageKey}
        onBack={() => go(backTo)}
        backLabel={view.from === 'fast' ? '속성 과정으로 돌아가기' : '주제별 연습으로 돌아가기'}
        onReviewWrong={() => go({ mode: 'wrong', title: view.title, pool: view.pool, from: view.from })}
      />
    );
  }
  if (view.mode === 'wrong') {
    return (
      <WrongNotes
        pool={view.pool}
        title={view.title}
        breadcrumb={BREADCRUMB}
        onBack={() => go({ mode: view.from })}
        backLabel={view.from === 'fast' ? '속성 과정으로 돌아가기' : '주제별 연습으로 돌아가기'}
      />
    );
  }
  if (view.mode === 'topics') return <TopicsPage fs={fs} onBack={() => go({ mode: 'home' })} onStart={go} />;
  if (view.mode === 'exam') return <ExamHome fs={fs} onBack={() => go({ mode: 'home' })} onStart={startExam} />;
  if (view.mode === 'vocab') return <VocabCards vocab={fs.vocab} onBack={() => go({ mode: 'fast' })} />;
  if (view.mode === 'fast') return <FastHome fs={fs} onBack={() => go({ mode: 'home' })} onGo={go} onExam={startExam} />;
  return <GuideHome onGo={go} />;
}

// ───────── 안내 (첫 화면) ─────────
const COMPARE: [string, string, string][] = [
  ['문제 수', '100문제', '100문제'],
  ['시험 시간', '45분', '45분'],
  ['합격 기준', '90점', '90점'],
  ['문제 유형', '판단형 + 단일 선택형', '판단형 + 단일 선택형 (C1은 다중 선택 없음)'],
  ['시험 언어', '중국어 (지역에 따라 외국어 선택 가능)', '중국어만'],
  ['응시 조건', '학습 기록만 등록하면 예약 가능', '7일 만점 교육을 먼저 끝내야 예약 가능 (현장 2일 이상 + 온라인 포함 5일 이상, 나머지는 자율 학습)'],
  ['출제 내용', '기본 이론, 차량 상식, 표지·노면 표시 위주', '기본 법규 + 실제 사고 사례 경고 + 안전·문명 상식 + 응급처치 + 새 규정'],
];

const STEPS: { title: string; desc: string }[] = [
  { title: '벌점 12점', desc: '면허증 압수, "만점 교육 통지서" 받음 (30일 안에 안 받으면 면허 사용 정지)' },
  { title: '7일 교육', desc: '交管12123 앱 "满分学习考试"에서 신청. 현장 2일 이상, 현장+온라인 5일 이상 (하루 3시간 = 1일)' },
  { title: '시험 예약·응시', desc: '100문제 45분, 90점 이상 합격. 중국어로만 출제' },
  { title: '불합격하면', desc: '10일 뒤에 다시 예약' },
  { title: '면허 반환', desc: '합격 + 벌금 납부를 마치면 벌점이 지워지고 면허증을 돌려받음' },
];

function GuideHome({ onGo }: { onGo: (view: View) => void }) {
  const exam = getMockResults<MockResult>()[EXAM_KEY];
  const cards = [
    {
      view: { mode: 'topics' } as View,
      icon: 'fa-book-open',
      color: '#ff6b6b',
      title: '주제별 연습',
      desc: '만점 교육에 많이 나오는 주제부터\n중국어 문제 + 한국어 번역',
    },
    {
      view: { mode: 'exam' } as View,
      icon: 'fa-pen-to-square',
      color: '#37a7f0',
      title: '실전 모의고사',
      desc: exam ? `최고 ${exam.best}점 · ${exam.attempts}회 응시` : '실제처럼 중국어로만\n100문제 · 45분',
    },
    {
      view: { mode: 'fast' } as View,
      icon: 'fa-bolt',
      color: '#f39c12',
      title: '⚡ 속성 과정',
      desc: '핵심 한자 단어 → 핵심 문제\n→ 실전 모의고사',
      hot: true,
    },
  ];
  return (
    <div className="max-w-[1100px] mx-auto px-4 pb-12">
      <div className="py-4 text-sm text-gray-500">현재 위치: {BREADCRUMB}</div>

      <div className="bg-gray-50 border border-gray-200 p-4 sm:p-8 mb-5 rounded sm:rounded-none">
        <h2 className="text-lg sm:text-2xl mb-3 text-gray-900 font-medium sm:font-normal text-center">
          만점 교육 시험 <span className="text-gray-500 text-base sm:text-xl">(满分学习考试 · 소형차 C1)</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {['100문제', '45분', '90점 이상 합격', '중국어로만 출제'].map((fact) => (
            <span
              key={fact}
              className={`px-2.5 py-1 rounded-full border text-xs sm:text-sm ${
                fact === '중국어로만 출제' ? 'bg-[#fdf0ef] border-[#f1b7b1] text-[#c0392b] font-medium' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {fact}
            </span>
          ))}
        </div>
        <p className="text-sm sm:text-[15px] text-gray-700 leading-relaxed">
          1년(벌점 주기) 안에 벌점이 12점이 되면 면허증을 압수당하고, 7일 동안 만점 교육을 받은 뒤 이 시험에 합격해야 면허증을 돌려받습니다. 외국인도 이 시험은{' '}
          <b>중국어로만</b> 볼 수 있어서, 여기 있는 모든 문제는 실제 시험처럼 중국어 원문으로 나오고 <b>[번역]</b>을 누르면 한국어가 보입니다.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-10">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onGo(card.view)}
            className={`relative flex flex-col justify-center items-center text-center cursor-pointer hover:-translate-y-1 transition-all rounded shadow-sm hover:shadow-md p-4 sm:p-6 ${
              card.hot ? 'col-span-2 sm:col-span-1 bg-[#fff8ec] border border-[#f7d9a8] hover:bg-[#fff1da]' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {card.hot && <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#f39c12] text-white text-[11px]">시간 없을 때</span>}
            <i className={`fa-solid ${card.icon} text-4xl sm:text-5xl mb-2 sm:mb-3`} style={{ color: card.color }}></i>
            <span className="text-base sm:text-lg font-medium text-gray-700 sm:mb-2">{card.title}</span>
            <span className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{card.desc}</span>
          </button>
        ))}
      </div>

      <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3">한눈에 보는 핵심 비교</h3>
      <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-[13px] sm:text-[15px] table-fixed">
          <thead className="bg-[#eef7fe] text-gray-700">
            <tr>
              <th className="w-[22%] sm:w-[16%] px-2.5 sm:px-4 py-2.5 text-left font-medium">비교 항목</th>
              <th className="px-2.5 sm:px-4 py-2.5 text-left font-medium">일반 과목1</th>
              <th className="px-2.5 sm:px-4 py-2.5 text-left font-medium text-[#c0392b]">만점 교육 시험</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {COMPARE.map(([item, normal, full]) => (
              <tr key={item} className="align-top">
                <td className="px-2.5 sm:px-4 py-2.5 text-gray-500">{item}</td>
                <td className="px-2.5 sm:px-4 py-2.5 text-gray-700">{normal}</td>
                <td className={`px-2.5 sm:px-4 py-2.5 ${normal === full ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>{full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8 p-4 sm:p-6 rounded-lg bg-[#fff8e1] border border-[#f7d9a8]">
        <h3 className="text-base sm:text-lg font-bold text-[#b9560e] mb-2">⚠️ 가장 주의할 점: 문제은행이 완전히 같지 않아요</h3>
        <p className="text-sm sm:text-[15px] text-gray-700 mb-2">만점 교육 문제은행은 일반 과목1 문제은행을 바탕으로 이렇게 바뀌었습니다.</p>
        <ul className="flex flex-col gap-1.5 text-sm sm:text-[15px] text-gray-800 leading-relaxed mb-3">
          <li>
            <b>새 규정 문제 추가</b> — 일반 과목1 문제은행에 없을 수 있는 새 규정 문제가 나옵니다.
          </li>
          <li>
            <b>안전·문명 상식</b> — 과목4 유형의 종합 문제가 섞여 나옵니다.
          </li>
          <li>
            <b>실제 사고 사례 경고</b> — 실제 교통사고를 소재로 "주된 위반 행위"를 묻는 문제가 나옵니다.
          </li>
          <li>
            <b>실전 후기</b> — 일반 과목1 모의고사는 10번 중 8번 넘게 붙었는데, 실제 시험은 앞 20~30문제만 비슷하고 뒤쪽은 처음 보는 문제라 당황했다는 경우가
            많습니다.
          </li>
        </ul>
        <p className="text-sm sm:text-[15px] text-gray-800">
          <b>한마디로</b> 형식은 같지만 문제가 "더 실전적"이고 "더 경고적"입니다. 그래서 이 탭은 <b>법규·처벌, 만점·벌점 제도, 사고 사례, 안전·문명, 응급처치</b>{' '}
          위주로 다시 골랐고, 모의고사도 실제처럼 뒤쪽 70문제를 이 주제로 냅니다.
        </p>
      </div>

      <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-3">만점 교육 절차</h3>
      <ol className="grid sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex sm:flex-col gap-3 sm:gap-2 p-3 sm:p-4 rounded-lg border border-gray-200 bg-white">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#37a7f0] text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
            <div>
              <div className="font-medium text-gray-800 mb-0.5">{step.title}</div>
              <div className="text-[13px] text-gray-600 leading-relaxed">{step.desc}</div>
            </div>
          </li>
        ))}
      </ol>
      <ul className="mb-6 flex flex-col gap-1 text-[13px] sm:text-sm text-gray-600 leading-relaxed">
        <li>• 같은 주기에 두 번째 만점이면 학습이 7일 늘고, 시험 합격 뒤 도로 주행(과목3)도 다시 봅니다. 세 번째부터는 과목2·과목3을 모두 다시 봅니다.</li>
        <li>• 아직 12점이 안 됐다면 학법감점(学法减分)으로 한 주기에 최대 6점까지 줄일 수 있습니다. (온라인 30분+시험 = 1점, 현장 1시간+시험 = 2점)</li>
        <li>• 교육·시험은 면허 발급지, 위반 발생지 또는 처리지에서 받을 수 있습니다.</li>
      </ul>
      <p className="text-xs text-gray-400 leading-relaxed">
        근거: 《道路交通安全违法行为记分管理办法》(공안부령 제163호). 지역마다 운영 방식이 조금 다를 수 있으니 交管12123 앱의 "满分学习考试"에서 꼭 확인하세요.
      </p>

    </div>
  );
}

// ───────── 주제별 연습 ─────────
function solvedOf(key: string) {
  const saved = getProgress<Progress>(key);
  return saved ? Object.keys(saved.answers).length : 0;
}

function TopicsPage({ fs, onBack, onStart }: { fs: FSData; onBack: () => void; onStart: (view: View) => void }) {
  const wrong = getWrongMap();
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <BackButton onClick={onBack} label="만점 교육으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">주제별 연습</h1>
      <p className="text-sm sm:text-[15px] text-gray-500 mb-5 leading-relaxed">
        문제는 실제 시험처럼 중국어로 나와요. 처음에는 <b>[번역]</b>을 켜고 풀고, 익숙해지면 끄고 풀어 보세요. 위쪽 <span className="text-[#d35400]">★ 중점</span> 주제가
        만점 교육 시험에 특히 많이 나옵니다.
      </p>
      <div className="flex flex-col gap-3">
        {fs.topics.map((topic) => {
          const key = `fs-${topic.key}`;
          const solved = solvedOf(key);
          const total = topic.questions.length;
          const wrongCount = topic.questions.filter((q) => q.id in wrong).length;
          const title = `${topic.ko}`;
          return (
            <div key={topic.key} className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                {FOCUS_TOPICS.has(topic.key) && <span className="text-xs text-[#d35400] font-medium">★ 중점</span>}
                <h2 className="text-[17px] font-bold text-gray-800">{topic.ko}</h2>
                <span className="text-sm text-gray-500">{topic.zh}</span>
                <span className="ml-auto text-xs text-gray-400">{total}문제</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{topic.desc}</p>
              {topic.key === 'cases' && (
                <p className="text-xs text-gray-400 mb-1">사례 문제는 실제 시험의 사례형 문제와 같은 형식으로 이 사이트에서 만든 연습 문제입니다.</p>
              )}
              <div className="flex items-center gap-3 my-2.5">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#37a7f0]" style={{ width: `${total ? (solved / total) * 100 : 0}%` }}></div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {solved}/{total} 풀이{wrongCount ? ` · 틀린 문제 ${wrongCount}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={btn.primary}
                  onClick={() =>
                    onStart({ mode: 'quiz', title: `${title} (순서대로)`, questions: topic.questions, storageKey: key, pool: topic.questions, from: 'topics', key: Date.now() })
                  }
                >
                  {solved > 0 && solved < total ? `이어서 풀기 (${solved}/${total})` : '순서대로 풀기'}
                </button>
                <button
                  className={btn.plain}
                  onClick={() =>
                    onStart({ mode: 'quiz', title: `${title} (랜덤)`, questions: shuffle(topic.questions), pool: topic.questions, from: 'topics', key: Date.now() })
                  }
                >
                  랜덤으로 풀기
                </button>
                {wrongCount > 0 && (
                  <button className={btn.danger} onClick={() => onStart({ mode: 'wrong', title, pool: topic.questions, from: 'topics' })}>
                    틀린 문제만 ({wrongCount})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 실전 모의고사 ─────────
function ExamHome({ fs, onBack, onStart }: { fs: FSData; onBack: () => void; onStart: () => void }) {
  const result = getMockResults<MockResult>()[EXAM_KEY];
  const name = (key: string) => fs.topics.find((t) => t.key === key)?.ko ?? key;
  const front = fs.mix.filter(([k]) => FRONT_TOPICS.has(k));
  const back = fs.mix.filter(([k]) => !FRONT_TOPICS.has(k));
  const sum = (rows: [string, number][]) => rows.reduce((n, [, c]) => n + c, 0);
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <BackButton onClick={onBack} label="만점 교육으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">만점 교육 실전 모의고사</h1>
      <p className="text-sm sm:text-[15px] text-gray-500 mb-5 leading-relaxed">
        실제 시험처럼 <b>중국어로만</b> 100문제를 45분 동안 풀어요. 시험 중에는 번역을 볼 수 없고, 제출한 뒤 결과 화면에서 틀린 문제의 한국어 번역과 해설을 볼 수
        있어요. 볼 때마다 문제가 새로 뽑힙니다.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: 'fa-list-check', label: '문제 수', value: '100문제', sub: '판단형 + 단일 선택형' },
          { icon: 'fa-language', label: '시험 언어', value: '중국어만', sub: '번역은 결과 화면에서' },
          { icon: 'fa-clock', label: '시험 시간', value: '45분', sub: '시간이 끝나면 자동 제출' },
          { icon: 'fa-award', label: '합격 기준', value: `${PASS_SCORE}점 이상`, sub: '오답 10문제까지' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <i className={`fa-solid ${item.icon} text-xl mb-2 text-[#37a7f0]`}></i>
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-sm sm:text-base font-medium text-gray-800">{item.value}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 leading-relaxed">
        <div className="font-medium text-gray-800 mb-1.5">문제 구성</div>
        <div>
          <b>앞 {sum(front)}문제</b> (일반 과목1과 비슷): {front.map(([k, n]) => `${name(k)} ${n}`).join(' · ')}
        </div>
        <div>
          <b>뒤 {sum(back)}문제</b> (만점 교육 중점): {back.map(([k, n]) => `${name(k)} ${n}`).join(' · ')}
        </div>
      </div>
      <div className="text-center">
        <button onClick={onStart} className="w-full sm:w-auto px-8 py-3 rounded-lg text-white text-[16px] bg-[#37a7f0] hover:bg-[#2a8bc9]">
          <i className="fa-solid fa-play mr-2"></i>실전 모의고사 시작
        </button>
        <div className="mt-3 text-sm text-gray-500">
          {result ? (
            <>
              최고 <b className={result.best >= PASS_SCORE ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}>{result.best}점</b> · 최근 {result.last}점 · {result.attempts}회 응시
            </>
          ) : (
            '아직 응시하지 않았어요'
          )}
        </div>
      </div>
    </div>
  );
}

// ───────── ⚡ 속성 과정 ─────────
function FastHome({ fs, onBack, onGo, onExam }: { fs: FSData; onBack: () => void; onGo: (view: View) => void; onExam: () => void }) {
  const known = getProgress<{ known: string[] }>(VOCAB_KEY)?.known.length ?? 0;
  const solved = solvedOf(CORE_KEY);
  const total = fs.core.length;
  const wrong = getWrongMap();
  const wrongCount = fs.core.filter((q) => q.id in wrong).length;
  const exam = getMockResults<MockResult>()[EXAM_KEY];
  const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);
  const title = '⚡ 만점 교육 핵심 문제';
  const steps = [
    {
      no: 1,
      title: '핵심 한자 단어',
      when: '먼저',
      desc: '시험 화면 단어(正确·错误·交卷…)와 처벌·위반 행위처럼 문제에 자주 나오는 한자를 익혀요. 문장을 다 못 읽어도 단어로 답을 찾을 수 있어요.',
      progress: pct(known, fs.vocab.length),
      status: `${known}/${fs.vocab.length}개 외움`,
      actions: [{ label: '단어 카드 보기', cls: btn.primary, onClick: () => onGo({ mode: 'vocab' }) }],
    },
    {
      no: 2,
      title: '핵심 문제',
      when: '그다음',
      desc: '정선 500문제 중 만점 교육 중점 주제(법규·처벌·안전 문명·응급처치)와 만점·벌점 제도, 사고 사례 문제를 모았어요. 번역을 켜고 한 번, 끄고 한 번 풀어 보세요.',
      progress: pct(solved, total),
      status: `${solved}/${total}문제 풀이${wrongCount ? ` · 틀린 문제 ${wrongCount}` : ''}`,
      actions: [
        {
          label: solved > 0 && solved < total ? `이어서 풀기 (${solved}/${total})` : '순서대로 풀기',
          cls: btn.primary,
          onClick: () => onGo({ mode: 'quiz', title: `${title} (순서대로)`, questions: fs.core, storageKey: CORE_KEY, pool: fs.core, from: 'fast', key: Date.now() }),
        },
        {
          label: '랜덤으로 풀기',
          cls: btn.plain,
          onClick: () => onGo({ mode: 'quiz', title: `${title} (랜덤)`, questions: shuffle(fs.core), pool: fs.core, from: 'fast', key: Date.now() }),
        },
        ...(wrongCount ? [{ label: `틀린 문제만 (${wrongCount})`, cls: btn.danger, onClick: () => onGo({ mode: 'wrong', title, pool: fs.core, from: 'fast' }) }] : []),
      ],
    },
    {
      no: 3,
      title: '실전 모의고사',
      when: '시험 전',
      desc: '실제처럼 중국어로만 100문제, 45분. 90점이 넘을 때까지 반복하세요.',
      progress: exam ? Math.min(100, exam.best) : 0,
      status: exam ? `최고 ${exam.best}점 · 최근 ${exam.last}점 (${exam.attempts}회)` : '아직 안 봤어요',
      actions: [{ label: '실전 모의고사 보기', cls: btn.primary, onClick: onExam }],
    },
  ];
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <BackButton onClick={onBack} label="만점 교육으로 돌아가기" />
      <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2">⚡ 만점 교육 속성 과정</h1>
      <p className="text-[15px] text-gray-600 leading-relaxed mb-6">시간이 없을 때 이 순서대로 하세요. 중국어가 서툴러도 핵심 단어만 알면 대부분의 문제를 풀 수 있어요.</p>
      <ol className="flex flex-col gap-4">
        {steps.map((step) => (
          <li key={step.no} className="p-4 sm:p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#f39c12] text-white font-bold flex items-center justify-center">{step.no}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                  <h2 className="text-lg font-bold text-gray-800">{step.title}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#fff4e0] text-[#d35400] text-xs">{step.when}</span>
                </div>
                <p className="text-[15px] text-gray-600 leading-relaxed mb-3">{step.desc}</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-[#f39c12]" style={{ width: `${step.progress}%` }}></div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">{step.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {step.actions.map((action) => (
                    <button key={action.label} onClick={action.onClick} className={action.cls}>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ───────── ① 핵심 한자 단어 카드 ─────────
function VocabCards({ vocab, onBack }: { vocab: FSVocab[]; onBack: () => void }) {
  useDriverLicenseRecords();
  const groups = ['전체', ...Array.from(new Set(vocab.map((v) => v.g)))];
  const [group, setGroup] = useState('전체');
  const [hideMeaning, setHideMeaning] = useState(false);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [, rerender] = useState(0);
  const known = new Set(getProgress<{ known: string[] }>(VOCAB_KEY)?.known ?? []);
  const toggleKnown = (word: string) => {
    const next = new Set(known);
    if (next.has(word)) next.delete(word);
    else next.add(word);
    setProgress(VOCAB_KEY, { known: Array.from(next) });
    rerender((n) => n + 1);
  };
  const reveal = (word: string) => setOpened((prev) => new Set(prev).add(word));
  const list = vocab.filter((v) => group === '전체' || v.g === group);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <BackButton onClick={onBack} label="속성 과정으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">① 핵심 한자 단어</h1>
      <p className="text-sm text-gray-500 mb-4">
        시험 문제에 자주 나오는 단어예요. 숫자는 문제은행에 나오는 문제 수입니다. ({known.size}/{vocab.length}개 외움)
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`shrink-0 px-3 py-1.5 rounded-full border text-sm ${group === g ? 'bg-[#37a7f0] border-[#37a7f0] text-white' : 'bg-white border-gray-300 text-gray-700'}`}
          >
            {g}
          </button>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 mb-4 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={hideMeaning}
          onChange={(e) => {
            setHideMeaning(e.target.checked);
            setOpened(new Set());
          }}
        />
        뜻 가리고 스스로 확인하기 (카드를 누르면 뜻이 보여요)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((v) => {
          const isKnown = known.has(v.zh);
          const covered = hideMeaning && !opened.has(v.zh);
          return (
            <div
              key={v.zh}
              onClick={() => covered && reveal(v.zh)}
              className={`flex flex-col p-3 sm:p-4 rounded-lg border ${isKnown ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-white'} ${covered ? 'cursor-pointer' : ''}`}
            >
              <div className="text-[22px] sm:text-2xl font-medium text-gray-900 leading-snug break-all">{v.zh}</div>
              <div className="text-[13px] text-gray-400 mb-1.5">{v.py}</div>
              {covered ? (
                <div className="flex-1 text-sm text-[#2a8bc9]">뜻 보기</div>
              ) : (
                <div className="flex-1">
                  <div className="text-[15px] text-gray-800 leading-snug">{v.ko}</div>
                  {v.tip && <div className="mt-1 text-xs text-[#b9560e] leading-snug">⚡ {v.tip}</div>}
                </div>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                {v.n > 0 ? <span className="text-[11px] text-gray-400">문제 {v.n}개</span> : <span className="text-[11px] text-gray-400">시험 화면</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKnown(v.zh);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border ${isKnown ? 'border-green-500 text-green-700 bg-white' : 'border-gray-300 text-gray-600 bg-white hover:border-[#37a7f0]'}`}
                >
                  {isKnown ? '✓ 외웠어요' : '외웠어요'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
