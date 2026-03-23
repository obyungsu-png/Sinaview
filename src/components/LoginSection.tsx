import { MessageCircle, Info, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

interface LoginSectionProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function LoginSection({ onLoginClick, onSignupClick }: LoginSectionProps) {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onLoginClick}
    >
      {/* Information text */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">안전하고 편안하게 이용해 주세요.</p>
        <Info className="w-5 h-5 text-gray-400" />
      </div>
      
      {/* WeChat Login Button */}
      <Button 
        className="w-full text-white py-4 rounded-2xl text-base font-medium flex items-center justify-center space-x-2 transition-all duration-200"
        style={{ backgroundColor: '#07c160' }}
        onClick={(e) => {
          e.stopPropagation();
          onLoginClick?.();
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#06a850'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#07c160'}
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span>로그인</span>
      </Button>
      
      {/* Phone Login Button */}
      <Button 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl text-base font-medium flex items-center justify-center space-x-2 transition-all duration-200 mt-3"
        onClick={(e) => {
          e.stopPropagation();
          onSignupClick?.();
        }}
      >
        <Smartphone className="w-5 h-5" />
        <span>회원 가입</span>
      </Button>
    </div>
  );
}