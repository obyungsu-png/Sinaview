import { useState } from 'react';
import { Eye, EyeOff, FileText, Stethoscope, Building2, CalendarDays, Mail, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LoginSectionProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  currentUser?: { id?: string; name?: string; username?: string; region?: string } | null;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function LoginSection({ onLoginClick, onSignupClick, currentUser, onLogout, onNavigate }: LoginSectionProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveId, setSaveId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = registeredUsers.find((u: any) =>
        u.username === username && u.password === password
      );
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

  // 로그인된 상태
  if (currentUser) {
    const menuItems = [
      { icon: <FileText className="w-7 h-7" strokeWidth={1.5} />, label: '내 게시글', page: 'chinalife' },
      { icon: <Stethoscope className="w-7 h-7" strokeWidth={1.5} />, label: '병원 상담', page: 'chinalife' },
      { icon: <Building2 className="w-7 h-7" strokeWidth={1.5} />, label: '부동산', page: 'realestate' },
      { icon: <CalendarDays className="w-7 h-7" strokeWidth={1.5} />, label: '나의 일정', page: 'chinalife' },
      { icon: <Mail className="w-7 h-7" strokeWidth={1.5} />, label: '쪽지함', page: 'chinalife' },
      { icon: <Settings className="w-7 h-7" strokeWidth={1.5} />, label: '설정', page: 'chinalife' },
    ];

    const activeIdx = 4; // 쪽지함을 활성으로 강조

    // 사용자 등급 (region 기반으로 임시 결정)
    const userBadge = currentUser.region ? '현지' : '주재원';

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 프로필 */}
        <button
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          onClick={() => onNavigate?.('chinalife')}
        >
          <div className="flex items-center gap-3">
            {/* 사각형 뱃지 */}
            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-xs font-semibold tracking-tighter px-1">
              {userBadge}
            </div>
            <p className="text-base font-semibold text-gray-900">
              {currentUser.name || currentUser.username || '사용자'}
            </p>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>

        {/* 메뉴 그리드 */}
        <div className="bg-gray-50 grid grid-cols-3 px-2 pt-2 pb-2">
          {menuItems.map((item, i) => {
            const isActive = i === activeIdx;
            // 세로 구분선: 마지막 열이 아닌 경우
            const showRightBorder = (i % 3) !== 2;
            return (
              <button
                key={i}
                className="flex flex-col items-center justify-center py-4 gap-1.5 relative hover:bg-white/70 rounded-lg transition-colors"
                onClick={() => onNavigate?.(item.page)}
              >
                <span className={isActive ? 'text-teal-500' : 'text-gray-700'}>
                  {item.icon}
                </span>
                <span className={`text-xs ${isActive ? 'text-teal-500 font-medium' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {showRightBorder && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-px bg-gray-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 비로그인 상태
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <form onSubmit={handleLogin} className="space-y-2.5">
        {/* 아이디 */}
        <input
          type="text"
          placeholder="아이디 입력"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
        />

        {/* 비밀번호 */}
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

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
        >
          {isSubmitting ? '로그인 중...' : '로그인하기'}
        </button>

        {/* 아이디 저장 + 링크 */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={saveId}
              onChange={e => setSaveId(e.target.checked)}
              className="w-3.5 h-3.5 accent-teal-600"
            />
            아이디 저장
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onLoginClick} className="hover:text-gray-700">아이디 찾기</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={onLoginClick} className="hover:text-gray-700">비밀번호 찾기</button>
            <span className="text-gray-300">|</span>
            <button type="button" onClick={onSignupClick} className="hover:text-gray-700">회원가입</button>
          </div>
        </div>
      </form>

      {/* SNS 로그인 */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <p className="text-xs text-center text-gray-400 mb-3">SNS 계정으로 간편하게 로그인하세요!</p>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={onLoginClick}
        >
          <span className="w-6 h-6 bg-[#03C75A] rounded-full flex items-center justify-center text-white text-xs font-black">N</span>
          <span className="text-sm text-gray-700">네이버 간편로그인</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={onLoginClick}
        >
          <span className="w-6 h-6 bg-[#FEE500] rounded-full flex items-center justify-center text-[#3C1E1E] text-xs font-black">K</span>
          <span className="text-sm text-gray-700">카카오 간편로그인</span>
        </button>
      </div>
    </div>
  );
}
