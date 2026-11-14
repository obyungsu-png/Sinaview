// 학법 감점 (学法减分): 벌점 12점이 되기 전에 교통법규 학습·시험으로 벌점을 최대 6점까지 줄이는 제도
// - 만점 교육과 같은 틀의 ⚡속성 과정: ① 핵심 정리 카드 → ② 실전 고사 (앱과 같은 화면: 그리드·60초·즉시 채점)
// - 연습은 보조 진입의 법규학습은행에서 (만점 문제은행과 같은 형식: 보기 단계·단어 팝업·단어 공부해요)
// - 데이터: data/driverLicenseXuefa.json (交管12123学法减分题库 마지막 장 파싱·한국어 번역, scratchpad 빌드 스크립트로 생성)
import { useEffect, useMemo, useState } from 'react';
import {
  BackButton,
  LevelSwitch,
  LoadingState,
  PASS_SCORE,
  PracticeQuiz,
  registerImageSizes,
  WordPopupHost,
  WordStudyHost,
  WrongNotes,
  ZhText,
  shuffle,
  speakZh,
  useMjLevel,
  useXfWords,
  type DLQuestion,
  type MjLevel,
  type MockResult,
} from './DriverLicenseQuiz';
import { XfExamRunner, XfExamResultView, XfExamRules, XfFullscreen, recordXfExam, type XfExamOutcome, type XfQ } from './DriverLicenseXfExam';
import { ContentCheck, checkedCount, scrollToId } from './DriverLicenseContentCheck';
import type { CheckQuestion } from '../data/driverLicenseCheckQuestions';
import { getMockResults, getProgress, getWrongMap, setProgress, useDriverLicenseRecords } from '../utils/driverLicenseRecords';
import { VocabPage } from './DriverLicenseVocab';

type XfTopic = { c: number; key: string; title: string; zh: string; desc: string; count: number; cards: number[] };
type XfLine = [string, string, string]; // 중국어, 병음, 한국어
type XfCard = { topic: string; title: string; zh: string; new: boolean; lines: XfLine[]; memo: XfLine; check: number[] };
// questions: 판단(j)·단선(s)·다선(m, ma=정답 글자) 모두 — 법규학습은행 주제별 + 실전 고사(exams: id 목록)
type XfData = { topics: XfTopic[]; questions: DLQuestion[]; cards: XfCard[]; exams: number[][]; imgSize: Record<string, [number, number]> };

let cache: XfData | null = null;
let pending: Promise<XfData> | null = null;
function loadData() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import('../data/driverLicenseXuefa.json')
      .then((m) => {
        cache = m.default as unknown as XfData;
        return cache;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
/** 운전면허 화면이 열리면 미리 불러 둠 — 학법 감점 탭을 누르면 바로 뜨게 */
export function preloadXuefa() {
  loadData().catch(() => {});
}
// 데이터가 오기 전 첫 화면에 쓰는 숫자 (불러온 뒤에는 실제 값으로 바뀜)
const XF_SUMMARY = { questions: 876, exams: 29, cards: 21 };

function useXfData() {
  const [data, setData] = useState<XfData | null>(cache);
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

const BREADCRUMB = '홈 > 학법 감점';
const ALL_KEY = 'xf-all';
const CARDS_KEY = 'xf-cards';
const EXAM_SECONDS_XF = 20 * 60; // 실제 시험 규칙: 20문제 20분
const EXAM_SIZE = 20;

const btn = {
  primary: 'px-4 py-2 rounded-lg text-[15px] text-white bg-[#37a7f0] hover:bg-[#2a8bc9]',
  plain: 'px-4 py-2 rounded-lg text-[15px] border border-gray-300 text-gray-700 bg-white hover:border-[#37a7f0] hover:text-[#37a7f0]',
  danger: 'px-4 py-2 rounded-lg text-[15px] border border-[#e74c3c] text-[#e74c3c] bg-white hover:bg-red-50',
};

export function XuefaPage({ onBack }: { onBack: () => void }) {
  return (
    <>
      <XuefaInner onBack={onBack} />
      <WordPopupHost />
      <WordStudyHost />
    </>
  );
}

function XuefaInner({ onBack }: { onBack: () => void }) {
  const { data, failed } = useXfData();
  const [view, setView] = useState<View>({ mode: 'home' });
  const [examNo, setExamNo] = useState<number | null>(null);
  const [rulesNo, setRulesNo] = useState<number | null>(null);
  const [continueFrom, setContinueFrom] = useState<{ answers: Record<number, number | string>; results: Record<number, boolean>; continued: boolean } | null>(null);
  const [outcome, setOutcome] = useState<(XfExamOutcome & { back: View }) | null>(null);
  useDriverLicenseRecords();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.mode, outcome]);

  useEffect(() => {
    if (data?.imgSize) registerImageSizes(data.imgSize);
  }, [data]);

  // 첫 화면은 데이터 없이 바로 보여 주고, 문제가 필요한 화면만 불러오기를 기다림
  // 단어 시험: 만점 교육·학법 감점 단어를 따로 불러옴
  if (view.mode === 'vocab') {
    return (
      <VocabPage
        key={view.questionIds?.join(',') ?? 'all'}
        home="b"
        startView={view.start ?? 'dict'}
        questionIds={view.questionIds}
        questionsTitle={view.title}
        onBack={() => setView(view.back ?? { mode: 'home' })}
        backLabel={view.back ? '틀린 문제로 돌아가기' : '학법 감점으로 돌아가기'}
      />
    );
  }
  if (!data) return view.mode === 'home' ? <XfHome data={null} onBack={onBack} onGo={setView} /> : <LoadingState failed={failed} onBack={() => setView({ mode: 'home' })} />;
  if (view.mode === 'quizAll') {
    // 데이터가 오기 전에 '전체 순서대로 풀기'를 눌렀던 경우
    const ordered = [...data.questions].sort((a, b) => a.c - b.c || a.id - b.id);
    return (
      <PracticeQuiz
        key="xf-all"
        questions={ordered}
        title={`법규학습은행 ${ordered.length}문제 (순서대로)`}
        breadcrumb={BREADCRUMB}
        storageKey={ALL_KEY}
        onBack={() => setView({ mode: 'bank' })}
        backLabel="법규학습은행으로 돌아가기"
        onReviewWrong={() => setView({ mode: 'wrong', title: '전체', pool: ordered })}
      />
    );
  }

  const go = (next: View) => setView(next);
  const byId = new Map<number, XfQ>(
    data.questions.map((q) => [q.id, q as unknown as XfQ]),
  );
  const startExam = (no: number) => {
    setOutcome(null);
    setContinueFrom(null);
    setRulesNo(null);
    setExamNo(no);
  };
  const continueExam = () => {
    if (!outcome) return;
    setContinueFrom({ answers: outcome.answers, results: outcome.results, continued: true });
    setOutcome(null);
    setExamNo(outcome.no);
  };
  const finishExam = (finished: XfExamOutcome) => {
    recordXfExam(finished);
    setOutcome({ ...finished, back: { mode: 'exams' } });
    setExamNo(null);
    setContinueFrom(null);
    window.scrollTo({ top: 0 });
  };

  if (examNo !== null) {
    const ids = data.exams[examNo - 1] ?? [];
    const questions = ids.map((id) => byId.get(id)).filter((q): q is XfQ => !!q);
    return (
      <XfFullscreen key="xf-exam">
        <XfExamRunner
          no={examNo}
          questions={questions}
          initial={continueFrom ?? undefined}
          onFinish={finishExam}
          onExit={() => {
            setExamNo(null);
            setContinueFrom(null);
          }}
        />
      </XfFullscreen>
    );
  }
  if (rulesNo !== null) {
    return (
      <XfFullscreen key="xf-rules">
        <XfExamRules
          no={rulesNo}
          total={(data.exams[rulesNo - 1] ?? []).length}
          onBack={() => setRulesNo(null)}
          onStart={() => startExam(rulesNo)}
        />
      </XfFullscreen>
    );
  }
  if (outcome) {
    return (
      <XfFullscreen key="xf-result">
        <XfExamResultView
          outcome={outcome}
          onRetry={() => startExam(outcome.no)}
          onContinue={outcome.failedOut && !outcome.continued ? continueExam : undefined}
          onList={() => {
            setOutcome(null);
            go(outcome.back);
          }}
        />
      </XfFullscreen>
    );
  }

  if (view.mode === 'quiz') {
    return (
      <PracticeQuiz
        key={view.key}
        questions={view.questions}
        title={view.title}
        breadcrumb={BREADCRUMB}
        storageKey={view.storageKey}
        onBack={() => go(view.back ?? { mode: 'bank' })}
        backLabel="법규학습은행으로 돌아가기"
        onReviewWrong={() => go({ mode: 'wrong', title: view.title, pool: view.pool })}
      />
    );
  }
  if (view.mode === 'wrong') {
    return (
      <WrongNotes
        pool={view.pool}
        title={view.title}
        breadcrumb={BREADCRUMB}
        onBack={() => go({ mode: 'bank' })}
        backLabel="법규학습은행으로 돌아가기"
        onVocabTest={(qs) => go({ mode: 'vocab', start: 'test', questionIds: qs.map((q) => q.id), title: `${view.title} 틀린 문제`, back: view })}
      />
    );
  }
  if (view.mode === 'cards') return <XfCards data={data} byId={byId} onBack={() => go({ mode: 'home' })} />;
  if (view.mode === 'bank') return <XfBank data={data} onBack={() => go({ mode: 'home' })} onGo={go} />;
  if (view.mode === 'exams') return <XfExams data={data} onBack={() => go({ mode: 'home' })} onPick={(no) => setRulesNo(no)} />;
  return <XfHome data={data} onBack={onBack} onGo={go} />;
}

type View =
  | { mode: 'home' }
  | { mode: 'quizAll' }
  | { mode: 'cards' }
  | { mode: 'bank' }
  | { mode: 'exams' }
  | { mode: 'quiz'; title: string; questions: DLQuestion[]; storageKey?: string; pool: DLQuestion[]; key: number; back?: View }
  | { mode: 'wrong'; title: string; pool: DLQuestion[] }
  | { mode: 'vocab'; start?: 'dict' | 'test'; questionIds?: number[]; title?: string; back?: View };

// ───────── 홈: 시작 전 간단한 설명 + 속성 과정 단계 ─────────
function solvedOf(key: string) {
  const saved = getProgress<Progress>(key);
  return saved ? Object.keys(saved.answers).length : 0;
}

const CANNOT: string[] = [
  '이번 또는 지난 벌점 주기에 만점 교육을 2회 이상 받은 사람',
  '최근 3주기 안에 사고 후 도주·음주 운전·가짜 번호판·면허증 사용으로 처리된 사람',
];

function XfHome({ data, onBack, onGo }: { data: XfData | null; onBack: () => void; onGo: (view: View) => void }) {
  const ordered = useMemo(() => (data ? [...data.questions].sort((a, b) => a.c - b.c || a.id - b.id) : []), [data]);
  const cardCount = data?.cards.length ?? XF_SUMMARY.cards;
  const examCount = data?.exams.length ?? XF_SUMMARY.exams;
  const cardsDone = getProgress<{ done: number[] }>(CARDS_KEY)?.done.length ?? 0;
  const cardsChecked = checkedCount('xf:');
  const solved = solvedOf(ALL_KEY);
  const total = data ? ordered.length : XF_SUMMARY.questions;
  const wrong = getWrongMap();
  const wrongCount = ordered.filter((q) => q.id in wrong).length;
  const examBest = (() => {
    const results = getMockResults<MockResult>();
    let best = 0;
    for (let i = 1; i <= examCount; i++) best = Math.max(best, results[`xf2-exam${i}`]?.best ?? 0);
    return best;
  })();
  const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);

  const steps = [
    {
      no: 1,
      title: '핵심 정리 카드',
      when: '먼저',
      desc: '벌점 기준부터 학법 감점 규칙, 처벌·면허·고속도로·등화·사고 처리까지 꼭 나오는 규칙을 중국어 시험 표현으로 정리했어요.',
      progress: pct(cardsDone, cardCount),
      status: `${cardsDone}/${cardCount}장 외움 · 체크 ${cardsChecked}/${cardCount}장`,
      actions: [{ label: '카드 보기', cls: btn.primary, onClick: () => onGo({ mode: 'cards' }) }],
    },
    {
      no: 2,
      title: `실전 고사 (${examCount}회 × ${EXAM_SIZE}문제)`,
      when: '그다음',
      desc: '실제 앱 시험과 같은 방식이에요. 회차마다 판단 5 · 단선 10 · 다선 5문제, 사진 문제 5~7장. 문제당 60초, 오답 3개 누적 시 자동 불합격.',
      progress: examBest ? Math.min(100, Math.round((examBest / EXAM_SIZE) * 100)) : 0,
      status: examBest ? `최고 ${examBest}/${EXAM_SIZE}문제 정답` : '아직 안 봤어요',
      actions: [{ label: '실전 고사 보기', cls: btn.primary, onClick: () => onGo({ mode: 'exams' }) }],
    },
    {
      no: 3,
      title: `법규학습은행 ${total}문제`,
      when: '마지막',
      desc: '연습할 때는 여기서 풀어요. 처음에는 1단계(한국어 + 작은 중국어 핵심 단어)로 뜻을 익히고, 익숙해지면 2단계(시험처럼 중국어만)로 바꿔 보세요.',
      progress: pct(solved, total),
      status: `${solved}/${total} 풀이${wrongCount ? ` · 틀린 문제 ${wrongCount}` : ''}`,
      actions: [
        { label: '은행 열기', cls: btn.primary, onClick: () => onGo({ mode: 'bank' }) },
        {
          label: solved > 0 && solved < total ? `전체 이어서 풀기 (${solved}/${total})` : '전체 순서대로 풀기',
          cls: btn.plain,
          onClick: () =>
            onGo(data ? { mode: 'quiz', title: `법규학습은행 ${total}문제 (순서대로)`, questions: ordered, storageKey: ALL_KEY, pool: ordered, key: Date.now() } : { mode: 'quizAll' }),
        },
        ...(wrongCount > 0 ? [{ label: `틀린 문제만 (${wrongCount})`, cls: btn.danger, onClick: () => onGo({ mode: 'wrong', title: '전체', pool: ordered }) }] : []),
      ],
    },
    {
      no: 4,
      title: '📘 단어 시험',
      when: '틈틈이',
      desc: '문제에 나오는 핵심 단어를 한자 + 병음 + 뜻으로 외우고 4지선다로 확인해요. 내가 틀린 문제에 나온 단어만 골라 볼 수도 있어요.',
      progress: 0,
      status: '',
      actions: [
        { label: '단어 시험 보기', cls: btn.primary, onClick: () => onGo({ mode: 'vocab', start: 'test' }) },
        { label: '단어장', cls: btn.plain, onClick: () => onGo({ mode: 'vocab', start: 'dict' }) },
      ],
    },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="운전면허 홈으로" />
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-1">
          학법 감점 <span lang="zh-CN" className="text-lg sm:text-xl font-normal text-gray-500">学法减分</span>
        </h1>
        <p className="text-[15px] text-gray-600 leading-relaxed">벌점이 쌓이기 전에 공부해서 줄이는 제도예요. 만점 교육만큼 어렵지 않으니 가볍게 준비하세요.</p>
      </header>

      {/* 시작 전 간단한 설명 */}
      <div className="p-4 sm:p-6 rounded-xl border border-[#bfe2fa] bg-[#eef7fe] mb-8">
        <h2 className="text-lg font-bold text-[#2c3e50] mb-2">什么是学法减分? (학법 감점이란?)</h2>
        <ul className="flex flex-col gap-1.5 text-sm sm:text-[15px] text-gray-800 leading-relaxed mb-3">
          <li>
            • 벌점 12점이 되기 전, <b>교통법규를 학습하고 시험에 합격하면 벌점을 1~2점씩 깎아 줍니다</b>. 한 벌점 주기(1년)에 최대 <b>6점</b>까지 감면.
          </li>
          <li>• 온라인 학습 30분 + 시험 = <b>1점</b>. 交管12123 앱에서 신청합니다.</li>
          <li>
            • 시험 규칙: <b>20문제 · 문제당 60초</b>, <b>18문제 이상</b> 정답이면 합격. <b>오답(또는 시간 초과)이 3문제 누적</b>되면 자동으로 불합격 처리돼요.
          </li>
          <li>
            • 문제 유형: 판단형(正确/错误) + 단일 선택형. 시험은 <b>중국어로만</b> 나오니 보기 단계로 한국어 도움을 줄여 가며 연습하세요.
          </li>
        </ul>
        <div className="text-sm font-medium text-[#c0392b] mb-1.5">학법 감점을 못 받는 경우</div>
        <ul className="flex flex-col gap-1 text-[13px] sm:text-sm text-gray-700 leading-relaxed">
          {CANNOT.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </div>

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
                <div className={`flex items-center gap-3 mb-3 ${step.status ? '' : 'hidden'}`}>
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

      <p className="mt-6 text-xs text-gray-400 leading-relaxed">
        근거: 《接受交通安全教育扣减交通违法行为记分工作规范》· 交管12123 앱 "学法减分". 지역마다 운영 방식이 조금 다를 수 있으니 앱에서 꼭 확인하세요.
      </p>
    </div>
  );
}

// ───────── ② 법규학습은행 ─────────
function XfBank({ data, onBack, onGo }: { data: XfData; onBack: () => void; onGo: (view: View) => void }) {
  useDriverLicenseRecords();
  const wrong = getWrongMap();
  const ordered = useMemo(() => [...data.questions].sort((a, b) => a.c - b.c || a.id - b.id), [data]);
  const solved = solvedOf(ALL_KEY);
  const wrongCount = ordered.filter((q) => q.id in wrong).length;
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-10">
      <BackButton onClick={onBack} label="학법 감점으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">법규학습은행 {ordered.length}문제</h1>
      <p className="text-sm sm:text-[15px] text-gray-500 mb-6 leading-relaxed">
        交管12123 学法减分 문제은행을 주제별로 나눴어요. 주제를 고르면 문제를 풀어요. 풀이 화면 위의 <b>보기 단계</b>(1단계 한국어 → 2단계 중국어)로 한국어 도움을 줄여 가세요.
      </p>
      <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm mb-6">
        <div className="flex items-center gap-3 my-2.5">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-[#37a7f0]" style={{ width: `${ordered.length ? (solved / ordered.length) * 100 : 0}%` }}></div>
          </div>
          <span className="shrink-0 text-xs text-gray-500">
            전체 {solved}/{ordered.length} 풀이{wrongCount ? ` · 틀린 문제 ${wrongCount}` : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={btn.primary}
            onClick={() => onGo({ mode: 'quiz', title: `법규학습은행 ${ordered.length}문제 (순서대로)`, questions: ordered, storageKey: ALL_KEY, pool: ordered, key: Date.now() })}
          >
            {solved > 0 && solved < ordered.length ? `전체 이어서 풀기 (${solved}/${ordered.length})` : '전체 순서대로 풀기'}
          </button>
          <button className={btn.plain} onClick={() => onGo({ mode: 'quiz', title: `법규학습은행 ${ordered.length}문제 (랜덤)`, questions: shuffle(ordered), pool: ordered, key: Date.now() })}>
            랜덤으로 풀기
          </button>
          {wrongCount > 0 && (
            <button className={btn.danger} onClick={() => onGo({ mode: 'wrong', title: '전체', pool: ordered })}>
              틀린 문제만 ({wrongCount})
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {data.topics.map((topic) => {
          const key = `xf-t${topic.c}`;
          const questions = ordered.filter((q) => q.c === topic.c);
          const s = solvedOf(key);
          const t = questions.length;
          const wc = questions.filter((q) => q.id in wrong).length;
          return (
            <div key={topic.key} className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                <h2 className="text-[17px] font-bold text-gray-800">{topic.title}</h2>
                <span className="text-sm text-gray-500" lang="zh-CN">
                  {topic.zh}
                </span>
                <span className="ml-auto text-xs text-gray-400">{t}문제</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{topic.desc}</p>
              <div className="flex items-center gap-3 my-2.5">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#37a7f0]" style={{ width: `${t ? (s / t) * 100 : 0}%` }}></div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {s}/{t} 풀이{wc ? ` · 틀린 문제 ${wc}` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={btn.primary}
                  onClick={() => onGo({ mode: 'quiz', title: `${topic.title} (순서대로)`, questions, storageKey: key, pool: questions, key: Date.now(), back: { mode: 'bank' } })}
                >
                  {s > 0 && s < t ? `이어서 풀기 (${s}/${t})` : '풀기'}
                </button>
                <button
                  className={btn.plain}
                  onClick={() => onGo({ mode: 'quiz', title: `${topic.title} (랜덤)`, questions: shuffle(questions), pool: questions, key: Date.now(), back: { mode: 'bank' } })}
                >
                  랜덤으로 풀기
                </button>
                {wc > 0 && (
                  <button className={btn.danger} onClick={() => onGo({ mode: 'wrong', title: topic.title, pool: questions })}>
                    틀린 문제만 ({wc})
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

// ───────── ③ 실전 고사 (회차별 20문제: 1~5 판단 + 6~15 단선 + 16~20 다선, 사진 문제 5~7장) ─────────
function XfExams({ data, onBack, onPick }: { data: XfData; onBack: () => void; onPick: (no: number) => void }) {
  useDriverLicenseRecords();
  const results = getMockResults<MockResult>();
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <BackButton onClick={onBack} label="학법 감점으로 돌아가기" />
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">실전 고사 (学法减分考试)</h1>
        <p className="text-sm text-gray-500">交管12123 앱과 똑같은 구성이에요. 회차를 고르면 시험 규칙 안내 후 시작합니다.</p>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: 'fa-list-check', label: '문제 구성', value: '회차당 20문제', sub: '판단 5 · 단선 10 · 다선 5' },
          { icon: 'fa-image', label: '사진 문제', value: '회차당 5~7장', sub: '표지·신호·상황 그림 문제' },
          { icon: 'fa-clock', label: '문제당 시간', value: '60초', sub: '초과하면 오답 처리' },
          { icon: 'fa-award', label: '합격 기준', value: '18문제 이상', sub: '오답 3문제 누적 시 자동 불합격' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <i className={`fa-solid ${item.icon} text-xl mb-2 text-[#37a7f0]`}></i>
            <div className="text-xs text-gray-500">{item.label}</div>
            <div className="text-sm sm:text-base font-medium text-gray-800">{item.value}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1">{item.sub}</div>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-medium text-gray-800 mb-1">회차별 고사 ({data.exams.length}회분)</h2>
      <p className="text-xs text-gray-500 mb-4">앱과 같은 순서로 1~5번 판단, 6~15번 단선(1개 고르기), 16~20번 다선(여러 개 고르기)이에요. 회차끼리 문제가 겹치지 않아요. 다선은 보기를 여러 개 고른 뒤 “下一题”를 누르면 채점돼요.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.exams.map((_, i) => {
          const no = i + 1;
          const result = results[`xf2-exam${no}`];
          return (
            <button key={no} onClick={() => onPick(no)} className="text-left p-4 bg-white border-2 border-gray-100 rounded-lg hover:border-[#37a7f0] hover:shadow-md transition-all">
              <div className="font-medium text-gray-800 mb-1">제{no}회 고사</div>
              {result ? (
                <div className="text-xs text-gray-500">
                  최고 <b className={result.best >= EXAM_SIZE * (PASS_SCORE / 100) ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}>{result.best}점</b> · {result.attempts}회 응시
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

// ───────── ① 핵심 정리 카드 (만점 교육 카드와 같은 틀, 심플 버전) ─────────
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
  line: XfLine;
  level: MjLevel;
  open: boolean;
  onOpen: () => void;
  tokens?: string[];
  dict?: Record<string, [string, string, number]>;
}) {
  const [zh, pinyin, ko] = line;
  if (level === 1)
    return (
      <div className="flex-1 min-w-0">
        <div className="text-[15px] sm:text-base text-gray-900 leading-snug">{ko}</div>
        <div lang="zh-CN" className="text-[13px] text-[#b9560e] leading-snug break-words">
          <ZhText tokens={tokens} dict={dict} fallback={zh} />
        </div>
      </div>
    );
  const showKo = level === 2 || open;
  return (
    <div className="flex-1 min-w-0">
      <div lang="zh-CN" className="text-[15px] sm:text-base text-gray-900 leading-snug">
        <ZhText tokens={tokens} dict={dict} fallback={zh} />
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

function XfCards({ data, byId, onBack }: { data: XfData; byId: Map<number, DLQuestion>; onBack: () => void }) {
  useDriverLicenseRecords();
  const [level, setLevel] = useMjLevel();
  const words = useXfWords(true); // 카드 줄글 단어 팝업 (컴퓨터: 마우스 올리면, 모바일: 톡 누르면)
  const [topic, setTopic] = useState('전체');
  const [opened, setOpened] = useState<Set<string>>(new Set());
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
  const topics = ['전체', ...Array.from(new Set(data.cards.map((c) => c.topic)))];
  const cards = data.cards.map((card, i) => ({ card, i })).filter(({ card }) => topic === '전체' || card.topic === topic);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="속성 과정으로 돌아가기" />
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">① 핵심 정리 카드</h1>
      <p className="text-sm text-gray-500 mb-4">
        학법 감점 시험에 나오는 중국어 표현으로 정리했어요. 처음에는 1단계(한국어)로 뜻을 익히고, 익숙해지면 2단계(중국어만, 누르면 뜻)로 바꿔 보세요. ({done.size}/
        {data.cards.length}장 외움 · 체크 {checkedCount('xf:')}/{data.cards.length}장)
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
            className={`shrink-0 px-3 py-1.5 rounded-full border text-sm ${topic === t ? 'bg-[#37a7f0] border-[#37a7f0] text-white' : 'bg-white border-gray-300 text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map(({ card, i }) => {
          const isDone = done.has(i);
          const checks = card.check.map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q && q.t !== 'm');
          return (
            <div
              key={i}
              id={`xf-card-${i}`}
              className={`p-4 sm:p-5 rounded-lg border ${isDone ? 'border-green-300 bg-green-50/40' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="shrink-0 px-2 py-0.5 rounded bg-[#eef7fe] text-[#2a8bc9] text-xs">{card.topic}</span>
                <h3 className="flex-1 font-medium text-gray-800">
                  {card.title} <span className="text-sm font-normal text-gray-500" lang="zh-CN">{card.zh}</span>
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
                    <LineView
                      line={line}
                      level={level}
                      open={opened.has(`${i}:${j}`)}
                      onOpen={() => open(`${i}:${j}`)}
                      tokens={words?.ct[i]?.[j]}
                      dict={words?.d}
                    />
                  </li>
                ))}
              </ul>
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
              <ContentCheck
                key={`${i}-${level}`}
                itemKey={`xf:${i}`}
                questions={checkQuestions(checks, `xf:${i}`, level)}
                onDone={() => {
                  scrollToId(`xf-card-${i + 1}`);
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

