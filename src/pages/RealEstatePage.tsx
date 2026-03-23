import { ArrowLeft, Home, MapPin, Bed, Bath, Square, TrendingUp, Search, Filter } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface RealEstatePageProps {
  onBack: () => void;
}

export function RealEstatePage({ onBack }: RealEstatePageProps) {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['전체', '매매', '전세', '월세', '상가', '오피스텔'];

  const properties = [
    {
      id: 1,
      title: '베이징 차오양구 고급 아파트',
      price: '12억원',
      type: '매매',
      location: '차오양구 CBD',
      area: '85㎡',
      rooms: 3,
      bathrooms: 2,
      floor: '15/25층',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      isHot: true,
      description: '지하철역 도보 5분, 명문학군, 풀옵션',
      views: 1234,
      date: '1일 전'
    },
    {
      id: 2,
      title: '상하이 황푸구 신축 오피스텔',
      price: '8.5억원',
      type: '매매',
      location: '황푸구 인민광장',
      area: '45㎡',
      rooms: 1,
      bathrooms: 1,
      floor: '20/30층',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      isHot: true,
      description: '신축 건물, 한국인 밀집지역',
      views: 892,
      date: '2일 전'
    },
    {
      id: 3,
      title: '선전 난산구 아파트',
      price: '6.2억원',
      type: '매매',
      location: '난산구 과학기술단지',
      area: '78㎡',
      rooms: 2,
      bathrooms: 2,
      floor: '10/18층',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      isHot: false,
      description: 'IT 기업 밀집지역, 교통 편리',
      views: 567,
      date: '3일 전'
    },
    {
      id: 4,
      title: '베이징 하이뎬구 학군 아파트',
      price: '300만원/월',
      type: '월세',
      location: '하이뎬구 중관촌',
      area: '92㎡',
      rooms: 3,
      bathrooms: 2,
      floor: '8/15층',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      isHot: false,
      description: '명문대 인근, 한국 마트 도보 거리',
      views: 423,
      date: '4일 전'
    },
    {
      id: 5,
      title: '상하이 푸동 신구 오피스',
      price: '15억원',
      type: '매매',
      location: '푸동신구 루자쭈이',
      area: '120㎡',
      rooms: 4,
      bathrooms: 3,
      floor: '25/35층',
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=300&fit=crop',
      isHot: true,
      description: '금융중심지, 강변뷰',
      views: 1567,
      date: '5일 전'
    },
    {
      id: 6,
      title: '광저우 톈허구 상가',
      price: '9억원',
      type: '매매',
      location: '톈허구 상권',
      area: '65㎡',
      rooms: 0,
      bathrooms: 1,
      floor: '1층',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      isHot: false,
      description: '한국인 상권, 높은 유동인구',
      views: 789,
      date: '1주일 전'
    },
    {
      id: 7,
      title: '베이징 순이구 전세 아파트',
      price: '2억원 (2년)',
      type: '전세',
      location: '순이구 국제공항 인근',
      area: '75㎡',
      rooms: 2,
      bathrooms: 1,
      floor: '12/20층',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      isHot: false,
      description: '공항 접근성 우수, 조용한 주거지',
      views: 345,
      date: '1주일 전'
    },
    {
      id: 8,
      title: '선전 푸톈구 럭셔리 아파트',
      price: '18억원',
      type: '매매',
      location: '푸톈구 CBD',
      area: '150㎡',
      rooms: 4,
      bathrooms: 3,
      floor: '30/40층',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
      isHot: true,
      description: '최고급 주거단지, 수영장/헬스장',
      views: 2341,
      date: '2주일 전'
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesCategory = activeCategory === '전체' || property.type === activeCategory;
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <Home className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-bold">중국 부동산</h1>
              </div>
            </div>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="지역, 단지명으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              <button className="absolute right-3 top-2.5">
                <Filter className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{filteredProperties.length}</div>
            <div className="text-sm text-gray-600 mt-1">매물 수</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">12.5억</div>
            <div className="text-sm text-gray-600 mt-1">평균 가격</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">+5.2%</div>
            <div className="text-sm text-gray-600 mt-1">전월 대비</div>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <ImageWithFallback
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                {property.isHot && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    HOT
                  </Badge>
                )}
                <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                  {property.type}
                </Badge>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {property.title}
                </h3>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {property.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                  {property.rooms > 0 && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.rooms}개</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms}개</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    <span>{property.area}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-lg font-bold text-green-600">
                    {property.price}
                  </div>
                  <div className="text-xs text-gray-500">
                    조회 {property.views.toLocaleString()} • {property.date}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}

        {/* Info Banner */}
        <Card className="mt-8 p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-lg mb-2">부동산 거래 안내</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 중국 부동산 거래는 외국인에게 제한이 있을 수 있습니다</li>
            <li>• 반드시 전문가와 상담 후 진행하시기 바랍니다</li>
            <li>• 계약 전 부동산 등기부등본과 권리관계를 확인하세요</li>
            <li>• Sina View 부동산은 정보 제공만 하며, 거래 책임은 당사자에게 있습니다</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
