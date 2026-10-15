// 운전면허 필기 학습 기록 (틀린 문제·진도·모의고사 점수·즐겨찾기)
// 서버(Edge Function)와 브라우저가 같은 합치기 규칙을 쓰도록 한 파일에 둔다. Deno·브라우저 전용 기능은 쓰지 않는다.
// - 항목마다 고친 시각(t)을 두고, 두 기기의 기록이 다르면 더 나중에 고친 쪽을 남긴다.
// - 회원 기록은 마지막으로 고친 지 RETENTION_DAYS 일이 지나면 지운다. (즐겨찾기는 직접 고르는 것이라 그대로 둔다)

export const RETENTION_DAYS = 14;
const RETENTION_MS = RETENTION_DAYS * 24 * 3600 * 1000;

/** 틀린 문제: s = 마지막에 고른 답, ok = 나중에 맞혀서 목록에서 빠짐 (다른 기기에도 알리기 위해 남겨 둠) */
export type DLWrongItem = { s: number; t: number; ok?: 1 };
export type DLStamped<T> = { v: T; t: number };
export type DLRecords = {
  wrong: Record<string, DLWrongItem>;
  progress: Record<string, DLStamped<unknown>>;
  mock: Record<string, DLStamped<unknown>>;
  favorites?: DLStamped<number[]>;
};

export const emptyRecords = (): DLRecords => ({ wrong: {}, progress: {}, mock: {} });

function mergeMap<T extends { t: number }>(a: Record<string, T> = {}, b: Record<string, T> = {}, cutoff: number) {
  const out: Record<string, T> = {};
  for (const [key, item] of Object.entries(a)) if (item.t >= cutoff) out[key] = item;
  for (const [key, item] of Object.entries(b)) {
    if (item.t < cutoff) continue;
    if (!out[key] || item.t >= out[key].t) out[key] = item;
  }
  return out;
}

/** a 와 b 를 합친다. 같은 항목은 t 가 큰 쪽(같으면 b), 보관 기간이 지난 항목은 버린다 */
export function mergeRecords(a: Partial<DLRecords> | null | undefined, b: Partial<DLRecords> | null | undefined, now = Date.now()): DLRecords {
  const cutoff = now - RETENTION_MS;
  const fa = a?.favorites;
  const fb = b?.favorites;
  return {
    wrong: mergeMap(a?.wrong, b?.wrong, cutoff),
    progress: mergeMap(a?.progress, b?.progress, cutoff),
    mock: mergeMap(a?.mock, b?.mock, cutoff),
    favorites: fa && fb ? (fb.t >= fa.t ? fb : fa) : fb || fa,
  };
}

const ID_RE = /^\d{1,6}$/;
const KEY_RE = /^[\w-]{1,40}$/;
const MAX_ITEM_BYTES = 120_000;

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);

/** 브라우저에서 받은 기록을 검사·정리한다 (모양이 틀린 항목은 버리고, 미래 시각은 지금으로 맞춤) */
export function sanitizeRecords(input: any, now = Date.now()): DLRecords {
  const out = emptyRecords();
  const time = (v: unknown) => Math.min(num(v), now);
  if (input?.wrong && typeof input.wrong === 'object') {
    for (const [id, item] of Object.entries<any>(input.wrong).slice(0, 5000)) {
      const s = num(item?.s);
      const t = time(item?.t);
      if (!ID_RE.test(id) || !Number.isInteger(s) || s < 0 || s > 9 || !(t > 0)) continue;
      out.wrong[id] = item.ok ? { s, t, ok: 1 } : { s, t };
    }
  }
  for (const field of ['progress', 'mock'] as const) {
    const map = input?.[field];
    if (!map || typeof map !== 'object') continue;
    for (const [key, item] of Object.entries<any>(map).slice(0, 60)) {
      const t = time(item?.t);
      if (!KEY_RE.test(key) || !(t > 0) || !item?.v || typeof item.v !== 'object') continue;
      if (JSON.stringify(item.v).length > MAX_ITEM_BYTES) continue;
      out[field][key] = { v: item.v, t };
    }
  }
  const fav = input?.favorites;
  if (fav && Array.isArray(fav.v) && time(fav.t) > 0) {
    out.favorites = { v: fav.v.filter((id: unknown) => Number.isInteger(id)).slice(0, 5000), t: time(fav.t) };
  }
  return out;
}
