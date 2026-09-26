import { useState, useEffect } from 'react';
import { X, Smartphone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { signIn, signUp } from '../utils/auth';

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

  // 비밀번호 로그인 (Supabase Auth)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(formData.username, formData.password);
      toast.success('로그인 성공!');
      onLoginSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || '🔐 아이디 또는 비밀번호가 올바르지 않아요.', { duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 회원가입 (Supabase Auth)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(formData.username)) {
      toast.error('아이디는 영문·숫자·밑줄(_) 4~20자로 만들어 주세요.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(formData.username, formData.password, formData.region);
      toast.success('회원가입 성공! 환영합니다!');
      onLoginSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (loginMethod === 'password') {
      handlePasswordLogin(e);
    } else if (loginMethod === 'signup') {
      handleSignup(e);
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
              placeholder="아이디 (영문·숫자 4~20자)"
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