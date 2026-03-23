import { useState } from 'react';
import { ArrowLeft, Search, Filter, Star, ShoppingCart, Heart } from 'lucide-react';
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
      name: "스마트폰 케이스 실리콘 투명",
      price: 15000,
      originalPrice: 25000,
      discount: 40,
      rating: 4.8,
      reviews: 1250,
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop",
      category: "가전",
      seller: "테크몰",
      freeShipping: true,
      isNew: true
    },
    {
      id: 2,
      name: "무선 블루투스 이어폰 프리미엄",
      price: 89000,
      originalPrice: 129000,
      discount: 31,
      rating: 4.6,
      reviews: 890,
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop",
      category: "가전",
      seller: "일렉트로닉스",
      freeShipping: true,
      isNew: false
    },
    {
      id: 3,
      name: "천연 스킨케어 세트 3종",
      price: 45000,
      originalPrice: 65000,
      discount: 31,
      rating: 4.9,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300&h=300&fit=crop",
      category: "뷰티",
      seller: "뷰티샵",
      freeShipping: true,
      isNew: false
    },
    {
      id: 4,
      name: "프리미엄 가죽 백팩",
      price: 120000,
      originalPrice: 180000,
      discount: 33,
      rating: 4.7,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
      category: "패션",
      seller: "가죽공방",
      freeShipping: false,
      isNew: true
    },
    {
      id: 5,
      name: "홈트레이닝 요가매트 10mm",
      price: 35000,
      originalPrice: 50000,
      discount: 30,
      rating: 4.5,
      reviews: 892,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
      category: "스포츠",
      seller: "스포츠존",
      freeShipping: true,
      isNew: false
    },
    {
      id: 6,
      name: "유기농 녹차 선물세트",
      price: 28000,
      originalPrice: 40000,
      discount: 30,
      rating: 4.8,
      reviews: 445,
      image: "https://images.unsplash.com/photo-1563822249366-9c07e51a506a?w=300&h=300&fit=crop",
      category: "식품",
      seller: "차마을",
      freeShipping: true,
      isNew: false
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
              <h1 className="text-2xl font-bold text-gray-900">틈새 쇼핑</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                    {product.discount}%
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded">
                    NEW
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {product.price.toLocaleString()}원
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                  {product.freeShipping && (
                    <span className="text-xs text-green-600 font-medium">무료배송</span>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  판매자: {product.seller}
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  장바구니
                </Button>
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