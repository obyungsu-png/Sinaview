// 비자/서류 · 교육 · 자동차 · 중국소식 게시판 화면 (네이버 모바일 목록과 비슷한 구성)
// - 목록: 위쪽 밑줄 탭(하위 분류) → 첫 글은 큰 사진 → 나머지는 "글 왼쪽 · 사진 오른쪽" 한 줄씩
// - 상세: 홈·목록에서 누른 바로 그 글, "목록" 누르면 같은 분류 목록으로
// - 홈 섹션(BoardSection)도 같은 데이터·같은 줄 모양을 써서 목록과 상세가 어긋나지 않음
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Search, X, ChevronRight, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import { CommentSection } from '../CommentSection';
import { BOARD_META, boardDate, useBoardItems, type BoardItem, type BoardKey } from '../../utils/portalBoards';
import type { GuideBlock } from '../../data/portalGuides';

/** 사이트 안 링크: 'visa:글id' 처럼 다른 게시판 글, 또는 'driverlicense' 같은 페이지 */
export type BoardLinkHandler = (target: string) => void;

const big = (url?: string) => url?.replace('w=400&h=250', 'w=800&h=450');

// ───────── 목록 한 줄 ─────────
export function BoardRow({ item, onOpen, showSub = true }: { item: BoardItem; onOpen: (item: BoardItem) => void; showSub?: boolean }) {
  return (
    <button onClick={() => onOpen(item)} className="w-full text-left flex gap-3 py-3.5 border-b border-gray-100 last:border-b-0 active:bg-gray-50">
      <div className="flex-1 min-w-0">
        <h3 className="text-[16px] sm:text-[17px] font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</h3>
        {item.summary && <p className={`mt-1 text-[14px] text-gray-600 leading-snug ${item.thumb ? 'line-clamp-1' : 'line-clamp-2'}`}>{item.summary}</p>}
        <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-gray-500 min-w-0">
          {showSub && <span className="shrink-0 text-[#03a94d] font-medium">{item.sub}</span>}
          {showSub && <span className="shrink-0 text-gray-300">·</span>}
          {item.ai && <Sparkles className="shrink-0 w-3 h-3 text-teal-600" />}
          <span className="truncate">{item.source}</span>
          <span className="shrink-0 text-gray-300">·</span>
          <span className="shrink-0">{boardDate(item.date, !!item.ai)}</span>
        </div>
      </div>
      {item.thumb && <img src={item.thumb} alt="" loading="lazy" className="shrink-0 w-[96px] h-[66px] sm:w-[120px] sm:h-[80px] object-cover rounded-md bg-gray-100" />}
    </button>
  );
}

// ───────── 첫 글 (큰 사진) ─────────
function Headline({ item, onOpen }: { item: BoardItem; onOpen: (item: BoardItem) => void }) {
  return (
    <button onClick={() => onOpen(item)} className="w-full text-left pt-1 pb-4 border-b border-gray-100 active:opacity-90">
      <img src={big(item.thumb)} alt="" className="w-full aspect-[16/9] object-cover rounded-lg bg-gray-100" />
      <div className="mt-2.5 text-[12.5px] text-[#03a94d] font-medium">{item.sub}</div>
      <h3 className="mt-0.5 text-[18px] sm:text-[20px] font-bold text-gray-900 leading-snug line-clamp-2">{item.title}</h3>
      {item.summary && <p className="mt-1 text-[14px] text-gray-600 leading-snug line-clamp-2">{item.summary}</p>}
    </button>
  );
}

// ───────── 밑줄 탭 (하위 분류) ─────────
function SubTabs({ subs, active, onPick }: { subs: string[]; active: string; onPick: (sub: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-on="1"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active]);
  return (
    <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide px-4 border-b border-gray-200 bg-white" style={{ scrollbarWidth: 'none' }}>
      {['전체', ...subs].map((sub) => (
        <button
          key={sub}
          data-on={sub === active ? '1' : '0'}
          onClick={() => onPick(sub)}
          className={`shrink-0 py-3 text-[15px] whitespace-nowrap border-b-2 -mb-px ${sub === active ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-500'}`}
        >
          {sub}
        </button>
      ))}
    </div>
  );
}

// ───────── 상세 본문 블록 ─────────
function Blocks({ blocks, onLink }: { blocks: GuideBlock[]; onLink: BoardLinkHandler }) {
  return (
    <div className="flex flex-col gap-3.5">
      {blocks.map((b, i) => {
        if ('h' in b) return <h2 key={i} className="mt-4 text-[18px] font-bold text-gray-900">{b.h}</h2>;
        if ('p' in b) return <p key={i} className="text-[16px] text-gray-800 leading-[1.8]">{b.p}</p>;
        if ('ul' in b)
          return (
            <ul key={i} className="flex flex-col gap-1.5 pl-1">
              {b.ul.map((t) => (
                <li key={t} className="flex gap-2 text-[16px] text-gray-800 leading-[1.7]">
                  <span className="mt-[11px] shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          );
        if ('ol' in b)
          return (
            <ol key={i} className="flex flex-col gap-2">
              {b.ol.map((t, n) => (
                <li key={t} className="flex gap-2.5 text-[16px] text-gray-800 leading-[1.7]">
                  <span className="mt-[3px] shrink-0 w-6 h-6 rounded-full bg-[#03a94d] text-white text-[13px] font-bold flex items-center justify-center">{n + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          );
        if ('tip' in b)
          return (
            <div key={i} className="flex gap-2 p-3.5 rounded-lg bg-[#eefaf3] text-[15px] text-gray-800 leading-relaxed">
              <Lightbulb className="shrink-0 w-4.5 h-4.5 mt-0.5 text-[#03a94d]" />
              <span>{b.tip}</span>
            </div>
          );
        if ('warn' in b)
          return (
            <div key={i} className="flex gap-2 p-3.5 rounded-lg bg-[#fff6e5] text-[15px] text-gray-800 leading-relaxed">
              <AlertTriangle className="shrink-0 w-4.5 h-4.5 mt-0.5 text-[#e8a300]" />
              <span>{b.warn}</span>
            </div>
          );
        return (
          <button key={i} onClick={() => onLink(b.link.page)} className="self-start flex items-center gap-1 px-3.5 py-2 rounded-full border border-[#03a94d] text-[#03a94d] text-[15px] font-medium hover:bg-[#eefaf3]">
            {b.link.label} <ChevronRight className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

// ───────── 상세 ─────────
function BoardDetail({
  item,
  items,
  onBack,
  onOpen,
  onLink,
  currentUser,
  isAdmin,
}: {
  item: BoardItem;
  items: BoardItem[];
  onBack: () => void;
  onOpen: (item: BoardItem) => void;
  onLink: BoardLinkHandler;
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
}) {
  const meta = BOARD_META[item.board];
  const related = useMemo(() => {
    const others = items.filter((i) => i.id !== item.id);
    return [...others.filter((i) => i.sub === item.sub), ...others.filter((i) => i.sub !== item.sub)].slice(0, 5);
  }, [items, item]);
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto h-12 px-2 flex items-center">
          <button onClick={onBack} className="flex items-center gap-1 px-2 py-2 text-[15px] text-gray-800">
            <ArrowLeft className="w-5 h-5" /> 목록
          </button>
          <span className="ml-1 text-[15px] font-semibold text-gray-900 whitespace-nowrap">{meta.title}</span>
          <span className="ml-1.5 text-[14px] text-gray-500 whitespace-nowrap">· {item.sub}</span>
        </div>
      </div>
      <article className="max-w-3xl mx-auto px-4 pt-5">
        <div className="text-[13px] text-[#03a94d] font-semibold">{item.sub}</div>
        <h1 className="mt-1 text-[22px] sm:text-[26px] font-bold text-gray-900 leading-snug">{item.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[13px] text-gray-500">
          {item.ai && (
            <span className="flex items-center gap-1 text-teal-700">
              <Sparkles className="w-3.5 h-3.5" /> AI 기사
            </span>
          )}
          {item.ai && <span className="text-gray-300">·</span>}
          <span>{item.source}</span>
          <span className="text-gray-300">·</span>
          <span>{item.ai ? boardDate(item.date) : `${boardDate(item.date, false)} 확인`}</span>
        </div>
        <div className="mt-4 border-t border-gray-100"></div>
        {item.thumb && <img src={big(item.thumb)} alt="" className="mt-4 w-full aspect-[16/9] object-cover rounded-lg bg-gray-100" />}
        {item.summary && <p className="mt-4 p-4 rounded-lg bg-gray-50 text-[16px] font-medium text-gray-800 leading-relaxed">{item.summary}</p>}
        <div className="mt-4">
          {item.body ? (
            <Blocks blocks={item.body} onLink={onLink} />
          ) : (
            <div className="text-[16px] text-gray-800 leading-[1.85] whitespace-pre-line">{item.content || item.summary}</div>
          )}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-[13px] text-gray-600">
                #{t}
              </span>
            ))}
          </div>
        )}
        <p className="mt-6 pt-4 border-t border-gray-100 text-[12.5px] text-gray-500 leading-relaxed">
          {item.ai
            ? `이 글은 AI가 ${item.source} 등 공식 자료를 바탕으로 한국어로 요약·재구성한 기사입니다.`
            : '절차·서류는 도시와 시기에 따라 다를 수 있어요. 신청 전에 담당 기관(출입경관리국·학교·차량관리소 등)의 최신 안내를 꼭 확인하세요.'}
        </p>

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[17px] font-bold text-gray-900 mb-1">{meta.title} 다른 글</h2>
            <div>
              {related.map((r) => (
                <BoardRow key={r.id} item={r} onOpen={onOpen} />
              ))}
            </div>
            <button onClick={onBack} className="mt-3 w-full py-3 rounded-lg border border-gray-200 text-[15px] text-gray-700">
              {item.sub} 목록 전체 보기
            </button>
          </section>
        )}
      </article>
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <CommentSection pageType={`board-${item.board}`} itemId={item.id} currentUser={currentUser} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

// ───────── 게시판 페이지 (목록 ↔ 상세) ─────────
export interface BoardTarget {
  sub?: string;
  nonce?: number;
}

// 게시판 주소 (Portal PAGE_PATH와 같음). 글은 "#주소/글id"
const BOARD_PATH: Record<BoardKey, string> = { visa: '/visa-documents', education: '/education', auto: '/auto', news: '/news' };

export function BoardPage({
  board,
  target,
  onBack,
  onLink,
  currentUser,
  isAdmin,
  top,
}: {
  board: BoardKey;
  target?: BoardTarget | null;
  onBack: () => void;
  onLink: BoardLinkHandler;
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
  top?: ReactNode; // 목록 위에 넣을 내용 (예: 자동차의 운전면허 바로가기)
}) {
  const meta = BOARD_META[board];
  const { items, subs } = useBoardItems(board);
  const base = BOARD_PATH[board];
  // 지금 열린 글은 주소에서 읽음 (#/visa-documents/글id) → 휴대폰 뒤로 가기·새로고침·공유가 됨
  const readId = () => {
    const h = window.location.hash.replace(/^#/, '');
    return h.startsWith(base + '/') ? decodeURIComponent(h.slice(base.length + 1)) : null;
  };
  const [sub, setSub] = useState(target?.sub ?? '전체');
  const [openId, setOpenId] = useState<string | null>(readId);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const listScroll = useRef(0);
  const depth = useRef(0); // 이 목록에서 연 글 수 (목록 버튼 = 그만큼 뒤로)

  useEffect(() => {
    const onHash = () => setOpenId(readId());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 홈의 "더보기"로 다시 들어오면 그 분류로
  useEffect(() => {
    if (target?.sub) setSub(target.sub);
  }, [target?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps
  // 글을 열면 맨 위로, 목록으로 돌아오면 보던 자리로 (브라우저 자동 스크롤 복원은 끔)
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);
  useEffect(() => {
    if (openId) window.scrollTo({ top: 0 });
    else requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: listScroll.current })));
  }, [openId]);

  const open = items.find((i) => i.id === openId) ?? null;
  const openItem = (item: BoardItem) => {
    if (!openId) listScroll.current = window.scrollY;
    depth.current += 1;
    window.location.hash = base + '/' + encodeURIComponent(item.id);
  };
  const backToList = () => {
    if (open && sub !== '전체' && open.sub !== sub) setSub(open.sub);
    if (depth.current > 0) {
      const n = depth.current;
      depth.current = 0;
      window.history.go(-n);
    } else {
      listScroll.current = 0;
      window.location.hash = base;
    }
  };
  const link: BoardLinkHandler = (to) => {
    const [b, id] = to.split(':');
    if (b === board && id) {
      const it = items.find((i) => i.id === id);
      if (it) return openItem(it);
    }
    onLink(to);
  };

  if (openId) {
    if (open) return <BoardDetail item={open} items={items} onBack={backToList} onOpen={openItem} onLink={link} currentUser={currentUser} isAdmin={isAdmin} />;
    // AI 기사가 아직 안 왔을 때 (홈에서 AI 기사를 눌러 들어온 경우)
    return <div className="min-h-screen bg-white pt-24 text-center text-gray-500">글을 불러오는 중...</div>;
  }

  const term = q.trim().toLowerCase();
  const shown = items.filter(
    (i) => (sub === '전체' || i.sub === sub) && (!term || [i.title, i.summary, ...(i.tags ?? [])].some((t) => t?.toLowerCase().includes(term))),
  );
  const head = !term && shown[0]?.thumb ? shown[0] : null;
  const rest = head ? shown.slice(1) : shown;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-20 bg-white">
        <div className="max-w-3xl mx-auto h-[52px] px-2 flex items-center gap-1">
          <button onClick={onBack} aria-label="홈으로" className="p-2 text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 min-w-0 text-[19px] font-bold text-gray-900 whitespace-nowrap truncate">{meta.title}</h1>
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="검색" className="p-2 text-gray-700">
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        {searchOpen && (
          <div className="max-w-3xl mx-auto px-4 pb-2.5">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`${meta.title} 글 검색`}
              className="w-full h-10 px-3.5 rounded-full bg-gray-100 text-[15px] outline-none focus:ring-2 focus:ring-[#03a94d]/40"
            />
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <SubTabs subs={subs} active={sub} onPick={setSub} />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        {top}
        <p className="pt-3 text-[13px] text-gray-500">{sub === '전체' ? meta.desc : `${meta.title} · ${sub}`} · {shown.length}개</p>
        {head && <Headline item={head} onOpen={openItem} />}
        <div>
          {rest.map((item) => (
            <BoardRow key={item.id} item={item} onOpen={openItem} showSub={sub === '전체'} />
          ))}
        </div>
        {shown.length === 0 && (
          <p className="py-16 text-center text-[15px] text-gray-500">
            {term ? '검색 결과가 없어요.' : board === 'news' || sub === meta.aiSub ? '소식을 불러오는 중이거나 아직 없어요.' : '아직 글이 없어요.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ───────── 홈 섹션 (메뉴 탭 안의 짧은 목록) ─────────
export function BoardSection({
  board,
  onOpen,
  onMore,
  count = 4,
  extra,
  top,
  footer,
}: {
  board: BoardKey;
  onOpen?: (item: BoardItem) => void;
  onMore?: (sub?: string) => void;
  count?: number;
  extra?: ReactNode; // 탭 줄 오른쪽 끝
  top?: ReactNode; // 제목 바로 아래, 탭보다 먼저 (예: 자동차의 운전면허 연습)
  footer?: ReactNode;
}) {
  const meta = BOARD_META[board];
  const { items, subs } = useBoardItems(board);
  const [sub, setSub] = useState('전체');
  const shown = items.filter((i) => sub === '전체' || i.sub === sub).slice(0, count);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">{meta.title}</h2>
        <button onClick={() => onMore?.(sub === '전체' ? undefined : sub)} className="flex items-center text-[13px] text-gray-500">
          전체보기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {top && <div className="px-4 pt-3">{top}</div>}
      <div className="mt-1 flex gap-4 overflow-x-auto px-4 border-b border-gray-100" style={{ scrollbarWidth: 'none' }}>
        {['전체', ...subs].map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={`shrink-0 py-2.5 text-[14px] whitespace-nowrap border-b-2 -mb-px ${s === sub ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-500'}`}
          >
            {s}
          </button>
        ))}
        {extra}
      </div>
      <div className="px-4">
        {shown.map((item) => (
          <BoardRow key={item.id} item={item} onOpen={(it) => onOpen?.(it)} showSub={sub === '전체'} />
        ))}
        {shown.length === 0 && <p className="py-8 text-center text-[14px] text-gray-500">소식을 불러오는 중이거나 아직 없어요.</p>}
      </div>
      <button onClick={() => onMore?.(sub === '전체' ? undefined : sub)} className="w-full py-3 border-t border-gray-100 text-[14px] text-gray-600">
        {sub === '전체' ? meta.title : sub} 더보기 <ChevronRight className="inline w-4 h-4 -mt-0.5" />
      </button>
      {footer && <div className="px-4 pb-3">{footer}</div>}
    </div>
  );
}
