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

  const rotation = Math.floor(Math.random() * 20) - 10;
  const captchaColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'modalFadeIn 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
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

        {/* 로그인 방법 선택 - 회원가입일 때는 숨김 */}
        {loginMethod !== 'signup' && (
          <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className="flex-1 py-2 rounded-md transition-all text-sm"
              style={{
                backgroundColor: loginMethod === 'password' ? 'white' : 'transparent',
                color: loginMethod === 'password' ? '#1F2937' : '#6B7280',
                fontWeight: loginMethod === 'password' ? '600' : 'normal',
                boxShadow: loginMethod === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              비밀번호
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('wechat')}
              className="flex-1 py-2 rounded-md transition-all text-sm"
              style={{
                backgroundColor: loginMethod === 'wechat' ? 'white' : 'transparent',
                color: loginMethod === 'wechat' ? '#1F2937' : '#6B7280',
                fontWeight: loginMethod === 'wechat' ? '600' : 'normal',
                boxShadow: loginMethod === 'wechat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              웨이신
            </button>
          </div>
        )}

        {loginMethod === 'wechat' ? (
          /* 웨이신 로그인 */
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 mx-auto mb-3" style={{ color: '#07c160' }} />
                <p className="text-sm text-gray-600">QR 코드 스캔</p>
                <p className="text-xs text-gray-400 mt-1">웨이신으로 스캔하세요</p>
              </div>
            </div>
            
            <button
              onClick={handleWeChatLogin}
              disabled={isSubmitting}
              className="w-full py-3 text-white rounded-lg font-bold cursor-pointer hover:shadow-lg transition-all disabled:opacity-70"
              style={{
                backgroundColor: '#07c160'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#06a850')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#07c160')}
            >
              {isSubmitting ? '로그인 중...' : '웨이신으로 로그인'}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              실제 환경에서는 웨이신 QR 코드가 표시됩니다
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {loginMethod === 'password' ? (
              <>
                {/* 사용자명 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="아이디"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2.5 pl-11 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    👤
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="relative">
                  <input
                    type="password"
                    placeholder="비밀번호"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 pl-11 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    🔒
                  </div>
                </div>

                {/* 캡챠 */}
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10">
                    🛡️
                  </div>
                  <input
                    type="text"
                    placeholder="인증 코드"
                    required
                    value={formData.captcha}
                    onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                    className="flex-1 px-4 py-2.5 pl-11 bg-transparent focus:outline-none text-gray-800 placeholder:text-gray-400"
                  />
                  <div
                    onClick={generateCaptcha}
                    className="w-24 bg-gray-100 flex items-center justify-center font-mono font-bold text-lg tracking-wider cursor-pointer border-l border-gray-300 select-none hover:bg-gray-200 transition-colors"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
                      transform: `rotate(${rotation}deg)`,
                      color: captchaColor
                    }}
                    title="클릭하여 새로고침"
                  >
                    {captchaCode}
                  </div>
                </div>
              </>
            ) : loginMethod === 'signup' ? (
              <>
                {/* 회원가입 폼 — 로그인 폼과 동일한 스타일 */}

                {/* 아이디 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="아이디"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                  />
                </div>

                {/* 비밀번호 */}
                <div className="relative">
                  <input
                    type="password"
                    placeholder="비밀번호 (6자리 이상)"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                  />
                </div>

                {/* 지역 선택 */}
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
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsSubmitting(true);
                            setTimeout(() => {
                              const wechatUser = {
              </>
            ) : (
              <>
                {/* 전화번호 */}
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-700 font-semibold focus:outline-none z-10 cursor-pointer text-sm"
                    style={{ width: '75px' }}
                  >
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="전화번호"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 pl-24 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-[78px] top-1/2 -translate-y-1/2 text-gray-300">
                    |
                  </div>
                </div>

                {/* 인증 코드 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="인증 코드 (123456)"
                    required
                    value={formData.verificationCode}
                    onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                    className="w-full px-4 py-2.5 pl-11 pr-20 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    🛡️
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-2.5 py-1 rounded text-xs cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `${countdown}초` : '코드전송'}
                  </button>
                </div>
              </>
            )}

            {/* 로그인/회원가입 버튼 */}
            {!(loginMethod === 'signup' && signupVerification === 'wechat') && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium cursor-pointer hover:bg-teal-700 transition-colors disabled:opacity-60 mt-2 text-sm"
              >
                {isSubmitting ? '확인 중...' : loginMethod === 'signup' ? '회원가입' : '로그인'}
              </button>
            )}

            {/* 원가입일 때는 소셜 로그인 옵션 숨김 */}
            {loginMethod !== 'signup' && (
              <>
                {/* 구분선 */}
                <div className="flex items-center text-center my-4">
                  <div className="flex-1 border-b border-gray-300 mr-3"></div>
                  <span className="text-gray-500 text-xs">다른 로그인 방법</span>
                  <div className="flex-1 border-b border-gray-300 ml-3"></div>
                </div>

                {/* 소셜 로그인 아이콘 */}
                <div className="flex justify-center gap-6 mb-4">
                  <button
                    type="button"
                    className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-110 hover:shadow-lg hover:bg-blue-700"
                    title="휴대폰으로 로그인"
                    onClick={() => setLoginMethod('phone')}
                  >
                    <Smartphone className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="w-12 h-12 rounded-full text-white flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-110 hover:shadow-lg"
                    style={{ backgroundColor: '#07c160' }}
                    title="웨이신으로 로그인"
                    onClick={() => setLoginMethod('wechat')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#06a850'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#07c160'}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* 하단 링크 */}
                <div className="flex justify-between text-xs px-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('비밀번호 찾기 기능 준비 중입니다!');
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    비밀번호 찾기
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setLoginMethod('signup');
                      setSignupVerification('phone');
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    회원가입
                  </a>
                </div>
              </>
            )}

            {/* 회원가입일 때 로그인 링크 표시 */}
            {loginMethod === 'signup' && (
              <div className="mt-3 text-center text-xs text-gray-500">
                이미 계정이 있으신가요?{' '}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setLoginMethod('password'); }}
                  className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
                >
                  로그인
                </a>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}