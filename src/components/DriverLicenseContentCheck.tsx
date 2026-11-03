// 암기 카드·핵심 내용 바로 아래에서 여는 인라인 체크
// - 모두 맞히면 '체크 완료'로 저장하고 다음 내용으로 스크롤
// - 하나라도 틀리면 해설을 보여 주고 다시 체크
import { useState } from 'react';
import { getProgress, setProgress } from '../utils/driverLicenseRecords';
import type { CheckQuestion } from '../data/driverLicenseCheckQuestions';

export const CHECK_KEY = 'fast-check';
type CheckMap = Record<string, { ok: 1; t: number }>;

const imageUrl = (name: string) => `${import.meta.env.BASE_URL}driver-license/img/${name}`;

export function readChecks(): CheckMap {
  return getProgress<CheckMap>(CHECK_KEY) ?? {};
}

/** prefix로 시작하는 체크 완료 개수 (card: / stage:a1: 등) */
export function checkedCount(prefix: string): number {
  return Object.keys(readChecks()).filter((key) => key.startsWith(prefix)).length;
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function ContentCheck({
  itemKey,
  questions,
  onDone,
}: {
  itemKey: string;
  questions: CheckQuestion[];
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(0);
  const [result, setResult] = useState<'ok' | 'retry' | null>(null);
  const [, bump] = useState(0);

  if (questions.length === 0) return null;

  const done = !!readChecks()[itemKey];
  const q = questions[index];
  const last = index === questions.length - 1;

  const reset = () => {
    setIndex(0);
    setPicked(null);
    setWrong(0);
    setResult(null);
  };

  const start = () => {
    reset();
    setOpen(true);
  };

  const choose = (choice: number) => {
    if (picked !== null) return;
    setPicked(choice);
    if (choice !== q.answer) setWrong((n) => n + 1);
  };

  const next = () => {
    if (!last) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    if (wrong === 0) {
      const map = readChecks();
      map[itemKey] = { ok: 1, t: Date.now() };
      setProgress(CHECK_KEY, map);
      setResult('ok');
      window.setTimeout(() => {
        setOpen(false);
        reset();
        bump((n) => n + 1);
        onDone?.();
      }, 700);
    } else {
      setResult('retry');
    }
  };

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={start}
          className={`text-sm px-3 py-1.5 rounded-full border ${
            done ? 'border-green-500 text-green-700 bg-white' : 'border-[#37a7f0] text-[#2a8bc9] bg-white hover:bg-[#eef7fe]'
          }`}
        >
          {done ? '✓ 체크 완료 · 다시 체크' : `이 내용 체크 · ${questions.length}문제`}
        </button>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-[#fafbfc] p-3 sm:p-4 text-[14px] sm:text-[15px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-gray-500">
              {result === 'ok' ? '✓ 모두 맞혔어요' : result === 'retry' ? '다시 체크해요' : `체크 ${index + 1}/${questions.length}`}
            </span>
            <button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              닫기
            </button>
          </div>

          {result === 'ok' ? (
            <div className="text-sm text-green-700">✓ 체크 완료 — 다음 내용으로 넘어갑니다.</div>
          ) : result === 'retry' ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[#c0392b]">{questions.length}문제 중 {wrong}개를 틀렸어요.</span>
              <button onClick={start} className="text-sm px-3 py-1.5 rounded-full bg-[#37a7f0] text-white hover:bg-[#2a8bc9]">
                다시 체크
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-800 leading-relaxed">
                <span className="mr-1.5 px-1.5 py-0.5 rounded bg-[#eef7fe] text-[#2a8bc9] text-xs align-middle">
                  {q.kind === 'judge' ? '판단형' : '선택형'}
                </span>
                {q.prompt}
              </p>
              {q.img && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {q.img.map((name) => (
                    <img
                      key={name}
                      src={imageUrl(name)}
                      alt="체크 문제 그림"
                      loading="lazy"
                      className="max-h-36 max-w-full w-auto rounded border border-gray-200 bg-white"
                    />
                  ))}
                </div>
              )}
              <div className={`mt-2 grid gap-x-4 gap-y-1.5 ${q.choices.length === 2 ? 'grid-cols-2' : 'sm:grid-cols-2'}`}>
                {q.choices.map((choice, i) => {
                  const isAnswer = i === q.answer;
                  const chosen = picked === i;
                  const style =
                    picked === null
                      ? 'text-gray-600 hover:bg-[#eef7fe] hover:text-[#2a8bc9]'
                      : isAnswer
                        ? 'text-green-700 bg-green-50'
                        : chosen
                          ? 'text-[#c0392b] bg-red-50'
                          : 'text-gray-400';
                  return (
                    <button
                      key={choice}
                      onClick={() => choose(i)}
                      disabled={picked !== null}
                      className={`text-left leading-relaxed px-1.5 py-0.5 rounded transition-colors ${style}`}
                    >
                      {'ABCD'[i]}. {choice}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <div className="mt-2 leading-relaxed">
                  <b className="text-green-700">정답 {'ABCD'[q.answer]}. {q.choices[q.answer]}</b>
                  {q.explain && <span className="text-gray-600"> — {q.explain}</span>}
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={next}
                  disabled={picked === null}
                  className="text-sm px-4 py-1.5 rounded bg-[#37a7f0] text-white hover:bg-[#2a8bc9] disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {last ? '체크 끝내기' : '다음 문제'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
