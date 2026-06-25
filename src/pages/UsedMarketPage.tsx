import { ArrowLeft, Package, MapPin, User, Heart, MessageCircle, Phone, Filter, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface UsedMarketPageProps {
  onBack: () => void;
}

export function UsedMarketPage({ onBack }: UsedMarketPageProps) {
  const marketItems = [
    {
      id: 1,
      title: "아이폰 14 Pro Max 256GB 퍼플 색상 판매",
      price: "5,200위안",
      originalPrice: "7,500위안",
      location: "베이징 차오양구",
      seller: "김서울",
      sellerRating: 4.8,
      time: "30분 전",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      category: "전자제품",
      likes: 15,
      views: 234,
      description: "작년에 구입한 아이폰으로 케이스 끼고 사용해서 깨끗합니다. 박스, 충전기 모두 포함."
    },
    {
      id: 2,
      title: "삼성 김치냉장고 327L 스탠드형 (거의 새것)",
      price: "3,200위안",
      originalPrice: "4,800위안",
      location: "상하이 푸동신구",
      seller: "박중국",
      sellerRating: 4.9,
      time: "1시간 전",
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=200&fit=crop",
      delivery: "중통택배",
      status: "예약중",
      category: "한국식품",
      likes: 28,
      views: 445,
      description: "한국에서 가져온 김치냉장고입니다. 6개월만 사용했고 이사로 인해 판매합니다."
    },
    {
      id: 3,
      title: "한국 화장품 세트 (설화수, 후, 이니스프리)",
      price: "850위안",
      originalPrice: "1,200위안",
      location: "광저우 천허구",
      seller: "이차이나",
      sellerRating: 4.7,
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
      delivery: "신다택배",
      status: "판매중",
      category: "화장품",
      likes: 42,
      views: 678,
      description: "한국 면세점에서 구입한 정품입니다. 미개봉 상태로 판매합니다."
    },
    {
      id: 4,
      title: "쿠쿠 압력밥솥 10인용 + 한국 라면 박스",
      price: "1,400위안",
      originalPrice: "2,100위안",
      location: "선전 난산구",
      seller: "최한국",
      sellerRating: 4.6,
      time: "3시간 전",
      image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&h=200&fit=crop",
      delivery: "원통택배",
      status: "판매중",
      category: "생활용품",
      likes: 19,
      views: 312,
      description: "한국 쿠쿠 밥솥과 신라면, 불닭볶음면 등 한국 라면 50개 세트로 판매합니다."
    },
    {
      id: 5,
      title: "LG 세탁기 12kg 드럼세탁기 (1년 사용)",
      price: "2,800위안",
      originalPrice: "4,200위안",
      location: "베이징 하이디안구",
      seller: "정베이징",
      sellerRating: 4.8,
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      category: "생활용품",
      likes: 31,
      views: 521,
      description: "LG 트롬 세탁기 12kg 용량입니다. 이사로 인해 판매하며 상태 매우 좋습니다."
    },
    {
      id: 6,
      title: "애플 맥북 프로 13인치 M2 512GB (6개월 사용)",
      price: "8,900위안",
      originalPrice: "12,500위안",
      location: "상하이 징안구",
      seller: "윤상하이",
      sellerRating: 4.9,
      time: "5시간 전",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop",
      delivery: "중통택배",
      status: "판매중",
      category: "전자제품",
      likes: 56,
      views: 892,
      description: "맥북 프로 M2칩 512GB 모델입니다. 케이스와 파우치, 어댑터 모두 포함합니다."
    }
  ];

  const categories = ["전체", "전자제품", "한국식품", "화장품", "생활용품"];
  const cities = ["전체", "베이징", "상하이", "광저우", "선전", "항저우", "난징"];
  const deliveryOptions = ["전체", "순풍택배", "중통택배", "신다택배", "원통택배", "EMS"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onBack}
              variant="ghost" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>메인으로</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">화개장터</h1>
            <div className="text-sm text-gray-500">
              중국 거주 한국인 물품 교환 커뮤니티
            </div>
            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full inline-block mt-2">
              <span className="font-medium">택배 옵션:</span> 순풍택배, 중통택배, 신다택배, 원통택배, EMS
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="물품명, 브랜드명으로 검색..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="지역" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="택배사" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Filter className="w-4 h-4 mr-2" />
                검색
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-green-600">1,247</span>개 상품
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Package className="w-4 h-4 mr-2" />
            판매하기
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={item.status === '예약중' ? 'secondary' : 'default'} className="text-xs">
                    {item.status}
                  </Badge>
                </div>
                <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-blue-500 text-white text-xs">
                    {item.category}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl font-bold text-green-600">{item.price}</span>
                  <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-3 h-3" />
                      <span>{item.delivery}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{item.seller}</span>
                      <span className="text-yellow-500">★{item.sellerRating}</span>
                    </div>
                    <span>{item.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{item.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>조회</span>
                        <span>{item.views}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button variant="outline" className="px-8">
            더 많은 상품 보기
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2 font-semibold">화개장터 이용 안내</p>
            <p className="text-xs text-gray-400 mb-4">
              한인이 직접 만든 제품과 중국 거주 한인들의 직거래를 함께 만나는 공간입니다
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">🌾 우리장터</h4>
                <p>한인이 직접 만든 김치·반찬·베이커리·수공예품·재능 서비스</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🛍️ 중고거래</h4>
                <p>이사·귀국 정리, 사용감 적은 물품. 직거래 또는 택배 가능</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚠️ 안전 거래</h4>
                <p>식품은 신선도 확인, 직접 만나서 거래하거나 신뢰할 수 있는 택배사 이용 권장</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}