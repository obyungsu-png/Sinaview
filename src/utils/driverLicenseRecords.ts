import { useEffect, useState } from 'react';
import { supabase, serverUrl } from './supabase/client';
import {
  emptyRecords,
  mergeRecords,
  RETENTION_DAYS,
  type DLRecords,
  type DLStamped,
} from '../supabase/functions/server/driver_license_records';

/*
 * 운전면허 필기 학습 기록 (틀린 문제·진도·모의고사 점수·즐겨찾기)
 * - 항상 이 기기(localStorage)에 먼저 저장하고, 로그인한 회원이면 서버에도 올려 휴대폰·PC 어디서든 이어서 푼다.
 * - 바뀐 항목만 몇 초 모아서 올리고, 필기시험 화면에 들어오거나 다시 볼 때 서버 기록을 받아 합친다.
 * - 회원 기록은 마지막으로 푼 지 RETENTION_DAYS(14)일이 지나면 지워진다.
 * - 로그인 전에 푼 기록은 로그인하면 회원 기록에 합쳐지고, 로그아웃하면 이 기기의 기록은 지운다.
 */
export { RETENTION_DAYS };

const STORE_KEY = 'dl-records';
const DIRTY_KEY = 'dl-records-dirty';
const OWNER_KEY = 'dl-records-owner';
const LEGACY_PROGRESS_PREFIX = 'dl-progress-';
const LEGACY_KEYS = ['dl-wrong', 'dl-favorites', 'dl-mock-results'];
const RECORDS_URL = `${serverUrl}/driver-license/records`;
const PUSH_DELAY = 3000;
const PULL_INTERVAL = 30_000;

type Dirty = { wrong: string[]; progress: string[]; mock: string[]; favorites?: boolean };
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간을 쓸 수 없는 환경(사생활 보호 모드 등)에서는 이번 화면에서만 기억함
  }
}

function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // 무시
  }
}

let cache: DLRecords | null = null;
let dirty: Dirty | null = null;

function dirtySet(): Dirty {
  if (!dirty) dirty = { wrong: [], progress: [], mock: [], ...readJSON<Partial<Dirty>>(DIRTY_KEY, {}) };
  return dirty;
}

function markDirty(field: 'wrong' | 'progress' | 'mock', key: string) {
  const list = dirtySet()[field];
  if (!list.includes(key)) list.push(key);
}

const isClean = (d: Dirty) => !d.wrong.length && !d.progress.length && !d.mock.length && !d.favorites;

function persist() {
  writeJSON(STORE_KEY, cache);
  writeJSON(DIRTY_KEY, dirtySet());
}

// 예전 방식(항목별 localStorage 키)으로 저장된 기록을 한 곳으로 옮긴다
function migrateLegacy(): DLRecords {
  const now = Date.now();
  const out = emptyRecords();
  const d = dirtySet();
  for (const [id, s] of Object.entries(readJSON<Record<string, unknown>>('dl-wrong', {}))) {
    if (typeof s !== 'number') continue;
    out.wrong[id] = { s, t: now };
    d.wrong.push(id);
  }
  const favorites = readJSON<unknown>('dl-favorites', null);
  if (Array.isArray(favorites) && favorites.length) {
    out.favorites = { v: favorites, t: now };
    d.favorites = true;
  }
  for (const [key, v] of Object.entries(readJSON<Record<string, unknown>>('dl-mock-results', {}))) {
    out.mock[key] = { v, t: now };
    d.mock.push(key);
  }
  const progressKeys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LEGACY_PROGRESS_PREFIX)) progressKeys.push(key);
    }
  } catch {
    // 무시
  }
  for (const key of progressKeys) {
    const v = readJSON<unknown>(key, null);
    if (!v) continue;
    const id = key.slice(LEGACY_PROGRESS_PREFIX.length);
    out.progress[id] = { v, t: now };
    d.progress.push(id);
  }
  cache = out;
  persist();
  if (readJSON(STORE_KEY, null)) [...LEGACY_KEYS, ...progressKeys].forEach(removeKey);
  return out;
}

function records(): DLRecords {
  if (!cache) {
    const saved = readJSON<DLRecords | null>(STORE_KEY, null);
    cache = saved ? { ...emptyRecords(), ...saved } : migrateLegacy();
  }
  return cache;
}

// ───── 읽기·쓰기 (화면에서 사용) ─────

/** 지금 틀린 상태인 문제: 문제 id → 마지막으로 고른 답 */
export function getWrongMap(): Record<number, number> {
  const out: Record<number, number> = {};
  for (const [id, item] of Object.entries(records().wrong)) if (!item.ok) out[Number(id)] = item.s;
  return out;
}

/** 푼 결과 기록: 틀리면 틀린 문제에 넣고, 예전에 틀렸던 문제를 맞히면 뺀다 */
export function recordAnswers(results: { id: number; selected: number; correct: boolean }[]) {
  const wrong = records().wrong;
  const now = Date.now();
  let changed = false;
  for (const { id, selected, correct } of results) {
    const key = String(id);
    const prev = wrong[key];
    if (correct) {
      if (!prev || prev.ok) continue;
      wrong[key] = { s: prev.s, t: now, ok: 1 };
    } else {
      wrong[key] = { s: selected, t: now };
    }
    markDirty('wrong', key);
    changed = true;
  }
  if (changed) saveLocal();
}

export function getProgress<T>(id: string): T | null {
  return (records().progress[id]?.v as T) ?? null;
}

export function setProgress(id: string, value: unknown) {
  const map = records().progress;
  if (map[id] && JSON.stringify(map[id].v) === JSON.stringify(value)) return;
  map[id] = { v: value, t: Date.now() };
  markDirty('progress', id);
  saveLocal();
}

export function getFavorites(): number[] {
  return records().favorites?.v ?? [];
}

export function setFavorites(ids: number[]) {
  records().favorites = { v: ids, t: Date.now() };
  dirtySet().favorites = true;
  saveLocal();
}

export function getMockResults<T>(): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, item] of Object.entries(records().mock)) out[key] = item.v as T;
  return out;
}

export function setMockResult(key: string, value: unknown) {
  records().mock[key] = { v: value, t: Date.now() };
  markDirty('mock', key);
  saveLocal();
}

function saveLocal() {
  persist();
  if (state.loggedIn) schedulePush();
}

// ───── 서버와 맞추기 ─────

let state: { loggedIn: boolean; status: SyncStatus; lastSyncedAt?: number } = { loggedIn: false, status: 'idle' };
let version = 0; // 서버 기록을 받아 바뀔 때마다 1 증가 → 화면이 다시 읽음
const listeners = new Set<() => void>();

function setState(next: Partial<typeof state>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

async function getSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

let pushTimer: number | undefined;
let pushQueue: Promise<void> = Promise.resolve();

function schedulePush() {
  window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => void pushNow().catch(() => setState({ status: 'error' })), PUSH_DELAY);
}

function pick<T extends { t: number }>(map: Record<string, T>, keys: string[]) {
  const out: Record<string, T> = {};
  for (const key of keys) if (map[key]) out[key] = map[key];
  return out;
}

/** 바뀐 항목만 서버에 올린다 (한 번에 하나씩). 올리는 동안 또 바뀐 항목은 다음에 다시 올림 */
function pushNow(token?: string, keepalive = false): Promise<void> {
  window.clearTimeout(pushTimer);
  const run = pushQueue.then(() => pushOnce(token, keepalive));
  pushQueue = run.catch(() => {});
  return run;
}

async function pushOnce(token: string | undefined, keepalive: boolean) {
  const d = dirtySet();
  if (isClean(d)) return;
  const accessToken = token ?? (await getSession())?.access_token;
  if (!accessToken) return;

  const r = records();
  const changes: Partial<DLRecords> = {
    wrong: pick(r.wrong, d.wrong),
    progress: pick(r.progress, d.progress),
    mock: pick(r.mock, d.mock),
    ...(d.favorites && r.favorites ? { favorites: r.favorites } : {}),
  };
  const sent = JSON.parse(JSON.stringify(changes)) as Partial<DLRecords>;
  const body = JSON.stringify({ changes });
  const res = await fetch(RECORDS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body,
    keepalive: keepalive && body.length < 60_000,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || `서버 오류 (${res.status})`);

  if (d !== dirty) return; // 그사이 로그아웃 등으로 이 기기 기록을 지웠음
  // 올린 뒤 다시 바뀌지 않은 항목만 '올림 완료'로 표시
  const now = records();
  const keep = <T extends { t: number }>(map: Record<string, T>, sentMap: Record<string, T> = {}) => (key: string) =>
    !!map[key] && (!sentMap[key] || sentMap[key].t !== map[key].t);
  d.wrong = d.wrong.filter(keep(now.wrong, sent.wrong));
  d.progress = d.progress.filter(keep(now.progress, sent.progress));
  d.mock = d.mock.filter(keep(now.mock, sent.mock));
  if (d.favorites && sent.favorites && now.favorites?.t === sent.favorites.t) d.favorites = false;
  writeJSON(DIRTY_KEY, d);
  setState({ status: 'synced', lastSyncedAt: Date.now() });
}

function clearLocal() {
  cache = emptyRecords();
  dirty = { wrong: [], progress: [], mock: [] };
  [STORE_KEY, DIRTY_KEY, OWNER_KEY].forEach(removeKey);
}

let syncing: Promise<void> | null = null;

/** 로그인한 회원이면 이 기기의 바뀐 기록을 올리고, 서버 기록을 받아 합친다 */
export function syncNow(): Promise<void> {
  if (!syncing) syncing = doSync().finally(() => (syncing = null));
  return syncing;
}

async function doSync() {
  const session = await getSession();
  if (!session) {
    setState({ loggedIn: false, status: 'idle' });
    return;
  }
  setState({ loggedIn: true, status: 'syncing' });
  try {
    // 다른 회원의 기록이 이 기기에 남아 있으면 섞이지 않도록 먼저 지운다
    const owner = readJSON<string | null>(OWNER_KEY, null);
    if (owner && owner !== session.user.id) clearLocal();
    records();
    await pushNow(session.access_token);

    const res = await fetch(RECORDS_URL, { headers: { Authorization: `Bearer ${session.access_token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.error || `서버 오류 (${res.status})`);

    const local = records();
    const merged = mergeRecords(local, data.records);
    // 받는 동안 이 기기에서 새로 푼 기록은 그대로 둔다
    const d = dirtySet();
    for (const field of ['wrong', 'progress', 'mock'] as const) {
      const target = merged[field] as Record<string, unknown>;
      const source = local[field] as Record<string, unknown>;
      for (const key of d[field]) if (source[key]) target[key] = source[key];
    }
    if (d.favorites && local.favorites) merged.favorites = local.favorites as DLStamped<number[]>;
    cache = merged;
    persist();
    writeJSON(OWNER_KEY, session.user.id);
    version++;
    lastPull = Date.now();
    setState({ status: 'synced', lastSyncedAt: Date.now() });
    if (!isClean(d)) schedulePush();
  } catch (error) {
    console.warn('운전면허 기록 동기화 실패:', error);
    setState({ status: 'error' });
  }
}

let started = false;
let lastPull = 0;

/** 필기시험 화면에 들어오면 한 번 호출: 기록을 맞추고, 화면을 다시 볼 때·로그인할 때 다시 맞춘다 */
export function startDriverLicenseSync() {
  if (!started) {
    started = true;
    document.addEventListener('visibilitychange', () => {
      if (!state.loggedIn) return;
      if (document.visibilityState === 'hidden') void pushNow(undefined, true).catch(() => {});
      else if (Date.now() - lastPull > PULL_INTERVAL) void syncNow();
    });
    window.addEventListener('pagehide', () => {
      if (state.loggedIn) void pushNow(undefined, true).catch(() => {});
    });
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && !state.loggedIn) void syncNow();
      if (event === 'SIGNED_OUT') setState({ loggedIn: false, status: 'idle' });
    });
  }
  if (Date.now() - lastPull > PULL_INTERVAL || !state.loggedIn) void syncNow();
}

/** 로그아웃 직전: 아직 못 올린 기록을 올리고 이 기기의 기록을 지운다 (다음 사람과 섞이지 않게) */
export async function finishDriverLicenseSync() {
  const session = await getSession();
  const owner = readJSON<string | null>(OWNER_KEY, null);
  if (session && (!owner || owner === session.user.id)) {
    await Promise.race([pushNow(session.access_token).catch(() => {}), new Promise((r) => setTimeout(r, 4000))]);
  }
  clearLocal();
  version++;
  setState({ loggedIn: false, status: 'idle' });
}

/** 기록이 서버에서 바뀌거나 동기화 상태가 바뀌면 화면을 다시 그린다 */
export function useDriverLicenseRecords() {
  const [, rerender] = useState(0);
  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return { ...state, version };
}
