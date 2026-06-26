import { useState, useEffect, lazy, Suspense } from 'react';
import { Cloud, Sun, CloudRain, Eye, FileText, GraduationCap, Building2, Car, BookOpen, ShoppingBag, TrendingUp, MessageCircle, Stethoscope, Plane, Settings, X, Check, EyeOff, ChevronRight, Newspaper, MapPin, Flame } from 'lucide-react';

const VisaDocumentSection = lazy(() => import('./VisaDocumentSection').then(m => ({ default: m.VisaDocumentSection })));
const EducationSection = lazy(() => import('./EducationSection').then(m => ({ default: m.EducationSection })));
const YellowPagesSection = lazy(() => import('./YellowPagesSection').then(m => ({ default: m.YellowPagesSection })));
const AutoSection = lazy(() => import('./AutoSection').then(m => ({ default: m.AutoSection })));
const NewsSection = lazy(() => import('./NewsSection').then(m => ({ default: m.NewsSection })));
const UsedMarketSection = lazy(() => import('./UsedMarketSection').then(m => ({ default: m.UsedMarketSection })));
const SecuritiesSection = lazy(() => import('./SecuritiesSection').then(m => ({ default: m.SecuritiesSection })));
const RealEstateSection = lazy(() => import('./RealEstateSection').then(m => ({ default: m.RealEstateSection })));
const ChinaAutoAdWidget = lazy(() => import('./ChinaAutoAdWidget').then(m => ({ default: m.ChinaAutoAdWidget })));
const ChinaSecuritiesAdWidget = lazy(() => import('./ChinaSecuritiesAdWidget').then(m => ({ default: m.ChinaSecuritiesAdWidget })));

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── 날씨 데이터 ──────────────────────────────────────────
const CITIES = [
  { name: '베이징', sub: '맑음', temp: 18, high: 21, low: 12, Icon: Sun, color: 'text-amber-400', dust: '미세 좋음' },
  { name: '상하이', sub: '비', temp: 16, high: 19, low: 13, Icon: CloudRain, color: 'text-slate-400', dust: '미세 나쁨' },
  { name: '광저우', sub: '흐림', temp: 25, high: 28, low: 22, Icon: Cloud, color: 'text-gray-400', dust: '미세 보통' },
  { name: '선전', sub: '구름조금', temp: 27, high: 30, low: 24, Icon: Sun, color: 'text-amber-400', dust: '미세 좋음' },
  { name: '대련', sub: '맑음', temp: 14, high: 17, low: 9, Icon: Sun, color: 'text-amber-400', dust: '미세 보통' },
];

// ── 지역 소식 ──────────────────────────────────────────
const REGIONS = ['대련','북경','상해','소주','무석','난징','항저우','천진','심천','심양','연길','우한','청두','광저우','청도'];
const NEWS_DATA: Record<string, {title:string; cat:string; date:string; views:number}[]> = {
  '대련': [
    { title:'대련시 한인회, 명절 맞이 전통시장 운영', cat:'행사', date:'12-16', views:1847 },
    { title:"개발구 한인마트 '코리아타운' 오늘 오픈", cat:'생활', date:'12-15', views:2341 },
    { title:'대련한국학교 2025학년도 신입생 모집', cat:'교육', date:'12-15', views:923 },
  ],
  '북경': [
    { title:'조양구 한국타운, 연말 특별 할인행사 진행', cat:'생활', date:'12-16', views:3127 },
    { title:'베이징한국국제학교 입학설명회 19일 개최', cat:'교육', date:'12-14', views:2456 },
    { title:'북경 한인사회 송년의 밤 행사 준비 한창', cat:'행사', date:'12-13', views:1789 },
  ],
  '상해': [
    { title:'푸동신구 한인타운 대형 리모델링 완료', cat:'생활', date:'12-16', views:2934 },
    { title:'상해한인회 찾아가는 법률상담 시작', cat:'서비스', date:'12-15', views:1267 },
    { title:'상해국제영화제 한국영화 특별전', cat:'문화', date:'12-12', views:2089 },
  ],
};
const getNews = (r:string) => NEWS_DATA[r] || NEWS_DATA['대련'];

// ── 메인 탭 목록 ──────────────────────────────────────────
const MAIN_TABS = [
  { id:'news',       label:'중국소식',   emoji:'📰' },
  { id:'visa',       label:'비자/서류',  emoji:'📋' },
  { id:'education',  label:'교육',       emoji:'🎓' },
  { id:'yellow',     label:'업소록',     emoji:'📖' },
  { id:'auto',       label:'자동차',     emoji:'🚗' },
  { id:'market',     label:'중고장터',   emoji:'🛒' },
  { id:'securities', label:'증권',       emoji:'📈' },
  { id:'realestate', label:'부동산',     emoji:'🏠' },
];

const SHORTCUT_ITEMS = [
  { id:'doc',        label:'서류 상담',   Icon:FileText,      page:'chinalife' },
  { id:'edu',        label:'교육 상담',   Icon:GraduationCap, page:'chinalife' },
  { id:'realestate', label:'부동산 상담', Icon:Building2,     page:'realestate' },
  { id:'travel',     label:'여행 상담',   Icon:Plane,         page:'chinalife' },
  { id:'stock',      label:'증권 상담',   Icon:TrendingUp,    page:'chinalife' },
  { id:'market',     label:'장터 상담',   Icon:ShoppingBag,   page:'usedmarket' },
  { id:'car',        label:'자동차 상담', Icon:Car,           page:'auto' },
  { id:'yellow',     label:'업소록 상담', Icon:BookOpen,      page:'yellowpages' },
  { id:'medical',    label:'병원 상담',   Icon:Stethoscope,   page:'chinalife' },
  { id:'community',  label:'커뮤니티',    Icon:MessageCircle, page:'chinalife' },
];

const CAT_COLORS: Record<string,string> = {
  행사:'bg-orange-100 text-orange-600', 생활:'bg-blue-100 text-blue-600',
  교육:'bg-green-100 text-green-600', 서비스:'bg-purple-100 text-purple-600',
  문화:'bg-pink-100 text-pink-600', 경제:'bg-yellow-100 text-yellow-700',
  모임:'bg-teal-100 text-teal-600', 스포츠:'bg-red-100 text-red-600',
};

interface MobileHomeProps {
  currentUser?: { id:string; name:string; username?:string; region?:string; city?:string } | null;
  isAdmin?: boolean;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLogout?: () => void;
  onNavigate?: (page:string) => void;
  onVisaArticleClick?: (a:any) => void;
  onEducationArticleClick?: (a:any) => void;
  onDriverLicenseClick?: () => void;
}

export function MobileHome({
  currentUser, isAdmin, onLoginClick, onSignupClick, onLogout, onNavigate,
  onVisaArticleClick, onEducationArticleClick, onDriverLicenseClick,
}: MobileHomeProps) {
  const [activeTab, setActiveTab] = useState('news');
  const [weatherIdx, setWeatherIdx] = useState(0);
  const [activeRegion, setActiveRegion] = useState('대련');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>(() => {
    try { const s = localStorage.getItem('dashboard_tabs'); return s ? JSON.parse(s) : ['doc','edu','realestate','travel','stock']; }
    catch { return ['doc','edu','realestate','travel','stock']; }
  });
  const [tempSelected, setTempSelected] = useState<string[]>(selectedShortcuts);

  // 날씨 자동 슬라이드
  useEffect(() => {
    const t = setInterval(() => setWeatherIdx(i => (i+1)%CITIES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // 사용자 지역 기본 설정
  useEffect(() => {
    if (currentUser?.region) setActiveRegion(currentUser.region);
  }, [currentUser]);

  const city = CITIES[weatherIdx];
  const WeatherIcon = city.Icon;
  const news = getNews(activeRegion);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find((u:any) => u.username === username && u.password === password);
      setIsSubmitting(false);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.reload();
      } else {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    }, 700);
  };

  const saveShortcuts = () => {
    if (tempSelected.length === 0) return;
    setSelectedShortcuts(tempSelected);
    localStorage.setItem('dashboard_tabs', JSON.stringify(tempSelected));
    setShowSettings(false);
  };

  const visibleShortcuts = SHORTCUT_ITEMS.filter(s => selectedShortcuts.includes(s.id));

  return (
    <div className="space-y-3 px-3 pb-8">

      {/* ── 1. 사용자 프로필 / 로그인 카드 ── */}
      {currentUser ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 프로필 헤더 */}
          <button
            onClick={() => onNavigate?.('chinalife')}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {(currentUser.name || currentUser.username || '?')[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name || currentUser.username}</p>
                <p className="text-xs text-gray-400">{currentUser.region || '지역 미설정'} · 커뮤니티 바로가기</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* 바로가기 그리드 */}
          <div className="border-t border-gray-50 bg-gray-50/60 grid grid-cols-5 px-1 py-1">
            {visibleShortcuts.slice(0,9).map((item, i) => (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.page)}
                className="flex flex-col items-center justify-center py-3 gap-1 rounded-xl hover:bg-white/80 transition-colors"
              >
                <item.Icon className="w-5 h-5 text-teal-600" strokeWidth={1.5} />
                <span className="text-[10px] text-gray-500 leading-tight text-center">{item.label.replace(' 상담','')}</span>
              </button>
            ))}
            <button
              onClick={() => { setTempSelected(selectedShortcuts); setShowSettings(true); }}
              className="flex flex-col items-center justify-center py-3 gap-1 rounded-xl hover:bg-white/80 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
              <span className="text-[10px] text-gray-400">설정</span>
            </button>
          </div>

          <button onClick={onLogout} className="w-full text-right px-4 py-2 text-[11px] text-gray-300 hover:text-red-400 transition-colors border-t border-gray-50">
            로그아웃
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!showLoginForm ? (
            /* 비로그인 배너 */
            <div className="px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">차이나뷰에 오신 것을 환영해요!</p>
                <p className="text-xs text-gray-400 mt-0.5">로그인하고 맞춤 정보를 받아보세요</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  로그인
                </button>
                <button
                  onClick={onSignupClick}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  회원가입
                </button>
              </div>
            </div>
          ) : (
            /* 로그인 폼 */
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">로그인</p>
                <button onClick={() => setShowLoginForm(false)} className="text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-2">
                <input
                  type="text" placeholder="아이디"
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 transition-colors"
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} placeholder="비밀번호"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 transition-colors pr-10"
                  />
                  <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? '로그인 중...' : '로그인하기'}
                </button>
                <p className="text-center text-xs text-gray-400">
                  아직 회원이 아닌가요?{' '}
                  <button type="button" onClick={onSignupClick} className="text-teal-600 font-medium">회원가입</button>
                </p>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── 2. 날씨 + 지역소식 가로 합체 카드 ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 날씨 */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-blue-400 font-medium">{city.name}</p>
              <p className="text-xs text-blue-300">{city.sub}</p>
            </div>
            <WeatherIcon className={`w-8 h-8 ${city.color}`} />
          </div>
          <p className="text-3xl font-light text-blue-900">{city.temp}°</p>
          <p className="text-xs text-blue-400 mt-1">{city.high}° / {city.low}°</p>
          <p className="text-[10px] text-blue-300 mt-1">{city.dust}</p>
          {/* 점 내비게이션 */}
          <div className="flex gap-1 mt-2">
            {CITIES.map((_,i) => (
              <button key={i} onClick={() => setWeatherIdx(i)}
                className={`h-1 rounded-full transition-all ${i === weatherIdx ? 'w-4 bg-blue-400' : 'w-1 bg-blue-200'}`}
              />
            ))}
          </div>
        </div>

        {/* 지역소식 미니 */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-gray-700">지역 소식</span>
            </div>
            <span className="bg-red-50 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>
          </div>
          {/* 지역 탭 가로 스크롤 */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-2 scrollbar-hide">
            {REGIONS.slice(0,8).map(r => (
              <button key={r} onClick={() => setActiveRegion(r)}
                className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                  activeRegion === r ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >{r}</button>
            ))}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {news.slice(0,2).map((n,i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded ${CAT_COLORS[n.cat] || 'bg-gray-100 text-gray-500'}`}>
                  {n.cat}
                </span>
                <p className="text-[11px] text-gray-700 line-clamp-2 leading-tight">{n.title}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate?.('news')} className="mt-2 text-[11px] text-gray-400 hover:text-teal-500 text-center">
            더보기 →
          </button>
        </div>
      </div>

      {/* ── 3. 주요 카테고리 탭 바 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* 탭 스크롤 */}
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {MAIN_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600 bg-teal-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-0">
          <Suspense fallback={<Spinner />}>
            {activeTab === 'news' && (
              <NewsSection category="중국소식" onMoreClick={() => onNavigate?.('news')} />
            )}
            {activeTab === 'visa' && (
              <VisaDocumentSection
                category="비자/서류"
                onMoreClick={() => onNavigate?.('visadocument')}
                onArticleClick={onVisaArticleClick}
              />
            )}
            {activeTab === 'education' && (
              <EducationSection
                category="교육"
                onMoreClick={() => onNavigate?.('education')}
                onArticleClick={onEducationArticleClick}
                userRegion={currentUser?.region}
              />
            )}
            {activeTab === 'yellow' && (
              <YellowPagesSection
                category="엘로우페이지"
                onMoreClick={() => onNavigate?.('yellowpages')}
              />
            )}
            {activeTab === 'auto' && (
              <AutoSection
                category="자동차"
                onMoreClick={() => onNavigate?.('auto')}
                onDriverLicenseClick={onDriverLicenseClick}
              />
            )}
            {activeTab === 'market' && (
              <UsedMarketSection
                category="중고장터"
                onMoreClick={() => onNavigate?.('usedmarket')}
                userRegion={currentUser?.region}
                currentUser={currentUser}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'securities' && (
              <SecuritiesSection category="증권" onMoreClick={() => onNavigate?.('securities')} />
            )}
            {activeTab === 'realestate' && (
              <RealEstateSection
                category="부동산"
                onMoreClick={() => onNavigate?.('realestate')}
                userCity={currentUser?.city || '베이징'}
              />
            )}
          </Suspense>
        </div>
      </div>

      {/* ── 4. 하단 광고 위젯 2열 ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <Suspense fallback={<div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />}>
          <div className="rounded-2xl overflow-hidden">
            <ChinaAutoAdWidget />
          </div>
        </Suspense>
        <Suspense fallback={<div className="h-24 bg-gray-50 rounded-2xl animate-pulse" />}>
          <div className="rounded-2xl overflow-hidden">
            <ChinaSecuritiesAdWidget />
          </div>
        </Suspense>
      </div>

      {/* ── 바로가기 설정 오버레이 ── */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">바로가기 설정</p>
                <p className="text-xs text-gray-400">{tempSelected.length}/9개 선택</p>
              </div>
              <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {SHORTCUT_ITEMS.map(item => {
                const on = tempSelected.includes(item.id);
                return (
                  <button key={item.id} onClick={() => {
                    setTempSelected(prev => on
                      ? prev.filter(t => t !== item.id)
                      : prev.length < 9 ? [...prev, item.id] : prev
                    );
                  }}
                    className={`relative flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                      on ? 'border-teal-400 bg-teal-50' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    {on && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <item.Icon className={`w-5 h-5 ${on ? 'text-teal-600' : 'text-gray-400'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] mt-1 text-center leading-tight ${on ? 'text-teal-700' : 'text-gray-500'}`}>
                      {item.label.replace(' 상담','')}
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={saveShortcuts}
              className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
