// 학법 감점 실전 고사 — 交管12123 "学法减分考试" 앱 화면을 그대로 재현
//  └ 시작: 考试规则 안내 화면(앱 1번 화면) → 模拟考试 누르면 시험 화면(앱 2번 화면)
//  └ 시험 화면: 파란 헤더 + 1~20 답안 그리드 + 剩余 60s 원형 타이머 + (判断题/单选题/多选题) + 하단 下一题
//  └ 판단형은 "Y：正确 / N：错误", 단선형은 라디오, 다선형은 네모 체크(下一题를 눌러야 채점)
//  └ 앱 규칙: 답 수정 불가 · 오답/초과 누적 3문제면 불합격(이어풀기 가능) · 18문제 이상 합격
//  └ 시험 화면은 앱과 똑같이 중국어로만 표시 (한국어 번역·해설은 시험지 검토에서)
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSwipe, imageUrl, type DLQuestion } from './DriverLicenseQuiz';
import { recordAnswers, setMockResult, getMockResults, useDriverLicenseRecords } from '../utils/driverLicenseRecords';
import type { MockResult } from './DriverLicenseQuiz';

const EXAM_SECONDS_XF = 20 * 60;
const Q_SECONDS = 60; // 문제당 60초
const MAX_WRONG = 3; // 오답 3개 누적 시 불합격 (앱 규칙)
const PASS_COUNT = 18;
const LETTERS = ['A', 'B', 'C', 'D'];

/** 시험 문제: 은행 문제(judge/단선) + 다선 전용 문제(t='m', ma=정답 문자열) */
export type XfQ = {
  id: number;
  c: number;
  t: 'j' | 's' | 'm';
  q: string;
  o?: string[];
  a: number;
  ma?: string;
  e: string;
  ko?: { q: string; o?: string[] } | null;
  img?: string[];
};

export type XfExamOutcome = {
  no: number;
  questions: XfQ[];
  answers: Record<number, number | string>; // 문제 인덱스 → 고른 보기(단일: 숫자, 시간 초과: -1, 다선: "AC" 문자열)
  results: Record<number, boolean>;
  correct: number;
  seconds: number;
  failedOut: boolean; // 오답 3개 누적으로 강제 종료
  continued: boolean; // 불합격 후 남은 문제를 이어서 풀었는지
};

const RULES: [string, string][] = [
  ['适用车型', 'A、B、C、D'],
  ['考试标准', '20题，20分钟，限时60秒/题'],
  ['合格标准', '答对18题及以上'],
  ['出题规则', '根据公安部出题规则组卷'],
];

const NOTES = [
  '进入考试模式不可修改答案，答错或者超时未答累计3题的，系统自动判定考试不合格并退出考试。',
  '多选题：选择后按“下一题”提交答案。',
  '上方答题卡可点击跳题，已答题目用颜色标记。',
];

const CANNOT_ZH = [
  '（1）在本记分周期内或者上一个记分周期内，机动车驾驶人有二次以上参加满分教育记录的；',
  '（2）在最近三个记分周期内，机动车驾驶人因造成交通事故后逃逸，或者饮酒后驾驶机动车，或者使用伪造、变造的机动车号牌、行驶证、驾驶证、校车标牌，或者使用其他机动车号牌、行驶证，或者买分卖分被处理的；',
];

const WHAT_IS = '机动车驾驶人处理完交通违法行为记录后累积记分未满12分，参加公安机关交通管理部门组织的交通安全教育并达到规定要求的，可以申请在机动车驾驶人现有累积记分分值中扣减记分。在一个记分周期内累计最高扣减6分。';

const selLetters = (sel: number | string | undefined) => (typeof sel === 'string' ? sel : '');
const isMulti = (q: XfQ) => q.t === 'm';

/** 고사 흐름 전체화면 오버레이: 앱 상단 내비게이션 바·하단 내비게이션 바를 가리고 시험 화면만 보이게 함 */
export function XfFullscreen({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-[#f0f2f5]">
      {children}
    </div>
  );
}

// ───────── 시작 전 考试规则 안내 화면 (앱 1번 화면) ─────────
export function XfExamRules({ no, total, onBack, onStart }: { no: number; total: number; onBack: () => void; onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="sticky top-0 z-20 bg-[#1c66c0] text-white shadow-md">
        <div className="mx-auto flex max-w-[560px] items-center gap-1 px-3 py-3">
          <button onClick={onBack} aria-label="돌아가기" className="w-9 h-9 flex items-center justify-center text-lg">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold">学法减分考试</h1>
          <span className="w-9"></span>
        </div>
      </div>
      <div className="mx-auto max-w-[560px] px-4 py-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3">考试规则</h2>
        <ul className="flex flex-col gap-1.5 text-[15px] text-gray-800 mb-1">
          {RULES.map(([k, v]) => (
            <li key={k} className="flex gap-2">
              <span className="shrink-0 text-gray-600">{k}：</span>
              <span className="font-medium">{v}</span>
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
          温馨提示：{NOTES[0]}
        </p>

        <h2 className="text-lg font-bold text-gray-900 mb-2">什么是学法减分？</h2>
        <p lang="zh-CN" className="text-[15px] text-gray-800 leading-relaxed mb-6">
          {WHAT_IS}
        </p>

        <h2 className="text-lg font-bold text-gray-900 mb-2">有以下情形之一，不可参加学法减分</h2>
        <ul className="flex flex-col gap-2 text-[14px] text-gray-800 leading-relaxed mb-8">
          {CANNOT_ZH.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 pb-8">
          <button onClick={onStart} className="w-full py-3.5 rounded-full bg-[#1c66c0] text-white text-[17px] font-semibold shadow-md">
            模拟考试（第{no}回 · {total}题）
          </button>
          <button onClick={onStart} className="w-full py-3.5 rounded-full border-2 border-[#1c66c0] text-[#1c66c0] text-[17px] font-semibold bg-white">
            真实考场模拟
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── 시험 화면 (앱 2번 화면) ─────────
type RunnerProps = {
  no: number;
  questions: XfQ[];
  onExit: () => void;
  onFinish: (outcome: XfExamOutcome) => void;
  initial?: { answers: Record<number, number | string>; results: Record<number, boolean>; continued: boolean }; // 이어풀기 재진입용
};

export function XfExamRunner({ no, questions, onExit, onFinish, initial }: RunnerProps) {
  const total = questions.length;
  const firstUnanswered = initial ? questions.findIndex((_, i) => initial.answers[i] === undefined) : 0;
  const [index, setIndex] = useState(firstUnanswered < 0 ? 0 : firstUnanswered);
  const [answers, setAnswers] = useState<Record<number, number | string>>(initial?.answers ?? {});
  const [results, setResults] = useState<Record<number, boolean>>(initial?.results ?? {});
  const [continued, setContinued] = useState(initial?.continued ?? false);
  const [multiPick, setMultiPick] = useState<string>(''); // 다선형: 아직 제출 안 한 선택(A-D)
  const [secondsLeft, setSecondsLeft] = useState(Q_SECONDS);
  const [warn, setWarn] = useState(false);
  const [help, setHelp] = useState(false);
  const [failPending, setFailPending] = useState(false);
  const startedAt = useRef(Date.now());
  const q = questions[index];
  const answered = answers[index] !== undefined;
  const finishedRef = useRef(false);
  // 마지막 채점 결과 (같은 클릭 안에서 finish가 갱신 전 state를 읽지 않게)
  const latest = useRef({ answers, results });
  latest.current = { answers, results };

  const gradeAndLock = (idx: number, sel: number | string) => {
    if (answers[idx] !== undefined || finishedRef.current || failPending) return null;
    const qd = questions[idx];
    const ok = isMulti(qd) ? sel === qd.ma : sel === qd.a;
    const nextAnswers = { ...answers, [idx]: sel };
    const nextResults = { ...results, [idx]: ok };
    setAnswers(nextAnswers);
    setResults(nextResults);
    latest.current = { answers: nextAnswers, results: nextResults };
    if (!ok && !continued && Object.values(nextResults).filter((r) => !r).length >= MAX_WRONG) {
      // 앱 규칙: 오답 3개 누적 → 안내 (결과 보기 또는 이어풀기 선택)
      setFailPending(true);
      return true; // 실패 트리거
    }
    return false;
  };

  const finish = (failed: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const { answers: finalAnswers, results: finalResults } = latest.current;
    const correct = Object.values(finalResults).filter(Boolean).length;
    onFinish({
      no,
      questions,
      answers: finalAnswers,
      results: finalResults,
      correct,
      seconds: Math.min(EXAM_SECONDS_XF, Math.round((Date.now() - startedAt.current) / 1000)),
      failedOut: failed,
      continued,
    });
  };

  // 문제 이동 (단일·판단은 답을 골야 다음으로, 다선은 下一题 제출 필요)
  // justAnswered: 방금 채점한 다선 문제 — 같은 렌더의 answered 값은 아직 갱신 전이라 따로 넘김
  const moveTo = (target: number, justAnswered = false) => {
    const next = Math.max(0, Math.min(total - 1, target));
    if (next === index) return;
    if (next > index && !answered && !justAnswered) {
      setWarn(true);
      window.setTimeout(() => setWarn(false), 1300);
      return;
    }
    setIndex(next);
    setMultiPick('');
    setSecondsLeft(Q_SECONDS);
  };
  const swipe = useSwipe(
    () => moveTo(index - 1),
    () => moveTo(index + 1),
  );

  // 다음 문제 (다선형은 여기서 채점)
  const nextStep = () => {
    if (isMulti(q) && !answered) {
      const fail = gradeAndLock(index, multiPick);
      if (fail) return; // 불합격 안내창 표시
      if (index === total - 1) finish(false);
      else moveTo(index + 1, true);
      return;
    }
    if (!answered) return;
    if (index === total - 1) finish(false);
    else moveTo(index + 1);
  };

  // 문제당 60초 카운트다운 (답을 고르면 정지)
  useEffect(() => {
    if (answered || failPending || finishedRef.current) return;
    if (secondsLeft <= 0) {
      // 시간 초과 → 오답 처리 후 자동으로 다음 문제
      const sel = isMulti(q) ? multiPick : -1;
      const fail = gradeAndLock(index, sel);
      window.setTimeout(() => {
        if (!finishedRef.current && !fail && index < total - 1) setIndex(index + 1);
      }, 900);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, answered, index, failPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const ring = 2 * Math.PI * 26;
  const timeRatio = secondsLeft / Q_SECONDS;
  const isLast = index === total - 1;
  const typeLabel = q.t === 'j' ? '判断题' : q.t === 'm' ? '多选题' : '单选题';
  const options = q.t === 'j' ? ['正确', '错误'] : q.o ?? [];
  const optionPrefix = (i: number) => (q.t === 'j' ? ['Y', 'N'][i] : LETTERS[i]);

  return (
    <div {...swipe} className="min-h-screen bg-[#f7f8fa]">
      {/* 파란 헤더 */}
      <div className="sticky top-0 z-20 bg-[#1c66c0] text-white shadow-md">
        <div className="mx-auto flex max-w-[560px] items-center gap-1 px-3 py-3">
          <button onClick={() => window.confirm('시험을 그만두시겠어요? 지금까지 고른 답은 저장되지 않습니다.') && onExit()} aria-label="시험 종료" className="w-9 h-9 flex items-center justify-center text-lg">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold">学法减分考试</h1>
          <button onClick={() => setHelp(true)} aria-label="시험 규칙" className="w-9 h-9 flex items-center justify-center text-base">
            <i className="fa-solid fa-circle-question"></i>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[560px] px-3 pb-28">
        {/* 답안 그리드 (앱과 같은 2줄 × 10) */}
        <div className="pt-3 pb-1">
          <div className="grid grid-cols-10 gap-1.5">
            {questions.map((_, i) => {
              const r = results[i];
              const isAnswered = answers[i] !== undefined;
              const cls = isAnswered
                ? r
                  ? 'bg-[#4caf50] text-white border-[#4caf50]'
                  : 'bg-[#f44336] text-white border-[#f44336]'
                : i === index
                  ? 'bg-white text-[#1c66c0] border-[#1c66c0] font-bold'
                  : 'bg-[#e8eaed] text-gray-500 border-transparent';
              return (
                <button key={i} onClick={() => moveTo(i)} className={`h-9 rounded-md border text-[15px] ${cls}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* 문제당 남은 시간 (원형 타이머) */}
        <div className="flex justify-center my-4">
          <div className="relative w-[72px] h-[72px]">
            <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
              <circle cx="30" cy="30" r="26" fill="white" stroke="#e5e7eb" strokeWidth="4"></circle>
              <circle
                cx="30" cy="30" r="26" fill="none"
                stroke={secondsLeft <= 10 ? '#f44336' : '#1c66c0'}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={ring}
                strokeDashoffset={ring * (1 - timeRatio)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
              <span className="text-[12px] text-gray-500">剩余</span>
              <span className={`text-[15px] font-bold ${secondsLeft <= 10 ? 'text-[#f44336]' : 'text-[#1c66c0]'}`}>{Math.max(0, secondsLeft)}s</span>
            </div>
          </div>
        </div>

        {/* 문제 */}
        <div className="px-1">
          <div className="text-[15px] text-gray-800 mb-1">（{typeLabel}）</div>
          <div lang="zh-CN" className="text-[17px] sm:text-lg text-gray-900 leading-relaxed">
            {index + 1}、{q.q}
          </div>
          <div className="mt-5 flex flex-col gap-4">
            {options.map((opt, i) => {
              const sel = answers[index];
              const chosen = isMulti(q) ? selLetters(sel).includes(LETTERS[i]) : sel === i;
              const pick = isMulti(q) && !answered && multiPick.includes(LETTERS[i]);
              const active = answered ? chosen : pick || chosen;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (answered) return;
                    if (isMulti(q)) {
                      // 다선형: 눌러서 선택/해제 (下一题로 제출)
                      setMultiPick((prev) => (prev.includes(LETTERS[i]) ? prev.replace(LETTERS[i], '') : (prev + LETTERS[i]).split('').sort().join('')));
                    } else {
                      const fail = gradeAndLock(index, i);
                      if (!fail && fail !== null && index === total - 1) {
                        // 마지막 문제였고 실패 아님 → 下一题를 눌러야 제출 (앱과 동일하게 버튼으로)
                      }
                    }
                  }}
                  disabled={answered}
                  className={`flex items-center gap-3 text-left ${answered ? 'cursor-default' : ''}`}
                >
                  {isMulti(q) ? (
                    <span className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center ${active ? 'border-[#1c66c0] bg-[#1c66c0]' : 'border-gray-300 bg-white'}`}>
                      {active && <i className="fa-solid fa-check text-white text-xs"></i>}
                    </span>
                  ) : (
                    <span className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#1c66c0]' : 'border-gray-300 bg-white'}`}>
                      {active && <span className="w-3 h-3 rounded-full bg-[#1c66c0]"></span>}
                    </span>
                  )}
                  <span lang="zh-CN" className="text-[16px] sm:text-[17px] text-gray-900">
                    {optionPrefix(i)}：{opt}
                  </span>
                </button>
              );
            })}
          </div>
          {/* 사진문제: 실제 앱처럼 질문→보기→사진 순 */}
          {q.img && q.img.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {q.img.map((name) => (
                <img key={name} src={imageUrl(name)} alt="문제 그림" loading="lazy" className="max-w-full h-auto max-h-56 rounded border border-gray-200 bg-white object-contain" />
              ))}
            </div>
          )}
        </div>

        {/* 스와이프 시 답 미제출 안내 */}
        {warn && (
          <div className="pointer-events-none fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-black/75 text-white text-sm whitespace-nowrap">
            <i className="fa-solid fa-circle-exclamation mr-1.5"></i>먼저 답을 골라 주세요
          </div>
        )}

        {/* 오답 3개 누적 안내: 결과 보기 또는 이어풀기 */}
        {failPending && (
          <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center px-6">
            <div className="bg-white rounded-xl p-6 text-center max-w-[340px]">
              <div className="text-4xl mb-2">😵</div>
              <div className="text-lg font-bold text-[#f44336] mb-1">考试不合格</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">오답(또는 시간 초과)이 3문제 누적되었어요.<br />실제 시험은 여기서 종료됩니다.</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setContinued(true);
                    setFailPending(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#1c66c0] text-white text-[15px] font-semibold"
                >
                  이어풀기 (남은 문제 풀기)
                </button>
                <button onClick={() => finish(true)} className="w-full py-2.5 rounded-full border border-gray-300 text-gray-700 text-[15px] bg-white">
                  결과 보기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 시험 규칙 도움말 */}
        {help && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center px-5" onClick={() => setHelp(false)}>
            <div className="bg-white rounded-xl w-full max-w-[420px] max-h-[80vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-800 mb-3">考试规则 (시험 규칙)</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-gray-700 mb-4">
                {RULES.map(([k, v]) => (
                  <li key={k} className="flex gap-2">
                    <span className="shrink-0 text-gray-500 w-[70px]">{k}</span>
                    <span className="font-medium">{v}</span>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col gap-1.5 text-[13px] text-gray-600 leading-relaxed">
                {NOTES.map((n) => (
                  <li key={n}>• {n}</li>
                ))}
              </ul>
              <button onClick={() => setHelp(false)} className="mt-4 w-full py-2.5 rounded-full bg-[#1c66c0] text-white text-[15px]">
                확인
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 下一题 버튼 (앱과 같은 알약 모양) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#f7f8fa] border-t border-gray-200">
        <div className="mx-auto max-w-[560px] px-4 py-3">
          <button
            onClick={nextStep}
            disabled={!answered && !(isMulti(q) && multiPick)}
            className={`w-full py-3.5 rounded-full text-white text-[17px] font-semibold ${
              answered || (isMulti(q) && multiPick) ? 'bg-gradient-to-r from-[#3b82f6] to-[#1c66c0] shadow-md' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            下一题
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── 결과 + 시험지 검토 (앱 결과 화면 형식) ─────────
export function XfExamResultView({ outcome, onRetry, onList, onContinue }: { outcome: XfExamOutcome; onRetry: () => void; onList: () => void; onContinue?: () => void }) {
  useDriverLicenseRecords();
  const [review, setReview] = useState(false);
  const { no, questions, answers, correct, seconds, failedOut, continued } = outcome;
  const passed = !failedOut && !continued && correct >= PASS_COUNT;
  const remaining = questions.length - Object.keys(answers).length;
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const best = (() => {
    const r = getMockResults<MockResult>()[`xf2-exam${no}`];
    return r?.best ?? correct;
  })();

  if (review) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <div className="sticky top-0 z-20 bg-[#1c66c0] text-white shadow-md">
          <div className="mx-auto flex max-w-[560px] items-center gap-1 px-3 py-3">
            <button onClick={() => setReview(false)} aria-label="결과로 돌아가기" className="w-9 h-9 flex items-center justify-center text-lg">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <h1 className="flex-1 text-center text-lg font-semibold">시험지 검토 (回顾试卷)</h1>
            <span className="w-9"></span>
          </div>
        </div>
        <div className="mx-auto max-w-[560px] px-3 py-4 flex flex-col gap-3 pb-10">
          {questions.map((q, i) => {
            const sel = answers[i];
            const isMultiQ = isMulti(q);
            const selStr = isMultiQ ? selLetters(sel) : typeof sel === 'number' && sel >= 0 ? LETTERS[sel] : '';
            const ansStr = isMultiQ ? q.ma ?? '' : LETTERS[q.a];
            const isCorrect = results[i];
            const options = q.t === 'j' ? ['正确', '错误'] : q.o ?? [];
            const koOptions = q.t === 'j' ? ['맞음', '틀림'] : q.ko?.o ?? [];
            const prefixes = q.t === 'j' ? ['Y', 'N'] : LETTERS;
            return (
              <div key={i} className={`bg-white rounded-lg shadow-sm border-l-4 px-4 py-3 ${isCorrect ? 'border-[#4caf50]' : 'border-[#f44336]'}`}>
                <div className="text-xs text-gray-500 mb-1">
                  {i + 1}. （{q.t === 'j' ? '判断题' : q.t === 'm' ? '多选题' : '单选题'}） · {isCorrect ? '정답' : sel === -1 ? '시간 초과' : '오답'}
                </div>
                <div lang="zh-CN" className="text-[15px] text-gray-900 leading-relaxed mb-1">
                  {q.q}
                </div>
                {q.ko?.q && <div className="text-[13px] text-gray-500 mb-2">{q.ko.q}</div>}
                <div className="flex flex-col gap-1.5 mt-2">
                  {options.map((opt, j) => {
                    const inAnswer = isMultiQ ? (q.ma ?? '').includes(LETTERS[j]) : q.a === j;
                    const inSel = isMultiQ ? selStr.includes(LETTERS[j]) : sel === j;
                    return (
                      <div
                        key={j}
                        className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-[14px] ${
                          inAnswer ? 'border-[#4caf50] bg-green-50' : inSel ? 'border-[#f44336] bg-red-50' : 'border-gray-100'
                        }`}
                      >
                        <span lang="zh-CN" className="text-gray-800">
                          {prefixes[j]}：{opt}
                        </span>
                        <span className="shrink-0 text-xs">
                          {inAnswer && <span className="text-[#4caf50] font-medium">정답</span>}
                          {inSel && !inAnswer && <span className="text-[#f44336] font-medium">내 답</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {q.img && q.img.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-2">
                    {q.img.map((name) => (
                      <img key={name} src={imageUrl(name)} alt="문제 그림" loading="lazy" className="max-w-full h-auto max-h-44 rounded border border-gray-200 bg-white object-contain" />
                    ))}
                  </div>
                )}
                {(q.ko?.q || q.e) && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-[13px] text-gray-600 leading-relaxed">
                    {q.ko?.o && (
                      <div className="mb-1">
                        <b>보기:</b> {options.map((o, j) => `${prefixes[j]}${koOptions[j] ?? o}`).join(' / ')}
                      </div>
                    )}
                    {isMultiQ && (
                      <div className="mb-1">
                        <b>정답:</b> {ansStr}
                        {!isCorrect && selStr && <span className="text-[#f44336]"> (내 답 {selStr})</span>}
                      </div>
                    )}
                    {q.e && (
                      <div>
                        <b>해설:</b> {q.e}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="sticky top-0 z-20 bg-[#1c66c0] text-white shadow-md">
        <div className="mx-auto flex max-w-[560px] items-center gap-1 px-3 py-3">
          <span className="w-9"></span>
          <h1 className="flex-1 text-center text-lg font-semibold">考试结果</h1>
          <span className="w-9"></span>
        </div>
      </div>
      <div className="mx-auto max-w-[560px] px-3 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-3">{passed ? '😄' : continued ? '📝' : '😵'}</div>
          <div className={`text-2xl font-bold mb-1 ${passed ? 'text-[#4caf50]' : 'text-[#f44336]'}`}>{passed ? '시험 합격!' : continued ? '이어풀기 완료' : '시험 불합격'}</div>
          {failedOut && !continued && <div className="text-sm text-gray-500 mb-1">오답 3문제 누적으로 자동 종료됐어요</div>}
          {continued && <div className="text-sm text-gray-500 mb-1">불합격 후 남은 문제를 이어서 풀었어요</div>}
          <div className="text-sm text-gray-500 mb-6">제{no}회 고사 · 최고 기록 {best}/{questions.length}문제</div>
          <div className="grid grid-cols-3 gap-2 text-center mb-8">
            <div className="bg-[#eaf2fd] rounded-lg py-3">
              <div className="text-xs text-gray-500 mb-1">本次答题 (응시)</div>
              <div className="text-lg font-bold text-[#1c66c0]">{Object.keys(answers).length}문제</div>
            </div>
            <div className="bg-green-50 rounded-lg py-3">
              <div className="text-xs text-gray-500 mb-1">答对题目 (정답)</div>
              <div className="text-lg font-bold text-[#4caf50]">{correct}문제</div>
            </div>
            <div className="bg-orange-50 rounded-lg py-3">
              <div className="text-xs text-gray-500 mb-1">考试用时 (소요)</div>
              <div className="text-lg font-bold text-[#f39c12]">
                {mm}'{String(ss).padStart(2, '0')}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {failedOut && !continued && remaining > 0 && onContinue && (
              <button onClick={onContinue} className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#f39c12] text-white text-[16px] font-semibold shadow-md">
                이어풀기 (남은 {remaining}문제)
              </button>
            )}
            <button onClick={onRetry} className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#1c66c0] text-white text-[16px] font-semibold shadow-md">
              다시 응시 (再考一次)
            </button>
            <button onClick={() => setReview(true)} className="w-full py-3.5 rounded-full border-2 border-[#1c66c0] text-[#1c66c0] text-[16px] font-semibold bg-white">
              시험지 검토 (回顾试卷)
            </button>
            <button onClick={onList} className="w-full py-3 text-sm text-gray-500 hover:text-gray-700">
              실전 고사 목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 학법 시험 결과 기록 (단일·판단형만 오답 노트에 기록)
export function recordXfExam(outcome: XfExamOutcome) {
  recordAnswers(
    outcome.questions
      .map((q, i) => ({ id: q.id, selected: typeof outcome.answers[i] === 'number' ? (outcome.answers[i] as number) : undefined, correct: outcome.results[i] }))
      .filter((r) => r.selected !== undefined && r.selected !== -1),
  );
  const key = `xf2-exam${outcome.no}`; // 2026-11 판단5·단선10·다선5로 회차를 새로 짜서 기록 키도 새로
  const prev = getMockResults<MockResult>()[key];
  setMockResult(key, {
    best: Math.max(prev?.best ?? 0, outcome.correct),
    last: outcome.correct,
    attempts: (prev?.attempts ?? 0) + 1,
    date: new Date().toLocaleDateString('ko-KR'),
  });
}
