import { useState } from 'react';
import { ArrowLeft, Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface NewsPageProps {
  onBack: () => void;
}

export function NewsPage({ onBack }: NewsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const handleViewDetails = (news: any) => {
    setSelectedNews(news);
  };

  const handleBackToList = () => {
    setSelectedNews(null);
  };

  const categories = ['전체', '정치', '경제', '사회', '국제', '스포츠', '연예', '과학/IT'];

  const newsItems = [
    {
      id: 1,
      title: "중국 경제성장률 5.2% 기록, 전년 대비 상승세 지속",
      content: "중국 국가통계국이 발표한 최신 경제 지표에 따르면, 올해 3분기 GDP 성장률이 5.2%를 기록하며 정부 목표치를 상회했다고 밝혔다.",
      source: "차이나데일리",
      time: "30분 전",
      category: "경제",
      image: "https://images.unsplash.com/photo-1758819285242-afa776cc4e65?w=400&h=250&fit=crop",
      views: 1250,
      isBreaking: true
    },
    {
      id: 2,
      title: "상하이 자유무역구 확대, 글로벌 기업 투자 유치 가속화",
      content: "상하이시 정부가 자유무역구 범위를 확대하고 외국인 투자 제한을 완화하는 새로운 정책을 발표했다.",
      source: "상하이데일리",
      time: "1시간 전",
      category: "경제",
      image: "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?w=400&h=250&fit=crop",
      views: 890,
      isBreaking: false
    },
    {
      id: 3,
      title: "중국 AI 반도체 기술, 자립도 80% 돌파",
      content: "중국 최대 반도체 제조업체가 AI 전용 칩 개발에서 큰 진전을 이뤘다고 발표했다.",
      source: "텐센트뉴스",
      time: "2시간 전",
      category: "과학/IT",
      image: "https://images.unsplash.com/photo-1608878777113-e7c0d46fae0d?w=400&h=250&fit=crop",
      views: 2150,
      isBreaking: false
    },
    {
      id: 4,
      title: "베이징 동계올림픽 2주년, 빙설 스포츠 대중화 성과",
      content: "베이징 동계올림픽 개최 2주년을 맞아 중국 내 빙설 스포츠 인구가 크게 증가했다고 발표됐다.",
      source: "베이징일보",
      time: "3시간 전",
      category: "스포츠",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      views: 567,
      isBreaking: false
    },
    {
      id: 5,
      title: "중국 전통문화 축제, 해외 관광객 급증",
      content: "춘절을 맞아 중국 전통문화를 체험하려는 해외 관광객들이 크게 늘어났다.",
      source: "중국문화일보",
      time: "4시간 전",
      category: "사회",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
      views: 1890,
      isBreaking: false
    }
  ];

  const filteredNews = newsItems.filter(item => 
    (selectedCategory === '전체' || item.category === selectedCategory) &&
    (searchTerm === '' || item.title.toLowerCase().includes(searchTerm.toLowerCase()))
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
                {selectedNews.isBreaking && (
                  <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">속보</span>
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
                <div className="flex items-center space-x-1">
                  <span>조회수 {selectedNews.views.toLocaleString()}</span>
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
              <div className="prose max-w-none mb-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {selectedNews.content}
                </p>
                
                <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">상세 내용</h2>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  {selectedNews.content}
                </p>

                {selectedNews.category === "경제" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">주요 경제 지표</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>3분기 GDP 성장률: 5.2% (전년 동기 대비)</li>
                      <li>소비자물가지수(CPI): 전월 대비 0.8% 상승</li>
                      <li>산업생산지수: 전년 동기 대비 4.6% 증가</li>
                      <li>외국인직접투자(FDI): 전년 대비 12% 증가</li>
                      <li>수출입 총액: 전년 동기 대비 8.3% 증가</li>
                    </ul>
                  </>
                )}

                {selectedNews.category === "과학/IT" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">기술 세부사항</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>7나노미터 공정 기술 자립 완성</li>
                      <li>AI 전용 칩셋 성능 30% 향상</li>
                      <li>전력 효율성 40% 개선</li>
                      <li>자체 설계 GPU 코어 탑재</li>
                      <li>양자컴퓨팅 연구 단계 진입</li>
                    </ul>
                  </>
                )}

                {selectedNews.category === "스포츠" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">주요 성과</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>빙설 스포츠 참여 인구 3억 명 돌파</li>
                      <li>전국 스��장 및 빙상장 2,000개소 이상 운영</li>
                      <li>청소년 동계스포츠 프로그램 확대</li>
                      <li>국제 대회 유치 및 개최 증가</li>
                      <li>동계 스포츠 관련 산업 급성장</li>
                    </ul>
                  </>
                )}

                {selectedNews.category === "사회" && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">문화 행사 정보</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                      <li>전통 춘절 축제 전국 500개 도시에서 개최</li>
                      <li>해외 관광객 전년 대비 180% 증가</li>
                      <li>전통 공예 체험 프로그램 인기</li>
                      <li>중국 요리 문화 체험관 확대 운영</li>
                      <li>전통 음악 및 무용 공연 상설화</li>
                    </ul>
                  </>
                )}

                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">전문가 분석</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-green-600">
                  "이번 발표는 중국이 지속가능한 성장을 유지하고 있음을 보여주는 중요한 지표입니다. 
                  특히 첨단 기술 분야와 내수 시장의 동반 성장이 주목할 만한 성과이며, 
                  앞으로도 이러한 추세가 계속될 것으로 전망됩니다."
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">향후 전망</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  전문가들은 중국 경제가 안정적인 성장세를 이어갈 것으로 전망하고 있습니다. 
                  특히 내수 시장 활성화와 기술 혁신이 경제 성장의 주요 동력이 될 것으로 보입니다.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  정부는 지속가능한 발전을 위해 친환경 정책과 디지털 전환을 가속화할 계획이며, 
                  이는 중장기적으로 경제 구조의 질적 개선을 가져올 것으로 기대됩니다.
                </p>
              </div>

              {/* Key Points Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">핵심 요약</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{selectedNews.content}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>전문가들은 향후 지속적인 성장세를 전망</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>정부의 적극적인 정책 지원이 뒷받침</span>
                  </li>
                </ul>
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
              {newsItems.filter(news => 
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
              <h1 className="text-2xl font-bold text-gray-900">뉴스</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="뉴스 검색..."
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
        </div>

        {/* Featured News */}
        {filteredNews.length > 0 && (
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
                  {filteredNews[0].isBreaking && (
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">속보</span>
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded">
                      {filteredNews[0].category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {filteredNews[0].title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {filteredNews[0].content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{filteredNews[0].source}</span>
                      <span>{filteredNews[0].time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>조회수: {filteredNews[0].views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* News List — compact */}
        <div className="space-y-2">
          {filteredNews.slice(1).map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(item)}>
              <div className="flex gap-3 p-3">
                <img src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-medium rounded">{item.category}</span>
                    {item.isBreaking && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-bold rounded">속보</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">{item.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1">{item.content}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{item.source}</span><span>·</span><span>{item.time}</span><span>· 조회 {item.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredNews.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">검색 결과가 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}