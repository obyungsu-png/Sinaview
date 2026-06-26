import { useState } from 'react';
import { Eye, EyeOff, FileText, GraduationCap, Building2, CalendarDays, Mail, Settings, TrendingUp, ShoppingBag, Car, BookOpen, MessageCircle, Home, Plane, Stethoscope, X, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LoginSectionProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  currentUser?: { id?: string; name?: string; username?: string; region?: string } | null;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

// 전체 선택 가능한 탭 목록
const ALL_TABS = [
  { id: 'doc',       label: '서류 상담',   icon: <FileText className="w-7 h-7" strokeWidth={1.5} />,      page: 'chinalife' },
  { id: 'edu',       label: '교육 상담',   icon: <GraduationCap className="w-7 h-7" strokeWidth={1.5} />, page: 'chinalife' },
  { id: 'realestate',label: '부동산 상담', icon: <Building2 className="w-7 h-7" strokeWidth={1.5} />,     page: 'realestate' },
  { id: 'travel',    label: '여행 상담',   icon: <Plane className="w-7 h-7" strokeWidth={1.5} />,         page: 'chinalife' },
  { id: 'stock',     label: '증권 상담',   icon: <TrendingUp className="w-7 h-7" strokeWidth={1.5} />,    page: 'chinalife' },
  { id: 'market',    label: '장터 상담',   icon: <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />,   page: 'usedmarket' },
  { id: 'car',       label: '자동차 상담', icon: <Car className="w-7 h-7" strokeWidth={1.5} />,           page: 'auto' },
  { id: 'yellow',    label: '업소록 상담', icon: <BookOpen className="w-7 h-7" strokeWidth={1.5} />,      page: 'yellowpages' },
  { id: 'medical',   label: '병원 상담',   icon: <Stethoscope className="w-7 h-7" strokeWidth={1.5} />,   page: 'chinalife' },
  { id: 'community', label: '커뮤니티',    icon: <MessageCircle className="w-7 h-7" strokeWidth={1.5} />, page: 'chinalife' },
];

const DEFAULT_SELECTED = ['doc', 'edu', 'realestate', 'travel', 'stock'];

export function LoginSection({ onLoginClick, onSignupClick, currentUser, onLogout, onNavigate }: LoginSectionProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [selectedTabs, setSelectedTabs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dashboard_tabs');
      return saved ? JSON.parse(saved) : DEFAULT_SELECTED;
    } catch { return DEFAULT_SELECTED; }
  });
  const [tempSelected, setTempSelected] = useState<string[]>(selectedTabs);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { toast.error('아이디와 비밀번호를 입력해주세요.'); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = registeredUsers.find((u: any) => u.username === username && u.password === password);
      setIsSubmitting(false);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success('로그인 성공!');
        window.location.reload();
      } else {
        toast.error('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    }, 800);
  };

  const handleTabToggle = (id: string) => {
    setTempSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(t => t !== id);
      } else {
        if (prev.length >= 5) {
          toast.error('최대 5개까지 선택할 수 있어요.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSettingsSave = () => {
    if (tempSelected.length === 0) { toast.error('최소 1개 이상 선택해주세요.'); return; }
    setSelectedTabs(tempSelected);
    localStorage.setItem('dashboard_tabs', JSON.stringify(tempSelected));
    setShowSettings(false);
    toast.success('저장됐어요!');
  };

  // 로그인된 상태
  if (currentUser) {
    const userBadge = currentUser.region ? '현지' : '주재원';
    const visibleTabs = ALL_TABS.filter(t => selectedTabs.includes(t.id));

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 프로필 */}
        <button
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          onClick={() => onNavigate?.('chinalife')}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-xs font-semibold tracking-tighter px-1">
              {userBadge}
            </div>
            <p className="text-base font-semibold text-gray-900">
              {currentUser.name || currentUser.username || '사용자'}
            </p>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>

        {/* 메뉴 그리드 — 5개 탭 + 설정 */}
        <div className="bg-gray-50 grid grid-cols-3 px-2 pt-2 pb-2">
          {visibleTabs.slice(0, 5).map((item, i) => {
            const showRightBorder = (i % 3) !== 2;
            return (
              <button
                key={item.id}
                className="flex flex-col items-center justify-center py-4 gap-1.5 relative hover:bg-white/70 rounded-lg transition-colors"
                onClick={() => onNavigate?.(item.page)}
              >
                <span className="text-gray-700">{item.icon}</span>
                <span className="text-xs text-gray-600">{item.label}</span>
                {showRightBorder && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-200" />
                )}
              </button>
            );
          })}

          {/* 설정 버튼 — 항상 6번째 */}
          <button
            className="flex flex-col items-center justify-center py-4 gap-1.5 relative hover:bg-white/70 rounded-lg transition-colors"
            onClick={() => { setTempSelected(selectedTabs); setShowSettings(true); }}
          >
            <span className="text-gray-700">
              <Settings className="w-7 h-7" strokeWidth={1.5} />
            </span>
            <span className="text-xs text-gray-600">설정</span>
          </button>
        </div>

        {/* 로그아웃 */}
        <div className="px-4 py-2.5 border-t border-gray-100">
          <button onClick={onLogout} className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors text-right">
            로그아웃
          </button>
        </div>

        {/* 설정 패널 (오버레이) */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">바로가기 설정</p>
                  <p className="text-xs text-gray-400 mt-0.5">최대 5개 선택 · 현재 {tempSelected.length}개</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 탭 선택 그리드 */}
              <div className="grid grid-cols-3 gap-2 p-4">
                {ALL_TABS.map(tab => {
                  const isSelected = tempSelected.includes(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabToggle(tab.id)}
                      className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </span>
                      )}
                      <span className={isSelected ? 'text-teal-600' : 'text-gray-600'}>
                        {tab.icon}
                      </span>
                      <span className={`text-[10px] mt-1.5 text-center leading-tight ${isSelected ? 'text-teal-700 font-medium' : 'text-gray-600'}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 저장 버튼 */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleSettingsSave}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  저장 ({tempSelected.length}/5)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 비로그인 상태
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <form onSubmit={handleLogin} className="space-y-2.5">
        <input
          type="text"
          placeholder="아이디 입력"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          {isSubmitting ? '로그인 중...' : '로그인하기'}
        </button>
        <div className="text-center text-xs text-gray-500 pt-1">
          아직 회원이 아니신가요?{' '}
          <button type="button" onClick={onSignupClick} className="text-teal-600 hover:text-teal-700 font-medium hover:underline">
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
}
