// 학법 감점 실전 고사 — 交管12123 "学法减分考试" 앱 화면을 그대로 재현
//  └ 파란 헤더(学法减分考试·?) + 1~20 답안 그리드(정답=초록·오답=빨강 즉시 채색) + 문제당 60초 원형 타이머
//  └ 라디오 보기(정답 선택 후 수정 불가) + 하단 下一题 그라데이션 버튼
//  └ 앱 규칙: 오답 또는 시간 초과가 3개 누적되면 자동 불합격 종료 / 18문제 이상 정답이면 합격
//  └ 모바일·컴퓨터 모두 같은 레이아웃(중앙 정렬 컬럼)
import { useEffect, useRef, useState } from 'react';
import { playTone, useSwipe, type DLQuestion } from './DriverLicenseQuiz';
import { recordAnswers, setMockResult, getMockResults, useDriverLicenseRecords } from '../utils/driverLicenseRecords';
import type { MockResult } from './DriverLicenseQuiz';

const EXAM_SECONDS_XF = 20 * 60;
const Q_SECONDS = 60; // 문제당 60초
const MAX_WRONG = 3; // 오답 3개 누적 시 자동 불합격 (앱 규칙)
const PASS_COUNT = 18;
const LETTERS = ['A', 'B', 'C', 'D'];

export type XfExamOutcome = {
  no: number;
  questions: DLQuestion[];
  answers: Record<number, number>; // 문제 인덱스 → 고른 보기(시간 초과는 -1)
  results: Record<number, boolean>; // 문제 인덱스 → 정답 여부
  correct: number;
  seconds: number;
  failedOut: boolean; // 오답 3개 누적으로 강제 종료
  continued: boolean; // 불합격 후 남은 문제를 이어서 풀었는지
};

type Props = {
  no: number;
  questions: DLQuestion[];
  onExit: () => void;
  onFinish: (outcome: XfExamOutcome) => void;
  initial?: { answers: Record<number, number>; results: Record<number, boolean>; continued: boolean }; // 이어풀기 재진입용
};

const RULES: [string, string][] = [
  ['적용 차종', 'A · B · C · D'],
  ['시험 기준', '20문제 · 20분 · 문제당 60초'],
  ['합격 기준', '18문제 이상 정답'],
  ['출제 규칙', '공안부 출제 규칙에 따라 구성 (은행 순서대로 20문제)'],
];

const NOTES = [
  '시험 모드에서는 답을 수정할 수 없어요.',
  '틀리거나 시간 초과(답 미선택)가 3문제 누적되면 자동으로 불합격 처리되고 시험이 종료돼요.',
  '위쪽 답안 그리드를 눌러 문제를 이동할 수 있어요 (이미 푼 문제는 색으로 표시).',
];

export function XfExamRunner({ no, questions, onExit, onFinish, initial }: Props) {
  const total = questions.length;
  const firstUnanswered = initial ? questions.findIndex((_, i) => initial.answers[i] === undefined) : 0;
  const [index, setIndex] = useState(firstUnanswered < 0 ? 0 : firstUnanswered);
  const [answers, setAnswers] = useState<Record<number, number>>(initial?.answers ?? {});
  const [results, setResults] = useState<Record<number, boolean>>(initial?.results ?? {});
  const [continued, setContinued] = useState(initial?.continued ?? false);
  const [secondsLeft, setSecondsLeft] = useState(Q_SECONDS);
  const [warn, setWarn] = useState(false);
  const [help, setHelp] = useState(false);
  const [failPending, setFailPending] = useState(false); // 오답 3개 누적 안내 (결과 보기/이어풀기 선택)
  const startedAt = useRef(Date.now());
  const q = questions[index];
  const answered = answers[index] !== undefined;
  const finishedRef = useRef(false);

  const finish = (failed: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const correct = Object.values(results).filter(Boolean).length;
    onFinish({
      no,
      questions,
      answers,
      results,
      correct,
      seconds: Math.min(EXAM_SECONDS_XF, Math.round((Date.now() - startedAt.current) / 1000)),
      failedOut: failed,
      continued,
    });
  };

  // 답 확정 (즉시 채점, 수정 불가)
  const lockAnswer = (idx: number, choice: number) => {
    if (answers[idx] !== undefined || finishedRef.current || failPending) return;
    const ok = questions[idx].a === choice;
    const nextAnswers = { ...answers, [idx]: choice };
    const nextResults = { ...results, [idx]: ok };
    setAnswers(nextAnswers);
    setResults(nextResults);
    playTone(ok);
    if (!ok && !continued && Object.values(nextResults).filter((r) => !r).length >= MAX_WRONG) {
      // 앱 규칙: 오답 3개 누적 → 안내 (결과 보기 또는 이어풀기 선택)
      setFailPending(true);
    }
  };

  // 문제 이동 (답을 골야 다음으로, 스와이프도 동일)
  const moveTo = (target: number) => {
    const next = Math.max(0, Math.min(total - 1, target));
    if (next === index) return;
    if (next > index && !answered) {
      setWarn(true);
      window.setTimeout(() => setWarn(false), 1300);
      return;
    }
    setIndex(next);
    setSecondsLeft(answers[next] === undefined ? Q_SECONDS : Q_SECONDS);
  };
  const swipe = useSwipe(
    () => moveTo(index - 1),
    () => moveTo(index + 1),
  );

  // 문제당 60초 카운트다운 (답을 고르면 정지)
  useEffect(() => {
    if (answered || failPending || finishedRef.current) return;
    if (secondsLeft <= 0) {
      // 시간 초과 → 오답 처리 후 자동으로 다음 문제
      lockAnswer(index, -1);
      window.setTimeout(() => {
        if (index < total - 1 && !finishedRef.current && !failPending) setIndex(index + 1);
      }, 900);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, answered, index, failPending]); // eslint-disable-line react-hooks/exhaustive-deps

  const ring = 2 * Math.PI * 26;
  const timeRatio = secondsLeft / Q_SECONDS;
  const isLast = index === total - 1;

  return (
    <div {...swipe} className="min-h-screen bg-[#f0f2f5]">
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
        <div className="bg-white rounded-b-lg shadow-sm px-2.5 py-3 mb-4">
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
                  : 'bg-[#eceff1] text-gray-500 border-transparent';
              return (
                <button key={i} onClick={() => moveTo(i)} className={`h-8 rounded border text-sm ${cls}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* 문제당 남은 시간 (원형 타이머) */}
        <div className="flex justify-center mb-4">
          <div className="relative w-[68px] h-[68px]">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className="text-[11px] text-gray-500">남은</span>
              <span className={`text-base font-bold ${secondsLeft <= 10 ? 'text-[#f44336]' : 'text-[#1c66c0]'}`}>{Math.max(0, secondsLeft)}s</span>
            </div>
          </div>
        </div>

        {/* 문제 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-4">
          <div className="text-sm text-gray-500 mb-1.5">
            ({q.t === 'j' ? '判断题' : '单选题'}) <span className="text-[#1c66c0] font-medium">{index + 1}、</span>
          </div>
          <div lang="zh-CN" className="text-[16px] sm:text-[17px] text-gray-900 leading-relaxed font-medium">
            {q.q}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(q.t === 'j' ? ['正确', '错误'] : q.o ?? []).map((opt, i) => {
              const chosen = answers[index] === i;
              return (
                <button
                  key={i}
                  onClick={() => lockAnswer(index, i)}
                  disabled={answered}
                  className={`flex items-center gap-3 text-left rounded-lg border px-3 py-3 transition-colors ${
                    chosen ? 'border-[#1c66c0] bg-[#eaf2fd]' : 'border-gray-200 bg-white active:bg-gray-50'
                  } ${answered ? 'cursor-default' : 'hover:border-[#1c66c0]'}`}
                >
                  <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${chosen ? 'border-[#1c66c0]' : 'border-gray-300'}`}>
                    {chosen && <span className="w-2.5 h-2.5 rounded-full bg-[#1c66c0]"></span>}
                  </span>
                  <span lang="zh-CN" className="text-[15px] sm:text-base text-gray-800">
                    {q.t === 'j' ? opt : `${LETTERS[i]}：${opt}`}
                  </span>
                </button>
              );
            })}
          </div>
          {answered && (
            <div className={`mt-3 text-sm font-medium ${results[index] ? 'text-[#4caf50]' : 'text-[#f44336]'}`}>
              {results[index] ? '✓ 정답이에요' : answers[index] === -1 ? '시간 초과 — 오답 처리' : '✗ 오답이에요'}
            </div>
          )}
        </div>

        {/* 스와이프 시 답 미선택 안내 */}
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
              <div className="text-lg font-bold text-[#f44336] mb-1">시험 불합격</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">오답(또는 시간 초과)이 3문제 누적되었어요.<br />실제 시험은 여기서 종료됩니다.</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setContinued(true);
                    setFailPending(false);
                  }}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#1c66c0] text-white text-[15px] font-semibold"
                >
                  이어풀기 (남은 문제 풀기)
                </button>
                <button onClick={() => finish(true)} className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[15px] bg-white">
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
              <button onClick={() => setHelp(false)} className="mt-4 w-full py-2.5 rounded-lg bg-[#1c66c0] text-white text-[15px]">
                확인
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 下一题 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#f0f2f5] border-t border-gray-200">
        <div className="mx-auto max-w-[560px] px-3 py-3">
          <button
            onClick={() => {
              if (!answered) return;
              if (isLast) finish(false);
              else moveTo(index + 1);
            }}
            disabled={!answered}
            className={`w-full py-3.5 rounded-lg text-white text-[16px] font-semibold ${
              answered ? 'bg-gradient-to-r from-[#3b82f6] to-[#1c66c0] shadow-md' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLast ? '제출하기 (提交)' : '다음 문제 (下一题)'}
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
    const r = getMockResults<MockResult>()[`xf-exam${no}`];
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
            const isCorrect = sel !== undefined && sel === q.a;
            const options = q.t === 'j' ? ['正确', '错误'] : q.o ?? [];
            const koOptions = q.t === 'j' ? ['맞음', '틀림'] : q.ko?.o ?? [];
            return (
              <div key={i} className={`bg-white rounded-lg shadow-sm border-l-4 px-4 py-3 ${isCorrect ? 'border-[#4caf50]' : 'border-[#f44336]'}`}>
                <div className="text-xs text-gray-500 mb-1">
                  {i + 1}. ({q.t === 'j' ? '判断题' : '单选题'}) · {isCorrect ? '정답' : sel === -1 ? '시간 초과' : '오답'}
                </div>
                <div lang="zh-CN" className="text-[15px] text-gray-900 leading-relaxed mb-1">
                  {q.q}
                </div>
                {q.ko?.q && <div className="text-[13px] text-gray-500 mb-2">{q.ko.q}</div>}
                <div className="flex flex-col gap-1.5 mt-2">
                  {options.map((opt, j) => {
                    const isAnswer = j === q.a;
                    const isSel = sel === j;
                    return (
                      <div
                        key={j}
                        className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-[14px] ${
                          isAnswer ? 'border-[#4caf50] bg-green-50' : isSel ? 'border-[#f44336] bg-red-50' : 'border-gray-100'
                        }`}
                      >
                        <span lang="zh-CN" className="text-gray-800">
                          {q.t === 'j' ? opt : `${LETTERS[j]}：${opt}`}
                        </span>
                        <span className="shrink-0 text-xs">
                          {isAnswer && <span className="text-[#4caf50] font-medium">정답</span>}
                          {isSel && !isAnswer && <span className="text-[#f44336] font-medium">내 답</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {(q.ko?.q || q.e) && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-[13px] text-gray-600 leading-relaxed">
                    {q.ko?.o && (
                      <div className="mb-1">
                        <b>보기:</b> {options.map((o, j) => `${LETTERS[j] ?? ''}${koOptions[j] ?? o}`).join(' / ')}
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
              <button onClick={onContinue} className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#f39c12] text-white text-[16px] font-semibold shadow-md">
                이어풀기 (남은 {remaining}문제)
              </button>
            )}
            <button onClick={onRetry} className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#1c66c0] text-white text-[16px] font-semibold shadow-md">
              다시 응시 (再考一次)
            </button>
            <button onClick={() => setReview(true)} className="w-full py-3.5 rounded-lg border-2 border-[#1c66c0] text-[#1c66c0] text-[16px] font-semibold bg-white">
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

// 학법 시험 결과 기록 (만점 recordAnswers 재사용)
export function recordXfExam(outcome: XfExamOutcome) {
  recordAnswers(
    outcome.questions
      .map((q, i) => ({ id: q.id, selected: outcome.answers[i], correct: outcome.answers[i] === q.a }))
      .filter((r) => r.selected !== undefined && r.selected !== -1),
  );
  const key = `xf-exam${outcome.no}`;
  const prev = getMockResults<MockResult>()[key];
  setMockResult(key, {
    best: Math.max(prev?.best ?? 0, outcome.correct),
    last: outcome.correct,
    attempts: (prev?.attempts ?? 0) + 1,
    date: new Date().toLocaleDateString('ko-KR'),
  });
}
