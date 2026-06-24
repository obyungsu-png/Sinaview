import React, { useState } from 'react';
import { MapPin, MessageCircle, Clock } from 'lucide-react';
import { Card } from './ui/card';

interface ShoppingSectionProps {
  category: string;
  onMoreClick?: (selectedCategory?: string) => void;
}

export function ShoppingSection({ category, onMoreClick }: ShoppingSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');

  const subcategories = ['전체', '식품', '생활용품', '화장품', '서비스', '기타'];

  const listings: Record<string, any[]> = {
    '전체': [
      { id: 1, title: '한국 김치 직접 담근 것 판매', seller: '베이징댁', location: '차오양구', price: '35,000원/kg', time: '1시간 전', category: '식품', contact: '위챗', desc: '시어머니 레시피로 직접 담근 배추김치입니다. 매주 금요일 픽업 가능.' },
      { id: 2, title: '이사 정리 생활용품 일괄 판매', seller: '상하이이사중', location: '푸동신구', price: '협의', time: '3시간 전', category: '생활용품', contact: '위챗', desc: '귀국 예정으로 살림살이 정리합니다. 직접 보러 오셔도 됩니다.' },
      { id: 3, title: '한국 화장품 공동구매 모집', seller: '뷰티왕언니', location: '하이뎬구', price: '정가 대비 20%↓', time: '5시간 전', category: '화장품', contact: '카카오', desc: '이니스프리, 에뛰드 등 다음 주 한국 출장 시 구매 대행해드립니다.' },
      { id: 4, title: '세금계산서 발행 가능 한중 통역', seller: '통역사김씨', location: '전지역', price: '8만원/시간', time: '어제', category: '서비스', contact: '전화', desc: '비즈니스 미팅, 계약서 번역 전문. 경력 10년.' },
      { id: 5, title: '직접 만든 된장·고추장 판매', seller: '전통식품아줌마', location: '광저우', price: '된장 40,000원/kg', time: '어제', category: '식품', contact: '위챗', desc: '콩 100% 국산 재료로 담근 전통 방식입니다. 소량 제조 중.' },
      { id: 6, title: '운전기사 서비스 (한국어 가능)', seller: '라오왕사장님', location: '베이징 전지역', price: '500위안/일', time: '2일 전', category: '서비스', contact: '위챗', desc: '한국어 가능한 운전기사입니다. 장거리 출장, 공항 픽업 가능.' },
    ],
    '식품': [
      { id: 1, title: '한국 김치 직접 담근 것 판매', seller: '베이징댁', location: '차오양구', price: '35,000원/kg', time: '1시간 전', category: '식품', contact: '위챗', desc: '시어머니 레시피로 직접 담근 배추김치입니다. 매주 금요일 픽업 가능.' },
      { id: 5, title: '직접 만든 된장·고추장 판매', seller: '전통식품아줌마', location: '광저우', price: '된장 40,000원/kg', time: '어제', category: '식품', contact: '위챗', desc: '콩 100% 국산 재료로 담근 전통 방식입니다. 소량 제조 중.' },
      { id: 7, title: '한국 반찬 정기 배달 (베이징)', seller: '반찬가게사모님', location: '왕징', price: '주 1회 150위안', time: '2일 전', category: '식품', contact: '위챗', desc: '매주 화요일 왕징 일대 배달. 나물, 조림, 볶음 8가지 구성.' },
    ],
    '생활용품': [
      { id: 2, title: '이사 정리 생활용품 일괄 판매', seller: '상하이이사중', location: '푸동신구', price: '협의', time: '3시간 전', category: '생활용품', contact: '위챗', desc: '귀국 예정으로 살림살이 정리합니다. 직접 보러 오셔도 됩니다.' },
      { id: 8, title: '한국 직구 대행 (식품·생활용품)', seller: '직구전문점', location: '온라인', price: '구매가 + 10%', time: '3일 전', category: '생활용품', contact: '카카오', desc: '한국 직배송 안 되는 상품 대신 구매해드립니다. 배송비 별도.' },
    ],
    '화장품': [
      { id: 3, title: '한국 화장품 공동구매 모집', seller: '뷰티왕언니', location: '하이뎬구', price: '정가 대비 20%↓', time: '5시간 전', category: '화장품', contact: '카카오', desc: '이니스프리, 에뛰드 등 다음 주 한국 출장 시 구매 대행해드립니다.' },
      { id: 9, title: '미개봉 한국 화장품 정리', seller: '뷰티덕후', location: '상하이 징안구', price: '정가 50%', time: '4일 전', category: '화장품', contact: '위챗', desc: '선물받은 화장품 중 안 맞는 것들 정리합니다. 직접 확인 후 구매 가능.' },
    ],
    '서비스': [
      { id: 4, title: '세금계산서 발행 가능 한중 통역', seller: '통역사김씨', location: '전지역', price: '8만원/시간', time: '어제', category: '서비스', contact: '전화', desc: '비즈니스 미팅, 계약서 번역 전문. 경력 10년.' },
      { id: 6, title: '운전기사 서비스 (한국어 가능)', seller: '라오왕사장님', location: '베이징 전지역', price: '500위안/일', time: '2일 전', category: '서비스', contact: '위챗', desc: '한국어 가능한 운전기사입니다. 장거리 출장, 공항 픽업 가능.' },
      { id: 10, title: '아파트 청소 서비스 (한국인 운영)', seller: '깔끔청소', location: '베이징·상하이', price: '300위안~', time: '5일 전', category: '서비스', contact: '위챗', desc: '이사 전후 청소, 정기 청소 모두 가능. 사진 견적 먼저 드립니다.' },
    ],
    '기타': [
      { id: 11, title: '자동차 매도 (현대 소나타 2021)', seller: '귀국준비중', location: '선전', price: '18만위안', time: '1일 전', category: '기타', contact: '위챗', desc: '귀국 예정으로 급매합니다. 무사고, 주행 3만km. 직접 확인 가능.' },
      { id: 12, title: '피아노 레슨 (한국인 선생님)', seller: '음대출신선생님', location: '상하이 창닝구', price: '200위안/50분', time: '3일 전', category: '기타', contact: '카카오', desc: '음대 졸업. 어린이부터 성인까지 가능. 첫 수업 무료 체험.' },
    ],
  };

  const contactColors: Record<string, string> = {
    '위챗': 'text-green-600',
    '카카오': 'text-yellow-600',
    '전화': 'text-blue-600',
  };

  const currentListings = listings[activeSubcategory] || listings['전체'];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">틈새 마켓</h2>
            <span className="text-xs text-gray-400">소상공인 직거래</span>
          </div>

          {/* 카테고리 탭 */}
          <div className="flex items-center gap-1 text-sm flex-wrap">
            {subcategories.map((cat, i) => (
              <React.Fragment key={cat}>
                <button
                  onClick={() => setActiveSubcategory(cat)}
                  className={`transition-colors ${activeSubcategory === cat ? 'text-gray-900 font-medium' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {cat}
                </button>
                {i < subcategories.length - 1 && <span className="text-gray-200">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 리스트 */}
        <div className="divide-y divide-gray-100">
          {currentListings.map((item) => (
            <button
              key={item.id}
              className="w-full text-left py-3.5 hover:bg-gray-50 transition-colors px-1 -mx-1"
              onClick={() => onMoreClick?.(activeSubcategory)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-snug mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-1.5">{item.desc}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />{item.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{item.time}
                    </span>
                    <span className={`flex items-center gap-0.5 ${contactColors[item.contact]}`}>
                      <MessageCircle className="w-3 h-3" />{item.contact}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 shrink-0 mt-0.5">{item.price}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => onMoreClick?.(activeSubcategory)}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            더 보기 →
          </button>
        </div>
      </Card>
    </div>
  );
}
