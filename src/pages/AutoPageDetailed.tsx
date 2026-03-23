import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Car, Star, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface AutoPageProps {
  onBack: () => void;
}

export function AutoPage({ onBack }: AutoPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const handleViewDetails = (news: any) => {
    setSelectedNews(news);
  };

  const handleBackToList = () => {
    setSelectedNews(null);
  };

  const categories = ['전체', '신차정보', '중고차', '전기차', '자동차리뷰', '튜닝', '자동차용품'];

  const autoNews = [
    {
      id: 1,
      title: "2024년 최신 중국산 전기차, 글로벌 시장 점유율 40% 돌파",
      description: "중국의 전기차 브랜드들이 기술 혁신과 가격 경쟁력을 앞세워 글로벌 시장에서 빠르게 성장하고 있습니다. BYD, NIO, XPeng 등 주요 브랜드들의 최신 동향을 살펴봅니다.",
      category: "전기차",
      source: "차이나오토뉴스",
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1593941707445-24ecad1b9d5b?w=400&h=250&fit=crop",
      likes: 1234,
      views: 45670,
      isHot: true,
      price: "-",
      tags: ["BYD", "NIO", "전기차", "글로벌시장"]
    },
    {
      id: 2,
      title: "베이징 모터쇼 2024, 혁신적인 자율주행 기술 공개",
      description: "베이징에서 열린 국제 모터쇼에서 중국 자동차 제조업체들이 차세대 자율주행 기술을 대거 공개했습니다.",
      category: "신차정보",
      source: "모터쇼뉴스",
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
      likes: 892,
      views: 23450,
      isHot: false,
      price: "-",
      tags: ["베이징모터쇼", "자율주행", "신기술"]
    },
    {
      id: 3,
      title: "중국 중고차 시장 분석, 2024년 거래량 20% 증가 전망",
      description: "중국의 중고차 시장이 지속적으로 성장하고 있으며, 올해 거래량이 전년 대비 20% 증가할 것으로 예상됩니다.",
      category: "중고차",
      source: "중고차매거진",
      time: "6시간 전",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop",
      likes: 567,
      views: 18920,
      isHot: false,
      price: "시세조회",
      tags: ["중고차", "시장분석", "거래량증가"]
    }
  ];

  const filteredNews = autoNews.filter(news => 
    (selectedCategory === '전체' || news.category === selectedCategory) &&
    (searchTerm === '' || news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     news.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 상세 페이지 렌더링
  if (selectedNews) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                onClick={handleBackToList}
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로</span>
              </Button>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Car className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium rounded">
                    {selectedNews.category}
                  </span>
                  {selectedNews.isHot && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 text-sm font-bold rounded">HOT</span>
                  )}
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {selectedNews.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <span>{selectedNews.source}</span>
                  <span>{selectedNews.time}</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Filter className="w-4 h-4" />
                    <span>조회수 {selectedNews.views?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>좋아요 {selectedNews.likes?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Article Image */}
              <div className="mb-8">
                <img 
                  src={selectedNews.image} 
                  alt={selectedNews.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg"
                />
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className="text-lg text-gray-800 font-medium mb-6">
                    {selectedNews.description}
                  </p>
                  
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-blue-900 mb-3">주요 특징</h3>
                    <ul className="space-y-2 text-blue-800">
                      <li>• 최신 자동차 기술과 트렌드를 반영한 정보입니다</li>
                      <li>• 전문가의 분석과 평가를 포함하고 있습니다</li>
                      <li>• 실제 사용자 후기와 경험담을 제공합니다</li>
                      <li>• 가격 정보와 구매 가이드를 안내합니다</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">상세 정보</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-gray-900">기술 사양</h4>
                        <p className="text-gray-600">최신 기술이 적용된 혁신적인 사양과 성능을 확인하세요.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-gray-900">안전성</h4>
                        <p className="text-gray-600">다양한 안전 기능과 보안 시스템이 탑재되어 있습니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-gray-900">연비 및 성능</h4>
                        <p className="text-gray-600">뛰어난 연료 효율성과 강력한 성능을 동시에 제공합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium text-gray-900">가격 대비 성능</h4>
                        <p className="text-gray-600">합리적인 가격으로 최고의 가치를 제공하는 선택입니다.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg mt-8">
                    <h3 className="font-semibold text-green-900 mb-3">구매 팁</h3>
                    <ul className="space-y-2 text-green-800">
                      <li>• 다양한 딜러샵을 방문하여 가격을 비교해보세요</li>
                      <li>• 시승을 통해 직접 성능을 체험해보는 것이 중요합니다</li>
                      <li>• 할부 조건과 보험료도 함께 고려하세요</li>
                      <li>• A/S 서비스와 부품 공급 상황을 확인하세요</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {selectedNews.tags?.map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Related Articles */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">관련 자동차 정보</h3>
                    <div className="space-y-4">
                      {autoNews.filter(news => news.id !== selectedNews.id && news.category === selectedNews.category).slice(0, 3).map((news) => (
                        <div key={news.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => handleViewDetails(news)}>
                          <div className="flex space-x-3">
                            <img src={news.image} alt={news.title} className="w-16 h-12 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{news.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{news.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">자동차 서비스</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Car className="w-4 h-4 mr-2" />
                        차량 검색
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        시승 예약
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        가격 비교
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Contact Info */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">문의하기</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">자동차 상담</p>
                        <p className="text-gray-600">+86-10-1234-5678</p>
                      </div>
                      <div>
                        <p className="font-medium">이메일</p>
                        <p className="text-gray-600">auto@chinaup.com</p>
                      </div>
                      <div>
                        <p className="font-medium">상담시간</p>
                        <p className="text-gray-600">평일 09:00-18:00</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
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
                  placeholder="자동차 정보 검색..."
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
        {/* Quick Access */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">자동차 서비스</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Car className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium text-sm">신차 검색</h3>
              <p className="text-xs text-gray-500">최신 모델</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium text-sm">중고차</h3>
              <p className="text-xs text-gray-500">시세 조회</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium text-sm">가격 비교</h3>
              <p className="text-xs text-gray-500">딜러별 가격</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium text-sm">시승 예약</h3>
              <p className="text-xs text-gray-500">체험 신청</p>
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
            총 {filteredNews.length}개 기사
          </div>
        </div>

        {/* Auto News List */}
        <div className="space-y-6">
          {filteredNews.map((news) => (
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