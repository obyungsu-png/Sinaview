import { useState } from 'react';
import { ArrowLeft, Search, Filter, Car, Zap, Star, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CommentSection } from '../components/CommentSection';

interface AutoPageProps {
  onBack: () => void;
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export function AutoPage({ onBack, currentUser, isAdmin }: AutoPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const handleViewDetails = (news: any) => {
    setSelectedNews(news);
  };

  const handleBackToList = () => {
    setSelectedNews(null);
  };

  const categories = ['전체', '중국신차', '전기차', 'BYD', 'NIO', '자율주행', '시장분석', '정책'];

  const autoNews = [
    {
      id: 1,
      title: "BYD 한(Han) EV, 중국 럭셔리 전기차 시장 강세",
      description: "BYD의 플래그십 전기차 모델인 한(Han) EV가 중국 럭셔리 전기차 시장에서 강세를 보이고 있습니다. 최신 배터리 기술과 프리미엄 인테리어로 테슬라와 경쟁하고 있습니다.",
      category: "BYD",
      source: "차이나오토",
      time: "1시간 전",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop",
      likes: 342,
      views: 8920,
      isHot: true,
      price: "약 4,500만원",
      tags: ["BYD", "럭셔리", "전기차", "한EV"]
    },
    {
      id: 2,
      title: "NIO ES8, 배터리 교환 기술로 중국 전기차 혁신 주도",
      description: "NIO의 ES8 모델이 독특한 배터리 교환 기술(Battery Swapping)으로 전기차 충전의 새로운 패러다임을 제시하고 있습니다. 3분 만에 완전 충전이 가능합니다.",
      category: "NIO",
      source: "중국자동차뉴스",
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop",
      likes: 567,
      views: 12340,
      isHot: true,
      price: "약 6,200만원",
      tags: ["NIO", "배터리교환", "ES8", "혁신기술"]
    },
    {
      id: 3,
      title: "샤오미 자동차, 2024년 양산 목표로 전기차 시장 진출",
      description: "스마트폰 제조업체 샤오미가 전기차 시장에 본격 진출합니다. 2024년 첫 양산 모델 출시를 목표로 하며, 스마트폰과 연동되는 혁신적인 기능들을 탑재할 예정입니다.",
      category: "중국신차",
      source: "베이징모터스",
      time: "3시간 전",
      image: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400&h=250&fit=crop",
      likes: 234,
      views: 5670,
      isHot: false,
      price: "예상 3,000만원대",
      tags: ["샤오미", "신규진출", "스마트카", "2024출시"]
    },
    {
      id: 4,
      title: "중국 자율주행차 정책, 바이두 아폴로 프로젝트 확대",
      description: "중국 정부가 자율주행차 상용화를 위한 정책을 발표했습니다. 바이두의 아폴로 프로젝트가 베이징, 상하이 등 주요 도시로 확대 운영됩니다.",
      category: "자율주행",
      source: "중국IT뉴스",
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
      likes: 445,
      views: 7890,
      isHot: false,
      price: "-",
      tags: ["자율주행", "바이두", "아폴로", "정책"]
    },
    {
      id: 5,
      title: "중국 전기차 수출 급증, 유럽 시장 점유율 확대",
      description: "중국 전기차의 유럽 수출이 전년 대비 200% 증가했습니다. BYD, NIO, XPeng 등 중국 브랜드들이 유럽 시장에서 빠르게 성장하고 있습니다.",
      category: "시장분석",
      source: "글로벌오토",
      time: "5시간 전",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=250&fit=crop",
      likes: 678,
      views: 15670,
      isHot: true,
      price: "-",
      tags: ["수출급증", "유럽진출", "시장점유율", "성장"]
    },
    {
      id: 6,
      title: "중국 전기차 배터리 기술 혁신, CATL 신기술 발표",
      description: "세계 최대 배터리 제조업체 CATL이 새로운 배터리 기술을 발표했습니다. 1회 충전으로 1000km 주행이 가능하며, 10분 내 80% 급속충전을 지원합니다.",
      category: "전기차",
      source: "배터리뉴스",
      time: "6시간 전",
      image: "https://images.unsplash.com/photo-1593941707445-24ecad1b9d5b?w=400&h=250&fit=crop",
      likes: 890,
      views: 23450,
      isHot: true,
      price: "-",
      tags: ["CATL", "배터리기술", "1000km", "급속충전"]
    }
  ];

  const filteredNews = autoNews.filter(news => 
    (selectedCategory === '전체' || news.category === selectedCategory) &&
    (searchTerm === '' || news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     news.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // If viewing detailed article
  if (selectedNews) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBackToList} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">기사 상세보기</h1>
            </div>
          </div>
        </div>

        {/* Article Detail */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Article Header */}
            <div className="p-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium rounded">
                  {selectedNews.category}
                </span>
                {selectedNews.isHot && (
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">HOT</span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {selectedNews.title}
              </h1>

              <div className="flex items-center justify-between text-sm text-gray-500 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">{selectedNews.source}</span>
                  <span>{selectedNews.time}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>조회수 {selectedNews.views.toLocaleString()}</span>
                  <span>좋아요 {selectedNews.likes}</span>
                </div>
              </div>
            </div>

            {/* Article Image */}
            <div className="w-full">
              <img 
                src={selectedNews.image} 
                alt={selectedNews.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Article Content */}
            <div className="p-8">
              {selectedNews.price !== "-" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">차량 가격 정보</h3>
                  <p className="text-2xl font-bold text-green-600">{selectedNews.price}</p>
                </div>
              )}

              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {selectedNews.description}
                </p>
                
                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">상세 내용</h2>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedNews.description}
                </p>

                {selectedNews.category === "BYD" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">주요 특징</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>차세대 블레이드 배터리 탑재로 안전성과 주행거리 향상</li>
                      <li>최신 DiLink 4.0 인포테인먼트 시스템</li>
                      <li>L2+ 레벨 자율주행 보조 시스템</li>
                      <li>프리미엄 가죽 내장재 및 럭셔리 인테리어</li>
                      <li>0-100km/h 가속 3.9초 (고성능 버전)</li>
                    </ul>
                  </>
                )}

                {selectedNews.category === "NIO" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">혁신 기술</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>배터리 교환 스테이션 전국 2,000개소 이상 운영</li>
                      <li>3분 이내 완전 충전 가능한 배터리 스왑 기술</li>
                      <li>NIO Pilot 자율주행 시스템</li>
                      <li>NOMI AI 비서 탑재</li>
                      <li>7인승 SUV로 넉넉한 실내 공간</li>
                    </ul>
                  </>
                )}

                {selectedNews.category === "중국신차" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">출시 예정 정보</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>2024년 상반기 양산 시작 예정</li>
                      <li>샤오미 생태계와 완벽한 연동</li>
                      <li>스마트폰으로 차량 제어 가능</li>
                      <li>중급 세단 시장 공략</li>
                      <li>중국 내수 및 글로벌 시장 동시 진출</li>
                    </ul>
                  </>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">전문가 의견</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-green-600">
                  "중국 전기차 시장은 급격한 성장세를 보이고 있으며, 기술력과 가격 경쟁력을 모두 갖춘 
                  제품들이 속속 출시되고 있습니다. 특히 배터리 기술의 발전으로 주행거리와 충전 시간이 
                  대폭 개선되어 소비자들의 관심이 높아지고 있습니다."
                </p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">관련 태그</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNews.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1.5 text-sm rounded-full hover:bg-gray-200 cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share and Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    공유하기
                  </Button>
                  <Button variant="outline" size="sm">
                    북마크
                  </Button>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleBackToList}
                >
                  목록으로
                </Button>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 기사</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {autoNews.filter(news => 
                news.id !== selectedNews.id && 
                news.category === selectedNews.category
              ).slice(0, 2).map((relatedNews) => (
                <Card 
                  key={relatedNews.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(relatedNews)}
                >
                  <div className="flex">
                    <div className="w-1/3">
                      <img 
                        src={relatedNews.image} 
                        alt={relatedNews.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium rounded">
                        {relatedNews.category}
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 mt-2 line-clamp-2">
                        {relatedNews.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">{relatedNews.source} · {relatedNews.time}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-12">
            <CommentSection 
              pageType="auto"
              itemId={selectedNews.id} 
              currentUser={currentUser} 
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">자동차</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="자동차 뉴스 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">중국 자동차 시장 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium text-sm">월간 판매량</h3>
              <p className="text-lg font-bold text-blue-600">2.8M대</p>
              <p className="text-xs text-green-600">↑15.2%</p>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium text-sm">전기차 비율</h3>
              <p className="text-lg font-bold text-green-600">35.6%</p>
              <p className="text-xs text-green-600">↑8.3%</p>
            </Card>
            <Card className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium text-sm">인기 브랜드</h3>
              <p className="text-lg font-bold text-purple-600">BYD</p>
              <p className="text-xs text-purple-600">점유율 1위</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium text-sm">수출 증가율</h3>
              <p className="text-lg font-bold text-orange-600">+67%</p>
              <p className="text-xs text-orange-600">전년 대비</p>
            </Card>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">카테고리</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            총 {filteredNews.length}개 뉴스
          </div>
        </div>

        {/* Featured Article */}
        {filteredNews.length > 0 && filteredNews[0].isHot && (
          <div className="mb-8">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/5">
                  <img 
                    src={filteredNews[0].image} 
                    alt={filteredNews[0].title}
                    className="w-full h-32 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-4/5 p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">HOT</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium rounded">
                      {filteredNews[0].category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {filteredNews[0].title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {filteredNews[0].description}
                  </p>
                  {filteredNews[0].price !== "-" && (
                    <div className="mb-4">
                      <span className="text-lg font-bold text-green-600">{filteredNews[0].price}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{filteredNews[0].source}</span>
                      <span>{filteredNews[0].time}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>조회수: {filteredNews[0].views.toLocaleString()}</span>
                      <span>좋아요: {filteredNews[0].likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* News List */}
        <div className="grid gap-6">
          {filteredNews.slice(1).map((news) => (
            <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="md:flex">
                <div className="md:w-1/6">
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-28 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-5/6 p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium rounded">
                      {news.category}
                    </span>
                    {news.isHot && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded">HOT</span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {news.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {news.description}
                  </p>
                  
                  {news.price !== "-" && (
                    <div className="mb-3">
                      <span className="text-lg font-bold text-green-600">{news.price}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {news.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{news.source}</span>
                      <span>{news.time}</span>
                      <span>조회수: {news.views.toLocaleString()}</span>
                      <span>좋아요: {news.likes}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleViewDetails(news)}
                    >
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}