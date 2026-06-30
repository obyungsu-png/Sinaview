import React, { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface VisaDocumentSectionProps {
  category: string;
  onMoreClick?: () => void;
  onArticleClick?: (article: any) => void;
}

export function VisaDocumentSection({ category, onMoreClick, onArticleClick }: VisaDocumentSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');

  const subcategories = [
    { id: 'all', name: '전체', count: 24 },
    { id: 'visa', name: '비자', count: 8 },
    { id: 'residence', name: '거류증', count: 6 },
    { id: 'notary', name: '공증서류', count: 5 },
    { id: 'bank', name: '은행계좌', count: 5 },
    { id: 'others', name: '기타', count: 4 }
  ];

  const contentBySubcategory = {
    '전체': [
      {
        id: 1,
        title: "[긴급] 2026년 상반기 중국 비자면제정책 추가 연장 확정 - 30일 체류 논의",
        source: "주중한국대사관",
        time: "10분 전",
        type: "비자",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "2026 중국 외국인 영구거류증(5성카드) 소지자 혜택 대폭 강화",
        source: "국가이민관리국",
        time: "1시간 전",
        type: "거류증",
        thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "한-중 아포스티유 협약 2주년, 공증 비용 50% 인하 효과 분석",
        source: "외교부",
        time: "2시간 전",
        type: "공증서류",
        thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "중국 5대 은행, 외국인 여권 비대면 계좌 개설 시범 지역 확대",
        source: "인민은행",
        time: "3시간 전",
        type: "은행계좌",
        thumbnail: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=100&h=60&fit=crop"
      }
    ],
    '비자': [
      {
        id: 1,
        title: "[긴급] 2026년 상반기 중국 비자면제정책 추가 연장 확정 - 30일 체류 논의",
        source: "주중한국대사관",
        time: "10분 전",
        type: "비자",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "2026 외국인 취업비자(Z) 포인트제 개편안 발표 - 고급인재 우대",
        source: "국가이민관리국",
        time: "45분 전",
        type: "비자",
        thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "유학생(X1) 비자 소지자, 교내 아르바이트 및 인턴십 허용 범위 확대",
        source: "교육부",
        time: "3시간 전",
        type: "비자",
        thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100&h=60&fit=crop"
      }
    ],
    '거류증': [
      {
        id: 1,
        title: "2026 중국 외국인 영구거류증(5성카드) 소지자 혜택 대폭 강화",
        source: "국가이민관리국",
        time: "1시간 전",
        type: "거류증",
        thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "상하이/베이징 외국인 거류허가 처리 기간 단축 (7일 -> 3일)",
        source: "출입국관리소",
        time: "4시간 전",
        type: "거류증",
        thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=60&fit=crop"
      }
    ],
    '공증서류': [
      {
        id: 1,
        title: "한-중 아포스티유 협약 2주년, 공증 비용 50% 인하 효과 분석",
        source: "외교부",
        time: "2시간 전",
        type: "공증서류",
        thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "2026년 재외국민용 전자 위임장 발급 서비스 전면 시행",
        source: "법무부",
        time: "5시간 전",
        type: "공증서류",
        thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=60&fit=crop"
      }
    ],
    '은행계좌': [
      {
        id: 1,
        title: "중국 5대 은행, 외국인 여권 비대면 계좌 개설 시범 지역 확대",
        source: "인민은행",
        time: "3시간 전",
        type: "은행계좌",
        thumbnail: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "2026 위챗페이 외국인 여권 인증 유효기간 자동 연동 시스템 구축",
        source: "텐센트",
        time: "6시간 전",
        type: "은행계좌",
        thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=60&fit=crop"
      }
    ],
    '기타': [
      {
        id: 1,
        title: "한국 운전면허증 중국 내 상호인정 협정 체결 최종 단계 진입",
        source: "교통운수부",
        time: "2시간 전",
        type: "기타",
        thumbnail: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "2026년 중국 외국인 사회보험 통합 조회 앱 출시 예정",
        source: "인력자원부",
        time: "4시간 전",
        type: "기타",
        thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "중국 내 한국인 반려동물 등록 절차 간소화 시범 운영",
        source: "농업농촌부",
        time: "5시간 전",
        type: "기타",
        thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "2026 베이징/상하이 외국인 전용 임대주택 공급 계획 발표",
        source: "주택건설부",
        time: "7시간 전",
        type: "기타",
        thumbnail: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=100&h=60&fit=crop"
      }
    ]
  };

  const currentItems = contentBySubcategory[activeSubcategory] || contentBySubcategory['전체'];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3 whitespace-nowrap">{category}</h2>
        
        {/* 서브카테고리 탭 - 이미지와 같은 스타일 */}
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

      <div className="space-y-3">
        {currentItems.slice(0, 4).map((item) => (
          <div 
            key={item.id} 
            className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer"
            onClick={() => onArticleClick?.(item)}
          >
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-12 sm:w-16 h-8 sm:h-10 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span>{item.source}</span>
                <span className="mx-1">·</span>
                <span>{item.time}</span>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 mt-1" />
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button 
          onClick={onMoreClick}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {activeSubcategory} 카테고리에서 더보기 &gt;
        </button>
      </div>
    </Card>
  );
}