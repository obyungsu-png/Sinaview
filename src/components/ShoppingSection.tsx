import React, { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ShoppingSectionProps {
  category: string;
  onMoreClick?: (selectedCategory?: string) => void;
}

export function ShoppingSection({ category, onMoreClick }: ShoppingSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');

  const subcategories = [
    { id: 'all', name: '전체', count: 850 },
    { id: 'food', name: '한국 식품', count: 180 },
    { id: 'living', name: '생활용품', count: 220 },
    { id: 'cosmetics', name: '화장품', count: 150 },
    { id: 'service', name: '서비스', count: 300 },
    { id: 'coupang', name: '중국 쿠팡', count: 250 }
  ];
  const productsBySubcategory = {
    '한국 식품': [
      {
        id: 1,
        title: "한국 김치 1kg (배추김치/포기김치)",
        price: "35,000",
        originalPrice: "45,000",
        discount: "22%",
        rating: 4.9,
        reviews: 3245,
        image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "신선배송",
        platform: "한국마트"
      },
      {
        id: 2,
        title: "한국 고추장 1kg + 된장 500g 세트",
        price: "42,000",
        originalPrice: "58,000",
        discount: "28%",
        rating: 4.8,
        reviews: 2156,
        image: "https://images.unsplash.com/photo-1569682676935-b38a84eecdd6?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "인기상품",
        platform: "한국마트"
      },
      {
        id: 3,
        title: "한국 라면 20봉 (신라면/너구리/안성탕면)",
        price: "28,900",
        originalPrice: "35,000",
        discount: "17%",
        rating: 4.9,
        reviews: 8945,
        image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "베스트",
        platform: "한국마트"
      },
      {
        id: 4,
        title: "한국 참기름 500ml + 들기름 500ml",
        price: "55,000",
        originalPrice: "72,000",
        discount: "24%",
        rating: 4.7,
        reviews: 1834,
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "국산",
        platform: "한국마트"
      }
    ],
    '생활용품': [
      {
        id: 5,
        title: "한국 치약 (2080/페리오) 6개입",
        price: "18,900",
        originalPrice: "28,000",
        discount: "32%",
        rating: 4.8,
        reviews: 4567,
        image: "https://images.unsplash.com/photo-1622007228726-c7a4e7c9e9c7?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "묶음할인",
        platform: "생활용품"
      },
      {
        id: 6,
        title: "한국 세제 (퐁퐁/참그린) 대용량",
        price: "24,900",
        originalPrice: "35,000",
        discount: "29%",
        rating: 4.7,
        reviews: 3421,
        image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "대용량",
        platform: "생활용품"
      },
      {
        id: 7,
        title: "VPN 서비스 1년 이용권 (한국IP)",
        price: "89,000",
        originalPrice: "120,000",
        discount: "26%",
        rating: 4.9,
        reviews: 12456,
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "필수품",
        platform: "서비스"
      },
      {
        id: 8,
        title: "한중 번역기 포켓형 AI 음성인식",
        price: "129,000",
        originalPrice: "189,000",
        discount: "32%",
        rating: 4.6,
        reviews: 5678,
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "AI번역",
        platform: "전자기기"
      }
    ],
    '화장품': [
      {
        id: 9,
        title: "한국 스킨케어 세트 (토너+에센스+크림)",
        price: "78,000",
        originalPrice: "120,000",
        discount: "35%",
        rating: 4.8,
        reviews: 6789,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "인기",
        platform: "화장품"
      },
      {
        id: 10,
        title: "한국 마스크팩 30매 (메디힐/CNP)",
        price: "32,000",
        originalPrice: "48,000",
        discount: "33%",
        rating: 4.9,
        reviews: 8934,
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "대용량",
        platform: "화장품"
      },
      {
        id: 11,
        title: "한국 선크림 SPF50+ PA++++ 100ml",
        price: "28,900",
        originalPrice: "42,000",
        discount: "31%",
        rating: 4.7,
        reviews: 4512,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "여름필수",
        platform: "화장품"
      },
      {
        id: 12,
        title: "한국 립스틱 세트 3색 (롬앤/페리페라)",
        price: "45,000",
        originalPrice: "68,000",
        discount: "34%",
        rating: 4.8,
        reviews: 7623,
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "인기색상",
        platform: "화장품"
      }
    ],
    '서비스': [
      {
        id: 13,
        title: "한국-중국 국제배송 서비스 (20kg)",
        price: "120,000",
        originalPrice: "180,000",
        discount: "33%",
        rating: 4.6,
        reviews: 2345,
        image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "빠른배송",
        platform: "배송"
      },
      {
        id: 14,
        title: "중국 비자 연장 대행 서비스",
        price: "350,000",
        originalPrice: "450,000",
        discount: "22%",
        rating: 4.9,
        reviews: 1234,
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "전문가",
        platform: "행정"
      },
      {
        id: 15,
        title: "한국 도서 배송대행 (중국 내 배송)",
        price: "25,000",
        originalPrice: "35,000",
        discount: "29%",
        rating: 4.7,
        reviews: 3456,
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "독서",
        platform: "배송"
      },
      {
        id: 16,
        title: "한중 통역 서비스 (1일 8시간)",
        price: "280,000",
        originalPrice: "400,000",
        discount: "30%",
        rating: 4.8,
        reviews: 987,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "전문통역",
        platform: "통역"
      }
    ],
    '중국 쿠팡': [
      {
        id: 17,
        title: "샤오미 공기청정기 4 Pro 한국어판",
        price: "189,000",
        originalPrice: "320,000",
        discount: "41%",
        rating: 4.9,
        reviews: 15678,
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "로켓배송",
        platform: "중국쿠팡"
      },
      {
        id: 18,
        title: "화웨이 무선 이어폰 FreeBuds 5",
        price: "119,000",
        originalPrice: "189,000",
        discount: "37%",
        rating: 4.8,
        reviews: 12456,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "특가",
        platform: "중국쿠팡"
      },
      {
        id: 19,
        title: "중국 전통 차 선물세트 (보이차+백차)",
        price: "45,900",
        originalPrice: "89,000",
        discount: "48%",
        rating: 4.7,
        reviews: 4567,
        image: "https://images.unsplash.com/photo-1557735387-1a87e36cc97c?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "설선물",
        platform: "중국쿠팡"
      },
      {
        id: 20,
        title: "하이얼 미니 냉장고 원룸용 70L",
        price: "159,000",
        originalPrice: "280,000",
        discount: "43%",
        rating: 4.6,
        reviews: 8934,
        image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "인기",
        platform: "중국쿠팡"
      },
      {
        id: 21,
        title: "중국 명품 실크 스카프 (항저우)",
        price: "78,000",
        originalPrice: "150,000",
        discount: "48%",
        rating: 4.8,
        reviews: 2345,
        image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "명품",
        platform: "중국쿠팡"
      },
      {
        id: 22,
        title: "전기 자전거 폴딩형 (접이식)",
        price: "890,000",
        originalPrice: "1,580,000",
        discount: "44%",
        rating: 4.7,
        reviews: 3421,
        image: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "무료배송",
        platform: "중국쿠팡"
      }
    ],
    '전체': [
      {
        id: 1,
        title: "한국 김치 1kg (배추김치/포기김치)",
        price: "35,000",
        originalPrice: "45,000",
        discount: "22%",
        rating: 4.9,
        reviews: 3245,
        image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "신선배송",
        platform: "한국마트"
      },
      {
        id: 3,
        title: "한국 라면 20봉 (신라면/너구리/안성탕면)",
        price: "28,900",
        originalPrice: "35,000",
        discount: "17%",
        rating: 4.9,
        reviews: 8945,
        image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "베스트",
        platform: "한국마트"
      },
      {
        id: 7,
        title: "VPN 서비스 1년 이용권 (한국IP)",
        price: "89,000",
        originalPrice: "120,000",
        discount: "26%",
        rating: 4.9,
        reviews: 12456,
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "필수품",
        platform: "서비스"
      },
      {
        id: 9,
        title: "한국 스킨케어 세트 (토너+에센스+크림)",
        price: "78,000",
        originalPrice: "120,000",
        discount: "35%",
        rating: 4.8,
        reviews: 6789,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "인기",
        platform: "화장품"
      },
      {
        id: 10,
        title: "한국 마스크팩 30매 (메디힐/CNP)",
        price: "32,000",
        originalPrice: "48,000",
        discount: "33%",
        rating: 4.9,
        reviews: 8934,
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop",
        isLiked: false,
        badge: "대용량",
        platform: "화장품"
      },
      {
        id: 14,
        title: "중국 비자 연장 대행 서비스",
        price: "350,000",
        originalPrice: "450,000",
        discount: "22%",
        rating: 4.9,
        reviews: 1234,
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop",
        isLiked: true,
        badge: "전문가",
        platform: "행정"
      }
    ]
  };

  const currentProducts = productsBySubcategory[activeSubcategory] || productsBySubcategory['전체'];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">틈새 쇼핑</h2>
          </div>
          
          {/* 서브카테고리 탭 */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            {subcategories.map((subcat, index) => (
              <div key={subcat.id} className="contents">
                <button
                  onClick={() => setActiveSubcategory(subcat.name)}
                  className={`hover:text-blue-600 transition-colors ${
                    activeSubcategory === subcat.name
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {subcat.name}
                </button>
                {index < subcategories.length - 1 && (
                  <span className="text-gray-400">|</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentProducts.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => onMoreClick?.(activeSubcategory)}
            >
              <div className="relative">
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className="w-full h-32 sm:h-36 lg:h-32 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                    {product.badge}
                  </Badge>
                </div>
                <button 
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className={`w-4 h-4 ${product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              
              <div className="mt-2 space-y-1">
                <h3 className="text-sm text-gray-900 line-clamp-2 group-hover:text-green-600">
                  {product.title}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 font-semibold text-sm">{product.discount}</span>
                  <span className="font-semibold">{product.price}원</span>
                </div>
                
                <div className="text-xs text-gray-500 line-through">
                  {product.originalPrice}원
                </div>
                
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-gray-400">({product.reviews.toLocaleString()})</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => onMoreClick?.(activeSubcategory)}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            더 많은 상품 보기
          </button>
        </div>
      </Card>
    </div>
  );
}