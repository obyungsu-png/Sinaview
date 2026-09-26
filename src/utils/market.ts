import { serverFetch } from './supabase/client';

export interface MarketQuote {
  code: string;
  name: string;
  type?: 'index' | 'stock';
  market?: string;
  currency?: string;
  price: number;
  change: number;
  percent: number;
}

export interface MarketNewsItem {
  id?: string;
  content?: string;   // AI가 쓴 한국어 기사 본문
  isSample?: boolean; // 서버 기사가 없을 때 보여 주는 예시 기사
  title: string;
  originalTitle: string;
  summary: string;
  category: string;
  url: string;
  source: string;
  publishedAt: string;
}

/** 서버에 저장된 지수·주가 (실패하면 null → 화면은 예시 데이터 사용) */
export async function fetchMarketQuotes(): Promise<{ quotes: MarketQuote[]; updatedAt: string } | null> {
  try {
    const res = await serverFetch('/market/quotes');
    return res.success && res.quotes?.length ? res : null;
  } catch {
    return null;
  }
}

// 한자·일본어 글자가 섞였는지 (한국어로만 보여 주기 위해)
const hasForeignScript = (text = '') => /[\u3040-\u30ff\u4e00-\u9fff]/.test(text);

/** 서버에 저장된 AI 한국어 증권 기사 - 본문이 있고 한국어로만 된 기사만 */
export async function fetchMarketNews(): Promise<{ items: MarketNewsItem[]; briefing?: string; updatedAt: string | null } | null> {
  try {
    const res = await serverFetch('/market/news');
    if (!res.success) return null;
    const items = (res.items || []).filter((i: MarketNewsItem) =>
      i.content && ![i.title, i.summary, i.content, i.source].some(hasForeignScript));
    const briefing = hasForeignScript(res.briefing) ? '' : res.briefing;
    return items.length || briefing ? { ...res, items, briefing } : null;
  } catch {
    return null;
  }
}

export function formatUpdatedAt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function timeAgo(iso: string) {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `${min}분 전`;
  const h = Math.round(min / 60);
  return h < 24 ? `${h}시간 전` : `${Math.round(h / 24)}일 전`;
}
