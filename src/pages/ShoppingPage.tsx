import { useState } from 'react';
import { ArrowLeft, Search, Star } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface ShoppingPageProps {
  onBack: () => void;
  initialCategory?: string;
}

export function ShoppingPage({ onBack, initialCategory = '전체' }: ShoppingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('인기순');

  // 선택된 카테고리를 맨 앞으로 이동
  const categories = initialCategory && initialCategory !== '전체'
    ? [initialCategory, '전체', '한국 식품', '생활용품', '화장품', '서비스', '중국 쿠팡'].filter((cat, index, self) => self.indexOf(cat) === index)
    : ['전체', '한국 식품', '생활용품', '화장품', '서비스', '중국 쿠팡'];
  const sortOptions = ['인기순', '낮은 가격순', '높은 가격순', '최신순', '평점순'];

  const products = [
    {
      id: 1,
      name: "직접 담근 배추김치 1kg",
      price: 35000,
      originalPrice: null,
      discount: 0,
      rating: 4.9,
      reviews: 38,
      image: "https://images.unsplash.com/photo-1583224964978-2257b8a1d74e?w=400&h=400&fit=crop&q=80",
      category: "식품",
      seller: "베이징댁",
      freeShipping: false,
      isNew: false,
      location: "차오양구",
      time: "1시간 전"
    },
    {
      id: 2,
      name: "이사 정리 — 주방용품·소형가전 일괄",
      price: 0,
      originalPrice: null,
      discount: 0,
      rating: null,
      reviews: 0,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&q=80",
      category: "생활용품",
      seller: "귀국준비中",
      freeShipping: false,
      isNew: false,
      location: "푸동신구",
      time: "3시간 전",
      priceLabel: "협의"
    },
    {
      id: 3,
      name: "한국 화장품 공동구매 모집 (이니스프리·에뛰드)",
      price: 0,
      originalPrice: null,
      discount: 0,
      rating: 4.8,
      reviews: 12,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&q=80",
      category: "화장품",
      seller: "뷰티왕언니",
      freeShipping: false,
      isNew: false,
      location: "하이뎬구",
      time: "5시간 전",
      priceLabel: "정가 대비 20%↓"
    },
    {
      id: 4,
      name: "한중 비즈니스 통역 (계약서·미팅 전문)",
      price: 80000,
      originalPrice: null,
      discount: 0,
      rating: 4.9,
      reviews: 56,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&q=80",
      category: "서비스",
      seller: "통역사김씨",
      freeShipping: false,
      isNew: false,
      location: "전지역",
      time: "어제",
      priceLabel: "8만원/시간"
    },
    {
      id: 5,
      name: "왕징 한국 반찬 정기배달 (주 1회)",
      price: 0,
      originalPrice: null,
      discount: 0,
      rating: 4.7,
      reviews: 24,
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop&q=80",
      category: "식품",
      seller: "반찬가게사모님",
      freeShipping: false,
      isNew: false,
      location: "왕징",
      time: "어제",
      priceLabel: "150위안/주"
    },
    {
      id: 6,
      name: "아파트 청소 서비스 (이사 전후·정기)",
      price: 0,
      originalPrice: null,
      discount: 0,
      rating: 4.8,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&q=80",
      category: "서비스",
      seller: "깔끔청소",
      freeShipping: false,
      isNew: false,
      location: "베이징·상하이",
      time: "2일 전",
      priceLabel: "300위안~"
    }
  ];

  const filteredProducts = products.filter(product => 
    (selectedCategory === '전체' || product.category === selectedCategory) &&
    (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <h1 className="text-xl font-semibold text-gray-900">틈새 마켓</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="상품 검색..."
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

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              총 {filteredProducts.length}개 상품
            </span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group border border-gray-100">
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              
              <div className="p-2.5">
                <h3 className="text-xs font-medium text-gray-900 mb-1.5 line-clamp-2 leading-snug">
                  {product.name}
                </h3>

                <div className="text-sm font-semibold text-gray-900 mb-1.5">
                  {(product as any).priceLabel
                    ? (product as any).priceLabel
                    : product.price > 0
                      ? `${product.price.toLocaleString()}원`
                      : '협의'}
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="truncate">{product.seller}</span>
                    <span>·</span>
                    <span className="truncate">{(product as any).location}</span>
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                      <span>{product.rating}</span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-gray-300 mt-0.5">{(product as any).time}</div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="px-8">
              더 많은 상품 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}