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
      <div className="h-[60px] lg:hidden" aria-hidden />
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch max-w-lg mx-auto h-[56px]">
          {TABS.map(t => {
            const on = active === t.id;
            // 네이버 모바일처럼: 색 없이 회색, 지금 화면만 검정 굵게
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                aria-current={on ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-1"
              >
                <t.Icon className={`w-[22px] h-[22px] ${on ? 'text-gray-900' : 'text-gray-500'}`} strokeWidth={on ? 2.4 : 1.7} />
                <span className={`text-[12px] leading-none ${on ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
