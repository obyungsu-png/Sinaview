import { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Phone, Clock, Star, Filter, Map } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface YellowPagesPageProps {
  onBack: () => void;
}

export function YellowPagesPage({ onBack }: YellowPagesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLocation, setSelectedLocation] = useState('대련');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRegion, setUserRegion] = useState('');

  // 사용자 지역 가져오기
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.region) {
        setUserRegion(userData.region);
        setSelectedLocation(userData.region);
      }
    }
  }, []);

  const categories = ['전체', '병원', '음식점', '교육', '서비스', '법무', '번역'];
  const locations = ['대련', '북경', '상해', '심양', '시안', '연변', '연태', '위해', '우한', '청도', '청두'];

  // 사용자 지역을 맨 앞으로 정렬
  const sortedLocations = React.useMemo(() => {
    if (!userRegion) return locations;
    
    const userLocationIndex = locations.findIndex(loc => loc === userRegion);
    if (userLocationIndex === -1) return locations;
    
    const otherLocations = locations.filter(loc => loc !== userRegion);
    return [userRegion, ...otherLocations];
  }, [userRegion]);

  const businesses = [
    {
      id: 1,
      name: "서울대학교",
      category: "학교",
      address: "서울 관악구 관악로 1",
      phone: "02-880-5114",
      rating: 4.8,
      reviews: 2340,
      isOpen: true,
      hours: "24시간",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop",
      description: "대한민국 최고의 국립대학교로 다양한 학부와 대학원 과정을 운영합니다.",
      services: ["학부교육", "대학원교육", "연구"],
      website: "www.snu.ac.kr"
    },
    {
      id: 2,
      name: "삼성서울병원",
      category: "병원",
      address: "서울 강남구 일원로 81",
      phone: "02-3410-2114",
      rating: 4.7,
      reviews: 1890,
      isOpen: true,
      hours: "24시간 응급실",
      image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=200&fit=crop",
      description: "최첨단 의료장비와 우수한 의료진을 갖춘 종합병원입니다.",
      services: ["종합진료", "응급의료", "건강검진"],
      website: "www.samsunghospital.com"
    },
    {
      id: 3,
      name: "YBM 종로센터",
      category: "학원",
      address: "서울 종로구 종로 69",
      phone: "02-2279-4567",
      rating: 4.5,
      reviews: 567,
      isOpen: true,
      hours: "09:00-22:00",
      image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=300&h=200&fit=crop",
      description: "영어, 중국어, 일본어 등 다양한 어학 교육을 제공하는 전문 학원입니다.",
      services: ["영어회화", "토익", "중국어", "일본어"],
      website: "www.ybm.co.kr"
    },
    {
      id: 4,
      name: "국립중앙도서관",
      category: "도서관",
      address: "서울 서초구 반포대로 201",
      phone: "02-590-0500",
      rating: 4.6,
      reviews: 1234,
      isOpen: true,
      hours: "09:00-18:00",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=300&h=200&fit=crop",
      description: "국가대표도서관으로 다양한 자료와 연구공간을 제공합니다.",
      services: ["도서대출", "연구지원", "디지털자료"],
      website: "www.nl.go.kr"
    },
    {
      id: 5,
      name: "세종문화회관",
      category: "문화시설",
      address: "서울 중구 세종대로 175",
      phone: "02-399-1000",
      rating: 4.7,
      reviews: 890,
      isOpen: true,
      hours: "10:00-20:00",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
      description: "다양한 공연과 전시를 즐길 수 있는 복합문화공간입니다.",
      services: ["공연관람", "전시관람", "대관서비스"],
      website: "www.sejongpac.or.kr"
    },
    {
      id: 6,
      name: "올림픽공원 체육관",
      category: "체육시설",
      address: "서울 송파구 올림픽로 424",
      phone: "02-410-1114",
      rating: 4.4,
      reviews: 445,
      isOpen: true,
      hours: "06:00-22:00",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
      description: "다양한 스포츠 시설과 프로그램을 제공하는 종합체육시설입니다.",
      services: ["헬스", "수영", "농구", "배드민턴"],
      website: "www.olympicpark.co.kr"
    }
  ];

  const filteredBusinesses = businesses.filter(business => 
    (selectedCategory === '전체' || business.category === selectedCategory) &&
    (selectedLocation === '전체 지역' || business.address.includes(selectedLocation.split(' ')[1])) &&
    (searchTerm === '' || business.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     business.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <h1 className="text-2xl font-bold text-gray-900">엘로우 페이지</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="업체명, 서비스 검색..."
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
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
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

          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Map className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">지역</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortedLocations.map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(location)}
                  className={selectedLocation === location ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              총 {filteredBusinesses.length}개 업체
            </span>
          </div>
        </div>

        {/* Business List */}
        <div className="space-y-6">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="md:flex">
                <div className="md:w-1/6">
                  <img 
                    src={business.image} 
                    alt={business.name}
                    className="w-full h-28 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-5/6 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium rounded">
                          {business.category}
                        </span>
                        {business.isOpen && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">영업중</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {business.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{business.address}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{business.hours}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {business.services.map((service, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900">{business.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        리뷰 {business.reviews.toLocaleString()}개
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        전화
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        길찾기
                      </Button>
                    </div>
                    <Button variant="link" size="sm" className="text-blue-600">
                      홈페이지 방문 →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}