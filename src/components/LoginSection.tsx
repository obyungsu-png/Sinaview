import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
      { icon: '📋', label: '내 게시글', page: 'chinalife' },
      { icon: '🏥', label: '병원 상담', page: 'chinalife' },
      { icon: '🏠', label: '부동산', page: 'realestate' },
      { icon: '📅', label: '나의 일정', page: 'chinalife' },
      { icon: '💬', label: '쪽지함', page: 'chinalife' },
      { icon: '⚙️', label: '설정', page: 'chinalife' },
    ];

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 프로필 */}
        <button
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          onClick={() => onNavigate?.('chinalife')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {(currentUser.name || currentUser.username || '사용자').charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.name || currentUser.username || '사용자'}
              </p>
              {currentUser.region && (
                <p className="text-xs text-gray-400">{currentUser.region}</p>
              )}
            </div>
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </button>

        {/* 구분선 */}
        <div className="border-t border-gray-100" />

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-3 divide-x divide-y divide-gray-100">
          {menuItems.map((item, i) => (
            <button
              key={i}
              className="flex flex-col items-center justify-center py-4 hover:bg-gray-50 transition-colors gap-1.5"
              onClick={() => onNavigate?.(item.page)}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-gray-600">{item.label}</span>
            </button>
          ))}
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
