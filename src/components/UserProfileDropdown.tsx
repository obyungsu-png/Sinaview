import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react@0.487.0';

interface UserProfileDropdownProps {
  currentUser: { id: string; name: string; username?: string; email?: string; region?: string } | null;
  onLogout?: () => void;
  onLoginClick?: () => void;
}

export function UserProfileDropdown({ currentUser, onLogout, onLoginClick }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
    window.location.reload();
  };

  // 로그인하지 않은 경우 로그인 버튼 표시
  if (!currentUser) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <User className="w-4 h-4 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <User className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">@{currentUser.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                {currentUser.username?.[0].toUpperCase() || currentUser.name[0]}
              </div>
              <div>
                <div className="font-semibold text-lg">{currentUser.name}</div>
                <div className="text-sm opacity-90">@{currentUser.username}</div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="text-gray-500 text-sm font-medium min-w-[60px]">아이디</div>
              <div className="text-gray-900 text-sm">@{currentUser.username}</div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="text-gray-500 text-sm font-medium min-w-[60px]">이름</div>
              <div className="text-gray-900 text-sm">{currentUser.name}</div>
            </div>

            {currentUser.email && (
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="text-gray-500 text-sm font-medium min-w-[60px]">이메일</div>
                <div className="text-gray-900 text-sm break-all">{currentUser.email}</div>
              </div>
            )}

            {currentUser.region && (
              <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="text-gray-500 text-sm font-medium min-w-[60px]">지역</div>
                <div className="text-gray-900 text-sm">{currentUser.region}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}