import { useState } from 'react';
import { ArrowLeft, Search, Filter, Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface BlogPageProps {
  onBack: () => void;
}

export function BlogPage({ onBack }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['전체', '여행', '일상', '요리', '문화', '비즈니스', '교육', '기술'];

  const blogPosts = [
    {
      id: 1,
      title: "베이징 겨울 여행 완벽 가이드 - 자금성에서 만리장성까지",
      description: "베이징의 겨울은 춥지만 그만큼 매력적입니다. 눈 덮인 자금성의 아름다움과 한적한 만리장성을 즐길 수 있는 겨울 여행 코스를 소개합니다. 현지인만 아는 숨은 맛집과 따뜻한 실내 관광지도 함께 안내드립니다.",
      category: "여행",
      author: "차이나트래블러",
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=250&fit=crop",
      likes: 1234,
      comments: 89,
      views: 15678,
      isPopular: true,
      tags: ["베이징", "겨울여행", "자금성", "만리장성", "맛집"]
    },
    {
      id: 2,
      title: "상하이에서 경험한 중국 전통차 문화의 깊이",
      description: "상하이 예원 근처 전통 찻집에서 경험한 중국 차 문화에 대한 이야기입니다. 다기 사용법부터 차를 우리는 예법까지, 한국과는 다른 중국만의 독특한 차 문화를 자세히 소개합니다.",
      category: "문화",
      author: "티마스터",
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1563822249366-9c07e51a506a?w=400&h=250&fit=crop",
      likes: 567,
      comments: 45,
      views: 8920,
      isPopular: false,
      tags: ["상하이", "차문화", "전통", "예원", "찻집"]
    },
    {
      id: 3,
      title: "중국 현지 직장에서 살아남는 비즈니스 매너 10가지",
      description: "중국 회사에서 3년간 근무하며 배운 현지 비즈니스 문화와 매너에 대해 공유합니다. 회식 문화, 명함 교환법, 회의 진행 방식 등 한국과 다른 점들을 실전 경험을 바탕으로 설명드립니다.",
      category: "비즈니스",
      author: "차이나비즈맨",
      time: "6시간 전",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop",
      likes: 890,
      comments: 67,
      views: 12340,
      isPopular: true,
      tags: ["비즈니스매너", "회사문화", "중국직장", "회식", "회의"]
    },
    {
      id: 4,
      title: "집에서 만드는 정통 마라탕 레시피 - 향신료부터 육수까지",
      description: "청두에서 배운 정통 마라탕 만드는 법을 공개합니다. 현지에서 구입한 정통 향신료 사용법과 깊은 맛의 육수 끓이는 비법까지, 집에서도 현지 맛을 재현할 수 있는 완벽한 레시피입니다.",
      category: "요리",
      author: "마라탕마니아",
      time: "8시간 전",
      image: "https://images.unsplash.com/photo-1606956916955-8eaae20ec43b?w=400&h=250&fit=crop",
      likes: 2145,
      comments: 156,
      views: 28790,
      isPopular: true,
      tags: ["마라탕", "청두", "향신료", "육수", "중국요리"]
    },
    {
      id: 5,
      title: "HSK 6급 합격 후기 - 3개월 집중 학습법 공개",
      description: "3개월 만에 HSK 6급에 합격한 나만의 학습법을 공유합니다. 효과적인 단어 암기법, 듣기 실력 향상 방법, 작문 팁까지 실전에서 검증된 학습 전략을 상세히 설명드립니다.",
      category: "교육",
      author: "중국어마스터",
      time: "10시간 전",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      likes: 3456,
      comments: 234,
      views: 45670,
      isPopular: true,
      tags: ["HSK6급", "중국어공부", "학습법", "단어암기", "작문팁"]
    },
    {
      id: 6,
      title: "중국 일상 속 디지털 생활 - 위챗페이부터 딜리버리까지",
      description: "중국에서의 일상은 모든 것이 디지털로 연결되어 있습니다. 위챗페이 사용법, 음식 주문 앱, 교통카드 앱 등 중국 생활에 필수적인 디지털 도구들의 사용법을 정리했습니다.",
      category: "일상",
      author: "디지털노마드",
      time: "12시간 전",
      image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=250&fit=crop",
      likes: 1567,
      comments: 78,
      views: 19890,
      isPopular: false,
      tags: ["위챗페이", "디지털생활", "앱사용법", "중국생활", "결제시스템"]
    }
  ];

  const filteredPosts = blogPosts.filter(post => 
    (selectedCategory === '전체' || post.category === selectedCategory) &&
    (searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     post.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBack}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">뷰(VIEW)</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="블로그 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                글쓰기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Popular Posts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">인기 게시물</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogPosts.filter(post => post.isPopular).slice(0, 3).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-20 object-cover"
                />
                <div className="p-4">
                  <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded mb-2 inline-block">
                    인기
                  </span>
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{post.author}</span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {post.likes}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {post.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
            총 {filteredPosts.length}개 게시물
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="md:flex">
                <div className="md:w-1/6">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-28 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-5/6 p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium rounded">
                      {post.category}
                    </span>
                    {post.isPopular && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded">인기</span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {post.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.author}</span>
                      <span>{post.time}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-500">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes.toLocaleString()}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-green-500">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="px-8">
              더 많은 게시물 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}