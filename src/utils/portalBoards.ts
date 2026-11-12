// 비자/서류 · 교육 · 자동차 · 중국소식 게시판 데이터 (홈 목록 · 메뉴 목록 · 상세가 모두 이 한 곳을 씀)
// - 안내 글: data/portalGuides.ts
// - 최신 소식: 서버 AI 기사 (/news/china: 중국소식 전체·교육·교통, /notices/visa: 비자 공지)
import { useAiArticles } from './aiContent';
import type { MarketNewsItem } from './market';
import { AUTO_GUIDES, EDUCATION_GUIDES, VISA_GUIDES, type Guide, type GuideBlock } from '../data/portalGuides';

export type BoardKey = 'visa' | 'education' | 'auto' | 'news';

export interface BoardItem {
  id: string;
  board: BoardKey;
  sub: string;
  title: string;
  summary: string;
  source: string;
  date: string; // ISO 또는 YYYY-MM-DD
  thumb?: string;
  tags?: string[];
  body?: GuideBlock[]; // 안내 글
  content?: string; // AI 기사 본문
  ai?: boolean;
  isSample?: boolean;
}

export interface BoardMeta {
  title: string;
  page: string; // Portal 페이지 이름
  subs: string[]; // '전체' 다음 하위 분류 (중국소식은 기사 분류에서 만듦)
  aiSub?: string; // AI 기사를 넣는 하위 분류
  desc: string;
}

export const BOARD_META: Record<BoardKey, BoardMeta> = {
  visa: { title: '비자/서류', page: 'visadocument', subs: ['비자', '거류증', '공증서류', '은행계좌', '기타', '최신 공지'], aiSub: '최신 공지', desc: '비자·거류증·공증 절차 안내와 출입국 최신 공지' },
  education: { title: '교육', page: 'education', subs: ['유학', 'HSK·어학', '국제학교', '현지학교', '입시', '교육 소식'], aiSub: '교육 소식', desc: '중국 유학·자녀 교육 안내와 교육 소식' },
  auto: { title: '자동차', page: 'auto', subs: ['운전면허', '차량 구입', '보험·검사', '교통 위반', '전기차', '교통 소식'], aiSub: '교통 소식', desc: '운전면허·차량·교통 규칙 안내와 교통 소식' },
  news: { title: '중국소식', page: 'news', subs: [], desc: '공식 자료를 바탕으로 한 중국 생활·정책 소식' },
};

export const BOARD_OF_PAGE: Record<string, BoardKey> = { visadocument: 'visa', education: 'education', auto: 'auto', news: 'news' };

const GUIDES: Record<Exclude<BoardKey, 'news'>, Guide[]> = { visa: VISA_GUIDES, education: EDUCATION_GUIDES, auto: AUTO_GUIDES };

const fromGuide = (board: BoardKey) => (g: Guide): BoardItem => ({ ...g, board });

const fromAi = (board: BoardKey, sub?: string) => (a: MarketNewsItem): BoardItem => ({
  id: 'ai-' + (a.id || a.url),
  board,
  sub: sub ?? (a.category || '기타'),
  title: a.title,
  summary: a.summary,
  source: a.source,
  date: a.publishedAt,
  content: a.content,
  ai: true,
  isSample: a.isSample,
});

const byDate = (a: BoardItem, b: BoardItem) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0);

/** 게시판 글 목록 (안내 글 + AI 소식, 최신순). AI 기사가 아직 안 왔으면 안내 글만 */
export function useBoardItems(board: BoardKey): { items: BoardItem[]; subs: string[] } {
  const news = useAiArticles('/news/china');
  const notices = useAiArticles('/notices/visa');
  if (board === 'news') {
    const items = news.map(fromAi('news')).sort(byDate);
    const subs = [...new Set(items.map((i) => i.sub))];
    return { items, subs };
  }
  const guides = GUIDES[board].map(fromGuide(board));
  const ai =
    board === 'visa'
      ? notices.map(fromAi('visa', BOARD_META.visa.aiSub))
      : news.filter((a) => a.category === (board === 'education' ? '교육' : '교통')).map(fromAi(board, BOARD_META[board].aiSub));
  // 안내 글을 먼저(분류 순서대로), 그다음 최신 소식
  return { items: [...guides, ...ai.sort(byDate)], subs: BOARD_META[board].subs };
}

/** 목록 날짜 표시: 소식은 7일 안이면 "n시간 전", 그 밖(안내 글 확인일 포함)은 "2026.11.07." */
export function boardDate(iso: string, relative = true) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return iso;
  const diff = Date.now() - t;
  if (relative && diff >= 0 && diff < 7 * 864e5) {
    const min = Math.max(1, Math.round(diff / 6e4));
    if (min < 60) return `${min}분 전`;
    const h = Math.round(min / 60);
    return h < 24 ? `${h}시간 전` : `${Math.round(h / 24)}일 전`;
  }
  const d = new Date(t);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}.`;
}
