import { useState, useEffect, lazy, Suspense } from 'react';
import {
  FileText, GraduationCap, Building2, Car, BookOpen, ShoppingBag,
  TrendingUp, MessageCircle, Stethoscope, Plane, X, Check,
  ChevronRight, Newspaper, Home, Grid3X3, User,
  Eye, EyeOff, ArrowLeft, ExternalLink, Search
} from 'lucide-react';

const VisaDocumentSection   = lazy(() => import('./VisaDocumentSection').then(m=>({default:m.VisaDocumentSection})));
const EducationSection      = lazy(() => import('./EducationSection').then(m=>({default:m.EducationSection})));
const YellowPagesSection    = lazy(() => import('./YellowPagesSection').then(m=>({default:m.YellowPagesSection})));
const AutoSection           = lazy(() => import('./AutoSection').then(m=>({default:m.AutoSection})));
const NewsSection           = lazy(() => import('./NewsSection').then(m=>({default:m.NewsSection})));
const UsedMarketSection     = lazy(() => import('./UsedMarketSection').then(m=>({default:m.UsedMarketSection})));
const SecuritiesSection     = lazy(() => import('./SecuritiesSection').then(m=>({default:m.SecuritiesSection})));
const RealEstateSection     = lazy(() => import('./RealEstateSection').then(m=>({default:m.RealEstateSection})));
const KoreanBizSection      = lazy(() => import('./KoreanBizSection').then(m=>({default:m.KoreanBizSection})));
const WeatherWidget         = lazy(() => import('./WeatherWidget').then(m=>({default:m.WeatherWidget})));
const HospitalWidget        = lazy(() => import('./HospitalWidget').then(m=>({default:m.HospitalWidget})));
const BlogSection           = lazy(() => import('./BlogSection').then(m=>({default:m.BlogSection})));

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"/>
  </div>
);

/* ── 데이터 ─────────────────── */
const REGIONS = ['대련','북경','상해','소주','무석','난징','항저우','천진','심천','광저우','청도'];
const NEWS_DATA = {
  '대련': [
    {title:'대련시 한인회, 명절 맞이 전통시장 운영', cat:'행사'},
    {title:'개발구 한인마트 코리아타운 오늘 오픈',   cat:'생활'},
    {title:'대련한국학교 2025학년도 신입생 모집',    cat:'교육'},
  ],
  '북경': [
    {title:'조양구 한국타운, 연말 특별 할인행사',   cat:'생활'},
    {title:'베이징한국국제학교 입학설명회 개최',    cat:'교육'},
    {title:'북경 한인사회 송년의 밤 준비 한창',    cat:'행사'},
  ],
  '상해': [
    {title:'푸동신구 한인타운 리모델링 완료',   cat:'생활'},
    {title:'상해한인회 찾아가는 법률상담 시작', cat:'서비스'},
    {title:'상해국제영화제 한국영화 특별전',    cat:'문화'},
  ],
};
const getNews = r => NEWS_DATA[r] || NEWS_DATA['대련'];

const CAT_COLORS = {
  행사:'bg-orange-100 text-orange-600', 생활:'bg-blue-100 text-blue-600',
  교육:'bg-green-100 text-green-600',   서비스:'bg-purple-100 text-purple-600',
  문화:'bg-pink-100 text-pink-600',
};

/* 서비스 아이콘 8개 - 더 부드러운 톤 */
const SERVICE_ICONS = [
  {id:'visa',       label:'비자/서류', icon:'📋', tab:'visa',       bg:'bg-blue-50'},
  {id:'education',  label:'교육',      icon:'🎓', tab:'education',  bg:'bg-green-50'},
  {id:'yellow',     label:'업소록',    icon:'📖', tab:'yellow',     bg:'bg-yellow-50'},
  {id:'auto',       label:'자동차',    icon:'🚗', tab:'auto',       bg:'bg-red-50'},
  {id:'market',     label:'중고장터',  icon:'🛍️', tab:'market',     bg:'bg-orange-50'},
  {id:'securities', label:'증권',      icon:'💹', tab:'securities', bg:'bg-indigo-50'},
  {id:'realestate', label:'부동산',    icon:'🏘️', tab:'realestate', bg:'bg-teal-50'},
  {id:'community',  label:'커뮤니티',  icon:'💬', tab:'community',  bg:'bg-purple-50', page:'chinalife'},
];

/* 주요 서비스 5개 카드 - 사진6 스타일 (대형 + 캐릭터 + HOT 태그) */
const FEATURE_CARDS = [
  {
    id:'koreanbiz', title:'재중 한국기업', sub:'5,000+ 기업 정보',
    emoji:'🏢', bg:'#A5E5D8', tag:'NEW', tagBg:'#FFB800', tabId:'koreanbiz',
  },
  {
    id:'blog', title:'뷰 (View)', sub:'한인 스토리·일상',
    emoji:'✍️', bg:'#FFD3D3', tag:'HOT', tagBg:'#FF4444', tabId:'blog',
  },
  {
    id:'daechi', title:'대치동 학원', sub:'유학·입시 컨설팅',
    emoji:'📚', bg:'#FFF4B8', tag:'추천', tagBg:'#FF8C42', tabId:'daechi',
  },
  {
    id:'realestate', title:'부동산', sub:'매물·전월세 정보',
    emoji:'🏠', bg:'#D4E5FF', tag:'AI', tagBg:'#5B9BFF', tabId:'realestate',
  },
  {
    id:'hospital', title:'병원정보', sub:'한국어 진료 가능',
    emoji:'🏥', bg:'#E0D4FF', tag:'24h', tagBg:'#9B6CFF', tabId:'hospital',
  },
];

/* 메인 배너 - 단일 톤 (teal) */
const BANNERS = [
  {title:'차이나뷰 서비스',   sub:'재중 한인을 위한 종합 정보 플랫폼', emoji:'🇨🇳'},
  {title:'부동산 1:1 상담', sub:'중국 현지 부동산 전문 컨설팅',     emoji:'🏠'},
  {title:'비자/서류 안내',   sub:'비자 연장·서류 발급 완벽 가이드', emoji:'📋'},
];

/* 광고 슬라이드 */
const AD_BANNERS = [
  {tag:'AD', sub:'코리아Up 비즈니스 아카데미', title:'중국 비즈니스 전문가 양성과정 모집', img:'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop', link:''},
  {tag:'AD', sub:'한성자동차 강남전시장',     title:'BYD 한 EV 출시 · 600만원 할인',         img:'https://images.unsplash.com/photo-1705747401901-28363172fe7e?w=400&h=400&fit=crop', link:''},
  {tag:'AD', sub:'베이커 부동산',             title:'베이징 한인 아파트 · 풀옵션 매물',       img:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop', link:''},
];

/* 바로가기 */
const SHORTCUT_ITEMS = [
  {id:'doc',        label:'서류',     Icon:FileText,       page:'chinalife'},
  {id:'edu',        label:'교육',     Icon:GraduationCap,  page:'chinalife'},
  {id:'realestate', label:'부동산',   Icon:Building2,      page:'realestate'},
  {id:'travel',     label:'여행',     Icon:Plane,          page:'chinalife'},
  {id:'stock',      label:'증권',     Icon:TrendingUp,     page:'chinalife'},
  {id:'market',     label:'장터',     Icon:ShoppingBag,    page:'usedmarket'},
  {id:'car',        label:'자동차',   Icon:Car,            page:'auto'},
  {id:'yellow',     label:'업소록',   Icon:BookOpen,       page:'yellowpages'},
  {id:'medical',    label:'병원',     Icon:Stethoscope,    page:'chinalife'},
  {id:'community',  label:'커뮤니티', Icon:MessageCircle,  page:'chinalife'},
];

/* 학습센터 */
const STUDY_LINKS = [
  {label:'HSK',         sub:'중국어 능력 시험',  url:() => localStorage.getItem('hskLinkUrl') || 'https://www.hsk.org.cn', emoji:'🇨🇳'},
  {label:'SAT/ACT',     sub:'SAT & ACT 준비',    url:() => 'https://your-sat-site.com',   emoji:'📝'},
  {label:'TOEFL/IELTS', sub:'영어 능력 시험',    url:() => 'https://your-toefl-site.com', emoji:'🌐'},
  {label:'AP/IB/A-level', sub:'국제 교육 과정',  url:() => 'https://your-apib-site.com', emoji:'🎓'},
];

const CONTENT_LABELS = {
  news:'중국소식', visa:'비자/서류', education:'교육', yellow:'업소록',
  auto:'자동차', market:'중고장터', securities:'증권', realestate:'부동산',
  koreanbiz:'재중 한국기업', blog:'뷰 (View)', weather:'날씨', hospital:'병원정보',
  daechi:'대치동 학원',
};

/* ══════════════════════════════════════════════ */
export function MobileHome({
  currentUser, isAdmin, activeTab: extTab, onTabChange,
  onLoginClick, onSignupClick, onLogout, onNavigate,
  onVisaArticleClick, onEducationArticleClick, onDriverLicenseClick,
}) {
  const [bottomTab, setBottomTab] = useState('home');
  const [contentTab, setContentTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const goContent = (tab, page) => {
    if (page) { onNavigate?.(page); return; }
    if (tab==='daechi') { onNavigate?.('education'); return; }
    setContentTab(tab); setBottomTab('service');
    window.scrollTo({top:0});
  };
  const goHome = () => { setContentTab(''); setBottomTab('home'); window.scrollTo({top:0}); };

  /* 배너 슬라이드 */
  const [bannerIdx, setBannerIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i=>(i+1)%BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* 광고 슬라이드 */
  const [adIdx, setAdIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setAdIdx(i=>(i+1)%AD_BANNERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const [activeRegion, setActiveRegion] = useState('대련');
  useEffect(() => { if (currentUser?.region) setActiveRegion(currentUser.region); }, [currentUser]);
  const news = getNews(activeRegion);

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleLogin = e => {
    e.preventDefault(); setIsSubmitting(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers')||'[]');
      const user = users.find(u => u.username===username && u.password===password);
      setIsSubmitting(false);
      if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); window.location.reload(); }
      else alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }, 700);
  };

  const [showSettings, setShowSettings] = useState(false);
  const [selectedShortcuts, setSelectedShortcuts] = useState(() => {
    try { const s = localStorage.getItem('dashboard_tabs'); return s ? JSON.parse(s) : ['doc','edu','realestate','travel','stock']; }
    catch { return ['doc','edu','realestate','travel','stock']; }
  });
  const [tempSelected, setTempSelected] = useState(selectedShortcuts);
  const saveShortcuts = () => {
    if (!tempSelected.length) return;
    setSelectedShortcuts(tempSelected);
    localStorage.setItem('dashboard_tabs', JSON.stringify(tempSelected));
    setShowSettings(false);
  };
  const visibleShortcuts = SHORTCUT_ITEMS.filter(s => selectedShortcuts.includes(s.id));

  const banner = BANNERS[bannerIdx];
  const ad = AD_BANNERS[adIdx];

  /* ── 콘텐츠 화면 ── */
  if (contentTab) return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center px-3 py-3 gap-3 shadow-sm">
        <button onClick={goHome} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600"/>
        </button>
        <span className="font-semibold text-gray-900 text-[15px]">{CONTENT_LABELS[contentTab]}</span>
      </div>
      <Suspense fallback={<Spinner/>}>
        {contentTab==='news'       && <NewsSection category="중국소식" onMoreClick={()=>onNavigate?.('news')}/>}
        {contentTab==='visa'       && <VisaDocumentSection category="비자/서류" onMoreClick={()=>onNavigate?.('visadocument')} onArticleClick={onVisaArticleClick}/>}
        {contentTab==='education'  && <EducationSection category="교육" onMoreClick={()=>onNavigate?.('education')} onArticleClick={onEducationArticleClick} userRegion={currentUser?.region}/>}
        {contentTab==='yellow'     && <YellowPagesSection category="업소록" onMoreClick={()=>onNavigate?.('yellowpages')}/>}
        {contentTab==='auto'       && <AutoSection category="자동차" onMoreClick={()=>onNavigate?.('auto')} onDriverLicenseClick={onDriverLicenseClick}/>}
        {contentTab==='market'     && <UsedMarketSection category="중고장터" onMoreClick={()=>onNavigate?.('usedmarket')} userRegion={currentUser?.region} currentUser={currentUser} isAdmin={isAdmin}/>}
        {contentTab==='securities' && <SecuritiesSection category="증권" onMoreClick={()=>onNavigate?.('securities')}/>}
        {contentTab==='realestate' && <RealEstateSection category="부동산" onMoreClick={()=>onNavigate?.('realestate')} userCity={currentUser?.city||'베이징'}/>}
        {contentTab==='koreanbiz'  && <KoreanBizSection/>}
        {contentTab==='blog'       && <BlogSection onViewHomeClick={()=>onNavigate?.('blog')}/>}
        {contentTab==='weather'    && <WeatherWidget/>}
        {contentTab==='hospital'   && <HospitalWidget userCity={currentUser?.city||'베이징'}/>}
      </Suspense>
      <BottomTabBar active={bottomTab} onSelect={t=>{ if(t==='home') goHome(); else { setBottomTab(t); setContentTab(''); } }}/>
    </div>
  );

  return (
    <div className="pb-20 bg-gray-50/50">

      {/* ══ 홈 ══ */}
      {bottomTab==='home' && (
        <div>

          {/* ─ 메인 배너 (단일 톤 teal) ─ */}
          <div className="relative bg-teal-500 px-5 pt-5 pb-6">
            <div className="text-white/80 text-[11px] font-bold tracking-widest mb-1">CN</div>
            <p className="text-white font-extrabold text-[22px] leading-tight">{banner.title}</p>
            <p className="text-white/85 text-[12px] mt-1">{banner.sub}</p>
            {/* 배경 장식 원 */}
            <div className="absolute right-6 top-6 w-20 h-20 rounded-full bg-white/15"/>
            <div className="absolute right-2 bottom-8 w-12 h-12 rounded-full bg-white/15"/>
            {/* 인디케이터 - 사진2처럼 막대 */}
            <div className="absolute bottom-4 right-5 flex gap-1.5 items-center">
              {BANNERS.map((_,i)=>(
                <button key={i} onClick={()=>setBannerIdx(i)}
                  className={`transition-all rounded-full ${
                    i===bannerIdx
                      ? 'w-6 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/40'
                  }`}/>
              ))}
            </div>
          </div>

          {/* ─ 검색바 (배너에 자연스럽게 연결) ─ */}
          <div className="px-3 -mt-3 mb-3 relative z-10">
            <div className="bg-white rounded-2xl shadow-md flex items-center gap-2 px-4 py-2.5 border border-gray-100">
              <Search className="w-4 h-4 text-gray-400 shrink-0"/>
              <input
                type="text"
                value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* ─ 서비스 아이콘 8개 ─ */}
          <div className="bg-white mx-3 mb-3 rounded-2xl border border-gray-100 shadow-sm px-3 pt-4 pb-3">
            <div className="grid grid-cols-4 gap-y-1">
              {SERVICE_ICONS.map(svc=>(
                <button key={svc.id} onClick={()=>goContent(svc.tab, svc.page)}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl active:bg-gray-50">
                  <div className={`w-12 h-12 ${svc.bg} rounded-2xl flex items-center justify-center text-[22px]`}>
                    {svc.icon}
                  </div>
                  <span className="text-[11px] text-gray-700 font-medium">{svc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ─ 광고 슬라이더 (컴팩트) ─ */}
          <div className="px-3 mb-3">
            <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex items-center gap-2.5 p-2 active:scale-[0.98] transition-transform">
              <img src={ad.img} alt={ad.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"/>
              <div className="flex-1 min-w-0 text-left py-0.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">{ad.tag}</span>
                  <span className="text-[10px] text-gray-400 truncate">{ad.sub}</span>
                </div>
                <p className="text-[12px] font-semibold text-gray-900 leading-tight line-clamp-1">{ad.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  {AD_BANNERS.map((_,i)=>(
                    <span key={i} className={`h-0.5 rounded-full transition-all ${i===adIdx?'w-3 bg-teal-500':'w-1 bg-gray-200'}`}/>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mr-1"/>
            </button>
          </div>

          {/* ─ 주요 서비스 5개 (사진6 스타일) ─ */}
          <div className="px-3 mb-3">
            <p className="text-[12px] text-gray-500 font-semibold mb-2 px-1">주요 서비스</p>
            {/* 1번째 줄: 큰 카드 2개 */}
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <FeatureCard card={FEATURE_CARDS[0]} onClick={()=>goContent(FEATURE_CARDS[0].tabId,null)}/>
              <FeatureCard card={FEATURE_CARDS[1]} onClick={()=>goContent(FEATURE_CARDS[1].tabId,null)}/>
            </div>
            {/* 2번째 줄: 큰 카드 2개 */}
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <FeatureCard card={FEATURE_CARDS[2]} onClick={()=>goContent(FEATURE_CARDS[2].tabId,null)}/>
              <FeatureCard card={FEATURE_CARDS[3]} onClick={()=>goContent(FEATURE_CARDS[3].tabId,null)}/>
            </div>
            {/* 3번째 줄: 가로형 큰 카드 1개 */}
            <FeatureCard card={FEATURE_CARDS[4]} wide onClick={()=>goContent(FEATURE_CARDS[4].tabId,null)}/>
          </div>

          {/* ─ 지역소식 ─ */}
          <div className="bg-white mx-3 mb-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📰</span>
                <span className="font-semibold text-gray-800 text-[14px]">지역 소식</span>
              </div>
              <button onClick={()=>goContent('news',null)} className="text-[11px] text-teal-500 font-medium">더보기 →</button>
            </div>
            <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
              {REGIONS.map(r=>(
                <button key={r} onClick={()=>setActiveRegion(r)}
                  className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-medium transition-all ${
                    activeRegion===r?'bg-teal-500 text-white':'bg-gray-100 text-gray-500'}`}>{r}</button>
              ))}
            </div>
            <div className="divide-y divide-gray-50 px-1 pb-1">
              {news.map((n,i)=>(
                <button key={i} onClick={()=>goContent('news',null)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${CAT_COLORS[n.cat]||'bg-gray-100 text-gray-500'}`}>{n.cat}</span>
                  <p className="text-[13px] text-gray-700 line-clamp-1 flex-1">{n.title}</p>
                  <ChevronRight className="w-3 h-3 text-gray-300 shrink-0"/>
                </button>
              ))}
            </div>
          </div>

          {/* ─ 로그인 유도 ─ */}
          {!currentUser && !showLoginForm && (
            <div className="mx-3 mb-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl border border-teal-100 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-gray-800">로그인하고 맞춤정보 받기</p>
                <p className="text-[10px] text-gray-400 mt-0.5">지역별 맞춤 서비스 제공</p>
              </div>
              <button onClick={()=>setShowLoginForm(true)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl">로그인</button>
            </div>
          )}
          {!currentUser && showLoginForm && (
            <div className="mx-3 mb-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-900 text-sm">로그인</p>
                <button onClick={()=>setShowLoginForm(false)}><X className="w-4 h-4 text-gray-400"/></button>
              </div>
              <form onSubmit={handleLogin} className="space-y-2">
                <input type="text" placeholder="아이디" value={username} onChange={e=>setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400"/>
                <div className="relative">
                  <input type={showPw?'text':'password'} placeholder="비밀번호" value={password} onChange={e=>setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 pr-10"/>
                  <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                  </button>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-[13px] font-semibold disabled:opacity-60">
                  {isSubmitting?'로그인 중...':'로그인'}
                </button>
                <p className="text-center text-[11px] text-gray-400">
                  계정이 없으신가요?{' '}
                  <button type="button" onClick={onSignupClick} className="text-teal-600 font-semibold">회원가입</button>
                </p>
              </form>
            </div>
          )}

          <div className="px-3 pb-4 text-center">
            <p className="text-[10px] text-gray-300">© Sina View Corp. All Rights Reserved.</p>
          </div>
        </div>
      )}

      {/* ══ 소식 ══ */}
      {bottomTab==='news' && (
        <div>
          <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
            <p className="font-bold text-gray-900 text-[16px]">📰 중국 소식</p>
          </div>
          <Suspense fallback={<Spinner/>}>
            <NewsSection category="중국소식" onMoreClick={()=>onNavigate?.('news')}/>
          </Suspense>
        </div>
      )}

      {/* ══ 서비스 ══ */}
      {bottomTab==='service' && !contentTab && (
        <div>
          <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
            <p className="font-bold text-gray-900 text-[16px]">서비스</p>
          </div>
          <div className="p-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-4 mb-3">
              <div className="grid grid-cols-4 gap-2">
                {SERVICE_ICONS.map(svc=>(
                  <button key={svc.id} onClick={()=>goContent(svc.tab, svc.page)}
                    className="flex flex-col items-center gap-2 py-3 rounded-2xl active:bg-gray-50">
                    <div className={`w-14 h-14 ${svc.bg} rounded-2xl flex items-center justify-center text-2xl`}>
                      {svc.icon}
                    </div>
                    <span className="text-[11px] text-gray-700 font-medium">{svc.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* 주요 서비스 */}
            <p className="text-[12px] text-gray-500 font-semibold mb-2 px-1">주요 서비스</p>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <FeatureCard card={FEATURE_CARDS[0]} onClick={()=>goContent(FEATURE_CARDS[0].tabId,null)}/>
              <FeatureCard card={FEATURE_CARDS[1]} onClick={()=>goContent(FEATURE_CARDS[1].tabId,null)}/>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <FeatureCard card={FEATURE_CARDS[2]} onClick={()=>goContent(FEATURE_CARDS[2].tabId,null)}/>
              <FeatureCard card={FEATURE_CARDS[3]} onClick={()=>goContent(FEATURE_CARDS[3].tabId,null)}/>
            </div>
            <FeatureCard card={FEATURE_CARDS[4]} wide onClick={()=>goContent(FEATURE_CARDS[4].tabId,null)}/>
          </div>
        </div>
      )}

      {/* ══ 내정보 ══ */}
      {bottomTab==='my' && (
        <div>
          <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
            <p className="font-bold text-gray-900 text-[16px]">내 정보</p>
          </div>

          {currentUser ? (
            <div className="p-3 space-y-3">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {(currentUser.name||currentUser.username||'?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{currentUser.name||currentUser.username}</p>
                    <p className="text-white/70 text-[13px]">{currentUser.region||'지역 미설정'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="text-[13px] font-semibold text-gray-700">나의 바로가기</span>
                  <button onClick={()=>{setTempSelected(selectedShortcuts);setShowSettings(true);}} className="text-[11px] text-teal-500">편집</button>
                </div>
                <div className="grid grid-cols-5 p-2 gap-1">
                  {visibleShortcuts.map(item=>(
                    <button key={item.id} onClick={()=>onNavigate?.(item.page)}
                      className="flex flex-col items-center py-3 gap-1 rounded-xl hover:bg-gray-50">
                      <item.Icon className="w-5 h-5 text-teal-600" strokeWidth={1.5}/>
                      <span className="text-[10px] text-gray-500">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-[13px] font-semibold text-gray-700">🎓 학습센터</p>
                </div>
                {STUDY_LINKS.map((link,i)=>(
                  <button key={i} onClick={()=>window.open(link.url(),'_blank')}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{link.emoji}</span>
                      <div className="text-left">
                        <p className="text-[13px] text-gray-800 font-medium">{link.label}</p>
                        <p className="text-[10px] text-gray-400">{link.sub}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300"/>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {[
                  {label:'게시판',     icon:'💬', action:()=>onNavigate?.('chinalife')},
                  {label:'부동산 상담',icon:'🏠', action:()=>onNavigate?.('realestate')},
                  {label:'중고장터',   icon:'🛍️', action:()=>onNavigate?.('usedmarket')},
                ].map((m,i)=>(
                  <button key={i} onClick={m.action} className="w-full flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-[14px] text-gray-700">{m.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300"/>
                  </button>
                ))}
              </div>
              <button onClick={onLogout} className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl text-[13px]">로그아웃</button>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-3">👤</div>
                <p className="font-semibold text-gray-800 mb-1">로그인이 필요해요</p>
                <p className="text-[12px] text-gray-400 mb-4">로그인하면 맞춤 정보를 받을 수 있어요</p>
                <div className="flex gap-2">
                  <button onClick={()=>{setShowLoginForm(true);setBottomTab('home');}}
                    className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-[13px] font-semibold">로그인</button>
                  <button onClick={onSignupClick}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[13px]">회원가입</button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-[13px] font-semibold text-gray-700">🎓 학습센터</p>
                </div>
                {STUDY_LINKS.map((link,i)=>(
                  <button key={i} onClick={()=>window.open(link.url(),'_blank')}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{link.emoji}</span>
                      <div className="text-left">
                        <p className="text-[13px] text-gray-800 font-medium">{link.label}</p>
                        <p className="text-[10px] text-gray-400">{link.sub}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300"/>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <BottomTabBar active={bottomTab} onSelect={t=>{ setBottomTab(t); setContentTab(''); window.scrollTo({top:0}); }}/>

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={()=>setShowSettings(false)}>
          <div className="bg-white rounded-t-3xl w-full p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-gray-900">바로가기 설정</p>
                <p className="text-[11px] text-gray-400">{tempSelected.length}/9개 선택</p>
              </div>
              <button onClick={()=>setShowSettings(false)}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {SHORTCUT_ITEMS.map(item=>{
                const on=tempSelected.includes(item.id);
                return (
                  <button key={item.id}
                    onClick={()=>setTempSelected(prev=>on?prev.filter(t=>t!==item.id):prev.length<9?[...prev,item.id]:prev)}
                    className={`relative flex flex-col items-center py-3 rounded-xl border-2 ${on?'border-teal-400 bg-teal-50':'border-gray-100 bg-gray-50'}`}>
                    {on && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" strokeWidth={3}/>
                    </span>}
                    <item.Icon className={`w-5 h-5 ${on?'text-teal-600':'text-gray-400'}`} strokeWidth={1.5}/>
                    <span className={`text-[10px] mt-1 ${on?'text-teal-700':'text-gray-500'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={saveShortcuts} className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold">저장</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 주요 서비스 카드 (사진6 스타일) ── */
function FeatureCard({card, wide, onClick}) {
  return (
    <button onClick={onClick}
      className="relative overflow-hidden rounded-3xl p-4 text-left active:scale-[0.97] transition-transform w-full"
      style={{
        background: card.bg,
        minHeight: wide ? 100 : 120,
      }}>
      {/* 태그 (HOT, NEW 등) */}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block"
          style={{
            background: card.tagBg,
            transform: 'rotate(8deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
          {card.tag}
        </span>
      </div>

      {/* 텍스트 */}
      <div className="relative z-[5]">
        <p className="text-gray-900 font-extrabold text-[17px] leading-tight tracking-tight">{card.title}</p>
        <p className="text-gray-700/70 text-[11px] mt-1">{card.sub}</p>
      </div>

      {/* 큰 이모지 (우측 하단) */}
      <div className={`absolute text-[60px] leading-none opacity-95 select-none ${wide ? 'right-6 bottom-0' : 'right-2 bottom-0'}`}
        style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))'}}>
        {card.emoji}
      </div>
    </button>
  );
}

function BottomTabBar({active, onSelect}) {
  const tabs = [
    {id:'home',    label:'홈',     Icon:Home},
    {id:'news',    label:'소식',   Icon:Newspaper},
    {id:'service', label:'서비스', Icon:Grid3X3},
    {id:'my',      label:'내정보', Icon:User},
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{boxShadow:'0 -1px 12px rgba(0,0,0,0.08)'}}>
      <div className="flex max-w-lg mx-auto">
        {tabs.map(tab=>{
          const on=active===tab.id;
          return (
            <button key={tab.id} onClick={()=>onSelect(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative">
              <tab.Icon className={`w-5 h-5 ${on?'text-teal-600':'text-gray-400'}`} strokeWidth={on?2:1.5}/>
              <span className={`text-[10px] font-medium ${on?'text-teal-600':'text-gray-400'}`}>{tab.label}</span>
              {on && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-teal-500 rounded-full"/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
