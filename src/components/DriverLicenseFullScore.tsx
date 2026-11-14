// 만점 교육 (满分学习考试): 1년(벌점 주기)에 벌점 12점이 되면 받는 교육·시험
// - 형식은 과목1과 같지만(100문제·45분·90점) 시험은 중국어로만 보고, 법규·처벌·사고·안전 문명·응급처치 비중이 큼
// - 틀은 필기시험과 같음: 주제별 연습 · 모의고사(회차별) · ⚡속성 과정(핵심 정리 카드 → 전체 문제 → 시험 전날 100문제)
// - 문제·카드는 중국어 원문 + 보기 단계(1단계 한국어 / 2단계 중국어만), 문제마다 速记口诀·핵심 요약·단어 공부
// - 데이터: data/driverLicenseManjeom.json (만점 문제은행 정리본, scratchpad 빌드 스크립트로 생성)
import { useEffect, useMemo, useState } from 'react';
import {
  BackButton,
  EXAM_SECONDS,
  ExamResult,
  ExamRunner,
  ImageLightbox,
  LevelSwitch,
  LoadingState,
  PASS_SCORE,
  PracticeQuiz,
  WordList,
  WordPopupHost,
  WordStudyHost,
  ZhText,
  WrongNotes,
  registerImageSizes,
  shuffle,
  speakZh,
  useMjLevel,
  useMjWords,
  type DLQuestion,
  type ExamOutcome,
  type ExamSession,
  type MjLevel,
  type MjWords,
  type MockResult,
  type Progress,
} from './DriverLicenseQuiz';
import { ContentCheck, checkedCount, scrollToId } from './DriverLicenseContentCheck';
import { VocabPage } from './DriverLicenseVocab';
import type { CheckQuestion } from '../data/driverLicenseCheckQuestions';
import { getMockResults, getProgress, getWrongMap, recordAnswers, setMockResult, setProgress, useDriverLicenseRecords } from '../utils/driverLicenseRecords';

type MjTopic = { c: number; key: string; title: string; zh: string; desc: string; count: number; cards: number[] };
type MjLine = [string, string, string]; // 중국어, 병음, 한국어
type MjCard = { topic: string; title: string; zh: string; new: boolean; lines: MjLine[]; memo: MjLine; check: number[]; images?: { src: string; caption?: string }[] };
type MjData = { topics: MjTopic[]; questions: DLQuestion[]; cards: MjCard[]; exam: number[]; imgSize: Record<string, [number, number]> };

let cache: MjData | null = null;
let pending: Promise<MjData> | null = null;
function loadData() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import('../data/driverLicenseManjeom.json')
      .then((m) => {
        cache = m.default as unknown as MjData;
        registerImageSizes(cache.imgSize);
        return cache;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
/** 운전면허 화면이 열리면 미리 불러 둠 — 만점 교육 탭을 누르면 바로 뜨게 */
export function preloadFullScore() {
  loadData().catch(() => {});
}
// 데이터가 오기 전 첫 화면에 쓰는 숫자 (불러온 뒤에는 실제 값으로 바뀜)
const MJ_SUMMARY = { questions: 600, topics: 8 };

function useMjData() {
  const [data, setData] = useState<MjData | null>(cache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (data) return;
    let alive = true;
    loadData()
      .then((d) => alive && setData(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [data]);
  return { data, failed };
}

const BREADCRUMB = '홈 > 만점 교육';
const ALL_KEY = 'mj-all';
const CARDS_KEY = 'mj-cards';
const EXAM100_KEY = 'mj-exam100';
const RANDOM_KEY = 'mj-random';
const SET_COUNT = 6; // 한 바퀴(모든 문제를 한 번씩) = 6회분
const SET_ROUNDS = 4; // 4바퀴 = 24회분 (바퀴마다 문제 순서·묶음이 달라짐)
const FOCUS_TOPICS = new Set(['rules', 'penalty', 'safety', 'emergency']);

// 회차별 모의고사: 주제마다 골고루 나눠 6회분이 한 바퀴 (각 100문제, 6회를 다 풀면 모든 문제를 한 번씩)
// 2바퀴째부터는 다른 순서로 다시 섞어서 묶음 — 1~6회는 예전과 똑같아서 저장된 점수가 그대로 맞음
function buildRound(data: MjData, round: number) {
  const o = round * 10000;
  const sets: DLQuestion[][] = Array.from({ length: SET_COUNT }, () => []);
  let turn = round; // 바퀴마다 시작 회차를 바꿔 주제 쏠림을 줄임
  for (const topic of data.topics) {
    const pool = shuffle(
      data.questions.filter((q) => q.c === topic.c),
      o + 600 + topic.c,
    );
    for (const q of pool) sets[turn++ % SET_COUNT].push(q);
  }
  return sets.map((set, i) => {
    const ids = new Set(set.map((q) => q.id));
    const extra = shuffle(
      data.questions.filter((q) => !ids.has(q.id)),
      o + 900 + i,
    ).slice(0, Math.max(0, 100 - set.length));
    return shuffle([...set, ...extra], o + 1200 + i).slice(0, 100);
  });
}

function buildSets(data: MjData) {
  return Array.from({ length: SET_ROUNDS }, (_, r) => buildRound(data, r)).flat();
}

type View =
  | { mode: 'home' }
  | { mode: 'topics' }
  | { mode: 'topic'; c: number }
  | { mode: 'mock' }
  | { mode: 'fast' }
  | { mode: 'cards' }
  | { mode: 'quiz'; title: string; questions: DLQuestion[]; storageKey?: string; pool: DLQuestion[]; from: 'topics' | 'fast'; key: number; back?: View }
  | { mode: 'wrong'; title: string; pool: DLQuestion[]; from: 'topics' | 'fast'; back?: View }
  | { mode: 'vocab'; start?: 'dict' | 'test'; questionIds?: number[]; title?: string; back?: View };

const btn = {
  primary: 'px-4 py-2 rounded-lg text-[15px] text-white bg-[#37a7f0] hover:bg-[#2a8bc9]',
  plain: 'px-4 py-2 rounded-lg text-[15px] border border-gray-300 text-gray-700 bg-white hover:border-[#37a7f0] hover:text-[#37a7f0]',
  danger: 'px-4 py-2 rounded-lg text-[15px] border border-[#e74c3c] text-[#e74c3c] bg-white hover:bg-red-50',
};

export function FullScorePage({ onBack }: { onBack: () => void }) {
  return (
    <>
      <FullScoreInner onBack={onBack} />
      {/* 해설·AI 창의 '단어 공부해요' 로 열리는 단어 정리 + 중국어 낱말 팝업 */}
      <WordStudyHost />
      <WordPopupHost />
    </>
  );
}

function FullScoreInner({ onBack }: { onBack: () => void }) {
  const { data, failed } = useMjData();
  const [view, setView] = useState<View>({ mode: 'home' });
  const [session, setSession] = useState<(ExamSession & { resultKey: string; back: View }) | null>(null);
  const [outcome, setOutcome] = useState<(ExamOutcome & { resultKey: string; back: View }) | null>(null);
  useDriverLicenseRecords();
  const sets = useMemo(() => (data ? buildSets(data) : []), [data]);

  // 효과 함수는 아무것도 돌려주지 않게 (돌려준 값을 React가 정리 함수로 부르기 때문)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.mode]);

  // 단어 시험: 만점 교육·학법 감점 단어를 따로 불러옴
  if (view.mode === 'vocab') {
    return (
      <VocabPage
        key={view.questionIds?.join(',') ?? 'all'}
        home="a"
        startView={view.start ?? 'dict'}
        questionIds={view.questionIds}
        questionsTitle={view.title}
        onBack={() => setView(view.back ?? { mode: 'home' })}
        backLabel={view.back ? '틀린 문제로 돌아가기' : '만점 교육으로 돌아가기'}
      />
    );
  }
  // 첫 화면(안내)은 데이터 없이 바로 보여 주고, 문제가 필요한 화면만 불러오기를 기다림
  if (!data) return view.mode === 'home' ? <GuideHome data={null} onGo={setView} /> : <LoadingState failed={failed} onBack={() => setView({ mode: 'home' })} />;

  const go = (next: View) => setView(next);
  const byId = new Map(data.questions.map((q) => [q.id, q]));
  const startExam = (title: string, questions: DLQuestion[], resultKey: string, back: View, no: number | null = null) => {
    setOutcome(null);
    setSession({ no, title, questions, answers: {}, startedAt: Date.now(), resultKey, back });
  };
  const finishExam = (finished: ExamSession) => {
    if (!session) return;
    const score = finished.questions.filter((q, i) => finished.answers[i] === q.a).length;
    recordAnswers(
      finished.questions
        .map((q, i) => ({ id: q.id, selected: finished.answers[i], correct: finished.answers[i] === q.a }))
        .filter((r) => r.selected !== undefined),
    );
    const prev = getMockResults<MockResult>()[session.resultKey];
    setMockResult(session.resultKey, {
      best: Math.max(prev?.best ?? 0, score),
      last: score,
      attempts: (prev?.attempts ?? 0) + 1,
      date: new Date().toLocaleDateString('ko-KR'),
    });
    setOutcome({ ...finished, score, seconds: Math.min(EXAM_SECONDS, Math.round((Date.now() - finished.startedAt) / 1000)), resultKey: session.resultKey, back: session.back });
    setSession(null);
    window.scrollTo({ top: 0 });
  };

  if (session) {
    return (
      <ExamRunner
        session={session}
        onChange={(next) => setSession({ ...next, resultKey: session.resultKey, back: session.back })}
        onSubmit={finishExam}
        onExit={() => {
          if (window.confirm('시험을 그만두시겠어요? 지금까지 고른 답은 저장되지 않습니다.')) setSession(null);
        }}
      />
    );
  }
  if (outcome) {
    const retry = () => {
      const fresh = outcome.resultKey === RANDOM_KEY ? shuffle(data.questions).slice(0, 100) : outcome.questions;
      startExam(outcome.title ?? '만점 교육 모의고사', fresh, outcome.resultKey, outcome.back, outcome.no);
    };
    return (
      <ExamResult
        outcome={outcome}
        chapters={[]}
        onRetry={retry}
        onList={() => {
          setOutcome(null);
          go(outcome.back);
        }}
        listLabel={outcome.back.mode === 'fast' ? '속성 과정으로' : '모의고사 목록'}
        groups={{
          title: '주제별 결과',
          rows: data.topics.map((t) => ({ key: t.key, label: `${t.title} (${t.zh})`, ids: new Set(data.questions.filter((q) => q.c === t.c).map((q) => q.id)) })),
        }}
      />
    );
  }

  if (view.mode === 'quiz') {
    return (
      <PracticeQuiz
        key={view.key}
        questions={view.questions}
        title={view.title}
        breadcrumb={view.from === 'fast' ? `${BREADCRUMB} > 속성 과정` : `${BREADCRUMB} > 주제별 연습`}
        storageKey={view.storageKey}
        onBack={() => go(view.back ?? { mode: view.from })}
        backLabel={view.from === 'fast' ? '속성 과정으로 돌아가기' : '주제별 연습으로 돌아가기'}
        onReviewWrong={() => go({ mode: 'wrong', title: view.title, pool: view.pool, from: view.from, back: view.back })}
      />
    );
  }
  if (view.mode === 'wrong') {
    return (
      <WrongNotes
        pool={view.pool}
        title={view.title}
        breadcrumb={BREADCRUMB}
        onBack={() => go(view.back ?? { mode: view.from })}
        backLabel={view.from === 'fast' ? '속성 과정으로 돌아가기' : '주제별 연습으로 돌아가기'}
        onVocabTest={(qs) => go({ mode: 'vocab', start: 'test', questionIds: qs.map((q) => q.id), title: `${view.title} 틀린 문제`, back: view })}
      />
    );
  }
  if (view.mode === 'topics') return <TopicsPage data={data} onBack={() => go({ mode: 'home' })} onStart={go} />;
  if (view.mode === 'topic') {
    const topic = data.topics.find((t) => t.c === view.c);
    if (topic) return <TopicIntro data={data} topic={topic} onBack={() => go({ mode: 'topics' })} onStart={go} />;
  }
  if (view.mode === 'mock') {
    return (
      <MockPage
        sets={sets}
        onBack={() => go({ mode: 'home' })}
        onStart={(no) =>
          no === null
            ? startExam('만점 교육 랜덤 모의고사', shuffle(data.questions).slice(0, 100), RANDOM_KEY, { mode: 'mock' })
            : startExam(`만점 교육 제${no}회 모의고사`, sets[no - 1], `mj-set${no}`, { mode: 'mock' }, no)
        }
      />
    );
  }
  if (view.mode === 'cards') return <MjCards data={data} byId={byId} onBack={() => go({ mode: 'fast' })} />;
  if (view.mode === 'fast') {
    const exam = data.exam.map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q);
    return (
      <FastHome
        data={data}
        onBack={() => go({ mode: 'home' })}
        onGo={go}
        onExam={() => startExam('⚡ 시험 전날 실전 100문제', exam, EXAM100_KEY, { mode: 'fast' })}
      />
    );
  }
  return <GuideHome data={data} onGo={go} />;
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

function GuideHome({ data, onGo }: { data: MjData | null; onGo: (view: View) => void }) {
  const qCount = data?.questions.length ?? MJ_SUMMARY.questions;
  const topicCount = data?.topics.length ?? MJ_SUMMARY.topics;
  const results = getMockResults<MockResult>();
  const best = Math.max(0, ...Object.entries(results).filter(([k]) => k.startsWith('mj-')).map(([, r]) => r.best));
  const cards = [
    { view: { mode: 'topics' } as View, icon: 'fa-book-open', color: '#ff6b6b', title: '주제별 연습', desc: `만점 문제은행 ${qCount}문제를\n${topicCount}개 주제로 나눠 연습` },
    { view: { mode: 'mock' } as View, icon: 'fa-pen-to-square', color: '#37a7f0', title: '모의고사', desc: best ? `최고 ${best}점\n실제처럼 중국어 100문제 · 45분` : `회차별 ${SET_COUNT * SET_ROUNDS}회분 + 랜덤\n중국어 100문제 · 45분` },
    { view: { mode: 'fast' } as View, icon: 'fa-bolt', color: '#f39c12', title: '⚡ 속성 과정', desc: '핵심 정리 카드 → 전체 문제\n→ 시험 전날 실전 100문제', hot: true },
    { view: { mode: 'vocab' } as View, icon: 'fa-language', color: '#2E7D7A', title: '📘 단어 시험', desc: '핵심 단어를 한자 + 병음 + 뜻으로\n단어장 · 4지선다 시험 · 틀린 문제 단어', wide: true },
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
          <b>중국어로만</b> 볼 수 있어서, 여기 있는 만점 문제은행 {qCount}문제는 모두 중국어 원문으로 나옵니다. <b>보기 단계</b>(1단계 한국어 → 2단계
          중국어)로 한국어 도움을 줄여 가며 익히세요. 모의고사는 실제 시험처럼 중국어로만 나옵니다.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-10">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => onGo(card.view)}
            className={`relative flex flex-col justify-center items-center text-center cursor-pointer hover:-translate-y-1 transition-all rounded shadow-sm hover:shadow-md p-4 sm:p-6 ${
              card.hot ? 'col-span-2 sm:col-span-1 bg-[#fff8ec] border border-[#f7d9a8] hover:bg-[#fff1da]' : card.wide ? 'col-span-2 sm:col-span-1 bg-[#eef7f6] border border-[#cfe6e3] hover:bg-[#e2f1ef]' : 'bg-gray-50 hover:bg-gray-100'
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
            <b>실제 사고 사례 경고</b> — 실제 교통사고를 소재로 한 경고 교육 문제가 나옵니다.
          </li>
          <li>
            <b>실전 후기</b> — 일반 과목1 모의고사는 10번 중 8번 넘게 붙었는데, 실제 시험은 앞 20~30문제만 비슷하고 뒤쪽은 처음 보는 문제라 당황했다는 경우가
            많습니다.
          </li>
        </ul>
        <p className="text-sm sm:text-[15px] text-gray-800">
          <b>한마디로</b> 형식은 같지만 문제가 "더 실전적"이고 "더 경고적"입니다. 그래서 여기서는 일반 과목1 문제가 아니라 <b>만점 교육 전용 문제은행</b>으로
          연습합니다.
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

function TopicsPage({ data, onBack, onStart }: { data: MjData; onBack: () => void; onStart: (view: View) => void }) {
  const wrong = getWrongMap();
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <BackButton onClick={onBack} label="만점 교육으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">주제별 연습</h1>
      <p className="text-sm sm:text-[15px] text-gray-500 mb-5 leading-relaxed">
        만점 문제은행 {data.questions.length}문제를 주제별로 나눴어요. 주제를 고르면 <b>핵심 내용</b>(중국어·병음·한국어)을 먼저 보고 문제를 풀어요.
        풀이 화면 위의 <b>보기 단계</b>(1단계 한국어 → 2단계 중국어)로 한국어 도움을 줄여 가세요. <span className="text-[#d35400]">★ 중점</span> 주제가 만점 교육 시험에 특히 많이 나옵니다.
      </p>
      <div className="flex flex-col gap-3">
        {data.topics.map((topic) => {
          const key = `mj-t${topic.c}`;
          const questions = data.questions.filter((q) => q.c === topic.c);
          const solved = solvedOf(key);
          const total = questions.length;
          const wrongCount = questions.filter((q) => q.id in wrong).length;
          return (
            <div key={topic.key} className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                {FOCUS_TOPICS.has(topic.key) && <span className="text-xs text-[#d35400] font-medium">★ 중점</span>}
                <h2 className="text-[17px] font-bold text-gray-800">{topic.title}</h2>
                <span className="text-sm text-gray-500">{topic.zh}</span>
                <span className="ml-auto text-xs text-gray-400">{total}문제</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{topic.desc}</p>
              <div className="flex items-center gap-3 my-2.5">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#37a7f0]" style={{ width: `${total ? (solved / total) * 100 : 0}%` }}></div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {solved}/{total} 풀이{wrongCount ? ` · 틀린 문제 ${wrongCount}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className={btn.primary} onClick={() => onStart({ mode: 'topic', c: topic.c })}>
                  핵심 내용 보고 {solved > 0 && solved < total ? `이어서 풀기 (${solved}/${total})` : '풀기'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 모의고사 (필기시험 모의고사와 같은 틀) ─────────
function MockPage({ sets, onBack, onStart }: { sets: DLQuestion[][]; onBack: () => void; onStart: (no: number | null) => void }) {
  const results = getMockResults<MockResult>();
  const random = results[RANDOM_KEY];
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <BackButton onClick={onBack} label="만점 교육으로 돌아가기" />
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">만점 교육 모의고사</h1>
        <p className="text-sm text-gray-500">실제 시험처럼 중국어로만 100문제를 45분 동안 풀어요. 번역은 제출한 뒤 결과 화면에서 볼 수 있어요.</p>
      </header>
      <div className="text-center mb-6">
        <button onClick={() => onStart(null)} className="w-full sm:w-auto px-6 py-3 rounded-lg text-white bg-[#37a7f0] hover:bg-[#2a8bc9]">
          <i className="fa-solid fa-shuffle mr-2"></i>랜덤 모의고사 시작
        </button>
        {random && (
          <div className="mt-2 text-xs text-gray-500">
            랜덤 최고 <b className={random.best >= PASS_SCORE ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}>{random.best}점</b> · {random.attempts}회 응시
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: 'fa-list-check', label: '문제 수', value: '100문제', sub: '판단형 + 단일 선택형' },
          { icon: 'fa-language', label: '시험 언어', value: '중국어만', sub: '번역은 결과 화면에서' },
          { icon: 'fa-clock', label: '시험 시간', value: '45분', sub: '시간이 끝나면 자동 제출' },
          { icon: 'fa-award', label: '합격 기준', value: `${PASS_SCORE}점 이상`, sub: '100점 만점, 오답 10문제까지' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <i className={`fa-solid ${item.icon} text-xl mb-2 text-[#37a7f0]`}></i>
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-sm sm:text-base font-medium text-gray-800">{item.value}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-medium text-gray-800 mb-1">회차별 모의고사 ({sets.length}회분)</h2>
      <p className="text-xs text-gray-500 mb-4">회차마다 모든 주제에서 골고루 나와요. {SET_COUNT}회씩 한 묶음(1~{SET_COUNT}회, {SET_COUNT + 1}~{SET_COUNT * 2}회 …)을 다 풀면 만점 문제은행 {sets.length * 100 / SET_ROUNDS}문제를 한 번씩 보게 되고, 묶음마다 문제 순서와 조합이 달라요.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {sets.map((_, i) => {
          const no = i + 1;
          const result = results[`mj-set${no}`];
          return (
            // 1~6회(처음부터 있던 회차)만 아주 옅은 파란 바탕으로 살짝 구분
            <button key={no} onClick={() => onStart(no)} className={`text-left p-4 border-2 rounded-lg hover:border-[#37a7f0] hover:shadow-md transition-all ${no <= SET_COUNT ? 'bg-[#f6fafe] border-[#e6f1fa]' : 'bg-white border-gray-100'}`}>
              <div className="font-medium text-gray-800 mb-1">제{no}회 모의고사</div>
              {result ? (
                <div className="text-xs text-gray-500">
                  최고 <b className={result.best >= PASS_SCORE ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}>{result.best}점</b> · {result.attempts}회 응시
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

// ───────── ⚡ 속성 과정 (필기시험 속성 과정과 같은 틀) ─────────
function FastHome({ data, onBack, onGo, onExam }: { data: MjData; onBack: () => void; onGo: (view: View) => void; onExam: () => void }) {
  const ordered = useMemo(() => [...data.questions].sort((a, b) => a.c - b.c || a.id - b.id), [data]);
  const cardsDone = getProgress<{ done: number[] }>(CARDS_KEY)?.done.length ?? 0;
  const cardsChecked = checkedCount('mj:');
  const solved = solvedOf(ALL_KEY);
  const total = ordered.length;
  const wrong = getWrongMap();
  const wrongCount = ordered.filter((q) => q.id in wrong).length;
  const exam = getMockResults<MockResult>()[EXAM100_KEY];
  const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);
  const title = `⚡ 만점 문제 ${total}`;
  const steps = [
    {
      no: 1,
      title: '핵심 정리 카드',
      when: '먼저',
      desc: '벌점·처벌·속도·면허·등화·표지·사고 순서로 꼭 나오는 규칙을 중국어 시험 표현으로 정리했어요. 필기시험에 없는 만점 교육 내용은 "만점 신규"로 표시했어요.',
      progress: pct(cardsDone, data.cards.length),
      status: `${cardsDone}/${data.cards.length}장 외움 · 체크 ${cardsChecked}/${data.cards.length}장`,
      actions: [{ label: '카드 보기', cls: btn.primary, onClick: () => onGo({ mode: 'cards' }) }],
    },
    {
      no: 2,
      title: `만점 문제은행 ${total}문제`,
      when: '그다음',
      desc: '주제 순서대로 전체 문제를 풀어요. 처음에는 1단계(한국어 + 작은 중국어 핵심 단어)로 뜻을 익히고, 익숙해지면 2단계(시험처럼 중국어만)로 바꿔 보세요.',
      progress: pct(solved, total),
      status: `${solved}/${total}문제 풀이${wrongCount ? ` · 틀린 문제 ${wrongCount}개` : ''}`,
      actions: [
        {
          label: solved > 0 && solved < total ? `이어서 풀기 (${solved}/${total})` : '순서대로 풀기',
          cls: btn.primary,
          onClick: () => onGo({ mode: 'quiz', title: `${title} (순서대로)`, questions: ordered, storageKey: ALL_KEY, pool: ordered, from: 'fast', key: Date.now() }),
        },
        { label: '랜덤으로 풀기', cls: btn.plain, onClick: () => onGo({ mode: 'quiz', title: `${title} (랜덤)`, questions: shuffle(ordered), pool: ordered, from: 'fast', key: Date.now() }) },
        ...(wrongCount ? [{ label: `틀린 문제만 (${wrongCount})`, cls: btn.danger, onClick: () => onGo({ mode: 'wrong', title, pool: ordered, from: 'fast' }) }] : []),
      ],
    },
    {
      no: 3,
      title: '시험 전날 실전 100문제',
      when: '시험 1일 전',
      desc: '자주 나오는 주제 비중대로 고른 100문제를 실제 시험처럼 중국어로만 45분 동안 풀어요.',
      progress: exam ? Math.min(100, exam.best) : 0,
      status: exam ? `최고 ${exam.best}점 · 최근 ${exam.last}점 (${exam.attempts}회)` : '아직 안 봤어요',
      actions: [{ label: '실전 시험 보기', cls: btn.primary, onClick: onExam }],
    },
  ];
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="만점 교육으로 돌아가기" />
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2">⚡ 만점 교육 속성 과정</h1>
        <p className="text-[15px] text-gray-600 leading-relaxed">시험이 얼마 안 남았을 때, 꼭 나오는 것만 3단계로 빠르게 끝내요.</p>
      </header>
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

// ───────── ① 핵심 정리 카드 (필기시험 암기 카드와 같은 틀 + 보기 단계) ─────────
function checkQuestions(questions: DLQuestion[], key: string, level: MjLevel): CheckQuestion[] {
  return questions.map((q) => {
    const ko = q.ko;
    const options = q.t === 'j' ? ['正确', '错误'] : q.o ?? [];
    const koOptions = q.t === 'j' ? ['맞음', '틀림'] : ko?.o ?? [];
    return {
      id: `${key}#${q.id}`,
      prompt: !ko || level === 3 ? q.q : level === 1 ? `${ko.q}\n(${q.q})` : `${q.q}\n(${ko.q})`,
      choices: options.map((o, i) => (!koOptions[i] || level === 3 ? o : level === 1 ? `${koOptions[i]} (${o})` : `${o} (${koOptions[i]})`)),
      answer: q.a,
      explain: q.e,
      img: q.img,
      kind: q.t === 'j' ? 'judge' : 'choice',
    };
  });
}

function LineView({
  line,
  level,
  open,
  onOpen,
  tokens,
  dict,
}: {
  line: MjLine;
  level: MjLevel;
  open: boolean;
  onOpen: () => void;
  tokens?: string[];
  dict?: MjWords['d'];
}) {
  const [zh, pinyin, ko] = line;
  const zhText = <ZhText tokens={tokens} dict={dict} fallback={zh} />;
  if (level === 1)
    return (
      <div className="flex-1 min-w-0">
        <div className="text-[15px] sm:text-base text-gray-900 leading-snug">{ko}</div>
        <div lang="zh-CN" className="text-[13px] text-[#b9560e] leading-snug break-words">
          {zhText}
        </div>
      </div>
    );
  const showKo = level === 2 || open;
  return (
    <div className="flex-1 min-w-0">
      <div lang="zh-CN" className="text-[15px] sm:text-base text-gray-900 leading-snug">
        {zhText}
      </div>
      {level === 2 && <div className="text-[12px] sm:text-[13px] text-[#c98b2f] leading-snug break-words">{pinyin}</div>}
      {showKo ? (
        <div className="text-[14px] text-gray-600 leading-snug">{ko}</div>
      ) : (
        <button type="button" onClick={onOpen} className="relative block w-full text-left" aria-label="한국어 보기">
          <span className="block blur-[5px] select-none text-[14px] text-gray-600 leading-snug" aria-hidden>
            {ko}
          </span>
          <span className="absolute inset-0 flex items-center text-[12px] text-[#2a8bc9] font-medium">눌러서 뜻 보기</span>
        </button>
      )}
    </div>
  );
}

/** 카드 아래 '📖 단어' — 누르면 그 카드에 나온 중국어 단어를 한자·병음·뜻으로 모두 */
function CardWords({ index }: { index: number }) {
  const [open, setOpen] = useState(false);
  const words = useMjWords(open);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`text-sm px-3 py-1.5 rounded-full border ${open ? 'bg-[#fff4d6] border-[#f5d58a] text-[#b9560e] font-medium' : 'border-[#f5d58a] text-[#b9560e] bg-white hover:bg-[#fff8e6]'}`}
      >
        📖 단어 {open ? '접기' : `정리${words ? ` (${words.c[index]?.length ?? 0})` : ''}`}
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-lg bg-white border border-gray-200">
          {words ? <WordList words={words.c[index] ?? []} dict={words.d} /> : <p className="py-4 text-center text-sm text-gray-400">단어를 불러오는 중…</p>}
        </div>
      )}
    </div>
  );
}

/** 주제별 연습: 핵심 내용(중국어·병음·한국어)을 먼저 보고 → 이어서 풀기 */
function TopicIntro({ data, topic, onBack, onStart }: { data: MjData; topic: MjTopic; onBack: () => void; onStart: (view: View) => void }) {
  const key = `mj-t${topic.c}`;
  const questions = data.questions.filter((q) => q.c === topic.c);
  const solved = solvedOf(key);
  const total = questions.length;
  const wrongCount = questions.filter((q) => q.id in getWrongMap()).length;
  const [zoomPic, setZoomPic] = useState<{ src: string; caption?: string } | null>(null);
  const words = useMjWords(true);
  const back: View = { mode: 'topic', c: topic.c };
  const buttons = (
    <div className="flex flex-wrap gap-2">
      <button
        className={btn.primary}
        onClick={() => onStart({ mode: 'quiz', title: `${topic.title} (순서대로)`, questions, storageKey: key, pool: questions, from: 'topics', key: Date.now(), back })}
      >
        <i className="fa-solid fa-play mr-2"></i>
        {solved > 0 && solved < total ? `이어서 풀기 (${solved}/${total})` : '순서대로 풀기'}
      </button>
      <button className={btn.plain} onClick={() => onStart({ mode: 'quiz', title: `${topic.title} (랜덤)`, questions: shuffle(questions), pool: questions, from: 'topics', key: Date.now(), back })}>
        <i className="fa-solid fa-shuffle mr-2"></i>랜덤으로 풀기
      </button>
      {wrongCount > 0 && (
        <button className={btn.danger} onClick={() => onStart({ mode: 'wrong', title: topic.title, pool: questions, from: 'topics', back })}>
          틀린 문제만 ({wrongCount})
        </button>
      )}
    </div>
  );
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
      <BackButton onClick={onBack} label="주제별 연습으로 돌아가기" />
      {zoomPic && <ImageLightbox src={zoomPic.src} caption={zoomPic.caption} onClose={() => setZoomPic(null)} />}
      <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
        {FOCUS_TOPICS.has(topic.key) && <span className="text-xs text-[#d35400] font-medium">★ 중점</span>}
        <h1 className="text-2xl font-bold text-[#2c3e50]">{topic.title}</h1>
        <span lang="zh-CN" className="text-gray-500">
          {topic.zh}
        </span>
      </div>
      <p className="text-sm sm:text-[15px] text-gray-500 mb-4">
        {topic.desc} · {total}문제 · {solved}/{total} 풀이
      </p>
      {buttons}
      <h2 className="mt-7 mb-1 text-lg font-bold text-gray-800">핵심 내용</h2>
      <p className="mb-3 text-sm text-gray-500">시험에 나오는 중국어 표현 그대로 정리했어요. 먼저 읽고 외운 뒤 문제를 풀어 보세요.</p>
      <div className="flex flex-col gap-3">
        {topic.cards.map((i) => {
          const card = data.cards[i];
          return (
            <section key={i} className={`p-4 sm:p-5 rounded-xl border ${card.new ? 'border-[#f7d9a8] bg-[#fffaf0]' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start gap-2 mb-2">
                {card.new && <span className="shrink-0 px-2 py-0.5 rounded bg-[#d35400] text-white text-xs font-medium">만점 신규</span>}
                <h3 className="flex-1 font-bold text-gray-800">
                  {card.title}{' '}
                  <span lang="zh-CN" className="text-sm font-normal text-gray-500">
                    {card.zh}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => speakZh(card.lines.map((l) => l[0]).join('。'))}
                  aria-label="중국어로 듣기"
                  className="shrink-0 w-8 h-8 rounded-full bg-[#eef7fe] text-[#2a8bc9] text-sm flex items-center justify-center hover:bg-[#d9edfb]"
                >
                  <i className="fa-solid fa-volume-high"></i>
                </button>
              </div>
              <ul className="flex flex-col gap-2.5">
                {card.lines.map((line, j) => (
                  <li key={j} className="flex gap-2">
                    <i className="fa-solid fa-check text-[#37a7f0] mt-1.5 text-xs"></i>
                    <LineView line={line} level={2} open onOpen={() => undefined} tokens={words?.ct[i]?.[j]} dict={words?.d} />
                  </li>
                ))}
              </ul>
              {card.images && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {card.images.map((pic) => (
                    <figure key={pic.src} className="w-[120px] sm:w-[150px] text-center">
                      <img
                        src={`${import.meta.env.BASE_URL}driver-license/img/${pic.src}`}
                        alt={pic.caption || card.title}
                        loading="lazy"
                        onClick={() => setZoomPic({ src: pic.src, caption: pic.caption || card.title })}
                        className="w-full h-auto rounded border border-gray-200 bg-white cursor-zoom-in"
                      />
                      {pic.caption && <figcaption className="mt-1 text-xs text-gray-600 leading-snug">{pic.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
              <div className="mt-3 px-3 py-2 bg-[#fff8e1] rounded text-sm text-gray-800 flex gap-1.5">
                <span>⚡</span>
                <LineView line={card.memo} level={2} open onOpen={() => undefined} tokens={words?.ct[i]?.[card.lines.length]} dict={words?.d} />
              </div>
              <CardWords index={i} />
            </section>
          );
        })}
      </div>
      <div className="mt-6 p-4 rounded-xl bg-[#eef7fe] border border-[#bfe2fa]">
        <p className="mb-3 text-[15px] text-gray-700">핵심 내용을 읽었으면 문제를 풀어 보세요.</p>
        {buttons}
      </div>
    </div>
  );
}

function MjCards({ data, byId, onBack }: { data: MjData; byId: Map<number, DLQuestion>; onBack: () => void }) {
  useDriverLicenseRecords();
  const [level, setLevel] = useMjLevel();
  const words = useMjWords(true);
  const [topic, setTopic] = useState('전체');
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [zoomPic, setZoomPic] = useState<{ src: string; caption?: string } | null>(null);
  const [, rerender] = useState(0);
  useEffect(() => {
    setOpened(new Set());
  }, [level]);
  const done = new Set(getProgress<{ done: number[] }>(CARDS_KEY)?.done ?? []);
  const toggle = (i: number) => {
    const next = new Set(done);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setProgress(CARDS_KEY, { done: Array.from(next).sort((a, b) => a - b) });
    rerender((n) => n + 1);
  };
  const open = (key: string) => setOpened((prev) => new Set(prev).add(key));
  const topics = ['전체', '만점 신규', ...Array.from(new Set(data.cards.map((c) => c.topic)))];
  const cards = data.cards.map((card, i) => ({ card, i })).filter(({ card }) => topic === '전체' || (topic === '만점 신규' ? card.new : card.topic === topic));

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="속성 과정으로 돌아가기" />
      {zoomPic && <ImageLightbox src={zoomPic.src} caption={zoomPic.caption} onClose={() => setZoomPic(null)} />}
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">① 핵심 정리 카드</h1>
      <p className="text-sm text-gray-500 mb-4">
        시험에 나오는 중국어 표현으로 정리했어요. 처음에는 1단계(한국어)로 뜻을 익히고, 익숙해지면 2단계(중국어만, 누르면 뜻)로 바꿔 보세요. 카드마다 <b>📖 단어</b>를 누르면 단어 정리가 나와요. ({done.size}/
        {data.cards.length}장 외움 · 체크 {checkedCount('mj:')}/{data.cards.length}장)
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">보기 단계</span>
        <LevelSwitch level={level} onChange={setLevel} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`shrink-0 px-3 py-1.5 rounded-full border text-sm ${
              topic === t ? 'bg-[#37a7f0] border-[#37a7f0] text-white' : t === '만점 신규' ? 'bg-[#fff4e0] border-[#f7d9a8] text-[#d35400]' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map(({ card, i }) => {
          const isDone = done.has(i);
          const checks = card.check.map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q);
          return (
            <div
              key={i}
              id={`mj-card-${i}`}
              className={`p-4 sm:p-5 rounded-lg border ${isDone ? 'border-green-300 bg-green-50/40' : card.new ? 'border-[#f7d9a8] bg-[#fffaf0]' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="shrink-0 px-2 py-0.5 rounded bg-[#eef7fe] text-[#2a8bc9] text-xs">{card.topic}</span>
                {card.new && <span className="shrink-0 px-2 py-0.5 rounded bg-[#d35400] text-white text-xs font-medium">만점 신규</span>}
                <h3 className="flex-1 font-medium text-gray-800">
                  {card.title} <span className="text-sm font-normal text-gray-500">{card.zh}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => speakZh(card.lines.map((l) => l[0]).join('。'))}
                  aria-label="중국어로 듣기"
                  className="shrink-0 w-8 h-8 rounded-full bg-[#eef7fe] text-[#2a8bc9] text-sm flex items-center justify-center hover:bg-[#d9edfb]"
                >
                  <i className="fa-solid fa-volume-high"></i>
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {card.lines.map((line, j) => (
                  <li key={j} className="flex gap-2">
                    <i className="fa-solid fa-check text-[#37a7f0] mt-1.5 text-xs"></i>
                    <LineView line={line} level={level} open={opened.has(`${i}:${j}`)} onOpen={() => open(`${i}:${j}`)} tokens={words?.ct[i]?.[j]} dict={words?.d} />
                  </li>
                ))}
              </ul>
              {card.images && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {card.images.map((pic) => (
                    <figure key={pic.src} className="w-[130px] sm:w-[160px] text-center">
                      <img
                        src={`${import.meta.env.BASE_URL}driver-license/img/${pic.src}`}
                        alt={pic.caption || card.title}
                        loading="lazy"
                        onClick={() => setZoomPic({ src: pic.src, caption: pic.caption || card.title })}
                        className="w-full h-auto rounded border border-gray-200 bg-white cursor-zoom-in hover:border-[#37a7f0] transition-colors"
                      />
                      {pic.caption && <figcaption className="mt-1 text-xs text-gray-600 leading-snug">{pic.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
              <div className="mt-3 px-3 py-2 bg-[#fff8e1] rounded text-sm text-gray-800 flex gap-1.5">
                <span>⚡</span>
                <LineView
                  line={card.memo}
                  level={level}
                  open={opened.has(`${i}:memo`)}
                  onOpen={() => open(`${i}:memo`)}
                  tokens={words?.ct[i]?.[card.lines.length]}
                  dict={words?.d}
                />
              </div>
              <button
                onClick={() => toggle(i)}
                className={`mt-3 text-sm px-3 py-1.5 rounded-full border ${isDone ? 'border-green-500 text-green-700 bg-white' : 'border-gray-300 text-gray-600 bg-white hover:border-[#37a7f0]'}`}
              >
                {isDone ? '✓ 외웠어요' : '외웠어요'}
              </button>
              <CardWords index={i} />
              <ContentCheck
                key={`${i}-${level}`}
                itemKey={`mj:${i}`}
                questions={checkQuestions(checks, `mj:${i}`, level)}
                onDone={() => {
                  scrollToId(`mj-card-${i + 1}`);
                  rerender((n) => n + 1);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
