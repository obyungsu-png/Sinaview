// 지원 언어 타입
export type Language = 'ko' | 'en' | 'ja';

// 언어별 텍스트 정의
export const translations = {
  ko: {
    // Header
    newsroom: '뉴스룸',
    education: '교육',
    temu: '테무',
    alibaba: '알리바바',
    shopping: '쇼핑',
    automobile: '자동차',
    securities: '증권',
    realEstate: '부동산',
    usedMarket: '당근시장',
    visaDocuments: '비자/서류',
    translate: '번역',
    calendar: '캘린더',
    map: '지도',
    searchPlaceholder: 'AI 검색',
    
    // News Section
    newsTitle: '뉴스',
    latestNews: '최신 뉴스',
    
    // Shopping Section
    shoppingTitle: '쇼핑',
    todaysDeals: '오늘의 특가',
    viewMore: '더보기',
    
    // Weather Widget
    weatherTitle: '날씨',
    temperature: '°C',
    humidity: '습도',
    wind: '바람',
    
    // Stock Widget
    stockTitle: '증권',
    shanghaI: '상해종합',
    shenzhen: '심천종합',
    kospi: 'KOSPI',
    nasdaq: 'NASDAQ',
    
    // Calendar Widget
    calendarTitle: '캘린더',
    today: '오늘',
    
    // Blog Section
    blogTitle: '블로그',
    cafeTitle: '카페',
    popularPosts: '인기글',
    recentPosts: '최신글'
  },
  en: {
    // Header
    newsroom: 'Newsroom',
    education: 'Education',
    temu: 'Temu',
    alibaba: 'Alibaba',
    shopping: 'Shopping',
    automobile: 'Automobile',
    securities: 'Securities',
    realEstate: 'Real Estate',
    usedMarket: 'Used Market',
    visaDocuments: 'Visa/Documents',
    translate: 'Language',
    calendar: 'Calendar',
    map: 'Map',
    searchPlaceholder: 'AI Search',
    
    // News Section
    newsTitle: 'News',
    latestNews: 'Latest News',
    
    // Shopping Section
    shoppingTitle: 'Shopping',
    todaysDeals: 'Today\'s Deals',
    viewMore: 'View More',
    
    // Weather Widget
    weatherTitle: 'Weather',
    temperature: '°C',
    humidity: 'Humidity',
    wind: 'Wind',
    
    // Stock Widget
    stockTitle: 'Stocks',
    shanghaI: 'Shanghai Composite',
    shenzhen: 'Shenzhen Composite',
    kospi: 'KOSPI',
    nasdaq: 'NASDAQ',
    
    // Calendar Widget
    calendarTitle: 'Calendar',
    today: 'Today',
    
    // Blog Section
    blogTitle: 'Blog',
    cafeTitle: 'Cafe',
    popularPosts: 'Popular Posts',
    recentPosts: 'Recent Posts'
  },
  ja: {
    // Header
    newsroom: 'ニュースルーム',
    education: '教育',
    temu: 'テム',
    alibaba: 'アリババ',
    shopping: 'ショッピング',
    automobile: '自動車',
    securities: '証券',
    realEstate: '不動産',
    usedMarket: '中古市場',
    visaDocuments: 'ビザ/書類',
    translate: '言語',
    calendar: 'カレンダー',
    map: '地図',
    searchPlaceholder: 'AI検索',
    
    // News Section
    newsTitle: 'ニュース',
    latestNews: '最新ニュース',
    
    // Shopping Section
    shoppingTitle: 'ショッピング',
    todaysDeals: '今日のお得情報',
    viewMore: 'もっと見る',
    
    // Weather Widget
    weatherTitle: '天気',
    temperature: '°C',
    humidity: '湿度',
    wind: '風',
    
    // Stock Widget
    stockTitle: '株式',
    shanghaI: '上海総合',
    shenzhen: '深セン総合',
    kospi: 'KOSPI',
    nasdaq: 'NASDAQ',
    
    // Calendar Widget
    calendarTitle: 'カレンダー',
    today: '今日',
    
    // Blog Section
    blogTitle: 'ブログ',
    cafeTitle: 'カフェ',
    popularPosts: '人気投稿',
    recentPosts: '最新投稿'
  }
};

// 언어별 국기 이모지
export const languageFlags = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵'
};

// 언어별 이름
export const languageNames = {
  ko: '한국어',
  en: 'English',
  ja: '日本語'
};