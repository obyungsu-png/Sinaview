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

/* 서비스 아이콘 8개 - 3D 클레이 스타일 SVG 캐릭터 */
const ICON_SVGS = {
  visa: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDFBF7"/><stop offset="100%" stop-color="#EAE0C8"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg1)"/><rect x="45" y="55" width="70" height="80" rx="8" fill="#FFF" opacity="0.7" transform="rotate(-5 80 95)"/><rect x="65" y="50" width="70" height="90" rx="8" fill="#FFF"/><rect x="85" y="45" width="30" height="30" rx="6" fill="#4A90E2"/><circle cx="95" cy="90" r="3" fill="#333"/><circle cx="115" cy="90" r="3" fill="#333"/><path d="M 98 100 Q 105 108 112 100" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>')}`,
  education: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8DFF5"/><stop offset="100%" stop-color="#CBBCE0"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg2)"/><rect x="45" y="110" width="90" height="20" rx="4" fill="#9B59B6"/><rect x="45" y="90" width="90" height="20" rx="4" fill="#E67E22"/><polygon points="90,50 130,70 90,90 50,70" fill="#2C3E50"/><rect x="85" y="70" width="10" height="20" fill="#2C3E50"/><circle cx="80" cy="100" r="3" fill="#333"/><circle cx="100" cy="100" r="3" fill="#333"/><path d="M 83 108 Q 90 115 97 108" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>')}`,
  yellow: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E3F2FD"/><stop offset="100%" stop-color="#BBDEFB"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg3)"/><path d="M 90 130 C 90 130 50 90 50 65 A 40 40 0 1 1 130 65 C 130 90 90 130 90 130 Z" fill="#5DADE2"/><rect x="75" y="95" width="30" height="35" rx="2" fill="#FF8A80" transform="rotate(10 90 110)"/><circle cx="80" cy="65" r="3" fill="#333"/><circle cx="100" cy="65" r="3" fill="#333"/><path d="M 83 75 Q 90 82 97 75" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>')}`,
  auto: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#D0E4F5"/><stop offset="100%" stop-color="#9DBFE0"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg4)"/><path d="M 40 100 L 50 75 Q 90 55 130 75 L 140 100 Z" fill="#3498DB"/><rect x="35" y="100" width="110" height="30" rx="10" fill="#3498DB"/><circle cx="60" cy="130" r="12" fill="#2C3E50"/><circle cx="120" cy="130" r="12" fill="#2C3E50"/><circle cx="80" cy="90" r="3" fill="#333"/><circle cx="100" cy="90" r="3" fill="#333"/><path d="M 83 98 Q 90 105 97 98" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>')}`,
  market: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FCE4EC"/><stop offset="100%" stop-color="#F8BBD0"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg5)"/><path d="M 45 60 L 60 110 L 120 110 L 135 60 Z" fill="none" stroke="#E74C3C" stroke-width="10" stroke-linejoin="round"/><path d="M 55 60 L 125 60" stroke="#E74C3C" stroke-width="7" stroke-linecap="round"/><rect x="75" y="75" width="30" height="25" rx="3" fill="#3498DB"/><circle cx="70" cy="125" r="8" fill="#2C3E50"/><circle cx="110" cy="125" r="8" fill="#2C3E50"/><circle cx="85" cy="85" r="2" fill="#FFF"/><circle cx="95" cy="85" r="2" fill="#FFF"/><path d="M 87 90 Q 90 93 93 90" stroke="#FFF" stroke-width="1.5" fill="none"/></svg>')}`,
  securities: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E8DFF5"/><stop offset="100%" stop-color="#CBBCE0"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg6)"/><rect x="45" y="100" width="20" height="30" rx="4" fill="#E74C3C"/><rect x="80" y="70" width="20" height="60" rx="4" fill="#3498DB"/><rect x="115" y="50" width="20" height="80" rx="4" fill="#2ECC71"/><circle cx="135" cy="115" r="15" fill="#F1C40F"/><text x="135" y="121" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFF" text-anchor="middle">¥</text></svg>')}`,
  realestate: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E0F2F1"/><stop offset="100%" stop-color="#B2DFDB"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg7)"/><rect x="45" y="80" width="35" height="50" rx="4" fill="#BDC3C7"/><rect x="52" y="90" width="8" height="8" rx="1" fill="#FFF" opacity="0.5"/><rect x="65" y="90" width="8" height="8" rx="1" fill="#FFF" opacity="0.5"/><rect x="75" y="50" width="40" height="80" rx="4" fill="#2ECC71"/><rect x="82" y="60" width="10" height="10" rx="1" fill="#FFF" opacity="0.5"/><rect x="98" y="60" width="10" height="10" rx="1" fill="#FFF" opacity="0.5"/><rect x="82" y="80" width="10" height="10" rx="1" fill="#FFF" opacity="0.5"/><rect x="98" y="80" width="10" height="10" rx="1" fill="#FFF" opacity="0.5"/><rect x="110" y="90" width="25" height="40" rx="4" fill="#FF8A80"/></svg>')}`,
  community: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><defs><linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FCE4EC"/><stop offset="100%" stop-color="#F8BBD0"/></linearGradient></defs><rect width="180" height="180" rx="40" fill="url(#bg8)"/><path d="M 50 90 Q 50 60 80 60 Q 110 60 110 90 Q 110 110 90 115 L 70 125 L 75 110 Q 50 105 50 90 Z" fill="#9B59B6"/><path d="M 70 80 Q 70 55 100 55 Q 130 55 130 80 Q 130 95 115 100 L 105 110 L 108 98 Q 70 95 70 80 Z" fill="#F9E852" opacity="0.85"/><circle cx="80" cy="90" r="3" fill="#FFF"/><circle cx="90" cy="90" r="3" fill="#FFF"/><circle cx="100" cy="90" r="3" fill="#FFF"/></svg>')}`,
};

const DEFAULT_SERVICE_ICONS = [
  {id:'visa',       label:'비자/서류', img: ICON_SVGS.visa,       tab:'visa',       bg:'#FFF3E0'},
  {id:'education',  label:'교육',      img: ICON_SVGS.education,  tab:'education',  bg:'#F3E8FF'},
  {id:'yellow',     label:'업소록',    img: ICON_SVGS.yellow,     tab:'yellow',     bg:'#EFF6FF'},
  {id:'auto',       label:'자동차',    img: ICON_SVGS.auto,       tab:'auto',       bg:'#DBEAFE'},
  {id:'market',     label:'중고장터',  img: ICON_SVGS.market,     tab:'market',     bg:'#FEF2F2'},
  {id:'securities', label:'증권',      img: ICON_SVGS.securities, tab:'securities', bg:'#EDE7F6'},
  {id:'realestate', label:'부동산',    img: ICON_SVGS.realestate, tab:'realestate', bg:'#E0F7FA'},
  {id:'community',  label:'커뮤니티',  img: ICON_SVGS.community,  tab:'community',  bg:'#F3E5F5', page:'chinalife'},
];

function getServiceIcons() {
  try {
    const saved = localStorage.getItem('cms_service_icons');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SERVICE_ICONS;
}

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
    emoji:'🎒', bg:'#FFF4B8', tag:'추천', tagBg:'#FF8C42', tabId:'daechi',
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

/* 메인 배너 - 슬라이드별 다른 그라데이션 */
const BANNERS = [
  {title:'차이나뷰 서비스',   sub:'재중 한인을 위한 종합 정보 플랫폼', from:'#00b09b', to:'#96c93d'},
  {title:'부동산 1:1 상담', sub:'중국 현지 부동산 전문 컨설팅',     from:'#4facfe', to:'#00f2fe'},
  {title:'비자/서류 안내',   sub:'비자 연장·서류 발급 완벽 가이드', from:'#a18cd1', to:'#fbc2eb'},
];

/* 광고 기본 데이터 (CMS 미설정 시 폴백) */
const DEFAULT_ADS = [
  {tag:'AD', sub:'전국농부들', title:'프리미엄 한우 꽃등심 특가 이벤트', desc:'투벌 한우 꽃등심 1kg + 양념 세트 55% 할인 🥩 무료배송', img:'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop', link:''},
  {tag:'AD', sub:'한성자동차', title:'BYD 한 EV 신차 출시 혜택', desc:'BYD·NIO·샤오펑 공식딜러 · 최대 600만원 할인 🚗', img:'https://images.unsplash.com/photo-1705747401901-28363172fe7e?w=400&h=400&fit=crop', link:''},
  {tag:'AD', sub:'베이커 부동산', title:'베이징 한인 아파트 풀옵션', desc:'명문학군·교통편리 · 즉시 입주 가능 🏠', img:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop', link:''},
];

const getMobileAds = () => {
  try {
    const saved = localStorage.getItem('cms_mobile_ads');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ADS;
};

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
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  /* 검색 결과 (서비스 아이콘 + 지역 필터용) */
  const ALL_SEARCHABLE = [
    {label:'비자/서류', icon:'📋', tab:'visa'},
    {label:'교육',     icon:'🎓', tab:'education'},
    {label:'업소록',   icon:'📖', tab:'yellow'},
    {label:'자동차',   icon:'🚗', tab:'auto'},
    {label:'중고장터', icon:'🛍️', tab:'market'},
    {label:'증권',     icon:'📊', tab:'securities'},
    {label:'부동산',   icon:'🏘️', tab:'realestate'},
    {label:'커뮤니티', icon:'💬', tab:'community', page:'chinalife'},
    {label:'재중 한국기업', icon:'🏢', tab:'koreanbiz'},
    {label:'뷰 (View)',     icon:'✍️', tab:'blog'},
    {label:'병원정보',     icon:'🏥', tab:'hospital'},
    {label:'대치동 학원',  icon:'📚', tab:'daechi'},
    {label:'중국 날씨',    icon:'🌤️', tab:'weather'},
  ];
  const searchResults = searchQuery.trim()
    ? ALL_SEARCHABLE.filter(s => s.label.includes(searchQuery))
    : ALL_SEARCHABLE;
  const SERVICE_ICONS = getServiceIcons();

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

  /* 광고 슬라이드 - CMS에서 로드 */
  const [adBanners, setAdBanners] = useState(() => getMobileAds());
  const [adIdx, setAdIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setAdIdx(i=>(i+1)%adBanners.length), 3500);
    return () => clearInterval(t);
  }, [adBanners.length]);

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

  const [showAdModal, setShowAdModal] = useState(false);
  const [modalAdIdx, setModalAdIdx] = useState(0);
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
  const ad = adBanners[adIdx] || DEFAULT_ADS[0];

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

          {/* ─ 메인 배너 (슬라이드별 그라데이션) ─ */}
          <div className="relative px-5 pt-5 pb-6"
            style={{background:`linear-gradient(135deg, ${banner.from}, ${banner.to})`}}>
            <div className="text-white/80 text-[11px] font-bold tracking-widest mb-1">CN</div>
            <p className="text-white font-extrabold text-[22px] leading-tight">{banner.title}</p>
            <p className="text-white/85 text-[12px] mt-1">{banner.sub}</p>
            <div className="absolute right-6 top-6 w-20 h-20 rounded-full bg-white/15"/>
            <div className="absolute right-2 bottom-8 w-12 h-12 rounded-full bg-white/15"/>
            <div className="absolute bottom-4 right-5 flex gap-1.5 items-center">
              {BANNERS.map((_,i)=>(
                <button key={i} onClick={()=>setBannerIdx(i)}
                  className={`transition-all rounded-full ${
                    i===bannerIdx ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                  }`}/>
              ))}
            </div>
          </div>

          {/* ─ 검색바 (탭 → 오버레이) ─ */}
          <div className="px-3 -mt-3 mb-3 relative z-10">
            <button
              className="w-full bg-white rounded-2xl shadow-md flex items-center gap-2 px-4 py-3 border border-gray-100 text-left active:scale-[0.98] transition-transform"
              onClick={() => setShowSearchOverlay(true)}
            >
              <Search className="w-4 h-4 text-gray-400 shrink-0"/>
              <span className="text-[13px] text-gray-400">검색어 입력하세요</span>
            </button>
          </div>

          {/* ─ 검색 오버레이 ─ */}
          {showSearchOverlay && (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 shadow-sm">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
                  <Search className="w-4 h-4 text-gray-400 shrink-0"/>
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                    placeholder="검색어 입력하세요"
                    className="flex-1 text-[14px] bg-transparent outline-none"
                  />
                  {searchQuery && (
                    <button onClick={()=>setSearchQuery('')} className="text-gray-400 text-xl leading-none w-5 h-5 flex items-center justify-center">×</button>
                  )}
                </div>
                <button onClick={()=>{ setShowSearchOverlay(false); setSearchQuery(''); }}
                  className="text-[13px] text-gray-600 font-medium shrink-0 px-1">취소</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <p className="text-[11px] text-gray-400 font-medium mb-2 px-1">
                  {searchQuery.trim() ? `"${searchQuery}" 검색 결과` : '전체 서비스'}
                </p>
                <div className="space-y-0.5">
                  {searchResults.map(item=>(
                    <button key={item.tab}
                      onClick={()=>{ setShowSearchOverlay(false); setSearchQuery(''); goContent(item.tab, item.page); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100">
                      <span className="text-xl w-8 text-center shrink-0">{item.icon}</span>
                      <span className="text-[14px] text-gray-800 font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto"/>
                    </button>
                  ))}
                  {searchQuery.trim() && searchResults.length===0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-[14px]">검색 결과가 없습니다</p>
                      <p className="text-[12px] mt-1">다른 키워드로 검색해보세요</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─ 서비스 아이콘 8개 ─ */}
          <div className="bg-white mx-3 mb-3 rounded-2xl border border-gray-100 shadow-sm" style={{padding:'16px 4px'}}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px 0px',
            }}>
              {SERVICE_ICONS.map(svc=>(
                <button
                  key={svc.id}
                  onClick={()=>goContent(svc.tab, svc.page)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: '0 4px',
                    minWidth: 0,
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                  onTouchStart={e => e.currentTarget.style.transform='scale(0.93)'}
                  onTouchEnd={e => e.currentTarget.style.transform='scale(1)'}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    borderRadius: 16,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img src={svc.img} alt={svc.label} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#333',
                    textAlign: 'center',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}>
                    {svc.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ─ 주요 서비스 5개 ─ */}
          <div className="px-3 mb-3">

            {/* 트렌디 광고 - 주요 서비스 바로 위 */}
            <button
              onClick={()=>{ setModalAdIdx(adIdx); setShowAdModal(true); }}
              className="w-full mb-4 relative overflow-hidden active:scale-[0.98] transition-all"
              style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '24px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                padding: '14px 14px 12px',
              }}>
              {/* 배경 블롭 장식 */}
              <div style={{position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(3,199,90,0.08)', pointerEvents:'none'}}/>
              <div style={{position:'absolute', bottom:-15, right:60, width:60, height:60, borderRadius:'50%', background:'rgba(3,199,90,0.05)', pointerEvents:'none'}}/>

              <div className="flex items-center gap-3 relative z-10">
                {/* 동그란 이미지 */}
                <div style={{position:'relative', shrink:0}}>
                  <img src={ad.img} alt=""
                    style={{width:64, height:64, borderRadius:'20px', objectFit:'cover', display:'block'}}/>
                  {/* AD 뱃지 - 이미지 위 */}
                  <span style={{
                    position:'absolute', top:-6, left:-6,
                    background:'#03c75a', color:'white',
                    fontSize:9, fontWeight:800,
                    padding:'2px 6px', borderRadius:20,
                    boxShadow:'0 2px 8px rgba(3,199,90,0.4)',
                    letterSpacing:'0.5px',
                  }}>AD</span>
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0 text-left">
                  <p style={{fontSize:10, color:'#aaa', marginBottom:3}}>{ad.sub}</p>
                  <p style={{fontSize:14, fontWeight:800, color:'#1a1a1a', lineHeight:1.3, marginBottom:4}}
                    className="line-clamp-2">{ad.title}</p>
                  <p style={{fontSize:11, color:'#888', lineHeight:1.4}}
                    className="line-clamp-1">{ad.desc}</p>
                </div>

                {/* 화살표 */}
                <ChevronRight className="w-4 h-4 shrink-0" style={{color:'#ccc'}}/>
              </div>

              {/* 인디케이터 */}
              <div className="flex items-center gap-1 mt-3 justify-center relative z-10">
                {adBanners.map((_,i)=>(
                  <span key={i} style={{
                    height: 4, borderRadius: 99,
                    width: i===adIdx ? 16 : 4,
                    background: i===adIdx ? '#03c75a' : '#e0e0e0',
                    transition: 'all 0.3s',
                    display: 'inline-block',
                  }}/>
                ))}
              </div>
            </button>

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

          {/* ─ 광고 (항상 표시) ─ */}
          <div className="px-3 mb-3">
            <button
              onClick={()=>{ setModalAdIdx(adIdx); setShowAdModal(true); }}
              className="w-full relative overflow-hidden active:scale-[0.98] transition-all"
              style={{background:'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderRadius:'24px', boxShadow:'0 2px 20px rgba(0,0,0,0.06)', padding:'14px 14px 12px'}}>
              <div style={{position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(3,199,90,0.08)', pointerEvents:'none'}}/>
              <div style={{position:'absolute', bottom:-15, right:60, width:60, height:60, borderRadius:'50%', background:'rgba(3,199,90,0.05)', pointerEvents:'none'}}/>
              <div className="flex items-center gap-3 relative z-10">
                <div style={{position:'relative'}}>
                  <img src={ad.img} alt="" style={{width:64, height:64, borderRadius:'20px', objectFit:'cover', display:'block'}}/>
                  <span style={{position:'absolute', top:-6, left:-6, background:'#03c75a', color:'white', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:20, boxShadow:'0 2px 8px rgba(3,199,90,0.4)'}}>AD</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p style={{fontSize:10, color:'#aaa', marginBottom:3}}>{ad.sub}</p>
                  <p style={{fontSize:14, fontWeight:800, color:'#1a1a1a', lineHeight:1.3, marginBottom:4}} className="line-clamp-2">{ad.title}</p>
                  <p style={{fontSize:11, color:'#888', lineHeight:1.4}} className="line-clamp-1">{ad.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{color:'#ccc'}}/>
              </div>
              <div className="flex items-center gap-1 mt-3 justify-center relative z-10">
                {adBanners.map((_,i)=>(
                  <span key={i} style={{height:4, borderRadius:99, width:i===adIdx?16:4, background:i===adIdx?'#03c75a':'#e0e0e0', transition:'all 0.3s', display:'inline-block'}}/>
                ))}
              </div>
            </button>
          </div>

          <div className="px-3 pb-4 text-center">
            <p className="text-[10px] text-gray-300">© Sina View Corp. All Rights Reserved.</p>
          </div>
        </div>
      )}

      {/* ── 광고 상세 모달 ── */}
      {showAdModal && (() => {
        const modalAd = adBanners[modalAdIdx] || {};
        const hasVideo = !!modalAd.video;
        const extraImgs = (modalAd.images||[]).filter(Boolean);
        const allImgs = [modalAd.img, ...extraImgs].filter(Boolean);
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55"
            onClick={()=>setShowAdModal(false)}>
            <div className="bg-white w-full rounded-t-3xl overflow-hidden flex flex-col"
              style={{maxHeight:'90vh'}}
              onClick={e=>e.stopPropagation()}>

              {/* 핸들바 */}
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-200 rounded-full"/>
              </div>

              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="bg-[#03c75a] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">AD</span>
                  <span className="text-[13px] font-semibold text-gray-800">{modalAd.sub}</span>
                </div>
                <button onClick={()=>setShowAdModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500"/>
                </button>
              </div>

              {/* 광고 탭 선택 (여러 광고) */}
              {adBanners.length > 1 && (
                <div className="flex gap-2 px-5 py-2 overflow-x-auto scrollbar-hide border-b border-gray-50 shrink-0">
                  {adBanners.map((a,i)=>(
                    <button key={i} onClick={()=>setModalAdIdx(i)}
                      className={`shrink-0 text-[11px] px-3 py-1 rounded-full font-medium transition-all ${
                        modalAdIdx===i?'bg-teal-500 text-white':'bg-gray-100 text-gray-500'}`}>
                      {a.sub}
                    </button>
                  ))}
                </div>
              )}

              {/* 콘텐츠 탭 (동영상/사진/안내) */}
              <AdModalContent ad={modalAd} hasVideo={hasVideo} allImgs={allImgs}/>

              {/* 하단 버튼 */}
              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <button
                  onClick={()=>{ if(modalAd.link) window.open(modalAd.link,'_blank'); setShowAdModal(false); }}
                  className="w-full py-3 bg-teal-600 text-white rounded-2xl text-[14px] font-bold active:bg-teal-700 transition-colors">
                  자세히 보기 →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-3" style={{padding:'16px 4px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'16px 0px'}}>
                {SERVICE_ICONS.map(svc=>(
                  <button key={svc.id} onClick={()=>goContent(svc.tab, svc.page)}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'none',border:'none',padding:'0 4px',minWidth:0,transition:'transform 0.2s ease'}}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                    onTouchStart={e=>e.currentTarget.style.transform='scale(0.93)'}
                    onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}>
                    <div style={{width:52,height:52,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:6,borderRadius:16,overflow:'hidden',flexShrink:0}}>
                      <img src={svc.img} alt={svc.label} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:500,color:'#333',textAlign:'center',letterSpacing:'-0.3px',lineHeight:1.2,whiteSpace:'nowrap'}}>
                      {svc.label}
                    </span>
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
        minHeight: wide ? 90 : 110,
      }}>
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block"
          style={{background: card.tagBg, transform:'rotate(8deg)', boxShadow:'0 2px 6px rgba(0,0,0,0.15)'}}>
          {card.tag}
        </span>
      </div>
      <div className="relative z-[5]">
        <p className="text-gray-900 font-extrabold text-[15px] leading-tight tracking-tight">{card.title}</p>
        <p className="text-gray-700/70 text-[11px] mt-0.5">{card.sub}</p>
      </div>
      <div className={`absolute text-[52px] leading-none opacity-90 select-none ${wide ? 'right-6 bottom-1' : 'right-1 bottom-0'}`}
        style={{filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.10))'}}>
        {card.emoji}
      </div>
    </button>
  );
}

/* ── 광고 모달 콘텐츠 (동영상/사진/안내 탭) ── */
function AdModalContent({ad, hasVideo, allImgs}) {
  const [tab, setTab] = useState(hasVideo ? 'video' : 'photo');
  const isYoutube = ad.video && (ad.video.includes('youtube.com') || ad.video.includes('youtu.be'));
  const isMp4 = ad.video && ad.video.endsWith('.mp4');

  const tabs = [
    ...(hasVideo ? [{id:'video', label:'🎬 동영상'}] : []),
    {id:'photo', label:'📸 사진'},
    {id:'info',  label:'📄 안내'},
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 탭 바 */}
      <div className="flex border-b border-gray-100 px-5 gap-4">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`py-2.5 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab===t.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* 제목 */}
        <div>
          <h2 className="text-[17px] font-extrabold text-gray-900 leading-tight">{ad.title}</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">{ad.sub}</p>
        </div>

        {/* ─ 동영상 탭 ─ */}
        {tab==='video' && (
          <div>
            {isYoutube && (
              <div className="rounded-2xl overflow-hidden bg-black" style={{aspectRatio:'16/9'}}>
                <iframe
                  src={ad.video.includes('embed') ? ad.video : ad.video.replace('watch?v=','embed/')}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen/>
              </div>
            )}
            {isMp4 && (
              <div className="rounded-2xl overflow-hidden bg-black" style={{aspectRatio:'16/9'}}>
                <video src={ad.video} controls className="w-full h-full object-contain"/>
              </div>
            )}
            {!isYoutube && !isMp4 && ad.video && (
              <div className="rounded-2xl overflow-hidden bg-black" style={{aspectRatio:'16/9'}}>
                <iframe src={ad.video} className="w-full h-full" allowFullScreen/>
              </div>
            )}
            <p className="text-[12px] text-gray-500 leading-relaxed mt-3">{ad.desc}</p>
          </div>
        )}

        {/* ─ 사진 탭 ─ */}
        {tab==='photo' && (
          <div>
            {/* 메인 이미지 */}
            <img src={ad.img} alt="" className="w-full rounded-2xl object-cover mb-2" style={{maxHeight:220}}/>
            {/* 추가 이미지 */}
            {allImgs.length > 1 && (
              <div className={`grid gap-1.5 ${allImgs.length===2?'grid-cols-2':'grid-cols-3'}`}>
                {allImgs.slice(1).map((src,i)=>(
                  <img key={i} src={src} alt=""
                    className="w-full aspect-square object-cover rounded-xl bg-gray-100"/>
                ))}
              </div>
            )}
            {allImgs.length === 1 && (
              <p className="text-[11px] text-gray-400 text-center py-2">추가 사진은 CMS에서 등록할 수 있습니다.</p>
            )}
          </div>
        )}

        {/* ─ 안내 탭 ─ */}
        {tab==='info' && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{ad.desc}</p>
            </div>
            {ad.link && (
              <a href={ad.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] text-teal-600 font-medium">
                <ExternalLink className="w-3.5 h-3.5"/>
                {ad.link}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
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
