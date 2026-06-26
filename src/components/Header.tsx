import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Menu, User, Keyboard, TrendingUp, Clock, MapPin, ExternalLink, Zap } from 'lucide-react@0.487.0';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserProfileDropdown } from './UserProfileDropdown';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onCategorySelect: (category: string) => void;
  onYellowPagesSelect: (category: string) => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  onNStudyHubToggle?: () => void;
  isNStudyHubOpen?: boolean;
  userRegion?: string;
  onLoginClick?: () => void;
  currentUser?: { id: string; name: string; username?: string } | null;
}

export function Header({ onCategorySelect, onYellowPagesSelect, onNavigate, currentPage = 'main', onNStudyHubToggle, isNStudyHubOpen = false, userRegion, onLoginClick, currentUser }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [currentUserRegion, setCurrentUserRegion] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const animatedPlaceholder = 'AI 검색';

  // 검색 가능한 키워드/페이지 데이터
  const searchableItems = useMemo(() => [
    { keyword: '비자', aliases: ['visa', '비자서류', '비자신청', '취업비자', '학생비자', 'Z비자', 'X비자'], section: 'visa-documents', mobileSection: 'visa-documents-mobile', page: 'visadocument', icon: '📋', category: '비자/서류' },
    { keyword: '서류', aliases: ['서류발급', '공증', '인증', '대사관'], section: 'visa-documents', mobileSection: 'visa-documents-mobile', page: 'visadocument', icon: '📋', category: '비자/서류' },
    { keyword: '교육', aliases: ['학교', '유학', '교육정보', '입학', '국제학교', 'education'], section: 'education', mobileSection: 'education-mobile', page: 'education', icon: '🎓', category: '교육' },
    { keyword: '엘로우페이지', aliases: ['옐로우페이지', '업소록', '전화번호', '업체', 'yellow pages', '엘로우 페이지'], section: 'yellowpages', mobileSection: 'yellowpages-mobile', page: 'yellowpages', icon: '📒', category: '엘로우 페이지' },
    { keyword: '자동차', aliases: ['차량', '중고차', 'BYD', '전기차', '현대', '기아', '벤츠', 'auto', '차'], section: 'auto', mobileSection: 'auto-mobile', page: 'auto', icon: '🚗', category: '자동차' },
    { keyword: '운전면허', aliases: ['면허', '면허시험', '필기시험', '운전', '면허교환', 'driver license'], section: 'auto', mobileSection: 'auto-mobile', page: 'driverlicense', icon: '🪪', category: '운전면허' },
    { keyword: '뉴스', aliases: ['중국소식', '중국뉴스', '뉴스', 'news', '소식', '시사'], section: 'news', mobileSection: 'news-mobile', page: 'news', icon: '📰', category: '중국소식' },
    { keyword: '화개장터', aliases: ['중고', '중고거래', '벼룩시장', '직접만든', '수제', '핸드메이드', '판매', 'market', '장터'], section: 'used-market', mobileSection: 'used-market-mobile', page: 'usedmarket', icon: '🏮', category: '화개장터' },
    { keyword: '증권', aliases: ['주식', '펀드', '투자', '상하이증시', '선전증시', 'stock', '증시', '코스피'], section: 'securities', mobileSection: 'securities-mobile', page: 'securities', icon: '📈', category: '중국 증권' },
    { keyword: '부동산', aliases: ['집', '아파트', '임대', '매매', '월세', 'real estate', '렌트'], section: 'realestate-section', mobileSection: 'realestate-section', page: 'realestate', icon: '🏠', category: '부동산' },
    { keyword: 'HSK', aliases: ['중국어시험', '한어수평고시', 'hsk', '중국어능력시험', 'HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'], section: null, mobileSection: null, page: 'hsk', icon: '🇨🇳', category: '학습 센터' },
    { keyword: '블로그', aliases: ['카페', '커뮤니티', 'blog', '글쓰기'], section: null, mobileSection: null, page: 'blog', icon: '✍️', category: '블로그' },
    { keyword: '게시판', aliases: ['커뮤니티', '생활정보', '차이나라이프', '중국생활'], section: null, mobileSection: null, page: 'chinalife', icon: '💬', category: '게시판' },
    { keyword: '로그인', aliases: ['회원가입', 'login', '계정', '아이디'], section: null, mobileSection: null, page: 'login', icon: '🔑', category: '계정' },
    { keyword: '날씨', aliases: ['기온', '일기예보', 'weather', '온도'], section: null, mobileSection: null, page: null, icon: '🌤️', category: '날씨', scrollOnly: true },
  ], []);

  // 인기 검색어
  const trendingKeywords = ['HSK 시험', '비자 연장', '전기차', '화개장터 베이징', '운전면허 교환'];

  // 검색어에 따른 필터링
  const filteredSuggestions = useMemo(() => {
    if (!searchValue.trim()) return [];
    const query = searchValue.trim().toLowerCase();
    return searchableItems.filter(item => {
      if (item.keyword.toLowerCase().includes(query)) return true;
      return item.aliases.some(alias => alias.toLowerCase().includes(query));
    }).slice(0, 8);
  }, [searchValue, searchableItems]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchValue.trim()) {
      // 검색 로직 구현
      alert(`"${searchValue.trim()}" 검색 결과를 찾고 있습니다...`);
      console.log('검색어:', searchValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Smooth scroll to section function
  const scrollToSection = (sectionId: string, mobileId?: string) => {
    const isMobile = window.innerWidth < 1024;
    const targetId = isMobile && mobileId ? mobileId : sectionId;
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSuggestionClick = (item: typeof searchableItems[0]) => {
    setSearchValue(item.keyword);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    if (item.page) {
      onNavigate?.(item.page);
    } else if (item.section) {
      scrollToSection(item.section, item.mobileSection || undefined);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = filteredSuggestions.length > 0 ? filteredSuggestions : [];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">


      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-0 sm:justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <button 
              onClick={() => onNavigate?.('main')}
              className="flex items-center gap-1 sm:gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Zap className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" fill="currentColor" />
              <span className="text-base sm:text-2xl font-extrabold tracking-tight text-gray-900 whitespace-nowrap">
                차이나 View
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-0 max-w-2xl mx-1 sm:mx-8" ref={searchRef}>
            <div className="relative">
              <div className="relative flex items-center bg-white rounded-full shadow-sm sm:shadow-lg border border-gray-200 hover:shadow-md sm:hover:shadow-xl transition-shadow duration-200">
                {/* Search Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    setShowPlaceholder(false);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setShowPlaceholder(searchValue === '')}
                  onKeyDown={handleKeyDown}
                  placeholder="검색어를 입력하세요"
                  className="flex-1 py-2 sm:py-4 px-3 sm:px-5 bg-transparent border-none outline-none text-sm sm:text-base min-w-0"
                  autoComplete="off"
                />
                
                {/* Right Icons */}
                <div className="flex items-center space-x-1 sm:space-x-2 pr-2 sm:pr-4 flex-shrink-0">
                  <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleSearch}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {/* 검색어가 있을 때 - 필터링된 결과 */}
                  {searchValue.trim() && filteredSuggestions.length > 0 && (
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">검색 결과</div>
                      {filteredSuggestions.map((item, index) => (
                        <button
                          key={item.keyword}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionClick(item)}
                          onMouseEnter={() => setSelectedSuggestionIndex(index)}
                          className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                            selectedSuggestionIndex === index 
                              ? 'bg-green-50' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-xl mr-3 flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{item.keyword}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 검색어가 있는데 결과 없을 때 */}
                  {searchValue.trim() && filteredSuggestions.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">"{searchValue}" 에 대한 결과가 없습니다</p>
                      <p className="text-xs text-gray-400 mt-1">다른 키워드로 검색해보세요</p>
                    </div>
                  )}

                  {/* 검색어가 없을 때 - 인기 검색어 + 바로가기 */}
                  {!searchValue.trim() && (
                    <div className="py-2">
                      {/* 인기 검색어 */}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> 인기 검색어
                      </div>
                      {trendingKeywords.map((keyword, index) => (
                        <button
                          key={keyword}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSearchValue(keyword);
                            setShowSuggestions(true);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${
                            index < 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700">{keyword}</span>
                        </button>
                      ))}
                      
                      {/* 빠른 바로가기 */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> 바로가기
                        </div>
                        <div className="px-4 py-2 flex flex-wrap gap-2">
                          {searchableItems.slice(0, 8).map(item => (
                            <button
                              key={item.keyword}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSuggestionClick(item)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-green-100 text-sm text-gray-700 hover:text-green-700 rounded-full transition-colors"
                            >
                              {item.icon} {item.keyword}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onNStudyHubToggle}
              className={`text-sm cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text transition-all duration-300 font-medium px-3 py-1.5 rounded-md ${
                isNStudyHubOpen 
                  ? 'bg-blue-100 shadow-sm text-transparent' 
                  : 'text-gray-600 hover:text-transparent hover:bg-blue-50 hover:shadow-sm'
              }`}
            >
              CSM {isNStudyHubOpen ? '▼' : '▶'}
            </button>
            {currentUser?.region && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <span className="text-orange-600 text-lg">📍</span>
                <span className="text-sm font-semibold text-orange-700">{currentUser.region}</span>
              </div>
            )}
            <UserProfileDropdown currentUser={currentUser} onLoginClick={onLoginClick} />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onNStudyHubToggle}
              className={`text-xs bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text font-medium cursor-pointer ${
                isNStudyHubOpen ? 'text-transparent' : 'text-transparent'
              }`}
            >
              CSM {isNStudyHubOpen ? '▼' : '▶'}
            </button>
            {currentUser?.region && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-50 to-red-50 rounded-md border border-orange-200">
                <span className="text-orange-600 text-sm">📍</span>
                <span className="text-xs font-semibold text-orange-700">{currentUser.region}</span>
              </div>
            )}
            <UserProfileDropdown currentUser={currentUser} onLoginClick={onLoginClick} />
          </div>
        </div>

        {/* Service Navigation - Responsive */}
        <nav className="mt-3 sm:mt-4 -mx-3 sm:-mx-0 px-3 sm:px-0">
          <div className="flex items-center space-x-3 sm:space-x-8 text-sm sm:text-base overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <button 
              onClick={() => scrollToSection('visa-documents', 'visa-documents-mobile')}
              className="hover:text-green-600 whitespace-nowrap"
            >
              비자/서류
            </button>
            <button 
              onClick={() => scrollToSection('education', 'education-mobile')}
              className="hover:text-green-600 whitespace-nowrap"
            >
              교육
            </button>
            <button 
              onClick={() => onNavigate?.('realestate')}
              className="hover:text-green-600 whitespace-nowrap font-medium"
            >
              부동산
            </button>
            <button 
              onClick={() => {
                onYellowPagesSelect('엘로우페이지');
                scrollToSection('yellowpages', 'yellowpages-mobile');
              }}
              className="hover:text-green-600 whitespace-nowrap"
            >
              엘로우 페이지
            </button>
            <button 
              onClick={() => scrollToSection('auto', 'auto-mobile')}
              className="hover:text-green-600 whitespace-nowrap"
            >
              자동차
            </button>
            <button 
              onClick={() => {
                onCategorySelect('중국소식');
                scrollToSection('news', 'news-mobile');
              }}
              className="hover:text-green-600 whitespace-nowrap"
            >
              중국소식
            </button>
            <button 
              onClick={() => scrollToSection('used-market', 'used-market-mobile')}
              className="hover:text-green-600 whitespace-nowrap"
            >
              화개장터
            </button>
            <button 
              onClick={() => scrollToSection('securities', 'securities-mobile')}
              className="hover:text-green-600 whitespace-nowrap"
            >
              중국 증권
            </button>
            <button 
              onClick={() => onNavigate?.('chinalife')}
              className="hover:text-green-600 whitespace-nowrap"
            >
              게시판
            </button>
            
            {/* 학습 센터 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-green-600 whitespace-nowrap flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-all">
                  <span className="text-purple-600 font-semibold">학습 센터</span>
                  <span className="text-purple-400">▼</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white shadow-xl">
                {/* HSK - 외부 링크 */}
                <DropdownMenuItem 
                  onClick={() => {
                    const hskUrl = localStorage.getItem('hskLinkUrl') || 'https://www.hsk.org.cn';
                    window.open(hskUrl, '_blank');
                  }}
                  className="cursor-pointer hover:bg-yellow-50 py-3 px-4"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-semibold text-gray-800">HSK</div>
                      <div className="text-xs text-gray-500">중국어 능력 시험</div>
                    </div>
                    <span className="text-gray-400 text-xs">🔗</span>
                  </div>
                </DropdownMenuItem>
                
                {/* SAT/ACT - 외부 링크 */}
                <DropdownMenuItem 
                  onClick={() => window.open('https://your-sat-site.com', '_blank')}
                  className="cursor-pointer hover:bg-blue-50 py-3 px-4"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-semibold text-gray-800">SAT/ACT</div>
                      <div className="text-xs text-gray-500">SAT & ACT 시험 준비</div>
                    </div>
                    <span className="text-gray-400 text-xs">🔗</span>
                  </div>
                </DropdownMenuItem>
                
                {/* TOEFL/IELTS - 외부 링크 */}
                <DropdownMenuItem 
                  onClick={() => window.open('https://your-toefl-site.com', '_blank')}
                  className="cursor-pointer hover:bg-orange-50 py-3 px-4"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-semibold text-gray-800">TOEFL/IELTS</div>
                      <div className="text-xs text-gray-500">영어 능력 시험</div>
                    </div>
                    <span className="text-gray-400 text-xs">🔗</span>
                  </div>
                </DropdownMenuItem>
                
                {/* AP/IB/A-level - 외부 링크 */}
                <DropdownMenuItem 
                  onClick={() => window.open('https://your-apib-site.com', '_blank')}
                  className="cursor-pointer hover:bg-purple-50 py-3 px-4"
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-semibold text-gray-800">AP/IB/A-level</div>
                      <div className="text-xs text-gray-500">국제 교육 과정</div>
                    </div>
                    <span className="text-gray-400 text-xs">🔗</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {currentUserRegion && (
              <button 
                className="flex items-center px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 whitespace-nowrap font-semibold animate-pulse"
                onClick={() => {
                  onYellowPagesSelect('엘로우페이지');
                  scrollToSection('yellowpages', 'yellowpages-mobile');
                }}
              >
                <span className="mr-1.5 text-base">📍</span>
                <span>{currentUserRegion}</span>
              </button>
            )}
          </div>
        </nav>
      </div>


    </header>
  );
}