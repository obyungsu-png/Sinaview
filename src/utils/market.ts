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

/** 서버에 저장된 AI 한국어 요약 증권 뉴스 */
export async function fetchMarketNews(): Promise<{ items: MarketNewsItem[]; briefing?: string; updatedAt: string | null } | null> {
  try {
    const res = await serverFetch('/market/news');
    return res.success && res.items?.length ? res : null;
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
