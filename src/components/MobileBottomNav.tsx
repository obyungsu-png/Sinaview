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
      <div className="h-[68px] lg:hidden" aria-hidden />
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-stretch max-w-lg mx-auto h-[62px]">
          {TABS.map(t => {
            const on = active === t.id;
            // 게시판은 상단 메뉴처럼 보라색 (선택된 탭은 초록 + 아이콘 뒤 동그란 배경으로 확실히 구분)
            const tone = on ? 'text-teal-700' : t.id === 'board' ? 'text-purple-600' : 'text-gray-600';
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                aria-current={on ? 'page' : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-50"
              >
                <span className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${on ? 'bg-teal-50' : ''}`}>
                  <t.Icon className={`w-[23px] h-[23px] ${tone}`} strokeWidth={on ? 2.3 : 1.9} />
                </span>
                <span className={`text-[12.5px] leading-none ${tone} ${on ? 'font-bold' : 'font-medium'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
