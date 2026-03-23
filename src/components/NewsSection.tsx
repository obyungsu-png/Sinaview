import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface NewsSectionProps {
  category: string;
  onMoreClick?: () => void;
}

export function NewsSection({ category, onMoreClick }: NewsSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');

  const subcategories = [
    { id: 'all', name: '전체', count: 1680 },
    { id: 'china-news', name: '중국소식', count: 520 },
    { id: 'media', name: '언론사별', count: 420 },
    { id: 'entertainment', name: '연예', count: 350 },
    { id: 'korea-news', name: '한국뉴스', count: 280 },
    { id: 'economy', name: '경제', count: 630 }
  ];
  const contentBySubcategory = {
    '전체': [
      {
        id: 1,
        title: "중국 3분기 GDP 성장률 4.6% 기록, 예상치 하회",
        source: "차이나데일리",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1758819285242-afa776cc4e65?w=100&h=60&fit=crop",
        type: "경제"
      },
      {
        id: 2,
        title: "시진핑 주석, 일대일로 10주년 기념식에서 신규 투자 발표",
        source: "신화통신",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?w=100&h=60&fit=crop",
        type: "언론사별"
      },
      {
        id: 3,
        title: "BTS 제이홉, 중국 팬미팅 개최 발표",
        source: "엔터테인먼트위클리",
        time: "3시간 전",
        thumbnail: "https://images.unsplash.com/photo-1608878777113-e7c0d46fae0d?w=100&h=60&fit=crop",
        type: "연예"
      },
      {
        id: 4,
        title: "한국 대통령, 중국 방문 일정 확정 발표",
        source: "연합뉴스",
        time: "4시간 전",
        thumbnail: "https://images.unsplash.com/photo-1554209721-6dbb1575b852?w=100&h=60&fit=crop",
        type: "한국뉴스"
      }
    ],
    '중국소식': [
      {
        id: 1,
        title: "중국 3분기 GDP 성장률 4.6% 기록, 예상치 하회",
        source: "차이나데일리",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1758819285242-afa776cc4e65?w=100&h=60&fit=crop",
        type: "경제"
      },
      {
        id: 2,
        title: "중국 위안화 환율 7.3 돌파, 달러 강세 지속",
        source: "중국경제신문",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?w=100&h=60&fit=crop",
        type: "경제"
      }
    ],
    '언론사별': [
      {
        id: 1,
        title: "시진핑 주석, 일대일로 10주년 기념식에서 신규 투자 발표",
        source: "신화통신",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?w=100&h=60&fit=crop",
        type: "언론사별"
      },
      {
        id: 2,
        title: "중국 AI 반도체 기술, 자립도 80% 돌파",
        source: "인민일보",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1608878777113-e7c0d46fae0d?w=100&h=60&fit=crop",
        type: "언론사별"
      }
    ],
    '연예': [
      {
        id: 1,
        title: "BTS 제이홉, 중국 팬미팅 개최 발표",
        source: "엔터테인먼트위클리",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1608878777113-e7c0d46fae0d?w=100&h=60&fit=crop",
        type: "연예"
      },
      {
        id: 2,
        title: "중국 영화 '봄날은 간다' 한국 개봉 확정",
        source: "스타뉴스",
        time: "3시간 전",
        thumbnail: "https://images.unsplash.com/photo-1710171454800-a1ab850a4668?w=100&h=60&fit=crop",
        type: "연예"
      }
    ],
    '한국뉴스': [
      {
        id: 1,
        title: "한국 대통령, 중국 방문 일정 확정 발표",
        source: "연합뉴스",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1554209721-6dbb1575b852?w=100&h=60&fit=crop",
        type: "한국뉴스"
      },
      {
        id: 2,
        title: "한중 무역협정 2차 협상 베이징에서 시작",
        source: "KBS뉴스",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1758819285242-afa776cc4e65?w=100&h=60&fit=crop",
        type: "한국뉴스"
      }
    ],
    '경제': [
      {
        id: 1,
        title: "중국 3분기 GDP 성장률 4.6% 기록, 예상치 하회",
        source: "차이나데일리",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1758819285242-afa776cc4e65?w=100&h=60&fit=crop",
        type: "경제"
      },
      {
        id: 2,
        title: "중국 위안화 환율 7.3 돌파, 달러 강세 지속",
        source: "중국경제신문",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?w=100&h=60&fit=crop",
        type: "경제"
      }
    ]
  };

  const currentItems = contentBySubcategory[activeSubcategory] || contentBySubcategory['전체'];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{category}</h2>
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

      <div className="space-y-3">
        {currentItems.slice(0, 4).map((item) => (
          <div 
            key={item.id} 
            className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer"
            onClick={onMoreClick}
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