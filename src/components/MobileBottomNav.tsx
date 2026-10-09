import { Home, MessageCircle, Grid3X3, User } from 'lucide-react';

/*
 * 모바일 하단 바 (모든 화면 공통, 데스크탑에서는 숨김)
 * 홈 · 게시판 · 서비스 · 내정보
 */
export type MobileNavTab = 'home' | 'board' | 'service' | 'my';

interface MobileBottomNavProps {
  active: MobileNavTab | null;
  onSelect: (tab: MobileNavTab) => void;
}

const TABS: { id: MobileNavTab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'board', label: '게시판', Icon: MessageCircle },
  { id: 'service', label: '서비스', Icon: Grid3X3 },
  { id: 'my', label: '내정보', Icon: User },
];

export function MobileBottomNav({ active, onSelect }: MobileBottomNavProps) {
  return (
    <>
      {/* 바에 가려지지 않도록 화면 맨 아래 여백 */}
      <div className="h-16 lg:hidden" aria-hidden />
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -1px 10px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-stretch max-w-lg mx-auto h-14">
          {TABS.map(t => {
            const on = active === t.id;
            // 게시판은 상단 메뉴처럼 보라색으로 강조
            const color = on ? 'text-teal-600' : t.id === 'board' ? 'text-purple-600' : 'text-gray-500';
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                aria-current={on ? 'page' : undefined}
                className="relative flex-1 flex flex-col items-center justify-center gap-0.5"
              >
                <t.Icon className={`w-5 h-5 ${on ? 'text-teal-600' : t.id === 'board' ? 'text-purple-500' : 'text-gray-400'}`} strokeWidth={on ? 2.2 : 1.7} />
                <span className={`text-[10.5px] ${color} ${on || t.id === 'board' ? 'font-semibold' : ''}`}>{t.label}</span>
                {on && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-teal-500" />}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
