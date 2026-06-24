import { useState, lazy, Suspense, useEffect } from 'react';
import { Header } from './Header';
import { testServerConnection } from '../utils/supabase/client';
import { LoginSection } from './LoginSection';
import { CenterAdBanner } from './CenterAdBanner';

// Lazy load LoginModal (only shown on user click)
const LoginModal = lazy(() => import('./LoginModal').then(m => ({ default: m.LoginModal })));

// Lazy load ALL section components
const VisaDocumentSection = lazy(() => import('./VisaDocumentSection').then(m => ({ default: m.VisaDocumentSection })));
const EducationSection = lazy(() => import('./EducationSection').then(m => ({ default: m.EducationSection })));
const SmallAdBanner = lazy(() => import('./SmallAdBanner').then(m => ({ default: m.SmallAdBanner })));
const YellowPagesSection = lazy(() => import('./YellowPagesSection').then(m => ({ default: m.YellowPagesSection })));
const ShoppingSection = lazy(() => import('./ShoppingSection').then(m => ({ default: m.ShoppingSection })));
const AutoSection = lazy(() => import('./AutoSection').then(m => ({ default: m.AutoSection })));
const NewsSection = lazy(() => import('./NewsSection').then(m => ({ default: m.NewsSection })));
const UsedMarketSection = lazy(() => import('./UsedMarketSection').then(m => ({ default: m.UsedMarketSection })));
const SecuritiesSection = lazy(() => import('./SecuritiesSection').then(m => ({ default: m.SecuritiesSection })));
const WeatherAdWidget = lazy(() => import('./WeatherAdWidget').then(m => ({ default: m.WeatherAdWidget })));
const RegionalNewsWidget = lazy(() => import('./RegionalNewsWidget').then(m => ({ default: m.RegionalNewsWidget })));
const WeatherWidget = lazy(() => import('./WeatherWidget').then(m => ({ default: m.WeatherWidget })));
const StockWidget = lazy(() => import('./StockWidget').then(m => ({ default: m.StockWidget })));
const HospitalWidget = lazy(() => import('./HospitalWidget').then(m => ({ default: m.HospitalWidget })));
const CalendarWidget = lazy(() => import('./CalendarWidget').then(m => ({ default: m.CalendarWidget })));
const ChinaAutoAdWidget = lazy(() => import('./ChinaAutoAdWidget').then(m => ({ default: m.ChinaAutoAdWidget })));
const ChinaSecuritiesAdWidget = lazy(() => import('./ChinaSecuritiesAdWidget').then(m => ({ default: m.ChinaSecuritiesAdWidget })));
const BlogSection = lazy(() => import('./BlogSection').then(m => ({ default: m.BlogSection })));

// Lazy load page components
const NewsPage = lazy(() => import('../pages/NewsPage').then(m => ({ default: m.NewsPage })));
const ShoppingPage = lazy(() => import('../pages/ShoppingPage').then(m => ({ default: m.ShoppingPage })));
const YellowPagesPage = lazy(() => import('../pages/YellowPagesPage').then(m => ({ default: m.YellowPagesPage })));
const VisaDocumentPage = lazy(() => import('../pages/VisaDocumentPage').then(m => ({ default: m.VisaDocumentPage })));
const EducationPage = lazy(() => import('../pages/EducationPage').then(m => ({ default: m.EducationPage })));
const AutoPage = lazy(() => import('../pages/AutoPage').then(m => ({ default: m.AutoPage })));
const BlogPage = lazy(() => import('../pages/BlogPage').then(m => ({ default: m.BlogPage })));
const UsedMarketPage = lazy(() => import('../pages/UsedMarketPage').then(m => ({ default: m.UsedMarketPage })));
const SecuritiesPage = lazy(() => import('../pages/SecuritiesPage').then(m => ({ default: m.SecuritiesPage })));
const LSMPage = lazy(() => import('../pages/LSMPage').then(m => ({ default: m.LSMPage })));
const CSMPage = lazy(() => import('../pages/CSMPage').then(m => ({ default: m.CSMPage })));
const DriverLicensePage = lazy(() => import('../pages/DriverLicensePage').then(m => ({ default: m.DriverLicensePage })));
const ChinaLifeCommunity = lazy(() => import('./ChinaLifeCommunity').then(m => ({ default: m.ChinaLifeCommunity })));
const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const WeChatLoginPage = lazy(() => import('../pages/WeChatLoginPage').then(m => ({ default: m.WeChatLoginPage })));
const RealEstatePage = lazy(() => import('../pages/RealEstatePage').then(m => ({ default: m.RealEstatePage })));
const HSKPage = lazy(() => import('../pages/HSKPage').then(m => ({ default: m.HSKPage })));

// Progressive rendering hook
function useDeferredSections(totalSections: number) {
  const [visibleCount, setVisibleCount] = useState(2);
  
  useEffect(() => {
    if (visibleCount >= totalSections) return;
    const timer = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 2, totalSections));
    }, 400);
    return () => clearTimeout(timer);
  }, [visibleCount, totalSections]);
  
  return visibleCount;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

export function Portal() {
  const visibleSections = useDeferredSections(8);

  const [activeNewsCategory, setActiveNewsCategory] = useState('중국소식');
  const [activeShoppingCategory, setActiveShoppingCategory] = useState('쇼핑');
  const [activeYellowPagesCategory, setActiveYellowPagesCategory] = useState('엘로우페이지');
  const [selectedShoppingCategory, setSelectedShoppingCategory] = useState('전체');
  
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; username?: string; region?: string; city?: string } | null>({
    id: 'user_demo_123',
    name: '김차이나',
    username: 'kimchaina',
    region: '베이징'
  });
  const [isAdmin, setIsAdmin] = useState(true);
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentPage, setCurrentPage] = useState('main');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isNStudyHubOpen, setIsNStudyHubOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = 'Sina View';
    
    // Set favicon - purple rounded square with white lightning bolt
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Purple rounded rectangle background
      const radius = 14;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(64 - radius, 0);
      ctx.quadraticCurveTo(64, 0, 64, radius);
      ctx.lineTo(64, 64 - radius);
      ctx.quadraticCurveTo(64, 64, 64 - radius, 64);
      ctx.lineTo(radius, 64);
      ctx.quadraticCurveTo(0, 64, 0, 64 - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fillStyle = '#7c3aed';
      ctx.fill();
      
      // White lightning bolt
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(36, 8);
      ctx.lineTo(20, 34);
      ctx.lineTo(30, 34);
      ctx.lineTo(28, 56);
      ctx.lineTo(44, 30);
      ctx.lineTo(34, 30);
      ctx.lineTo(36, 8);
      ctx.closePath();
      ctx.fill();
      
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = canvas.toDataURL('image/png');
      document.head.appendChild(link);
    }

    const timer = setTimeout(() => {
      testServerConnection();
    }, 5000);
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    return () => clearTimeout(timer);
  }, []);

  // Navigation handlers
  const handleGoToNewsPage = () => setCurrentPage('news');
  const handleGoToShoppingPage = (category?: string) => {
    if (category) setSelectedShoppingCategory(category);
    setCurrentPage('shopping');
  };
  const handleGoToYellowPagesPage = () => setCurrentPage('yellowpages');
  const handleGoToVisaDocumentPage = () => setCurrentPage('visadocument');
  const handleGoToEducationPage = () => setCurrentPage('education');
  const handleGoToAutoPage = () => setCurrentPage('auto');
  const handleGoToBlogPage = () => setCurrentPage('blog');
  const handleGoToUsedMarketPage = () => setCurrentPage('usedmarket');
  const handleGoToSecuritiesPage = () => setCurrentPage('securities');
  const handleGoToLSMPage = () => setCurrentPage('lsm');
  const handleGoToCSMPage = () => setCurrentPage('csm');
  const handleGoToDriverLicensePage = () => setCurrentPage('driverlicense');
  const handleGoToRealEstatePage = () => setCurrentPage('realestate');
  const handleBackToHome = () => setCurrentPage('main');
  const handleNavigate = (page: string) => setCurrentPage(page);
  const handleNStudyHubToggle = () => setIsNStudyHubOpen(prev => !prev);
  
  const handleVisaArticleClick = (article: any) => {
    setSelectedArticle(article);
    setCurrentPage('visadocument');
  };
  const handleEducationArticleClick = (article: any) => {
    setSelectedArticle(article);
    setCurrentPage('education');
  };

  // Render sub-pages
  if (isNStudyHubOpen) {
    return (
      <div className="h-screen flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <LSMPage onBack={() => setIsNStudyHubOpen(false)} />
        </Suspense>
      </div>
    );
  }

  const pageMap: Record<string, JSX.Element> = {
    homepage: <HomePage />,
    news: <NewsPage onBack={handleBackToHome} />,
    shopping: <ShoppingPage onBack={handleBackToHome} initialCategory={selectedShoppingCategory} />,
    yellowpages: <YellowPagesPage onBack={handleBackToHome} />,
    visadocument: <VisaDocumentPage onBack={handleBackToHome} selectedArticle={selectedArticle} currentUser={currentUser} isAdmin={isAdmin} />,
    education: <EducationPage onBack={handleBackToHome} selectedArticle={selectedArticle} currentUser={currentUser} isAdmin={isAdmin} />,
    auto: <AutoPage onBack={handleBackToHome} currentUser={currentUser} isAdmin={isAdmin} />,
    blog: <BlogPage onBack={handleBackToHome} />,
    usedmarket: <UsedMarketPage onBack={handleBackToHome} />,
    securities: <SecuritiesPage onBack={handleBackToHome} />,
    lsm: <LSMPage onBack={handleBackToHome} />,
    csm: <CSMPage onBack={handleBackToHome} />,
    driverlicense: <DriverLicensePage onBack={handleBackToHome} />,
    login: <LoginPage onBack={handleBackToHome} />,
    wechatlogin: <WeChatLoginPage onBack={handleBackToHome} />,
    realestate: <RealEstatePage onBack={handleBackToHome} />,
    hsk: <HSKPage onBack={handleBackToHome} />,
    chinalife: <ChinaLifeCommunity currentUser={currentUser} isAdmin={isAdmin} onBack={handleBackToHome} />,
  };

  if (currentPage !== 'main' && pageMap[currentPage]) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        {pageMap[currentPage]}
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        key={currentUser?.region || 'no-user'}
        onCategorySelect={setActiveNewsCategory} 
        onShoppingSelect={setActiveShoppingCategory}
        onYellowPagesSelect={setActiveYellowPagesCategory}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onNStudyHubToggle={handleNStudyHubToggle}
        isNStudyHubOpen={isNStudyHubOpen}
        userRegion={currentUser?.region}
        onLoginClick={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
      />
      
      <CenterAdBanner />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop Layout */}
        <div className="hidden lg:block space-y-6">
          <div className="grid grid-cols-10 gap-6">
            <div className="col-span-7 space-y-6">
              {visibleSections >= 1 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="grid grid-cols-2 gap-4">
                    <div id="visa-documents">
                      <VisaDocumentSection 
                        category="비자/서류" 
                        onMoreClick={handleGoToVisaDocumentPage}
                        onArticleClick={handleVisaArticleClick}
                      />
                    </div>
                    <div id="education">
                      <EducationSection 
                        category="교육" 
                        onMoreClick={handleGoToEducationPage}
                        onArticleClick={handleEducationArticleClick}
                        userRegion={currentUser?.region}
                      />
                    </div>
                  </div>
                </Suspense>
              )}
              
              {visibleSections >= 2 && (
                <>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SmallAdBanner />
                  </Suspense>
                  <Suspense fallback={<LoadingSpinner />}>
                    <div id="yellowpages">
                      <YellowPagesSection 
                        category={activeYellowPagesCategory} 
                        onMoreClick={handleGoToYellowPagesPage}
                      />
                    </div>
                  </Suspense>
                </>
              )}
              
              {visibleSections >= 3 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <div id="shopping">
                    <ShoppingSection 
                      category={activeShoppingCategory} 
                      onMoreClick={handleGoToShoppingPage}
                    />
                  </div>
                </Suspense>
              )}
              
              {visibleSections >= 4 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div id="auto">
                      <AutoSection 
                        category="자동차" 
                        onMoreClick={handleGoToAutoPage}
                        onDriverLicenseClick={handleGoToDriverLicensePage}
                      />
                    </div>
                    <div id="news">
                      <NewsSection 
                        category={activeNewsCategory} 
                        onMoreClick={handleGoToNewsPage}
                      />
                    </div>
                  </div>
                </Suspense>
              )}
              
              {visibleSections >= 5 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div id="used-market">
                      <UsedMarketSection 
                        category="중고시장" 
                        onMoreClick={handleGoToUsedMarketPage} 
                        userRegion={currentUser?.region}
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                      />
                    </div>
                    <div id="securities">
                      <SecuritiesSection category="증권" onMoreClick={handleGoToSecuritiesPage} />
                    </div>
                  </div>
                </Suspense>
              )}
            </div>
            <div className="col-span-3 space-y-6">
              {visibleSections >= 1 && (
                <LoginSection 
                  onLoginClick={() => setIsLoginModalOpen(true)} 
                  onSignupClick={() => setIsSignupModalOpen(true)}
                />
              )}
              {visibleSections >= 2 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <WeatherAdWidget />
                </Suspense>
              )}
              {visibleSections >= 3 && (
                <>
                  <Suspense fallback={<LoadingSpinner />}>
                    <RegionalNewsWidget />
                  </Suspense>
                  <Suspense fallback={<LoadingSpinner />}>
                    <WeatherWidget />
                  </Suspense>
                </>
              )}
              {visibleSections >= 4 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <StockWidget />
                </Suspense>
              )}
              {visibleSections >= 5 && (
                <Suspense fallback={<LoadingSpinner />}>
                  <HospitalWidget userCity={currentUser?.city || '베이징'} />
                </Suspense>
              )}
              {visibleSections >= 6 && showCalendar && (
                <Suspense fallback={<LoadingSpinner />}>
                  <CalendarWidget />
                </Suspense>
              )}
              {visibleSections >= 7 && (
                <>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChinaAutoAdWidget />
                  </Suspense>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ChinaSecuritiesAdWidget />
                  </Suspense>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {visibleSections >= 1 && (
            <div className="space-y-4">
              <LoginSection 
                onLoginClick={() => setIsLoginModalOpen(true)}
                onSignupClick={() => setIsSignupModalOpen(true)}
              />
              <Suspense fallback={<LoadingSpinner />}>
                <RegionalNewsWidget />
              </Suspense>
            </div>
          )}
          
          {visibleSections >= 2 && (
            <div className="space-y-4">
              <Suspense fallback={<LoadingSpinner />}>
                <WeatherWidget />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <WeatherAdWidget />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <StockWidget />
              </Suspense>
            </div>
          )}
          
          {visibleSections >= 3 && (
            <>
              <Suspense fallback={<LoadingSpinner />}>
                <NewsSection category={activeNewsCategory} onMoreClick={handleGoToNewsPage} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <EducationSection 
                  category="교육" 
                  onMoreClick={handleGoToEducationPage}
                  onArticleClick={handleEducationArticleClick}
                  userRegion={currentUser?.region}
                />
              </Suspense>
            </>
          )}
          
          {visibleSections >= 4 && (
            <>
              <Suspense fallback={<LoadingSpinner />}>
                <SmallAdBanner />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <YellowPagesSection category={activeYellowPagesCategory} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <ShoppingSection category={activeShoppingCategory} />
              </Suspense>
            </>
          )}
          
          {visibleSections >= 5 && (
            <>
              <Suspense fallback={<LoadingSpinner />}>
                <AutoSection 
                  category="자동차" 
                  onMoreClick={handleGoToAutoPage}
                  onDriverLicenseClick={handleGoToDriverLicensePage}
                />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <SecuritiesSection category="증권" onMoreClick={handleGoToSecuritiesPage} />
              </Suspense>
            </>
          )}
          
          {visibleSections >= 6 && (
            <>
              <Suspense fallback={<LoadingSpinner />}>
                <UsedMarketSection category="중고시장" onMoreClick={handleGoToUsedMarketPage} userRegion={currentUser?.region} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <VisaDocumentSection 
                  category="비자/서류" 
                  onMoreClick={handleGoToVisaDocumentPage}
                  onArticleClick={handleVisaArticleClick}
                />
              </Suspense>
            </>
          )}
          
          {visibleSections >= 7 && (
            <>
              {showCalendar && (
                <Suspense fallback={<LoadingSpinner />}>
                  <CalendarWidget />
                </Suspense>
              )}
              <div className="space-y-4">
                <Suspense fallback={<LoadingSpinner />}>
                  <ChinaAutoAdWidget />
                </Suspense>
                <Suspense fallback={<LoadingSpinner />}>
                  <ChinaSecuritiesAdWidget />
                </Suspense>
              </div>
            </>
          )}
        </div>

        {visibleSections >= 7 && (
          <div className="mt-8 lg:hidden">
            <Suspense fallback={<LoadingSpinner />}>
              <HospitalWidget userCity={currentUser?.city || '베이징'} />
            </Suspense>
          </div>
        )}

        {visibleSections >= 8 && (
          <div className="mt-8">
            <Suspense fallback={<LoadingSpinner />}>
              <BlogSection onViewHomeClick={handleGoToBlogPage} />
            </Suspense>
          </div>
        )}
      </main>

      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={() => {
              setIsLoginModalOpen(false);
              const user = localStorage.getItem('currentUser');
              if (user) setCurrentUser(JSON.parse(user));
            }}
          />
        </Suspense>
      )}

      {isSignupModalOpen && (
        <Suspense fallback={null}>
          <LoginModal 
            isOpen={isSignupModalOpen} 
            onClose={() => setIsSignupModalOpen(false)}
            initialTab="signup"
            onLoginSuccess={() => {
              setIsSignupModalOpen(false);
              const user = localStorage.getItem('currentUser');
              if (user) setCurrentUser(JSON.parse(user));
            }}
          />
        </Suspense>
      )}

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">회사소개</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-green-600">Sina View 소개</a></li>
                <li><a href="#" className="hover:text-green-600">인재채용</a></li>
                <li><a href="#" className="hover:text-green-600">제휴제안</a></li>
                <li><a href="#" className="hover:text-green-600">이용약관</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">고객센터</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-green-600">공지사항</a></li>
                <li><a href="#" className="hover:text-green-600">문의하기</a></li>
                <li><a href="#" className="hover:text-green-600">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-green-600">청소년보호정책</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Sina View 서비스</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-green-600">Sina View 메일</a></li>
                <li><a href="#" className="hover:text-green-600">Sina View 클라우드</a></li>
                <li><a href="#" className="hover:text-green-600">Sina View 웍스</a></li>
                <li><a href="#" className="hover:text-green-600">Sina View 페이</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">정책 및 약관</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-green-600">운영정책</a></li>
                <li><a href="#" className="hover:text-green-600">권리침해신고</a></li>
                <li><a href="#" className="hover:text-green-600">Sina View 정책</a></li>
                <li><button onClick={handleGoToLSMPage} className="hover:text-green-600 text-left">법적고지</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            <p>&copy; Sina View Corp. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}