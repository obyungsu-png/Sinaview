import React, { useState } from 'react';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface SecuritiesSectionProps {
  category: string;
  onMoreClick?: () => void;
}

export function SecuritiesSection({ category, onMoreClick }: SecuritiesSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');

  const subcategories = [
    { id: 'all', name: '전체', count: 180 },
    { id: 'shanghai', name: '상하이증시', count: 45 },
    { id: 'hongkong', name: '홍콩증시', count: 60 },
    { id: 'a-share', name: 'A주', count: 35 },
    { id: 'fund', name: '중국펀드', count: 40 }
  ];
  const contentBySubcategory = {
    '전체': [
      {
        id: 1,
        title: "알리바바 그룹, 클라우드 사업 회복으로 주가 상승",
        source: "차이나파이낸셜",
        time: "30분 전",
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=60&fit=crop",
        trend: "up",
        change: "+4.2%",
        type: "홍콩증시"
      },
      {
        id: 2,
        title: "상하이 종합지수 3,200포인트 돌파, 정부 부양책 효과",
        source: "상하이증권보",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=100&h=60&fit=crop",
        trend: "up",
        change: "+2.8%",
        type: "상하이증시"
      },
      {
        id: 3,
        title: "차이나펀드 연말 수익률 10% 돌파 전망",
        source: "펀드투데이",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=60&fit=crop",
        trend: "up",
        change: "+3.5%",
        type: "중국펀드"
      },
      {
        id: 4,
        title: "중국 A주 시장 외국인 순매수 지속",
        source: "중국증권",
        time: "3시간 전",
        thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=60&fit=crop",
        trend: "up",
        change: "+1.2%",
        type: "A주"
      }
    ],
    '상하이증시': [
      {
        id: 1,
        title: "상하이 종합지수 3,200포인트 돌파, 정부 부양책 효과",
        source: "상하이증권보",
        time: "30분 전",
        thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=100&h=60&fit=crop",
        trend: "up",
        change: "+2.8%",
        type: "상하이증시"
      },
      {
        id: 2,
        title: "상하이 50 ETF 투자 자금 대거 유입",
        source: "상하이데일리",
        time: "2시간 전",
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=60&fit=crop",
        trend: "up",
        change: "+1.5%",
        type: "상하이증시"
      }
    ],
    '홍콩증시': [
      {
        id: 1,
        title: "알리바바 그룹, 클라우드 사업 회복으로 주가 상승",
        source: "차이나파이낸셜",
        time: "30분 전",
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=60&fit=crop",
        trend: "up",
        change: "+4.2%",
        type: "홍콩증시"
      },
      {
        id: 2,
        title: "텐센트 3분기 실적 호조, 게임 부문 성장",
        source: "증권시보",
        time: "1시간 전",
        thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=60&fit=crop",
        trend: "up",
        change: "+3.5%",
        type: "홍콩증시"
      }
    ],
    'A주': [
      {
        id: 1,
        title: "중국 A주 시장 외국인 순매수 지속",
        source: "중국증권",
        time: "30분 전",
        thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=60&fit=crop",
        trend: "up",
        change: "+1.2%",
        type: "A주"
      }
    ],
    '중국펀드': [
      {
        id: 1,
        title: "차이나펀드 연말 수익률 10% 돌파 전망",
        source: "펀드투데이",
        time: "30분 전",
        thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=60&fit=crop",
        trend: "up",
        change: "+3.5%",
        type: "중국펀드"
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
                <span className="mx-1">·</span>
                <div className={`flex items-center ${item.trend === 'up' ? 'text-red-500' : 'text-blue-500'}`}>
                  {item.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  <span>{item.change}</span>
                </div>
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