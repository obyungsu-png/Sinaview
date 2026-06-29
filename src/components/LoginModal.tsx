import { useState, useEffect } from 'react';
import { X, Smartphone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  initialTab?: 'password' | 'signup' | 'wechat';
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, initialTab = 'password' }: LoginModalProps) {
  const [loginMethod, setLoginMethod] = useState<'password' | 'signup' | 'wechat'>(initialTab);
  const [signupVerification, setSignupVerification] = useState<'phone' | 'wechat'>('phone'); // 회원가입 인증 방식
  const [captchaCode, setCaptchaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countryCode, setCountryCode] = useState('+86');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captcha: '',
    phone: '',
    verificationCode: '',
    region: '대련',
    name: '',
    email: ''
  });
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);

  // 중국 주요 도시 목록
  const regions = [
    { id: 1, name: '대련' },
    { id: 2, name: '베이징' },
    { id: 3, name: '상하이' },
    { id: 4, name: '선양' },
    { id: 5, name: '칭다오' },
    { id: 6, name: '옌타이' },
    { id: 7, name: '웨이하이' },
    { id: 8, name: '광저우' },
    { id: 9, name: '심천' },
    { id: 10, name: '우한' },
    { id: 11, name: '톈진' },
    { id: 12, name: '청두' }
  ];

  // 캡챠 생성 함수
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
      captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaCode(captcha);
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      // 모달이 열릴 때 폼 초기화
      setFormData({
        username: '',
        password: '',
        captcha: '',
        phone: '',
        verificationCode: '',
        region: '대련',
        name: '',
        email: ''
      });
      setLoginMethod(initialTab);
    }
  }, [isOpen, initialTab]);

  // 인증 코드 전송
  const handleSendCode = () => {
    if (!formData.phone) {
      toast.error('전화번호를 입력해주세요.');
      return;
    }
    
    let count = 60;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    toast.success(`인증 코드가 ${countryCode}${formData.phone}로 전송되었습니다!`);
  };

  // 비밀번호 로그인
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      toast.error('인증 코드가 올바르지 않습니다.');
      generateCaptcha();
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = registeredUsers.find((u: any) => 
        u.username === formData.username && u.password === formData.password
      );
      
      setIsSubmitting(false);
      
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success('로그인 성공!');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose();
      } else {
        // 귀여운 에러 메시지
        const registeredUser = registeredUsers.find((u: any) => u.username === formData.username);
        if (!registeredUser) {
          toast.error('🐰 이런! 등록되지 않은 회원이에요. 먼저 회원가입을 해주세요~ 💕', {
            duration: 4000
          });
        } else {
          toast.error('🔐 비밀번호가 틀렸어요! 다시 확인해주세요~', {
            duration: 3000
          });
        }
        generateCaptcha();
      }
    }, 1000);
  };

  // 휴대폰 로그인
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const fullPhone = countryCode + formData.phone;
      const user = registeredUsers.find((u: any) => u.phone === fullPhone);
      
      setIsSubmitting(false);
      
      if (!user) {
        // 등록되지 않은 전화번호
        toast.error('🐰 이런! 등록되지 않은 전화번호예요. 먼저 회원가입을 해주세요~ 💕', {
          duration: 4000
        });
        return;
      }
      
      if (user && formData.verificationCode === '123456') {
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success('로그인 성공!');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose();
      } else {
        toast.error('🔑 인증 코드가 올바르지 않아요! 다시 확인해주세요~', {
          duration: 3000
        });
      }
    }, 1000);
  };

  // 웨이신 로그인
  const handleWeChatLogin = () => {
    setIsSubmitting(true);
    
    // 웨이신 로그인 시뮬레이션
    setTimeout(() => {
      const wechatUser = {
        username: 'wechat_user_' + Date.now(),
        phone: '+86' + Math.floor(Math.random() * 1000000000),
        region: '대련',
        loginMethod: 'wechat',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(wechatUser));
      setIsSubmitting(false);
      toast.success('웨이신 로그인 성공!');
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      onClose();
    }, 2000);
  };

  // 회원가입
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = registeredUsers.find((u: any) => u.username === formData.username);
      
      setIsSubmitting(false);
      
      if (user) {
        toast.error('이미 존재하는 아이디입니다.');
      } else {
        const newUser = {
          username: formData.username,
          password: formData.password,
          region: formData.region,
          loginMethod: 'password',
          createdAt: new Date().toISOString()
        };
        
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        toast.success('회원가입 성공! 환영합니다!');
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose();
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (loginMethod === 'password') {
      handlePasswordLogin(e);
    } else if (loginMethod === 'signup') {
      handleSignup(e);
    } else if (loginMethod === 'phone') {
      handlePhoneLogin(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalFadeIn 0.3s ease-out' }}
      >
        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 제목 */}
        <h2 className="text-center text-2xl text-gray-800 mb-5 font-bold">
          {loginMethod === 'signup' ? '회원 가입' : '로그인'}
        </h2>

        {loginMethod === 'signup' ? (
          /* 회원가입 폼 */
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="아이디"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
            />
            <input
              type="password"
              placeholder="비밀번호 (6자리 이상)"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
            />
            <input
              type="text"
              placeholder="인증코드"
              value={formData.verificationCode || ''}
              onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
            />
            <div className="relative">
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-gray-400 transition-colors text-sm appearance-none"
              >
                {regions.map(region => (
                  <option key={region.id} value={region.name}>{region.name}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium cursor-pointer hover:bg-teal-700 transition-colors disabled:opacity-60 mt-2 text-sm"
            >
              {isSubmitting ? '확인 중...' : '회원가입'}
            </button>
            <div className="text-center text-xs text-gray-500 mt-2">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className="text-teal-600 hover:underline font-medium"
              >
                로그인
              </button>
            </div>
          </form>
        ) : (
          /* 로그인 폼 - 간결 */
          <form onSubmit={handlePasswordLogin} className="space-y-3">
            <input
              type="text"
              placeholder="아이디"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
            />
            <input
              type="password"
              placeholder="비밀번호"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium cursor-pointer hover:bg-teal-700 transition-colors disabled:opacity-60 text-sm"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => toast.info('비밀번호 찾기 기능 준비 중입니다!')}
                className="text-gray-400 hover:text-gray-600"
              >
                비밀번호 찾기
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('signup'); }}
                className="text-teal-600 hover:underline font-medium"
              >
                회원가입
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}