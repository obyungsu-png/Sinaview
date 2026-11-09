import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';
import { STAGE_INFO, type StageInfo } from '../data/driverLicenseStages';
import { FAST_CARDS } from '../data/driverLicenseFastCards';
import { bankCheckQuestions, buildSectionGalleries, cardCheckQuestions, sectionCheckQuestions } from '../data/driverLicenseCheckQuestions';
import { ContentCheck, checkedCount, scrollToId } from './DriverLicenseContentCheck';
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
import { askAi, setAiContext } from '../utils/aiAssistant';

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
  // 만점 교육(중국어로만 시험): q·o 가 중국어 원문일 때 한국어 번역
  ko?: { q: string; o?: string[] };
  kw?: [string, string, string][]; // 핵심 단어 [한자, 병음, 뜻]
  ez?: string; // 중국어 원문 해설
  kj?: [string, string, string]; // 速记口诀 [중국어(【】=노란 강조), 병음, 한국어]
  sm?: [string, string, string]; // 핵심 요약 [중국어, 병음, 한국어]
};
export type DLKind = 'txt' | 'pic' | 'sign' | 'sig';
export type DLChapter = { id: number; title: string };
// 속성 과정(정선 500문제): 문제 id(책 순서), 문제별 요령, 시험 전날 100문제
type DLFast = { ids: number[]; tips: Record<string, string>; exam?: number[] };
export type DLData = { chapters: DLChapter[]; questions: DLQuestion[]; imgSize?: Record<string, [number, number]>; fast?: DLFast };

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

export const KIND_LABEL: Record<DLKind, string> = {
  txt: '글 문제',
  pic: '그림 상황 판단',
  sign: '교통 표지·노면 표시',
  sig: '신호등·교통경찰 수신호',
};
const KIND_SHORT: Record<DLKind, string> = { txt: '글', pic: '그림', sign: '표지', sig: '신호·수신호' };
export const kindOf = (q: DLQuestion): DLKind => q.k ?? 'txt';

const JUDGE_ZH = ['正确', '错误'];
const optionsOf = (q: DLQuestion) => (q.t === 'j' ? (q.ko ? JUDGE_ZH : JUDGE_OPTIONS) : q.o ?? []);
const isCorrect = (q: DLQuestion, selected: number[] | undefined) => selected?.length === 1 && selected[0] === q.a;
const answerText = (q: DLQuestion) => `${LETTERS[q.a]}. ${optionsOf(q)[q.a]}`;
const imageUrl = (name: string) => `${import.meta.env.BASE_URL}driver-license/img/${name}`;

let fastIdSet: Set<number> | null = null;
const isFast = (q: DLQuestion) => {
  if (!fastIdSet && dataCache?.fast) fastIdSet = new Set(dataCache.fast.ids);
  return !!fastIdSet?.has(q.id);
};
const fastTip = (q: DLQuestion) => dataCache?.fast?.tips[q.id];

// 원본 그림이 작아서(가로 200~400px) 시험지처럼 크게 보여 줌: 상황 그림은 가로 최대 640px, 표지·계기판은 세로 최대 300px
const extraImgSize: Record<string, [number, number]> = {};
/** 다른 데이터(만점 교육)의 그림 크기를 등록해 같은 규칙으로 크기를 맞춤 */
export function registerImageSizes(sizes: Record<string, [number, number]>) {
  Object.assign(extraImgSize, sizes);
}

function imageStyle(name: string, count: number, compact = false): CSSProperties | undefined {
  const size = dataCache?.imgSize?.[name] ?? extraImgSize[name];
  if (!size) return undefined;
  const [w, h] = size;
  const maxWidth = Math.min(w * 2.2, count > 1 ? 300 : 640);
  const aspectRatio = `${w} / ${h}`;
  // 연습 풀이 화면: 스크롤 없이 한 화면에 들어오도록 화면 높이에 맞춤
  // 그림 1개는 index.css 의 .dl-qimg 가 남은 화면 높이로 크기를 정함, 여러 개(표지판 등)는 각각 화면 높이의 14~18%
  if (compact) {
    if (count === 1) return { '--ar': (w / h).toFixed(3), '--mw': `${Math.round(maxWidth)}px`, aspectRatio } as CSSProperties;
    return { width: `min(${Math.round(maxWidth)}px, calc(${count > 2 ? 14 : 18}vh * ${(w / h).toFixed(3)}))`, aspectRatio };
  }
  return { width: Math.round(Math.min(maxWidth, ((count > 1 ? 200 : 300) * w) / h)), aspectRatio };
}

// ── 보기 단계 (1단계 한국어 / 2단계 중국어+한국어 / 3단계 실전=중국어만) — 만점 교육·필기시험 연습·카드 공통, 한 번 고르면 저장 ──
export type MjLevel = 1 | 2 | 3;
const MJ_LEVEL_KEY = 'dl-mj-level';
const MJ_LEVEL_EVENT = 'dl-mj-level';
export const MJ_LEVELS: { v: MjLevel; label: string; short: string }[] = [
  { v: 1, label: '1단계 · 한국어', short: '1단계' },
  { v: 2, label: '2단계 · 중국어', short: '2단계' },
  { v: 3, label: '3단계 · 실전', short: '실전' },
];
export function useMjLevel(): [MjLevel, (level: MjLevel) => void] {
  const [level, setLevel] = useState<MjLevel>(() => readStore<MjLevel>(MJ_LEVEL_KEY, 1));
  useEffect(() => {
    const sync = () => setLevel(readStore<MjLevel>(MJ_LEVEL_KEY, 1));
    window.addEventListener(MJ_LEVEL_EVENT, sync);
    return () => window.removeEventListener(MJ_LEVEL_EVENT, sync);
  }, []);
  const change = (next: MjLevel) => {
    writeStore(MJ_LEVEL_KEY, next);
    window.dispatchEvent(new Event(MJ_LEVEL_EVENT));
  };
  return [level, change];
}
export function LevelSwitch({ level, onChange, size = 'md' }: { level: MjLevel; onChange: (level: MjLevel) => void; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" aria-label="보기 단계" className="inline-flex rounded-lg border border-gray-300 bg-white overflow-hidden">
      {MJ_LEVELS.map((item) => (
        <button
          key={item.v}
          type="button"
          role="radio"
          aria-checked={level === item.v}
          onClick={() => onChange(item.v)}
          className={`${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 sm:px-4 py-2 text-[13px] sm:text-sm'} border-l first:border-l-0 border-gray-200 transition-colors ${
            level === item.v ? 'bg-[#37a7f0] text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/** 휴대폰 풀이 화면 위의 작은 단계 선택 (접기·펼치기, 펼침 여부도 기억) */
const LEVEL_OPEN_KEY = 'dl-level-open';
function LevelBar({ level, onChange }: { level: MjLevel; onChange: (level: MjLevel) => void }) {
  const [open, setOpen] = useState(() => readStore<boolean>(LEVEL_OPEN_KEY, true));
  const toggle = (next: boolean) => {
    setOpen(next);
    writeStore(LEVEL_OPEN_KEY, next);
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => toggle(true)}
        aria-label={`보기 단계 펼치기 (지금 ${MJ_LEVELS[level - 1].label})`}
        className="ml-auto mr-1 h-8 px-3 rounded-full bg-gray-100 text-[13px] text-gray-600 flex items-center gap-1.5"
      >
        {MJ_LEVELS[level - 1].short}
        <i className="fa-solid fa-chevron-down text-[10px]"></i>
      </button>
    );
  }
  return (
    <div className="ml-auto flex items-center">
      <div role="radiogroup" aria-label="보기 단계" className="inline-flex rounded-full bg-gray-100 p-0.5">
        {MJ_LEVELS.map((item) => (
          <button
            key={item.v}
            type="button"
            role="radio"
            aria-checked={level === item.v}
            onClick={() => onChange(item.v)}
            className={`h-7 px-2.5 rounded-full text-[12.5px] transition-colors ${level === item.v ? 'bg-white shadow-sm text-[#2a8bc9] font-medium' : 'text-gray-500'}`}
          >
            {item.short}
            {item.v < 3 && <span className="ml-0.5 text-[11px] opacity-80">{item.v === 1 ? '한국어' : '중국어'}</span>}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => toggle(false)} aria-label="보기 단계 접기" className="w-9 h-9 rounded-full text-gray-400 active:bg-gray-100">
        <i className="fa-solid fa-chevron-up text-[11px]"></i>
      </button>
    </div>
  );
}

// 필요할 때만 따로 불러오는 큰 데이터 (한 번 불러오면 계속 씀)
function lazyData<T>(load: () => Promise<{ default: unknown }>) {
  let value: T | null = null;
  let pending: Promise<void> | null = null;
  const get = () => value;
  const useData = (enabled: boolean) => {
    const [, bump] = useState(0);
    useEffect(() => {
      if (!enabled || value) return;
      if (!pending) {
        pending = load()
          .then((m) => {
            value = m.default as T;
          })
          .catch(() => {
            pending = null;
          });
      }
      let alive = true;
      pending?.then(() => {
        if (alive) bump((n) => n + 1);
      });
      return () => {
        alive = false;
      };
    }, [enabled]);
    return value;
  };
  return { get, useData };
}

// 필기시험 문제의 중국어 원문·핵심 단어 (보기 단계 2·3용, 연습 화면을 열 때만 불러옴)
type ZhEntry = { q: string; o?: string[]; kw?: [string, string, string][] };
const zhStore = lazyData<Record<string, ZhEntry>>(() => import('../data/driverLicenseZh.json'));
const useZhData = (enabled: boolean) => !!zhStore.useData(enabled);

// 만점 교육 단어장: d 사전 {단어: [병음, 뜻, 종류(2 핵심·1 일반·0 기능어)]}, q 문제별 모든 단어, k 1단계 핵심 단어 [문제, 보기1, …], c 카드별 단어
export type MjWords = { d: Record<string, [string, string, number]>; q: Record<string, string[]>; k: Record<string, string[][]>; c: string[][] };
const mjWordStore = lazyData<MjWords>(() => import('../data/driverLicenseManjeomWords.json'));
export const useMjWords = mjWordStore.useData;

/** 【】로 감싼 부분을 노란 형광펜처럼 강조 */
export function Marked({ text, mark = 'bg-[#ffe666] text-gray-900 rounded px-0.5' }: { text: string; mark?: string }) {
  return (
    <>
      {text.split(/(【[^】]*】)/).map((part, i) =>
        part.startsWith('【') ? (
          <mark key={i} className={mark}>
            {part.slice(1, -1)}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ── 단어 공부: 문제·보기(또는 카드)의 모든 단어를 한자·병음·뜻으로 ──
const WORD_KIND = [
  { v: 2, title: '핵심 단어', hint: '시험에 꼭 나오는 말' },
  { v: 1, title: '일반 단어', hint: '' },
  { v: 0, title: '기능어 · 짧은 말', hint: '~의, ~에서 같은 말' },
];
export function WordList({ words, dict }: { words: string[]; dict: MjWords['d'] }) {
  const list = words.filter((w) => dict[w]);
  return (
    <div className="flex flex-col gap-4">
      {WORD_KIND.map((kind) => {
        const items = list.filter((w) => dict[w][2] === kind.v);
        if (items.length === 0) return null;
        return (
          <section key={kind.v}>
            <h4 className="mb-2 flex items-baseline gap-2 text-sm font-bold text-gray-700">
              {kind.title}
              <span className="text-xs font-normal text-gray-400">
                {items.length}개{kind.hint && ` · ${kind.hint}`}
              </span>
            </h4>
            {kind.v === 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {items.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => speakZh(w)}
                    className="inline-flex items-baseline gap-1 px-2 py-1 rounded-full bg-gray-100 text-[13px] text-gray-600"
                  >
                    <b lang="zh-CN" className="text-[15px] font-medium text-gray-800">
                      {w}
                    </b>
                    <span className="text-[#c98b2f]">{dict[w][0]}</span>
                    <span>{dict[w][1]}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`grid gap-2 ${kind.v === 2 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {items.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => speakZh(w)}
                    className={`text-left rounded-xl px-3 py-2 border ${kind.v === 2 ? 'bg-[#fff8e6] border-[#f5d58a]' : 'bg-white border-gray-200'}`}
                  >
                    <span lang="zh-CN" className={`block leading-tight ${kind.v === 2 ? 'text-[22px] text-[#b9560e] font-medium' : 'text-[18px] text-gray-900'}`}>
                      {w}
                    </span>
                    <span className="block text-[12.5px] text-[#c98b2f] leading-snug">{dict[w][0]}</span>
                    <span className={`block leading-snug ${kind.v === 2 ? 'text-[14px] text-gray-800' : 'text-[13px] text-gray-600'}`}>{dict[w][1]}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

const WORD_STUDY_EVENT = 'dl-word-study';
/** 만점 문제의 단어 공부 창 열기 (해설·AI 창·연습 화면 어디서든) */
export function openWordStudy(q: DLQuestion, label = '') {
  window.dispatchEvent(new CustomEvent(WORD_STUDY_EVENT, { detail: { q, label } }));
}
/** 단어 공부 창 (만점 교육 화면에 하나 두면 openWordStudy 로 열림) */
export function WordStudyHost() {
  const [target, setTarget] = useState<{ q: DLQuestion; label: string } | null>(null);
  const words = useMjWords(!!target);
  useEffect(() => {
    const onOpen = (e: Event) => setTarget((e as CustomEvent).detail);
    window.addEventListener(WORD_STUDY_EVENT, onOpen);
    return () => window.removeEventListener(WORD_STUDY_EVENT, onOpen);
  }, []);
  if (!target) return null;
  const list = words?.q[target.q.id] ?? [];
  return (
    <div data-noswipe className="fixed inset-0 z-[1200] bg-black/40 flex items-end sm:items-center justify-center" onClick={() => setTarget(null)} role="dialog" aria-modal="true" aria-label="단어 공부">
      <div
        className="w-full sm:max-w-[760px] max-h-[88dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-gray-100">
          <span className="text-lg" aria-hidden>
            📖
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 leading-tight">단어 공부해요</h3>
            <p className="text-xs text-gray-500 truncate">
              {target.label ? `${target.label} · ` : ''}문제와 보기의 단어 {list.length}개 · 누르면 중국어로 읽어 줘요
            </p>
          </div>
          <button type="button" onClick={() => setTarget(null)} aria-label="닫기" className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          <p lang="zh-CN" className="mb-3 p-3 rounded-lg bg-gray-50 text-[15px] text-gray-800 leading-relaxed">
            {target.q.q}
            {target.q.o && <span className="block mt-1 text-[14px] text-gray-600">{target.q.o.map((o, i) => `${LETTERS[i]}. ${o}`).join('　')}</span>}
          </p>
          {words ? <WordList words={list} dict={words.d} /> : <p className="py-8 text-center text-sm text-gray-400">단어를 불러오는 중…</p>}
        </div>
      </div>
    </div>
  );
}

// 1단계(한국어 중심): 한국어 문장 속 그 뜻의 말 바로 뒤에 작은 중국어+병음 (못 찾으면 문장 끝에)
function koreanCore(meaning: string) {
  const out: string[] = [];
  meaning
    .replace(/\([^)]*\)/g, ' ')
    .split(/[·,/]/)
    .map((part) => part.replace(/^~/, '').replace(/(하다|되다|다)$/, '').trim())
    .forEach((part) => {
      // '교통 위반 행위' → 그대로, 띄어쓰기 없이(교통위반행위), 앞부분만(교통 위반)
      const tokens = part.split(/\s+/);
      for (let n = tokens.length; n >= 1; n--) {
        const head = tokens.slice(0, n).join(' ');
        out.push(head, head.replace(/\s+/g, ''));
      }
    });
  return out.filter((part, i) => part.length >= 2 && out.indexOf(part) === i);
}
function annotateKorean(text: string, words: string[], dict: MjWords['d']): ReactNode {
  const marks: { at: number; w: string }[] = [];
  const rest: string[] = [];
  for (const w of words) {
    const entry = dict[w];
    if (!entry) continue;
    let at = -1;
    for (const core of koreanCore(entry[1])) {
      const i = text.indexOf(core);
      if (i >= 0) {
        at = i + core.length;
        while (at < text.length && !/[\s,.?!·:;()]/.test(text[at])) at++; // 그 어절 끝까지
        break;
      }
    }
    if (at >= 0 && !marks.some((m) => m.at === at)) marks.push({ at, w });
    else rest.push(w);
  }
  marks.sort((a, b) => a.at - b.at);
  const tag = (w: string) => (
    <span key={w} className="mx-0.5 whitespace-nowrap text-[12.5px] sm:text-[13.5px] font-normal">
      <span lang="zh-CN" className="text-[#b9560e]">
        {w}
      </span>
      <span className="ml-0.5 text-[#c98b2f]">{dict[w][0]}</span>
    </span>
  );
  const out: ReactNode[] = [];
  let from = 0;
  for (const m of marks) {
    out.push(text.slice(from, m.at), tag(m.w));
    from = m.at;
  }
  out.push(text.slice(from));
  rest.forEach((w) => out.push(' ', tag(w)));
  return out;
}

// 한 문제의 중국어·한국어 (만점 문제: 중국어가 본문 + 한국어 번역 / 필기시험: 한국어가 본문 + 불러온 중국어)
type Bilingual = { zhQ: string; zhO: string[]; koQ: string; koO: string[]; kw: [string, string, string][] };
function bilingualOf(q: DLQuestion): Bilingual | null {
  if (q.ko) return { zhQ: q.q, zhO: q.t === 'j' ? JUDGE_ZH : q.o ?? [], koQ: q.ko.q, koO: q.t === 'j' ? JUDGE_OPTIONS : q.ko.o ?? [], kw: q.kw ?? [] };
  const z = zhStore.get()?.[q.id];
  if (!z) return null;
  return { zhQ: z.q, zhO: q.t === 'j' ? JUDGE_ZH : z.o ?? [], koQ: q.q, koO: q.t === 'j' ? JUDGE_OPTIONS : q.o ?? [], kw: z.kw ?? [] };
}

/** 중국어 읽어 주기 (브라우저 음성) */
export function speakZh(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.9;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('zh'));
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

// 문장 속 핵심 단어에 색을 칠함
function highlightWords(text: string, words: string[]): ReactNode {
  const list = words.filter(Boolean).sort((a, b) => b.length - a.length);
  if (!list.length) return text;
  const re = new RegExp(`(${list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return text.split(re).map((part, i) =>
    list.includes(part) ? (
      <span key={i} className="text-[#b9560e] bg-[#fff4d6] rounded px-0.5">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// ── 휴대폰 문제 풀이 화면 공통: 좌우로 밀어 이전·다음, 들어올 때 전체 화면(주소창 숨김) ──
/** 좌우로 밀면 이전·다음 (세로 스크롤·짧은 터치·data-noswipe 안쪽은 무시) */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onTouchStart: (e: ReactTouchEvent) => {
      const target = e.target as HTMLElement;
      if (e.touches.length !== 1 || target.closest('[data-noswipe]')) {
        start.current = null;
        return;
      }
      const p = e.touches[0];
      start.current = { x: p.clientX, y: p.clientY, t: Date.now() };
    },
    onTouchEnd: (e: ReactTouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - s.x;
      const dy = p.clientY - s.y;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5 || Date.now() - s.t > 700) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}

const isPhone = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(max-width: 1023px)').matches && !!window.matchMedia?.('(pointer: coarse)').matches;

/** 휴대폰에서 문제 화면에 들어오면 전체 화면으로 (주소창 숨김), 나갈 때 원래대로 */
function usePhoneFullscreen() {
  useEffect(() => {
    const root = document.documentElement;
    if (!isPhone() || !root.requestFullscreen || document.fullscreenElement) return;
    let entered = false;
    root
      .requestFullscreen({ navigationUI: 'hide' })
      .then(() => {
        entered = true;
      })
      .catch(() => {});
    return () => {
      if (entered && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);
}

/** 처음 한 번만: 좌우로 밀어서 넘기는 안내 */
function SwipeHint() {
  const [show, setShow] = useState(() => isPhone() && !readStore('dl-swipe-hint', false));
  useEffect(() => {
    if (!show) return;
    writeStore('dl-swipe-hint', true);
    const timer = window.setTimeout(() => setShow(false), 2800);
    return () => window.clearTimeout(timer);
  }, [show]);
  if (!show) return null;
  return (
    <div className="lg:hidden pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-24 z-30 px-4 py-2 rounded-full bg-black/75 text-white text-sm whitespace-nowrap">
      <i className="fa-solid fa-hand-point-left mr-1.5"></i>좌우로 밀어서 이전·다음 문제<i className="fa-solid fa-hand-point-right ml-1.5"></i>
    </div>
  );
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

export function shuffle<T>(items: T[], seed = Math.floor(Math.random() * 2 ** 32)): T[] {
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

export function LoadingState({ failed, onBack }: { failed: boolean; onBack: () => void }) {
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

export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
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

// 모든 확대 팝업에서 같은 크기의 큰 박스로 표시 (원본 해상도가 작아도 강제로 확대)
const LIGHTBOX_IMG_STYLE: CSSProperties = {
  width: 'min(92vw, 900px)',
  height: 'min(70vh, 600px)',
  objectFit: 'contain',
};

// 작은 그림 클릭 → 화면 가득 확대해 보는 라이트박스 (배경 클릭·닫기 버튼으로 종료)
export function ImageLightbox({ src, caption, onClose }: { src: string; caption?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-4 gap-3" onClick={onClose}>
      <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl(src)}
          alt={caption || '그림 확대'}
          style={LIGHTBOX_IMG_STYLE}
          className="rounded bg-white"
        />
        {caption && <p className="text-sm text-white text-center leading-snug max-w-[90vw]">{caption}</p>}
      </div>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="px-4 py-1.5 rounded-full bg-white/90 text-gray-800 text-sm hover:bg-white transition-colors"
      >
        닫기 ✕
      </button>
    </div>
  );
}

// 문제 한 개 (연습·오답 노트·결과 화면 공통)
// compact: 연습 풀이 화면용 - 문제·그림·보기가 한 화면에 들어가도록 작게, 넓은 화면에서는 보기(왼쪽)와 그림(오른쪽)을 나란히
function QuestionCard({
  q,
  label,
  selected,
  reveal,
  onSelect,
  headerRight,
  compact = false,
  level,
}: {
  q: DLQuestion;
  label: string;
  selected: number[];
  reveal: boolean;
  onSelect?: (index: number) => void;
  headerRight?: ReactNode;
  compact?: boolean;
  level?: MjLevel; // 보기 단계 (연습 화면). 결과·오답 화면은 만점 문제는 한·중, 필기시험은 한국어
}) {
  const [zoom, setZoom] = useState(false);
  // 번역을 가린 단계에서 눌러서 잠깐 보기 / 실전 단계에서 누른 핵심 단어
  const [peek, setPeek] = useState(false);
  const [openWords, setOpenWords] = useState<string[]>([]);
  useEffect(() => {
    setPeek(false);
    setOpenWords([]);
  }, [q.id]);
  // 보기 단계: ① 한국어(+핵심 단어 3개) ② 한·중(중국어 + 회색 한국어) ③ 실전(중국어만, 누르면 한국어)
  // 결과·오답 화면(compact 아님)은 만점 문제는 한·중, 필기시험은 한국어 그대로
  const bi = bilingualOf(q);
  const lv: MjLevel | 0 = !bi ? 0 : compact ? level ?? 1 : q.ko ? 2 : 0;
  const mainQ = !bi || lv === 0 ? q.q : lv === 1 ? bi.koQ : bi.zhQ;
  const mainO = !bi || lv === 0 ? optionsOf(q) : lv === 1 ? bi.koO : bi.zhO;
  const subQ = bi && lv >= 2 ? bi.koQ : null;
  const showSub = lv === 2 || peek;
  const subO = bi && (lv === 2 || (lv === 3 && peek)) ? bi.koO : [];
  // 만점 1단계: 한국어 문장·보기 안에 핵심 단어를 작은 중국어+병음으로 (단어장을 불러온 뒤)
  const mjw = useMjWords(!!q.ko && lv === 1);
  const inline = q.ko && lv === 1 && mjw ? mjw.k[q.id] : null;
  const words = !bi || !lv || inline ? [] : lv === 1 ? bi.kw.filter(([zh]) => bi.zhQ.includes(zh) || bi.zhO[q.a]?.includes(zh)).slice(0, 3) : bi.kw;
  const zhLang = bi && lv >= 2 ? 'zh-CN' : undefined; // 중국어 글자를 한 글꼴(중국어)로 그리게
  const images = q.img && (
    <div className={compact ? 'flex flex-wrap gap-2 justify-center lg:max-w-[760px] lg:mb-4' : 'flex flex-wrap gap-3 mb-6'}>
      {q.img.map((name) => (
        <img
          key={name}
          src={imageUrl(name)}
          alt="문제 그림"
          loading="lazy"
          style={imageStyle(name, q.img!.length, compact)}
          onClick={compact ? () => setZoom(true) : undefined}
          className={`max-w-full h-auto rounded border border-gray-200 bg-white object-contain ${compact ? `cursor-zoom-in ${q.img!.length === 1 ? 'dl-qimg' : ''}` : ''}`}
        />
      ))}
    </div>
  );

  const options = (
    <div className={`${compact ? 'flex flex-col gap-1 sm:gap-1.5' : 'flex flex-col gap-3'} lg:max-w-[760px]`}>
      {mainO.map((text, i) => {
        const isSelected = selected.includes(i);
        const isAnswer = i === q.a;
        if (compact) {
          // 보기를 직접 눌러 답 고르기 (모바일 모의고사와 같은 모양). 답한 뒤에는 정답은 초록, 고른 오답은 빨강
          // 네모 칸 없이 동그라미 글자 + 큰 글씨 (답한 뒤: 정답 초록, 고른 오답 빨강)
          let tone = 'text-gray-900';
          let badgeTone = 'bg-white text-gray-600 shadow-[0_1px_4px_rgba(0,0,0,0.18)]';
          let badge: ReactNode = LETTERS[i];
          if (reveal && isAnswer) {
            tone = 'text-green-600 font-medium';
            badgeTone = 'bg-green-500 text-white';
            badge = <i className="fa-solid fa-check"></i>;
          } else if (reveal && isSelected) {
            tone = 'text-[#e74c3c]';
            badgeTone = 'bg-[#e74c3c] text-white';
            badge = <i className="fa-solid fa-xmark"></i>;
          } else if (reveal) tone = 'text-gray-400';
          return (
            <button
              key={i}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(i)}
              className={`w-full min-h-[50px] [@media(max-height:700px)]:min-h-[44px] flex items-center gap-4 px-1.5 py-2 [@media(max-height:700px)]:py-1 rounded-lg text-left text-[18px] sm:text-[19px] leading-snug transition-colors ${tone} ${
                onSelect ? 'cursor-pointer active:bg-gray-100 lg:hover:bg-gray-50' : 'cursor-default'
              }`}
            >
              <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-medium ${badgeTone}`}>{badge}</span>
              <span className="flex-1">
                <span lang={zhLang}>{inline && mjw ? annotateKorean(text, inline[i + 1] ?? [], mjw.d) : text}</span>
                {subO[i] && <span className="ml-1.5 text-[14px] sm:text-[15px] text-gray-500">{subO[i]}</span>}
              </span>
            </button>
          );
        }
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
            className={`w-full flex items-center gap-3 text-left px-4 border-2 rounded-lg bg-white transition-colors py-3 sm:py-4 text-base sm:text-lg ${tone} ${
              onSelect ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <span className="shrink-0 w-7 flex justify-center">{mark}</span>
            <span>
              {LETTERS[i]}. <span lang={zhLang}>{text}</span>
              {subO[i] && <span className="block text-sm text-gray-500">{subO[i]}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className={`flex justify-between items-start gap-4 ${compact ? 'mb-3' : 'mb-5'}`}>
        <h2 className={`${compact ? 'text-[19px] sm:text-[21px] leading-snug sm:leading-relaxed font-medium' : 'text-lg sm:text-[22px] leading-relaxed font-normal'} text-gray-900`}>
          {label}{' '}
          {isFast(q) && !q.ko && (
            <span className="inline-block align-middle mr-1.5 px-1.5 py-0.5 rounded bg-[#fff4e0] text-[#d35400] text-xs font-medium" title="속성 과정 핵심 500문제">
              ⚡속성
            </span>
          )}
          {bi && lv >= 2 ? (
            <span lang="zh-CN">{highlightWords(mainQ, bi.kw.map((w) => w[0]))}</span>
          ) : inline && mjw ? (
            annotateKorean(mainQ, inline[0] ?? [], mjw.d)
          ) : (
            mainQ
          )}
          {subQ &&
            (showSub ? (
              <span className="block mt-1 text-[15px] sm:text-[16px] font-normal text-gray-500 leading-snug">{subQ}</span>
            ) : (
              <button type="button" onClick={() => setPeek(true)} className="relative block w-full mt-1 text-left font-normal" aria-label="번역 보기">
                <span className="block blur-[5px] select-none text-[15px] sm:text-[16px] text-gray-500 leading-snug" aria-hidden>
                  {subQ}
                </span>
                <span className="absolute inset-0 flex items-center text-[13px] text-[#2a8bc9] font-medium">눌러서 번역 보기</span>
              </button>
            ))}
        </h2>
        {headerRight}
      </div>
      {bi && lv > 0 && (
        <div className={`flex flex-wrap items-center gap-1.5 ${compact ? '-mt-1 mb-3' : 'mb-4'}`}>
          <button
            type="button"
            onClick={() => speakZh(bi.zhQ + (q.t === 's' ? '。' + bi.zhO.map((o, i) => `${LETTERS[i]}，${o}`).join('。') : ''))}
            aria-label="중국어로 읽어 주기"
            className="w-7 h-7 rounded-full bg-[#eef7fe] text-[#2a8bc9] text-xs flex items-center justify-center hover:bg-[#d9edfb]"
          >
            <i className="fa-solid fa-volume-high"></i>
          </button>
          {words.map(([zh, pinyin, meaning]) => {
            const open = lv < 3 || openWords.includes(zh);
            return (
              <button
                key={zh}
                type="button"
                onClick={() => setOpenWords((list) => (list.includes(zh) ? list.filter((w) => w !== zh) : [...list, zh]))}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff8e6] border border-[#f5d58a] text-[12px] sm:text-[13px] text-gray-700"
              >
                <b lang="zh-CN" className="text-[#b9560e] text-[13px] sm:text-[14px]">{zh}</b>
                {open ? (
                  <>
                    <span className="text-[#c98b2f]">{pinyin}</span>
                    <span className="text-gray-600">{meaning}</span>
                  </>
                ) : (
                  <span className="text-[#c98b2f]">?</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {images}
      {options}
      {zoom && (
        <div data-noswipe className="fixed inset-0 z-[60] bg-black/70 flex flex-col items-center justify-center p-4 gap-3" onClick={() => setZoom(false)}>
          <div className="flex flex-col items-center gap-3 overflow-y-auto max-h-full py-2" onClick={(e) => e.stopPropagation()}>
            {q.img!.map((name) => (
              <img key={name} src={imageUrl(name)} alt="문제 그림 확대" style={LIGHTBOX_IMG_STYLE} className="rounded bg-white" />
            ))}
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-gray-700 text-xl hover:bg-white"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
    </div>
  );
}

// AI 도우미에게 보낼 해설 요청 (공식 정답을 전제로 정답·오답 이유를 짧게)
function explainPrompt(q: DLQuestion, selected?: number) {
  const options = optionsOf(q);
  return [
    '[중국 운전면허 과목1(필기) 문제 해설 요청]',
    `문제: ${q.q}`,
    q.ko ? `(한국어 번역: ${q.ko.q})` : '',
    '보기:',
    ...options.map((text, i) => `${LETTERS[i]}. ${text}`),
    `공식 정답: ${answerText(q)}`,
    selected !== undefined && selected !== q.a ? `내가 고른 답: ${LETTERS[selected]}. ${options[selected]}` : '',
    q.img ? '(그림이 있는 문제입니다. 그림은 볼 수 없으니 문제 글과 보기로 설명해 주세요.)' : '',
    '',
    '공식 정답이 맞다는 전제로, 정답인 이유와 다른 보기(특히 내가 고른 답)가 틀린 이유를 중국 도로교통안전법 기준으로 한국어 3~5줄 이내로 간단히 설명해 주세요. 관련 숫자(벌점·속도·거리·기간 등)가 있으면 꼭 넣어 주세요.',
  ]
    .filter((line, i, all) => line !== '' || (i > 0 && all[i - 1] !== ''))
    .join('\n');
}

function ExplanationBox({ q, selected, compact = false, level }: { q: DLQuestion; selected?: number; compact?: boolean; level?: MjLevel }) {
  const correct = selected === undefined ? null : selected === q.a;
  const bi = bilingualOf(q);
  const lvl = level ?? (q.ko ? 2 : 1);
  const answerMain = bi ? (lvl === 1 ? bi.koO[q.a] : bi.zhO[q.a]) : optionsOf(q)[q.a];
  const answerSub = bi ? (lvl === 1 ? bi.zhO[q.a] : bi.koO[q.a]) : null;
  return (
    <div className={`${compact ? 'mt-3 px-3.5 py-3 sm:p-4' : 'mt-5 p-4 sm:p-5'} border-l-4 rounded ${correct === false ? 'bg-[#fdf0ef] border-[#e74c3c]' : 'bg-[#e3f2fd] border-[#37a7f0]'}`}>
      {q.kj && (
        // 速记口诀: 정답 바로 위에 먼저 (노란 부분이 외울 핵심)
        <div className="mb-2.5 px-3 py-2.5 rounded-lg bg-white/90 border border-[#f5d58a]">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#b9560e]">
            <span aria-hidden>⚡</span>速记口诀 <span className="font-normal text-gray-500">암기 요령</span>
            <button type="button" onClick={() => speakZh(q.kj![0].replace(/[【】]/g, ''))} aria-label="암기 요령 읽어 주기" className="ml-auto w-7 h-7 rounded-full text-[#2a8bc9] hover:bg-[#eef7fe]">
              <i className="fa-solid fa-volume-high text-xs"></i>
            </button>
          </div>
          <p lang="zh-CN" className="text-[17px] font-medium text-gray-900 leading-snug">
            <Marked text={q.kj[0]} />
          </p>
          <p className="text-[12.5px] text-[#c98b2f] leading-snug">{q.kj[1]}</p>
          <p className="mt-0.5 text-[14px] text-gray-700 leading-snug">
            <Marked text={q.kj[2]} mark="bg-transparent font-bold text-gray-900" />
          </p>
        </div>
      )}
      <h4 className="text-base font-medium text-gray-800 mb-1.5">
        {correct === true && <span className="mr-2 text-green-600">⭕ 정답이에요!</span>}
        {correct === false && <span className="mr-2 text-[#e74c3c]">❌ 틀렸어요.</span>}
        <span className={correct === null ? '' : 'text-gray-600 font-normal'}>
          정답 {LETTERS[q.a]}. {answerMain}
          {answerSub && <span className="text-gray-500 font-normal"> ({answerSub})</span>}
        </span>
      </h4>
      {q.e && (
        <p className="text-[15px] text-gray-700 leading-relaxed">
          <i className="fa-solid fa-lightbulb mr-1.5 text-[#f1b10f]"></i>
          {q.e}
        </p>
      )}
      {fastTip(q) && <p className="mt-1.5 text-[15px] text-[#b9560e] leading-relaxed">⚡ {fastTip(q)}</p>}
      {q.ez && (
        <details className="mt-2">
          <summary className="text-sm text-[#2a8bc9] cursor-pointer select-none">중국어 원문 해설 보기</summary>
          <p lang="zh-CN" className="mt-1 text-sm text-gray-600 leading-relaxed">
            {q.ez}
          </p>
        </details>
      )}
      {q.sm && (
        // 원문 해설이 길고 어려워서 핵심만 한 줄로 (중국어 + 병음 + 한국어)
        <div className="mt-2 px-3 py-2 rounded-lg bg-white/80 border border-gray-200">
          <div className="mb-0.5 text-xs font-bold text-[#2a8bc9]">📌 핵심 요약</div>
          <p lang="zh-CN" className="text-[15px] text-gray-900 leading-snug">
            {q.sm[0]}
          </p>
          <p className="text-[12.5px] text-[#c98b2f] leading-snug">{q.sm[1]}</p>
          <p className="mt-0.5 text-[14px] text-gray-700 leading-snug">{q.sm[2]}</p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {q.ko && (
          <button
            type="button"
            onClick={() => openWordStudy(q)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff4d6] border border-[#f5d58a] text-sm font-medium text-[#b9560e] hover:bg-[#ffecb8]"
          >
            <span aria-hidden>📖</span> 단어 공부해요
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            askAi({
              label: correct === false ? `${LETTERS[selected!]}번이 왜 틀렸는지 설명해 줘` : '이 문제 정답 이유를 자세히 설명해 줘',
              prompt: explainPrompt(q, selected),
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#bfe2fa] bg-white text-sm text-[#2a8bc9] hover:bg-[#eef7fe]"
        >
          <span aria-hidden>🤖</span> AI에게 더 자세히 묻기
        </button>
      </div>
    </div>
  );
}

export type Progress = { index: number; answers: Record<number, number[]>; total?: number; correct?: number; wrong?: number };

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
  const [autoNext, setAutoNext] = useState(() => readStore('dl-auto-next', false));
  // 만점 교육(중국어 문제): 한국어 번역 보이기
  const isMj = useMemo(() => questions.some((item) => item.ko), [questions]);
  const zhReady = useZhData(!isMj);
  const hasKo = isMj || zhReady;
  const [level, setLevel] = useMjLevel();
  usePhoneFullscreen();
  const [slide, setSlide] = useState<'next' | 'prev' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(getFavorites);
  const timer = useRef<number>();
  const loadedVersion = useRef(version);
  const panelRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const currentCellRef = useRef<HTMLButtonElement>(null);

  const index = Math.min(progress.index, questions.length - 1);
  const q = questions[index];
  const answered = progress.answers[q.id];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // AI 도우미 버튼을 누르면 지금 보는 문제를 바로 설명받을 수 있게
  useEffect(() => {
    const selected = answered?.[0];
    setAiContext({
      title: `${title} ${index + 1}번 문제`,
      label: selected !== undefined && selected !== q.a ? `${LETTERS[selected]}번이 왜 틀렸는지 설명해 줘` : '이 문제 정답·오답 이유를 설명해 줘',
      prompt: explainPrompt(q, selected),
      // 만점 문제는 AI 질문 대신 '단어 공부해요' (문제·보기의 모든 단어)
      action: q.ko ? { label: '📖 단어 공부해요', run: () => openWordStudy(q, `${index + 1}번 문제`) } : undefined,
    });
  }, [q, index, title, answered]);
  useEffect(() => () => setAiContext(null), []);

  // 풀이 화면이 열려 있는 동안 뒤 페이지가 스크롤되지 않게
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // 문제가 바뀌면 맨 위부터, 해설이 열리면 해설이 보이도록 (아래 버튼 줄은 항상 고정)
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [index]);
  const explanationOpen = showExplanation || !!answered;
  // 답을 고르거나 해설을 열었을 때만 (다시 찾아온 문제는 맨 위부터 보여 줌)
  const scrollToExplanation = () =>
    window.setTimeout(() => explanationRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
  // 답안지를 열면 지금 문제 번호가 보이도록
  useEffect(() => {
    if (showSheet) currentCellRef.current?.scrollIntoView({ block: 'center' });
  }, [showSheet]);

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
    if (target !== index) setSlide(target > index ? 'next' : 'prev');
    setProgress((p) => ({ ...p, index: Math.max(0, Math.min(questions.length - 1, target)) }));
    setShowExplanation(false);
  };

  const handleSelect = (i: number) => {
    if (answered) return;
    const ok = i === q.a;
    playTone(ok);
    setProgress((p) => ({ ...p, answers: { ...p.answers, [q.id]: [i] } }));
    recordAnswers([{ id: q.id, selected: i, correct: ok }]);
    scrollToExplanation();
    if (!ok) setShowExplanation(true);
    else if (autoNext && index < questions.length - 1) timer.current = window.setTimeout(() => goTo(index + 1), 1500);
  };

  const swipe = useSwipe(
    () => goTo(index - 1),
    () => goTo(index + 1),
  );

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

  // 키보드 (데스크톱): ← → 이전·다음 문제, 1~4 또는 A~D 로 답 고르기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || showSheet) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') goTo(index + 1);
      else if (e.key === 'ArrowLeft') goTo(index - 1);
      else if (!answered) {
        const choice = Math.max('1234'.indexOf(e.key), 'abcd'.indexOf(e.key.toLowerCase()));
        if (choice >= 0 && choice < optionsOf(q).length) handleSelect(choice);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // 한 화면 풀이: 위(뒤로·현재 위치·답안지·즐겨찾기) / 가운데(문제·그림·보기·해설) / 아래 고정(이전·해설·다음)
  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col" style={{ height: '100dvh' }} role="dialog" aria-modal="true" aria-label={title}>
      {/* 휴대폰: 위에는 뒤로 화살표만 */}
      <div className="lg:hidden flex-none h-11 flex items-center px-1">
        <button
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
          className="w-11 h-11 rounded-full flex items-center justify-center text-gray-700 active:bg-gray-100"
        >
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        {hasKo && <LevelBar level={level} onChange={setLevel} />}
      </div>
      <SwipeHint />

      <div
        ref={panelRef}
        {...swipe}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-8 pt-1 pb-3.5 sm:py-5 lg:pt-6 [@media(max-height:700px)]:py-1.5"
      >
        <div key={q.id} className={`max-w-[1100px] mx-auto ${slide === 'next' ? 'dl-swipe-next' : slide === 'prev' ? 'dl-swipe-prev' : ''}`}>
          {/* 노트북: 페이지형 헤더 (뒤로·현재 위치·진행률·답안지) */}
          <div className="hidden lg:block">
            <BackButton onClick={onBack} label={backLabel} />

            <div className="text-sm text-gray-400 mb-6">
              현재위치: {breadcrumb}
              <span className="mx-1">&gt;</span>
              <strong className="text-gray-700">{title}</strong>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#37a7f0] transition-all" style={{ width: `${((stats.correct + stats.wrong) / questions.length) * 100}%` }}></div>
              </div>
              <button
                onClick={() => setShowSheet(true)}
                aria-label="답안지 보기"
                className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#37a7f0]"
              >
                <i className="fa-solid fa-table-cells"></i>답안지 {index + 1}/{questions.length}
              </button>
            </div>
          </div>

          <QuestionCard
            q={q}
            label={`${index + 1}.`}
            selected={answered ?? []}
            reveal={!!answered}
            onSelect={answered ? undefined : handleSelect}
            compact
            level={level}
            headerRight={
              <div className="hidden lg:flex shrink-0 items-center gap-2">
                {hasKo && <LevelSwitch level={level} onChange={setLevel} size="sm" />}
                <button
                  onClick={toggleFavorite}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    isFavorite ? 'bg-[#fff3cd] border-[#ffc107] text-[#856404]' : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`}></i> 즐겨찾기
                </button>
              </div>
            }
          />
          {explanationOpen && (
            <div ref={explanationRef} className="scroll-mb-3">
              <ExplanationBox q={q} selected={answered?.[0]} compact level={hasKo ? level : undefined} />
            </div>
          )}
          {finished && (
            <div className="mt-3 p-3.5 sm:p-4 rounded-lg bg-green-50 border border-green-200 flex flex-wrap items-center gap-3">
              <span className="text-gray-800 text-[15px]">
                <i className="fa-solid fa-flag-checkered mr-2 text-[#2ecc71]"></i>
                {questions.length}문제를 모두 풀었어요. 정답 {stats.correct} · 오답 {stats.wrong}
              </span>
              {onReviewWrong && wrongCount > 0 && (
                <button onClick={onReviewWrong} className="sm:ml-auto px-4 py-2 rounded-lg text-white text-sm bg-[#e74c3c] hover:opacity-90">
                  틀린 문제만 보기 ({wrongCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 휴대폰: 아래에는 맞은·틀린 수, 답안지(번호), 해설, 즐겨찾기만 (이전·다음은 좌우로 밀기, 보기 단계는 위) */}
      <div className="lg:hidden flex-none border-t border-gray-200 bg-white px-1.5">
        <div className="h-12 flex items-center gap-0.5">
          <span className="flex items-center gap-1.5 px-2 text-[15px] text-gray-700 tabular-nums" aria-label={`맞은 문제 ${stats.correct}개`}>
            <i className="fa-solid fa-circle-check text-[#2ecc71] text-[17px]"></i>
            {stats.correct}
          </span>
          <span className="flex items-center gap-1.5 px-2 text-[15px] text-gray-700 tabular-nums" aria-label={`틀린 문제 ${stats.wrong}개`}>
            <i className="fa-solid fa-circle-xmark text-[#e74c3c] text-[17px]"></i>
            {stats.wrong}
          </span>
          <button
            onClick={() => setShowSheet(true)}
            aria-label="답안지 보기"
            className="flex items-center gap-1.5 h-10 px-2 rounded-lg text-[15px] text-gray-700 tabular-nums active:bg-gray-100"
          >
            <i className="fa-solid fa-table-cells text-gray-400"></i>
            {index + 1}/{questions.length}
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => {
              if (!showExplanation) scrollToExplanation();
              setShowExplanation(!showExplanation);
            }}
            disabled={!!answered}
            aria-pressed={explanationOpen}
            aria-label="해설 보기"
            className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] ${explanationOpen ? 'bg-[#e3f2fd]' : 'active:bg-gray-100'}`}
          >
            <i className={`fa-${explanationOpen ? 'solid' : 'regular'} fa-lightbulb text-[#f1b10f]`}></i>
          </button>
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
            aria-pressed={isFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] active:bg-gray-100 ${isFavorite ? 'text-[#f1b10f]' : 'text-gray-400'}`}
          >
            <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-star`}></i>
          </button>
        </div>
      </div>

      {/* 노트북: 아래 버튼 줄 (양쪽 끝 이전·다음, 가운데 해설) */}
      <div className="hidden lg:block flex-none border-t border-gray-200 bg-white px-3 sm:px-8 py-2.5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="justify-self-start w-full max-w-[150px] h-12 rounded-xl border border-gray-300 bg-white text-[15px] font-medium text-gray-700 hover:border-[#37a7f0] active:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200"
          >
            <i className="fa-solid fa-chevron-left mr-1.5"></i>이전
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!showExplanation) scrollToExplanation();
                setShowExplanation(!showExplanation);
              }}
              disabled={!!answered}
              aria-pressed={explanationOpen}
              className={`h-12 px-4 rounded-xl border text-[14px] transition-colors ${
                explanationOpen ? 'bg-[#e3f2fd] border-[#37a7f0] text-[#2a8bc9]' : 'bg-[#f7f7f7] border-gray-300 text-gray-700 hover:border-[#37a7f0] active:bg-gray-200'
              }`}
            >
              <i className="fa-solid fa-lightbulb mr-1.5 text-[#f1b10f]"></i>해설<span className="hidden sm:inline"> 보기</span>
            </button>
            {onReviewWrong && (
              <button
                onClick={onReviewWrong}
                className="hidden sm:inline-flex items-center h-12 px-4 rounded-xl border border-[#f1b7b1] bg-white text-[14px] text-[#e74c3c] hover:bg-red-50"
              >
                틀린 문제 ({wrongCount})
              </button>
            )}
          </div>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === questions.length - 1}
            className="justify-self-end w-full max-w-[150px] h-12 rounded-xl bg-[#37a7f0] text-[15px] font-medium text-white hover:bg-[#2a8bc9] active:bg-[#2a8bc9] disabled:bg-gray-300"
          >
            다음<i className="fa-solid fa-chevron-right ml-1.5"></i>
          </button>
        </div>
      </div>

      {/* 답안지: 번호를 눌러 이동, 정답·오답·정답률, 틀린 문제·자동 넘김·처음부터 다시 */}
      {showSheet && (
        <div className="fixed inset-0 z-10 bg-black/30 flex items-end justify-center" onClick={() => setShowSheet(false)}>
          <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl shadow-2xl dl-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div className="text-base font-medium text-gray-800">답안지 ({questions.length}문제)</div>
              <button
                onClick={() => setShowSheet(false)}
                aria-label="답안지 닫기"
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 text-lg hover:bg-gray-100"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="px-5 pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <span>
                정답 <b className="text-[#2ecc71]">{stats.correct}</b>
              </span>
              <span>
                오답 <b className="text-[#e74c3c]">{stats.wrong}</b>
              </span>
              <span>정답률 {accuracy}%</span>
              <label className="ml-auto flex items-center gap-1.5 cursor-pointer text-gray-700">
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
            </div>
            {(onReviewWrong || storageKey) && (
              <div className="px-5 pt-3 flex flex-wrap items-center gap-2">
                {onReviewWrong && (
                  <button
                    onClick={onReviewWrong}
                    className="h-10 px-4 rounded-lg border border-[#f1b7b1] bg-white text-sm text-[#e74c3c] hover:bg-red-50"
                  >
                    <i className="fa-solid fa-rotate-left mr-1.5"></i>틀린 문제 ({wrongCount})
                  </button>
                )}
                {storageKey && (
                  <button onClick={resetProgress} className="ml-auto h-10 px-3 text-sm text-gray-500 hover:text-[#e74c3c]">
                    처음부터 다시
                  </button>
                )}
              </div>
            )}
            <div className="max-h-[45vh] overflow-y-auto px-5 py-4">
              <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(40px,1fr))]">
                {questions.map((item, i) => {
                  const selected = progress.answers[item.id];
                  let tone = 'bg-white border-gray-300 text-gray-600';
                  if (i === index) tone = 'bg-[#37a7f0] border-[#37a7f0] text-white font-bold';
                  else if (selected)
                    tone = isCorrect(item, selected) ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-400 text-red-600';
                  return (
                    <button
                      key={item.id}
                      ref={i === index ? currentCellRef : undefined}
                      onClick={() => {
                        goTo(i);
                        setShowSheet(false);
                      }}
                      className={`aspect-square rounded border text-xs sm:text-[13px] flex items-center justify-center hover:border-[#37a7f0] ${tone}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 pb-1">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm border border-[#37a7f0] bg-[#37a7f0] inline-block"></span>현재 문제
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm border border-green-500 bg-green-50 inline-block"></span>정답
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm border border-red-400 bg-red-50 inline-block"></span>오답
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
export function WrongNotes({
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
              <ExplanationBox q={q} selected={wrong[q.id]} />
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

// 영역 설명: 영역 소개 · 소주제별 핵심 내용(내용 체크) · 함정 · 암기 요령을 보고 풀기 시작
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
  const [closed, setClosed] = useState<Set<number>>(() => new Set());
  const byId = useMemo(() => new Map(group.questions.map((q) => [q.id, q])), [group.questions]);
  // 그림은 영역 안에서 점수가 가장 높은 소주제에만 배정 (중복 표시 방지)
  const galleries = useMemo(
    () => buildSectionGalleries(info?.sections ?? [], group.questions),
    [info, group.questions],
  );
  const stageCheckPrefix = `stage:${group.key}:`;
  const checked = info?.sections ? checkedCount(stageCheckPrefix) : 0;
  const [, bumpChecks] = useState(0);
  // 소주제 기출 그림 클릭 확대
  const [zoomPic, setZoomPic] = useState<{ src: string; caption?: string } | null>(null);

  const startButtons = (className: string) => (
    <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`}>
      <button onClick={() => onStart(false)} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-white bg-[#37a7f0] hover:bg-[#2a8bc9]">
        <i className="fa-solid fa-play mr-2"></i>
        {solved > 0 && solved < group.questions.length ? `이어서 풀기 (${solved}/${group.questions.length})` : '순서대로 풀기'}
      </button>
      <button
        onClick={() => onStart(true)}
        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-[#37a7f0] hover:text-[#37a7f0]"
      >
        <i className="fa-solid fa-shuffle mr-2"></i>랜덤으로 풀기
      </button>
      <button
        onClick={onWrong}
        disabled={wrongCount === 0}
        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-[#e74c3c] bg-white text-[#e74c3c] hover:bg-red-50 disabled:border-gray-200 disabled:text-gray-300 disabled:hover:bg-white disabled:cursor-not-allowed"
      >
        <i className="fa-solid fa-circle-xmark mr-2"></i>틀린 문제만 보기 ({wrongCount})
      </button>
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="주제별 연습으로 돌아가기" />
      {zoomPic && <ImageLightbox src={zoomPic.src} caption={zoomPic.caption} onClose={() => setZoomPic(null)} />}
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

      {startButtons('mb-8')}

      {info && (
        <>
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              <i className="fa-solid fa-book-open mr-2 text-[#37a7f0]"></i>영역 설명
            </h2>
            <p className="text-[15px] text-gray-700 leading-relaxed">{info.summary}</p>
          </section>

          {info.sections && info.sections.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-lg font-medium text-gray-800">
                  <i className="fa-solid fa-list-check mr-2 text-[#37a7f0]"></i>핵심 내용 <span className="text-sm font-normal text-gray-500">(기출 기반 · {info.sections.length}개 주제 · 체크 {checked}/{info.sections.length})</span>
                </h2>
                <button
                  onClick={() => setClosed(closed.size ? new Set() : new Set(info.sections!.map((_, i) => i)))}
                  className="shrink-0 text-sm text-[#2a8bc9] hover:underline"
                >
                  {closed.size ? '모두 펼치기' : '모두 접기'}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {info.sections.map((section, i) => {
                  const open = !closed.has(i);
                  const examples = (section.examples ?? []).map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q);
                  return (
                    <div key={section.title} id={`stage-sec-${i}`} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => {
                          const next = new Set(closed);
                          if (open) next.add(i);
                          else next.delete(i);
                          setClosed(next);
                        }}
                        className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-left bg-gray-50 hover:bg-gray-100"
                        aria-expanded={open}
                      >
                        <span className="shrink-0 w-7 h-7 rounded-full bg-[#37a7f0] text-white text-sm flex items-center justify-center">{i + 1}</span>
                        <span className="flex-1 font-medium text-gray-800 text-[15px] sm:text-base">{section.title}</span>
                        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} text-gray-400 text-sm`}></i>
                      </button>
                      {open && (
                        <div className="px-4 sm:px-5 py-4">
                          <ul className="flex flex-col gap-2 text-[15px] text-gray-700 leading-relaxed">
                            {section.points.map((point) => (
                              <li key={point} className="flex gap-2">
                                <i className="fa-solid fa-check text-[#37a7f0] mt-1.5 text-xs"></i>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                          {section.memo && (
                            <div className="mt-3 px-3 py-2 bg-[#fff8e1] rounded text-sm text-gray-800">
                              <b className="mr-1.5">암기</b>
                              {section.memo}
                            </div>
                          )}
                          {(() => {
                            // 해당 소주제에 배정된 기출 그림 (다른 소주제와 중복 없음)
                            const pics = galleries.get(section.title) ?? [];
                            return pics.length > 0 ? (
                              <div className="mt-3">
                                <div className="text-xs text-gray-500 mb-1.5">그림으로 보기 (기출)</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                  {pics.map((pic) => (
                                    <figure key={pic.img} className="text-center">
                                      <img
                                        src={imageUrl(pic.img)}
                                        alt={pic.caption}
                                        loading="lazy"
                                        onClick={() => setZoomPic({ src: pic.img, caption: pic.caption })}
                                        className="w-full h-32 sm:h-40 object-contain rounded border border-gray-200 bg-white cursor-zoom-in hover:border-[#37a7f0] transition-colors"
                                      />
                                      <figcaption className="mt-1 text-[11px] sm:text-xs leading-snug text-gray-600">{pic.caption}</figcaption>
                                    </figure>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                          <ContentCheck
                            itemKey={`${stageCheckPrefix}${section.title}`}
                            questions={sectionCheckQuestions(section, examples, group.questions, `${stageCheckPrefix}${section.title}`)}
                            onDone={() => {
                              scrollToId(`stage-sec-${i + 1}`);
                              bumpChecks((n) => n + 1);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(!info.sections || info.sections.length === 0) && !!info.points?.length && (
            <section className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h3 className="text-base font-medium text-gray-800 mb-2">핵심 내용</h3>
              <ul className="flex flex-col gap-2 text-[15px] text-gray-700 leading-relaxed">
                {info.points!.map((point) => (
                  <li key={point} className="flex gap-2">
                    <i className="fa-solid fa-check text-[#37a7f0] mt-1.5 text-xs"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {info.traps && info.traps.length > 0 && (
            <section className="mb-6 p-4 sm:p-5 bg-[#fdf0ef] border border-[#f5c6c1] rounded-lg">
              <h2 className="text-base font-medium text-[#c0392b] mb-2">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>자주 틀리는 함정
              </h2>
              <ul className="flex flex-col gap-1.5 text-[15px] text-gray-700 leading-relaxed list-disc pl-5">
                {info.traps.map((trap) => (
                  <li key={trap}>{trap}</li>
                ))}
              </ul>
            </section>
          )}

          {info.tip && (
            <div className="p-4 bg-[#fff8e1] border-l-4 border-[#ffc107] rounded text-[15px] text-gray-800">
              <b className="mr-2">암기 요령</b>
              {info.tip}
            </div>
          )}
        </>
      )}

      {startButtons('mt-8')}
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
          아직 즐겨찾기한 문제가 없습니다. 순서 연습이나 주제별 연습에서 풀이 화면 오른쪽 위의
          <i className="fa-regular fa-star mx-1 text-[#f1b10f]"></i>
          (별표)를 누르면 여기에 모입니다.
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

// ───────────────── ⚡ 속성 과정 ─────────────────
// 시험이 얼마 안 남았을 때: ① 암기 구결·요령 카드 → ② 핵심 500문제 → ③ 시험 전날 실전 100문제
const FAST_PROGRESS = 'fast500';
const FAST_CARDS_PROGRESS = 'fast-cards';
const FAST_EXAM_RESULT = 'fast100';
const FAST_BREADCRUMB = '홈 > 필기시험 > 속성 과정';
type FastView =
  | { mode: 'home' }
  | { mode: 'cards' }
  | { mode: 'quiz'; random: boolean; questions: DLQuestion[]; key: number }
  | { mode: 'wrong' };

function fastExamQuestions(data: DLData, fast: DLQuestion[]) {
  const byId = new Map(data.questions.map((q) => [q.id, q]));
  const fixed = (data.fast?.exam ?? []).map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q);
  if (fixed.length >= 50) return { questions: fixed, fromBook: true };
  // 시험 전날 100문제 자료가 없으면 핵심 500문제에서 실제 시험처럼 판단형 40 + 선택형 60
  const judge = shuffle(fast.filter((q) => q.t === 'j'), 20261103).slice(0, EXAM_JUDGE);
  const single = shuffle(fast.filter((q) => q.t !== 'j'), 20261104).slice(0, EXAM_TOTAL - judge.length);
  return { questions: [...judge, ...single], fromBook: false };
}

function FastCards({ onBack }: { onBack: () => void }) {
  useDriverLicenseRecords();
  const { data } = useDriverLicenseData();
  // 카드에 붙은 기출 문제(그림 포함)를 체크에 함께 쓰기 위한 조회 테이블
  const bankById = useMemo(
    () => (data ? new Map(data.questions.map((q) => [q.id, q])) : new Map<number, DLQuestion>()),
    [data],
  );
  const done = new Set(getProgress<{ done: number[] }>(FAST_CARDS_PROGRESS)?.done ?? []);
  const topics = ['전체', ...Array.from(new Set(FAST_CARDS.map((card) => card.topic)))];
  const [topic, setTopic] = useState('전체');
  const [, rerender] = useState(0);
  // 카드 그림 클릭 확대
  const [zoomPic, setZoomPic] = useState<{ src: string; caption?: string } | null>(null);
  const toggle = (i: number) => {
    const next = new Set(done);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    saveProgress(FAST_CARDS_PROGRESS, { done: Array.from(next).sort((a, b) => a - b) });
    rerender((n) => n + 1);
  };
  const cards = FAST_CARDS.map((card, i) => ({ card, i })).filter(({ card }) => topic === '전체' || card.topic === topic);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="속성 과정으로 돌아가기" />
      {zoomPic && <ImageLightbox src={zoomPic.src} caption={zoomPic.caption} onClose={() => setZoomPic(null)} />}
      <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">① 암기 구결·요령</h1>
      <p className="text-sm text-gray-500 mb-5">
        자주 나오는 숫자·규칙을 먼저 외우세요. 외운 카드는 "외웠어요"를 눌러 표시해 두면 진도가 저장돼요. ({done.size}/{FAST_CARDS.length}장 외움 · 체크 {checkedCount('card:')}/{FAST_CARDS.length}장)
      </p>
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
      {FAST_CARDS.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">암기 카드를 준비하고 있어요.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {cards.map(({ card, i }) => (
            <div
              key={i}
              id={`fast-card-${i}`}
              className={`p-4 sm:p-5 rounded-lg border ${done.has(i) ? 'border-green-300 bg-green-50/40' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="shrink-0 px-2 py-0.5 rounded bg-[#eef7fe] text-[#2a8bc9] text-xs">{card.topic}</span>
                <h3 className="flex-1 font-medium text-gray-800">{card.title}</h3>
              </div>
              <ul className="flex flex-col gap-1.5 text-[15px] text-gray-700 leading-relaxed">
                {card.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <i className="fa-solid fa-check text-[#37a7f0] mt-1.5 text-xs"></i>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {card.images && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {card.images.map((pic) => (
                    <figure key={pic.src} className="w-[130px] sm:w-[160px] text-center">
                      <img
                        src={imageUrl(pic.src)}
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
              {card.memo && <div className="mt-3 px-3 py-2 bg-[#fff8e1] rounded text-sm text-gray-800">⚡ {card.memo}</div>}
              <button
                onClick={() => toggle(i)}
                className={`mt-3 text-sm px-3 py-1.5 rounded-full border ${done.has(i) ? 'border-green-500 text-green-700 bg-white' : 'border-gray-300 text-gray-600 bg-white hover:border-[#37a7f0]'}`}
              >
                {done.has(i) ? '✓ 외웠어요' : '외웠어요'}
              </button>
              <ContentCheck
                itemKey={`card:${i}`}
                questions={[
                  ...bankCheckQuestions(
                    (card.bankIds ?? []).map((id) => bankById.get(id)).filter((q): q is DLQuestion => !!q),
                    `card:${i}`,
                  ),
                  ...cardCheckQuestions(card, i),
                ]}
                onDone={() => {
                  scrollToId(`fast-card-${i + 1}`);
                  rerender((n) => n + 1);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FastCoursePage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useDriverLicenseData();
  const [view, setView] = useState<FastView>({ mode: 'home' });
  const [session, setSession] = useState<ExamSession | null>(null);
  const [outcome, setOutcome] = useState<ExamOutcome | null>(null);
  useDriverLicenseRecords();

  const fast = useMemo(() => {
    if (!data?.fast) return [];
    const byId = new Map(data.questions.map((q) => [q.id, q]));
    return data.fast.ids.map((id) => byId.get(id)).filter((q): q is DLQuestion => !!q);
  }, [data]);
  const exam = useMemo(() => (data ? fastExamQuestions(data, fast) : { questions: [], fromBook: false }), [data, fast]);

  if (!data) return <LoadingState failed={failed} onBack={onBack} />;

  const title = '⚡ 시험 전날 실전 100문제';
  const startExam = () => {
    setOutcome(null);
    setSession({ no: null, title, questions: exam.questions, answers: {}, startedAt: Date.now() });
    window.scrollTo({ top: 0 });
  };
  const finishExam = (finished: ExamSession) => {
    const score = finished.questions.filter((q, i) => finished.answers[i] === q.a).length;
    recordAnswers(
      finished.questions
        .map((q, i) => ({ id: q.id, selected: finished.answers[i], correct: finished.answers[i] === q.a }))
        .filter((r) => r.selected !== undefined),
    );
    const prev = getMockResults<MockResult>()[FAST_EXAM_RESULT];
    setMockResult(FAST_EXAM_RESULT, {
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
    return <ExamResult outcome={outcome} chapters={data.chapters} onRetry={startExam} onList={() => setOutcome(null)} listLabel="속성 과정으로" />;
  }
  if (view.mode === 'cards') return <FastCards onBack={() => setView({ mode: 'home' })} />;
  if (view.mode === 'quiz') {
    return (
      <PracticeQuiz
        key={view.key}
        questions={view.questions}
        title={`⚡ 핵심 500문제 (${view.random ? '랜덤' : '순서대로'})`}
        breadcrumb={FAST_BREADCRUMB}
        storageKey={view.random ? undefined : FAST_PROGRESS}
        onBack={() => setView({ mode: 'home' })}
        backLabel="속성 과정으로 돌아가기"
        onReviewWrong={() => setView({ mode: 'wrong' })}
      />
    );
  }
  if (view.mode === 'wrong') {
    return <WrongNotes pool={fast} title="⚡ 핵심 500문제" breadcrumb={FAST_BREADCRUMB} onBack={() => setView({ mode: 'home' })} backLabel="속성 과정으로 돌아가기" />;
  }

  const cardsDone = getProgress<{ done: number[] }>(FAST_CARDS_PROGRESS)?.done.length ?? 0;
  const cardsChecked = checkedCount('card:');
  const saved = getProgress<Progress>(FAST_PROGRESS);
  const solved = saved ? Object.keys(saved.answers).length : 0;
  const wrong = readWrong();
  const wrongCount = fast.filter((q) => q.id in wrong).length;
  const examResult = getMockResults<MockResult>()[FAST_EXAM_RESULT];
  const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
  const steps = [
    {
      no: 1,
      title: '암기 구결·요령',
      when: '먼저',
      desc: '벌금·벌점·속도·거리처럼 꼭 나오는 숫자와 규칙을 카드로 외워요.',
      progress: pct(cardsDone, FAST_CARDS.length),
      status: `${cardsDone}/${FAST_CARDS.length}장 외움 · 체크 ${cardsChecked}/${FAST_CARDS.length}장`,
      actions: [{ label: '카드 보기', primary: true, onClick: () => setView({ mode: 'cards' }) }],
    },
    {
      no: 2,
      title: '핵심 500문제',
      when: '그다음',
      desc: '자주 나오는 문제와 새 규정 문제만 골랐어요. 문제마다 ⚡ 풀이 요령이 붙어 있어요.',
      progress: pct(solved, fast.length),
      status: `${solved}/${fast.length}문제 풀이${wrongCount ? ` · 틀린 문제 ${wrongCount}개` : ''}`,
      actions: [
        {
          label: solved > 0 && solved < fast.length ? `이어서 풀기 (${solved}/${fast.length})` : '순서대로 풀기',
          primary: true,
          onClick: () => setView({ mode: 'quiz', random: false, questions: fast, key: Date.now() }),
        },
        { label: '랜덤으로 풀기', onClick: () => setView({ mode: 'quiz', random: true, questions: shuffle(fast), key: Date.now() }) },
        ...(wrongCount ? [{ label: `틀린 문제만 (${wrongCount})`, danger: true, onClick: () => setView({ mode: 'wrong' }) }] : []),
      ],
    },
    {
      no: 3,
      title: '시험 전날 실전 100문제',
      when: '시험 1일 전',
      desc: exam.fromBook
        ? '시험 전날 보는 실전 문제 100개를 실제 시험처럼 45분 동안 풀어요. 이 100문제만 보지 말고 ①·②단계를 먼저 끝내세요.'
        : '핵심 500문제에서 실제 시험처럼 판단형 40 + 선택형 60문제를 골라 45분 동안 풀어요.',
      progress: examResult ? Math.min(100, examResult.best) : 0,
      status: examResult ? `최고 ${examResult.best}점 · 최근 ${examResult.last}점 (${examResult.attempts}회)` : '아직 안 봤어요',
      actions: [{ label: '실전 시험 보기', primary: true, onClick: startExam }],
    },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <BackButton onClick={onBack} label="필기시험으로 돌아가기" />
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2">⚡ 속성 과정</h1>
        <p className="text-[15px] text-gray-600 leading-relaxed">
          시험이 얼마 안 남았을 때, 꼭 나오는 것만 3단계로 빠르게 끝내요. 전체 {data.questions.length}문제 중 속성 문제는 다른 연습에서도 ⚡속성 표시로 보여요.
        </p>
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
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className={`px-4 py-2 rounded-lg text-[15px] ${
                        'primary' in action && action.primary
                          ? 'text-white bg-[#37a7f0] hover:bg-[#2a8bc9]'
                          : 'danger' in action && action.danger
                            ? 'border border-[#e74c3c] text-[#e74c3c] bg-white hover:bg-red-50'
                            : 'border border-gray-300 text-gray-700 bg-white hover:border-[#37a7f0] hover:text-[#37a7f0]'
                      }`}
                    >
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

// ───────────────── 모의고사 ─────────────────

const EXAM_TOTAL = 100;
const EXAM_JUDGE = 40; // 판단형 40 + 단일 선택형 60
export const EXAM_SECONDS = 45 * 60;
export const PASS_SCORE = 90;
// 실전 시험 화면의 회색 버튼 (일시정지·이전·다음·제출 모두 같은 색)
const EXAM_BUTTON =
  'min-w-[90px] px-4 py-[5px] border border-[#bfbfbf] bg-[#f0f0f0] text-[13px] text-[#333] hover:bg-[#e6e6e6] disabled:text-[#aaa] disabled:bg-[#f7f7f7] disabled:cursor-not-allowed';
// 문제 형태별 구성: 글 45 · 그림 상황 35 · 교통 표지 10 · 신호등·교통경찰 수신호 10
const EXAM_MIX: Record<DLKind, number> = { txt: 45, pic: 35, sign: 10, sig: 10 };
const KINDS: DLKind[] = ['txt', 'pic', 'sign', 'sig'];

export type MockResult = { best: number; last: number; attempts: number; date: string };

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

export type ExamSession = { no: number | null; title?: string; questions: DLQuestion[]; answers: Record<number, number>; startedAt: number };
export type ExamOutcome = ExamSession & { score: number; seconds: number };

export function MockExamPage({ onBack }: { onBack: () => void }) {
  const { data, failed } = useDriverLicenseData();
  const sets = useMemo(() => (data ? buildExamSets(data.questions) : []), [data]);
  const [results, setResults] = useState<Record<string, MockResult>>(() => getMockResults<MockResult>());
  const { version } = useDriverLicenseRecords();
  useEffect(() => {
    setResults(getMockResults<MockResult>());
  }, [version]);
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

      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#2c3e50] mb-2">소형차 필기시험(과목1) 모의고사</h1>
        <p className="text-sm text-gray-500">
          실제 시험과 같은 방식으로 100문제를 풀어 보세요. 회차마다 주제별 연습의 모든 단계에서 골고루 출제됩니다.
        </p>
      </header>

      <div className="text-center mb-6">
        <button
          onClick={() => start(null)}
          className="w-full sm:w-auto px-6 py-3 rounded-lg text-white bg-[#37a7f0] hover:bg-[#2a8bc9]"
        >
          <i className="fa-solid fa-shuffle mr-2"></i>랜덤 모의고사 시작
        </button>
      </div>

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
      <p className="hidden sm:block text-xs text-gray-400 mb-10 leading-relaxed">
        과목1은 판단형과 단일 선택형 두 가지 유형만 출제됩니다. 2026년 개편 내용에 맞춰 그림(상황 그림·계기판), 교통 표지·노면
        표시, 신호등·교통경찰 수신호 문제를 합쳐 회차마다 55문제를 넣었고, 신에너지차·스마트 보조 주행 문제도 회차마다 포함됩니다.
      </p>

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

export function ExamRunner({
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
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const latest = useRef(session);
  latest.current = session;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  usePhoneFullscreen();
  const [slide, setSlide] = useState<'next' | 'prev' | null>(null);

  // 일시정지 중에는 멈춘 시각 기준으로 남은 시간을 계산해 타이머가 얼어붙게 함
  const remaining = EXAM_SECONDS - Math.floor(((pausedAt ?? now) - session.startedAt) / 1000);
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
    setZoom(false);
  }, [index]);

  // 실전 시험처럼 보기를 고른 뒤에는 그 문제에 머무름 (다음 문제는 '다음'으로 이동)
  const select = (i: number) => {
    if (pausedAt !== null) return;
    onChange({ ...latest.current, answers: { ...latest.current.answers, [index]: i } });
  };

  // 일시정지: 시간을 멈추고, 다시 시작할 때 멈춰 있던 만큼 시작 시각을 밀어 시간을 보정
  const togglePause = () => {
    if (pausedAt === null) setPausedAt(Date.now());
    else {
      onChange({ ...latest.current, startedAt: latest.current.startedAt + (Date.now() - pausedAt) });
      setPausedAt(null);
    }
  };

  // 키보드: ← → 이전·다음 문제, 1~4 또는 A~D 로 답 고르기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.repeat || pausedAt !== null) return;
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

  // 휴대폰: 좌우로 밀어 이전·다음 문제
  const moveTo = (target: number) => {
    const next = Math.max(0, Math.min(total - 1, target));
    if (next === index) return;
    setSlide(next > index ? 'next' : 'prev');
    setIndex(next);
  };
  const swipe = useSwipe(
    () => moveTo(index - 1),
    () => moveTo(index + 1),
  );

  // 실전처럼 제출 전에 확인 창을 띄움
  const submit = () => setConfirmOpen(true);
  const unanswered = total - answeredCount;
  const seat = (session.startedAt % 90) + 10;
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else rootRef.current?.requestFullscreen().catch(() => {});
  };

  // 실전 시험 화면과 같은 틀: 왼쪽 수험자 정보, 가운데 문제, 오른쪽 답안지 (화면이 넓어지면 세 열이 같이 넓어짐)
  return (
    <div ref={rootRef} className="fixed inset-0 z-[1000] bg-white overflow-auto" role="dialog" aria-modal="true" aria-label="모의고사 시험 화면">
      <div className="md:min-w-[1024px] h-screen flex flex-col" style={{ height: '100dvh' }}>
        {/* 상단 바 (이전 스타일): 시험 이름·남은 시간·전체 화면·제출·그만두기 */}
        {/* 한 줄 고정: 좁은 화면에서는 시험 이름이 말줄임으로 줄어들고, ← 버튼은 항상 남은 시간 오른쪽에 */}
        {/* 휴대폰: 위에는 뒤로 화살표, 일시정지, 남은 시간만 */}
        <div className="md:hidden flex-none h-12 flex items-center gap-1 px-1 border-b border-gray-100">
          <button onClick={onExit} aria-label="시험 그만두기" className="w-11 h-11 rounded-full flex items-center justify-center text-gray-700 active:bg-gray-100">
            <i className="fa-solid fa-chevron-left text-xl"></i>
          </button>
          <div className="flex-1"></div>
          <button
            onClick={togglePause}
            aria-label={pausedAt === null ? '일시정지' : '다시 시작'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 active:bg-gray-100"
          >
            <i className={`fa-solid ${pausedAt === null ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          <span className={`font-mono text-[17px] pr-2 tabular-nums ${remaining <= 300 ? 'text-[#e74c3c]' : 'text-gray-800'}`}>
            <i className="fa-regular fa-clock mr-1.5"></i>
            {formatTime(remaining)}
          </span>
        </div>
        <SwipeHint />
        <div className="flex-none hidden md:flex flex-nowrap items-center gap-x-2 sm:gap-x-3 px-3 sm:px-6 py-2.5 border-b border-gray-200 bg-[#f7fbfe]">
          <span className="min-w-0 truncate font-medium text-gray-800">{session.title ?? (session.no === null ? '랜덤 모의고사' : `제${session.no}회 모의고사`)}</span>
          <span className="shrink-0 whitespace-nowrap text-sm text-gray-500">
            {answeredCount}/{total}
            <span className="hidden sm:inline"> 답함</span>
          </span>
          <span className={`shrink-0 whitespace-nowrap font-mono text-base sm:text-lg px-2 sm:px-3 py-1 rounded ${remaining <= 300 ? 'bg-red-50 text-[#e74c3c]' : 'bg-white text-gray-800'}`}>
            <i className="fa-regular fa-clock mr-1.5"></i>
            {formatTime(remaining)}
          </span>
          <button onClick={onExit} className="md:hidden shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[#2a8bc9]" aria-label="되돌아가기">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <div className="shrink-0 flex items-center gap-2 ml-auto">
            {typeof document !== 'undefined' && !!document.fullscreenEnabled && (
              <button
                onClick={toggleFullscreen}
                className="hidden md:inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:border-[#37a7f0] hover:text-[#2a8bc9]"
              >
                <i className={`fa-solid ${fullscreen ? 'fa-compress' : 'fa-expand'} mr-1`}></i>
                {fullscreen ? '전체 화면 끝' : '전체 화면'}
              </button>
            )}
            <button
              onClick={onExit}
              className="hidden md:inline-flex items-center px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:border-[#e74c3c] hover:text-[#e74c3c]"
            >
              그만두기
            </button>
          </div>
        </div>

        {/* 실전처럼 전체를 감싸는 외곽선 안에 왼쪽·가운데·오른쪽 네모칸 배치 (데스크톱 전용) */}
        <div className="hidden md:block flex-1 min-h-0 p-2.5">
          <div className="h-full border border-[#c9c9c9] p-2 grid grid-cols-[minmax(150px,1.2fr)_minmax(0,6fr)_minmax(290px,2.2fr)] grid-rows-[minmax(0,auto)_minmax(0,1fr)] gap-2.5">
            {/* 왼쪽: 수험자 정보 (구역별로 네모칸) */}
            <aside className="flex flex-col gap-2 min-h-0 text-[13px] text-gray-700">
              <div className="border border-[#c9c9c9] p-2 text-center">
                <div className="font-bold text-[14px] text-gray-800">모의 시험장</div>
                <div className="mt-0.5">제 {seat} 고사대</div>
              </div>
              <div className="border border-[#c9c9c9] p-2 flex-1">
                <div className="font-bold text-gray-800 mb-1.5">수험자 정보</div>
                <div className="w-[62px] h-[78px] mx-auto bg-[#e8e8e8] border border-[#d0d0d0] flex items-center justify-center text-gray-400 text-3xl mb-2">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="space-y-0.5 leading-relaxed">
                  <div>수험자 성명: 게스트</div>
                  <div>성별: 미정</div>
                  <div>시험 과목: 과목1</div>
                  <div>시험 차종: C1</div>
                  <div>신청 유형: 초회 신청</div>
                </div>
              </div>
              <div className="border border-[#c9c9c9] p-2">
                <div className="font-bold text-gray-800">남은 시간</div>
                <div className="text-[#e60012] text-xl font-bold mt-0.5">{formatTime(remaining)}</div>
              </div>
            </aside>

            {/* 가운데: 문제 (회색 네모칸) */}
            <div className="border border-[#c9c9c9] flex flex-col min-h-0">
              <div className="flex-none px-4 py-2 border-b border-[#d5d5d5] font-bold text-[14px] text-gray-800">시험 문제</div>
              <div ref={panelRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
                <h2 className="text-[21px] font-bold text-gray-900 leading-relaxed">
                  {index + 1}. <span lang={q.ko ? 'zh-CN' : undefined}>{q.q}</span>
                </h2>
                {/* 실전처럼 보기 글자는 읽기 전용 */}
                <div className="mt-5 space-y-4 text-[17px] text-gray-800">
                  {optionsOf(q).map((text, i) => (
                    <div key={i}>
                      {LETTERS[i]}、<span lang={q.ko ? 'zh-CN' : undefined}>{text}</span>
                    </div>
                  ))}
                </div>
                {/* 실전처럼 '선택한 답'과 같은 줄에 답 고르기 버튼 (오른쪽에서 약간 왼쪽), 아래 여백을 둠 */}
                <div className="mt-12 flex items-center justify-between gap-4">
                  <div className="text-[16px] text-gray-800">
                    선택한 답: <b className="text-[#e60012]">{session.answers[index] !== undefined ? LETTERS[session.answers[index]] : ''}</b>
                  </div>
                  <div className="flex items-center gap-2 mr-8">
                    <span className="text-[14px] text-gray-600 mr-1">답 고르기:</span>
                    {optionsOf(q).map((text, i) => (
                      <button
                        key={i}
                        onClick={() => select(i)}
                        title={`${LETTERS[i]}. ${text}`}
                        className={`w-[44px] h-[44px] border text-[16px] ${
                          session.answers[index] === i
                            ? 'bg-[#19b39b] border-[#19b39b] text-white'
                            : 'bg-[#f0f0f0] border-[#bfbfbf] text-gray-700 hover:border-[#19b39b]'
                        }`}
                      >
                        {LETTERS[i]}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 안내 정보 네모칸(높이는 버튼과 동일), 오른쪽 끝에 일시정지·이전·다음·제출 */}
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="border border-[#c9c9c9] bg-[#fcfcfc] h-[30px] px-2 flex items-center text-[12px] text-gray-600">
                    {q.t === 'j' ? '안내 정보: 맞으면 A, 틀리면 B를 고르세요!' : '안내 정보: 올바른 답을 고르세요!'}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button onClick={togglePause} className={EXAM_BUTTON}>
                      일시정지
                    </button>
                    <button onClick={() => setIndex(index - 1)} disabled={index === 0} className={EXAM_BUTTON}>
                      이전
                    </button>
                    <button onClick={() => setIndex(index + 1)} disabled={index === total - 1} className={EXAM_BUTTON}>
                      다음
                    </button>
                    <button onClick={submit} className={EXAM_BUTTON}>
                      제출
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 답안지 (번호 표까지만 네모칸, 아래로 길게 내려오지 않음) */}
            <aside className="border border-[#c9c9c9] self-start">
              <div className="px-2 py-2 border-b border-[#d5d5d5] font-bold text-[15px] text-gray-800 text-center">답안지 정보</div>
              <div className="p-3 grid grid-cols-10 gap-[5px]">
                {session.questions.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setIndex(i)}
                    className={`aspect-square text-[13px] leading-none border ${
                      i === index
                        ? 'bg-[#19b39b] border-[#19b39b] text-white font-bold'
                        : session.answers[i] !== undefined
                          ? 'bg-[#bcd8f5] border-[#8fb8e0] text-gray-700'
                          : 'bg-white border-[#d0d0d0] text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </aside>

            {/* 시험 그림 정보: 오른쪽 끝(답안지 아래)까지 이어지는 테두리, 그림이 없어도 빈 칸은 항상 보임 */}
            <div className="col-span-3 min-h-0">
              <div className="border border-[#c9c9c9] p-2 h-full">
                <div className="text-[13px] text-gray-500 mb-1.5">시험 그림 정보</div>
                {/* 그림 크기 통일: 1개면 36vh, 여러 개(표지판·계기판 등)면 각각 24vh */}
                <div className="flex flex-wrap justify-center items-center gap-2 pb-1 min-h-[36vh]">
                  {q.img?.map((name) => (
                    <img
                      key={name}
                      src={imageUrl(name)}
                      alt="문제 그림"
                      loading="lazy"
                      style={{ height: q.img!.length > 1 ? '24vh' : '36vh', width: 'auto' }}
                      onClick={() => setZoom(true)}
                      className="max-w-full border border-[#d5d5d5] bg-white object-contain cursor-zoom-in"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일: 단일 열 (문제 → 그림 → 보기 → 답 고르기), 하단 탭으로 답안지 팝업 */}
        <div className="md:hidden flex-1 min-h-0 flex flex-col">
          <div className="flex-none px-3 py-2 border-b border-[#d5d5d5] bg-[#f7fbfe] flex items-center justify-between gap-2 text-[12px] text-gray-600">
            <span>제 {index + 1}문제 / 전체 {total}문제</span>
            <span>남은 문제 <b className="text-[#e60012]">{unanswered}</b>개</span>
          </div>
          <div {...swipe} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3">
            <div key={index} className={slide === 'next' ? 'dl-swipe-next' : slide === 'prev' ? 'dl-swipe-prev' : ''}>
            <h2 className="text-[19px] font-medium text-gray-900 leading-snug">
              {index + 1}. <span lang={q.ko ? 'zh-CN' : undefined}>{q.q}</span>
            </h2>
            {q.img && (
              <div className="my-3 flex flex-wrap justify-center gap-2">
                {q.img.map((name) => (
                  <img
                    key={name}
                    src={imageUrl(name)}
                    alt="문제 그림"
                    loading="lazy"
                    style={{ height: q.img!.length > 1 ? '150px' : '200px', width: 'auto' }}
                    onClick={() => setZoom(true)}
                    className="max-w-full border border-[#d5d5d5] bg-white object-contain"
                  />
                ))}
              </div>
            )}
            {/* 보기를 직접 눌러 답 고르기 (네모 칸 없이, 고른 보기는 초록 동그라미) */}
            <div className="mt-4 flex flex-col gap-1" role="radiogroup" aria-label="답 고르기">
              {optionsOf(q).map((text, i) => {
                const chosen = session.answers[index] === i;
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={chosen}
                    onClick={() => select(i)}
                    className={`w-full min-h-[52px] flex items-center gap-4 px-1.5 py-2 rounded-lg text-left text-[18px] leading-snug transition-colors active:bg-gray-100 ${
                      chosen ? 'text-[#13917e] font-medium' : 'text-gray-900'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-medium ${
                        chosen ? 'bg-[#19b39b] text-white' : 'bg-white text-gray-600 shadow-[0_1px_4px_rgba(0,0,0,0.18)]'
                      }`}
                    >
                      {chosen ? <i className="fa-solid fa-check"></i> : LETTERS[i]}
                    </span>
                    <span className="flex-1" lang={q.ko ? 'zh-CN' : undefined}>{text}</span>
                  </button>
                );
              })}
            </div>
            </div>
          </div>
          {/* 아래에는 답안지 정보만 (이전·다음은 좌우로 밀기, 제출은 답안지 안에서) */}
          <div className="flex-none border-t border-[#e0e0e0] bg-white">
            <button onClick={() => setSheetOpen(true)} className="w-full h-12 px-3 text-[15px] font-medium text-gray-700 bg-[#f7fbfe] active:bg-[#eaf4fb]">
              <i className="fa-solid fa-table-cells mr-1.5"></i>답안지 정보 · 제출 (답함 {answeredCount}/{total})
            </button>
          </div>
        </div>

        {/* 하단 바 */}
        <div className="hidden md:block flex-none border-t border-[#e0e0e0] py-1.5 text-center text-[11px] text-gray-400">
          운전면허 모의고사 시뮬레이션 · 과목1 C1 · 실전 시험 화면 재현
        </div>
      </div>

      {/* 제출 확인 창 (실전 '考试确认窗口' 재현) */}
      {confirmOpen && (
        <div className="fixed inset-0 z-30 bg-black/35 flex items-center justify-center p-4">
          <div className="w-[400px] shadow-xl">
            <div className="bg-[#0f5f6e] py-2 text-center text-[#ff3b30] font-bold text-[15px] tracking-widest">시험 확인 창</div>
            <div className="bg-[#a5e6b2] px-5 py-4 text-[13px] leading-relaxed text-gray-900">
              <div className="font-bold mb-1.5">조작 안내:</div>
              <div>1: [제출 확인]을 누르면 성적이 제출되고 시험이 끝납니다!</div>
              <div>2: [계속 시험]을 누르면 창이 닫히고 계속 시험을 봅니다!</div>
              <div>
                3: 아직 답하지 않은 문제가 <b className="text-[#e60012] text-base">{unanswered}</b>개 있습니다.
              </div>
              <div className="pl-4">자세한 것은 오른쪽 답안지 정보를 확인하세요.</div>
            </div>
            <div className="bg-[#b4b4e6] px-5 py-3 flex justify-center gap-8">
              <button onClick={() => onSubmit(session)} className="px-5 py-1.5 bg-white border border-[#8a8a8a] text-[13px] text-gray-800 hover:bg-gray-100">
                제출 확인
              </button>
              <button onClick={() => setConfirmOpen(false)} className="px-5 py-1.5 bg-white border border-[#8a8a8a] text-[13px] text-gray-800 hover:bg-gray-100">
                계속 시험
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 답안지 팝업 */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/35 flex items-end justify-center" onClick={() => setSheetOpen(false)}>
          <div className="w-full bg-white rounded-t-2xl shadow-2xl p-4 dl-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-800">답안지 정보</div>
              <button onClick={() => setSheetOpen(false)} aria-label="닫기" className="w-8 h-8 rounded-full bg-gray-100 text-gray-600"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="grid grid-cols-10 gap-[5px]">
              {session.questions.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => { setIndex(i); setSheetOpen(false); }}
                  className={`aspect-square text-[13px] leading-none border ${
                    i === index
                      ? 'bg-[#19b39b] border-[#19b39b] text-white font-bold'
                      : session.answers[i] !== undefined
                        ? 'bg-[#bcd8f5] border-[#8fb8e0] text-gray-700'
                        : 'bg-white border-[#d0d0d0] text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setSheetOpen(false);
                submit();
              }}
              className="w-full mt-4 h-12 rounded-xl bg-[#19b39b] text-white text-[15px] font-medium active:bg-[#14917e]"
            >
              답안 제출 ({answeredCount}/{total})
            </button>
          </div>
        </div>
      )}

      {/* 그림 확대 */}
      {zoom && q.img && (
        <div className="fixed inset-0 z-40 bg-black/70 flex flex-col items-center justify-center p-4 gap-3" onClick={() => setZoom(false)}>
          <div className="flex flex-col items-center gap-3 overflow-y-auto max-h-full py-2" onClick={(e) => e.stopPropagation()}>
            {q.img.map((name) => (
              <img key={name} src={imageUrl(name)} alt="문제 그림 확대" style={LIGHTBOX_IMG_STYLE} className="bg-white" />
            ))}
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-gray-700 text-xl hover:bg-white"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* 일시정지: 실전처럼 문제를 가리고 시간을 멈춤 */}
      {pausedAt !== null && (
        <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center gap-4 p-6 text-center">
          <i className="fa-solid fa-pause text-4xl text-[#2b5cb4]"></i>
          <div className="text-lg text-gray-800">일시정지 중입니다</div>
          <div className="text-sm text-gray-500">
            남은 시간 <span className="font-mono text-[#e60012]">{formatTime(remaining)}</span>
          </div>
          <button onClick={togglePause} className="px-6 py-2.5 text-white bg-[#2b5cb4] hover:bg-[#234c96]">
            시험 계속하기
          </button>
        </div>
      )}
    </div>
  );
}

export function ExamResult({
  outcome,
  chapters,
  onRetry,
  onList,
  listLabel = '모의고사 목록',
  groups,
}: {
  outcome: ExamOutcome;
  chapters: DLChapter[];
  onRetry: () => void;
  onList: () => void;
  listLabel?: string;
  groups?: { title: string; rows: { key: string; label: string; ids: Set<number> }[] }; // 단계별 대신 보여 줄 묶음 (만점 교육: 주제별)
}) {
  const passed = outcome.score >= PASS_SCORE;
  const tally = (key: string, label: string, match: (q: DLQuestion) => boolean) => {
    const items = outcome.questions.map((q, i) => ({ q, i })).filter(({ q }) => match(q));
    return { key, label, total: items.length, correct: items.filter(({ q, i }) => outcome.answers[i] === q.a).length };
  };
  const byKind = KINDS.map((kind) => tally(kind, KIND_LABEL[kind], (q) => kindOf(q) === kind)).filter((row) => row.total > 0);
  const byChapter = groups
    ? groups.rows.map((row) => tally(row.key, row.label, (q) => row.ids.has(q.id))).filter((row) => row.total > 0)
    : chapters
        .map((chapter) => tally(String(chapter.id), `제${chapter.id}장 ${chapter.title}`, (q) => q.c === chapter.id))
        .filter((row) => row.total > 0);
  const wrong = outcome.questions
    .map((q, i) => ({ q, i, selected: outcome.answers[i] }))
    .filter(({ q, selected }) => selected !== q.a);

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className={`rounded-xl p-6 sm:p-8 text-center mb-8 ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="text-sm text-gray-500 mb-1">{outcome.title ?? (outcome.no === null ? '랜덤 모의고사' : `제${outcome.no}회 모의고사`)} 결과</div>
        <div className={`text-5xl font-bold mb-2 ${passed ? 'text-[#2ecc71]' : 'text-[#e74c3c]'}`}>{outcome.score}점</div>
        <div className={`inline-block px-4 py-1 rounded-full text-white text-sm mb-4 ${passed ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'}`}>
          {passed ? '합격' : '불합격'} (합격 기준 {PASS_SCORE}점)
        </div>
        <div className="text-sm text-gray-600">
          정답 {outcome.score}문제 · 오답 {wrong.length}문제 · 소요 시간 {formatTime(outcome.seconds)}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button onClick={onRetry} className="px-5 py-2.5 rounded text-white bg-[#37a7f0] hover:bg-[#2a8bc9]">
            {outcome.title ? '다시 풀기' : outcome.no === null ? '새 랜덤 모의고사' : '이 회차 다시 풀기'}
          </button>
          <button onClick={onList} className="px-5 py-2.5 rounded border border-gray-300 bg-white text-gray-700 hover:border-[#37a7f0] hover:text-[#37a7f0]">
            {listLabel}
          </button>
        </div>
      </div>

      {[
        { title: '문제 형태별 결과', rows: byKind },
        { title: groups?.title ?? '단계별 결과', rows: byChapter },
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
                <ExplanationBox q={q} selected={selected} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
