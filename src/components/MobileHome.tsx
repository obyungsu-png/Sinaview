import { useState, useEffect, lazy, Suspense } from 'react';
import { Cloud, Sun, CloudRain, Eye, EyeOff, FileText, GraduationCap, Building2, Car, BookOpen, ShoppingBag, TrendingUp, MessageCircle, Stethoscope, Plane, Settings, X, Check, ChevronRight, Newspaper } from 'lucide-react';

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
  <div className="flex items-center justify-center py-10">
    <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const CITIES = [
  { name: '베이징', sub: '맑음', temp: 18, high: 21, low: 12, Icon: Sun, color: 'text-amber-400' },
  { name: '상하이', sub: '비', temp: 16, high: 19, low: 13, Icon: CloudRain, color: 'text-slate-400' },
  { name: '광저우', sub: '흐림', temp: 25, high: 28, low: 22, Icon: Cloud, color: 'text-gray-400' },
  { name: '선전', sub: '구름조금', temp: 27, high: 30, low: 24, Icon: Sun, color: 'text-amber-400' },
  { name: '대련', sub: '맑음', temp: 14, high: 17, low: 9, Icon: Sun, color: 'text-amber-400' },
];

const REGIONS = ['대련','북경','상해','소주','무석','난징','항저우','천진','심천','광저우','청도'];
const NEWS_DATA = {
  '대련': [
    { title:'대련시 한인회, 명절 맞이 전통시장 운영', cat:'행사' },
    { title:'개발구 한인마트 코리아타운 오늘 오픈', cat:'생활' },
    { title:'대련한국학교 2025학년도 신입생 모집', cat:'교육' },
  ],
  '북경': [
    { title:'조양구 한국타운, 연말 특별 할인행사', cat:'생활' },
    { title:'베이징한국국제학교 입학설명회 개최', cat:'교육' },
    { title:'북경 한인사회 송년의 밤 준비 한창', cat:'행사' },
  ],
  '상해': [
    { title:'푸동신구 한인타운 리모델링 완료', cat:'생활' },
    { title:'상해한인회 찾아가는 법률상담 시작', cat:'서비스' },
    { title:'상해국제영화제 한국영화 특별전', cat:'문화' },
  ],
};
const getNews = (r) => NEWS_DATA[r] || NEWS_DATA['대련'];

const SHORTCUT_ITEMS = [
  { id:'doc',        label:'서류',   Icon:FileText,      page:'chinalife' },
  { id:'edu',        label:'교육',   Icon:GraduationCap, page:'chinalife' },
  { id:'realestate', label:'부동산', Icon:Building2,     page:'realestate' },
  { id:'travel',     label:'여행',   Icon:Plane,         page:'chinalife' },
  { id:'stock',      label:'증권',   Icon:TrendingUp,    page:'chinalife' },
  { id:'market',     label:'장터',   Icon:ShoppingBag,   page:'usedmarket' },
  { id:'car',        label:'자동차', Icon:Car,           page:'auto' },
  { id:'yellow',     label:'업소록', Icon:BookOpen,      page:'yellowpages' },
  { id:'medical',    label:'병원',   Icon:Stethoscope,   page:'chinalife' },
  { id:'community',  label:'커뮤니티',Icon:MessageCircle, page:'chinalife' },
];

const CAT_COLORS = {
  행사:'bg-orange-100 text-orange-600', 생활:'bg-blue-100 text-blue-600',
  교육:'bg-green-100 text-green-600', 서비스:'bg-purple-100 text-purple-600',
  문화:'bg-pink-100 text-pink-600',
};

const MAIN_TABS = [
  { id:'news', label:'중국소식', emoji:'📰' },
  { id:'visa', label:'비자/서류', emoji:'📋' },
  { id:'education', label:'교육', emoji:'🎓' },
  { id:'yellow', label:'업소록', emoji:'📖' },
  { id:'auto', label:'자동차', emoji:'🚗' },
  { id:'market', label:'중고장터', emoji:'🛒' },
  { id:'securities', label:'증권', emoji:'📈' },
  { id:'realestate', label:'부동산', emoji:'🏠' },
];

export function MobileHome({
  currentUser, isAdmin, activeTab: extTab, onTabChange,
  onLoginClick, onSignupClick, onLogout, onNavigate,
  onVisaArticleClick, onEducationArticleClick, onDriverLicenseClick,
}) {
  const [internalTab, setInternalTab] = useState('news');
  const activeTab = extTab ?? internalTab;
  const setActiveTab = (t) => { setInternalTab(t); onTabChange?.(t); };

  const [weatherIdx, setWeatherIdx] = useState(0);
  const [activeRegion, setActiveRegion] = useState('대련');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedShortcuts, setSelectedShortcuts] = useState(() => {
    try { const s = localStorage.getItem('dashboard_tabs'); return s ? JSON.parse(s) : ['doc','edu','realestate','travel','stock']; }
    catch { return ['doc','edu','realestate','travel','stock']; }
  });
  const [tempSelected, setTempSelected] = useState(selectedShortcuts);

  useEffect(() => {
    const t = setInterval(() => setWeatherIdx(i => (i+1)%CITIES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (currentUser?.region) setActiveRegion(currentUser.region);
  }, [currentUser]);

  const city = CITIES[weatherIdx];
  const WeatherIcon = city.Icon;
  const news = getNews(activeRegion);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find((u) => u.username === username && u.password === password);
      setIsSubmitting(false);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.reload();
      } else { alert('아이디 또는 비밀번호가 올바르지 않습니다.'); }
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
    <div className="space-y-2.5 px-2.5 pb-6">

      {/* 1. 사용자 / 로그인 */}
      {currentUser ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button onClick={() => onNavigate?.('chinalife')} className="w-full flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {(currentUser.name || currentUser.username || '?')[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-900 leading-tight">{currentUser.name || currentUser.username}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{currentUser.region || '지역 미설정'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
          <div className="border-t border-gray-50 bg-gray-50/60 grid grid-cols-6 px-0.5 py-0.5">
            {visibleShortcuts.slice(0,5).map(item => (
              <button key={item.id} onClick={() => onNavigate?.(item.page)}
                className="flex flex-col items-center justify-center py-2 gap-0.5 rounded-lg hover:bg-white/80 transition-colors">
                <item.Icon className="w-4 h-4 text-teal-600" strokeWidth={1.5} />
                <span className="text-[9px] text-gray-500 leading-none">{item.label}</span>
              </button>
            ))}
            <button onClick={() => { setTempSelected(selectedShortcuts); setShowSettings(true); }}
              className="flex flex-col items-center justify-center py-2 gap-0.5 rounded-lg hover:bg-white/80 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <span className="text-[9px] text-gray-400 leading-none">설정</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {!showLoginForm ? (
            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 leading-tight truncate">차이나뷰에 오신 걸 환영해요</p>
                <p className="text-[10px] text-gray-400 leading-tight truncate">로그인하고 맞춤 정보 받기</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setShowLoginForm(true)}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg whitespace-nowrap">로그인</button>
                <button onClick={onSignupClick}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg whitespace-nowrap">가입</button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-semibold text-gray-800">로그인</p>
                <button onClick={() => setShowLoginForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <form onSubmit={handleLogin} className="space-y-1.5">
                <input type="text" placeholder="아이디" value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400" />
                <div className="relative">
                  <input type={showPw?'text':'password'} placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 pr-9" />
                  <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg text-[13px] font-medium disabled:opacity-60">
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 2. 날씨 + 지역소식 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-blue-500 font-medium leading-tight">{city.name}</p>
              <p className="text-[10px] text-blue-300 leading-tight">{city.sub}</p>
            </div>
            <WeatherIcon className={`w-6 h-6 ${city.color}`} />
          </div>
          <p className="text-2xl font-light text-blue-900 mt-1">{city.temp}°</p>
          <p className="text-[10px] text-blue-400">{city.high}°/{city.low}°</p>
          <div className="flex gap-1 mt-1.5">
            {CITIES.map((_,i) => (
              <button key={i} onClick={() => setWeatherIdx(i)}
                className={`h-1 rounded-full transition-all ${i===weatherIdx?'w-3 bg-blue-400':'w-1 bg-blue-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-1 mb-1.5">
            <Newspaper className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px] font-semibold text-gray-700">지역소식</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 mb-1 scrollbar-hide">
            {REGIONS.slice(0,6).map(r => (
              <button key={r} onClick={() => setActiveRegion(r)}
                className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                  activeRegion===r?'bg-teal-500 text-white':'bg-gray-100 text-gray-500'}`}>{r}</button>
            ))}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {news.slice(0,2).map((n,i) => (
              <button key={i} onClick={() => onNavigate?.('news')} className="flex items-start gap-1 text-left">
                <span className={`shrink-0 text-[8px] font-semibold px-1 py-0.5 rounded ${CAT_COLORS[n.cat]||'bg-gray-100 text-gray-500'}`}>{n.cat}</span>
                <p className="text-[10px] text-gray-700 line-clamp-1 leading-tight">{n.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 주요 탭 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {MAIN_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab===tab.id?'border-teal-500 text-teal-600 bg-teal-50/50':'border-transparent text-gray-500'}`}>
              <span className="text-[13px]">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div>
          <Suspense fallback={<Spinner />}>
            {activeTab==='news' && <NewsSection category="중국소식" onMoreClick={() => onNavigate?.('news')} />}
            {activeTab==='visa' && <VisaDocumentSection category="비자/서류" onMoreClick={() => onNavigate?.('visadocument')} onArticleClick={onVisaArticleClick} />}
            {activeTab==='education' && <EducationSection category="교육" onMoreClick={() => onNavigate?.('education')} onArticleClick={onEducationArticleClick} userRegion={currentUser?.region} />}
            {activeTab==='yellow' && <YellowPagesSection category="엘로우페이지" onMoreClick={() => onNavigate?.('yellowpages')} />}
            {activeTab==='auto' && <AutoSection category="자동차" onMoreClick={() => onNavigate?.('auto')} onDriverLicenseClick={onDriverLicenseClick} />}
            {activeTab==='market' && <UsedMarketSection category="중고장터" onMoreClick={() => onNavigate?.('usedmarket')} userRegion={currentUser?.region} currentUser={currentUser} isAdmin={isAdmin} />}
            {activeTab==='securities' && <SecuritiesSection category="증권" onMoreClick={() => onNavigate?.('securities')} />}
            {activeTab==='realestate' && <RealEstateSection category="부동산" onMoreClick={() => onNavigate?.('realestate')} userCity={currentUser?.city||'베이징'} />}
          </Suspense>
        </div>
      </div>

      {/* 4. 광고 */}
      <div className="space-y-2 mobile-ad-compact">
        <Suspense fallback={<div className="h-16 bg-gray-50 rounded-xl animate-pulse" />}>
          <ChinaAutoAdWidget />
        </Suspense>
        <Suspense fallback={<div className="h-16 bg-gray-50 rounded-xl animate-pulse" />}>
          <ChinaSecuritiesAdWidget />
        </Suspense>
      </div>

      {/* 설정 오버레이 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-t-3xl w-full p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">바로가기 설정</p>
                <p className="text-[11px] text-gray-400">{tempSelected.length}/9개</p>
              </div>
              <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {SHORTCUT_ITEMS.map(item => {
                const on = tempSelected.includes(item.id);
                return (
                  <button key={item.id} onClick={() => setTempSelected(prev => on?prev.filter(t=>t!==item.id):prev.length<9?[...prev,item.id]:prev)}
                    className={`relative flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${on?'border-teal-400 bg-teal-50':'border-gray-100 bg-gray-50'}`}>
                    {on && <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" strokeWidth={3} /></span>}
                    <item.Icon className={`w-4 h-4 ${on?'text-teal-600':'text-gray-400'}`} strokeWidth={1.5} />
                    <span className={`text-[9px] mt-1 ${on?'text-teal-700':'text-gray-500'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={saveShortcuts} className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold">저장</button>
          </div>
        </div>
      )}
    </div>
  );
}
