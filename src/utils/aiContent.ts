import { useEffect, useState } from 'react';
import { serverFetch } from './supabase/client';
import { MarketNewsItem } from './market';

/*
 * 서버의 AI 자동화 결과 (매일 예약 실행으로 만들어짐)
 * - 아침 브리핑: /daily/morning
 * - 중국소식 기사: /news/china
 * - 비자/서류 공지 요약: /notices/visa
 */
const hasForeignScript = (text = '') => /[぀-ヿ一-鿿]/.test(text);

export interface MorningBriefing {
  date: string;
  rate: { krwPerCny: number; prev: number | null } | null;
  weather: { city: string; max: number; min: number; rain: number | null; desc: string }[];
  lines: string[];
  createdAt: string;
}

export async function fetchMorningBriefing(): Promise<MorningBriefing | null> {
  try {
    const res = await serverFetch('/daily/morning');
    return res.success && res.briefing ? res.briefing : null;
  } catch {
    return null;
  }
}

const cache: Record<string, Promise<MarketNewsItem[]>> = {};

/** AI 기사 목록 (한국어로만 된 기사만, 실패하면 빈 목록) */
export function useAiArticles(path: '/news/china' | '/notices/visa'): MarketNewsItem[] {
  const [items, setItems] = useState<MarketNewsItem[]>([]);
  useEffect(() => {
    cache[path] ??= serverFetch(path)
      .then(res => (res.items || []).filter((i: MarketNewsItem) =>
        i.content && ![i.title, i.summary, i.content, i.source].some(hasForeignScript)))
      .catch(() => []);
    let alive = true;
    cache[path].then(list => { if (alive) setItems(list); });
    return () => { alive = false; };
  }, [path]);
  return items;
}
