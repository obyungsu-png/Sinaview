import React, { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react@0.487.0';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface AutoSectionProps {
  category: string;
  onMoreClick?: () => void;
  onDriverLicenseClick?: () => void;
}

export function AutoSection({ category, onMoreClick, onDriverLicenseClick }: AutoSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState(0);

  const subcategories = [
    { id: 'all', name: '전체', count: 28 },
    { id: 'hyundai-kia', name: '현대/기아차', count: 9 },
    { id: 'electric', name: '전기차', count: 12 },
    { id: 'geely', name: '지리', count: 4 },
    { id: 'mercedes', name: '벤츠', count: 3 },
    { id: 'license', name: '운전면허', count: 15, isHighlight: true }
  ];

  const contentBySubcategory = {
    '전체': [
      {
        id: 1,
        title: "BYD 한(Han) EV, 중국 럭셔리 전기차 시장 강세",
        source: "차이나오토",
        time: "1시간 전",
        type: "전기차",
        thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "현대차 중국 공장 전기차 생산라인 확대",
        source: "현대차뉴스",
        time: "2시간 전",
        type: "현대/기아차",
        thumbnail: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "지리자동차 볼보와 전기차 기술 공유 협약",
        source: "지리그룹",
        time: "3시간 전",
        type: "지리",
        thumbnail: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "메르세데스-벤츠 중국 럭셔리 시장 점유율 1위",
        source: "벤츠차이나",
        time: "4시간 전",
        type: "벤츠",
        thumbnail: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=60&fit=crop"
      }
    ],
    '현대/기아차': [
      {
        id: 1,
        title: "현대차 중국 공장 전기차 생산라인 확대",
        source: "현대차뉴스",
        time: "1시간 전",
        type: "현대/기아차",
        thumbnail: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "기아 K3 중국 내수 판매량 전년 대비 20% 증가",
        source: "기아모터스",
        time: "2시간 전",
        type: "현대/기아차",
        thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=60&fit=crop"
      }
    ],
    '전기차': [
      {
        id: 1,
        title: "BYD 한(Han) EV, 중국 럭셔리 전기차 시장 강세",
        source: "차이나오토",
        time: "1시간 전",
        type: "전기차",
        thumbnail: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "테슬라 상하이 공장 연간 생산량 100만대 돌파",
        source: "테슬라차이나",
        time: "3시간 전",
        type: "전기차",
        thumbnail: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=100&h=60&fit=crop"
      }
    ],
    '지리': [
      {
        id: 1,
        title: "지리자동차 볼보와 전기차 기술 공유 협약",
        source: "지리그룹",
        time: "1시간 전",
        type: "지리",
        thumbnail: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=100&h=60&fit=crop"
      }
    ],
    '벤츠': [
      {
        id: 1,
        title: "메르세데스-벤츠 중국 럭셔리 시장 점유율 1위",
        source: "벤츠차이나",
        time: "1시간 전",
        type: "벤츠",
        thumbnail: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&h=60&fit=crop"
      }
    ],
    '운전면허': [
      {
        id: 1,
        title: "중국 운전면허 취득 완벽 가이드 2025",
        source: "차이나라이프",
        time: "1시간 전",
        type: "운전면허",
        thumbnail: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "한국 면허증 중국 면허로 교환하기",
        source: "비자가이드",
        time: "2시간 전",
        type: "운전면허",
        thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "중국 운전면허 필기시험 한국어 문제집",
        source: "Sina View",
        time: "3시간 전",
        type: "운전면허",
        thumbnail: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "베이징 운전면허 시험장 예약 방법",
        source: "운전면허센터",
        time: "5시간 전",
        type: "운전면허",
        thumbnail: "https://images.unsplash.com/photo-1625527575307-616f0bb84ad2?w=100&h=60&fit=crop"
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
              {subcat.isHighlight ? (
                <button
                  onClick={() => {
                    if (onDriverLicenseClick) {
                      onDriverLicenseClick();
                    } else {
                      setActiveSubcategory(subcat.name);
                      setSelectedItem(0);
                    }
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity font-medium"
                >
                  {subcat.name}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveSubcategory(subcat.name);
                    setSelectedItem(0);
                  }}
                  className={`hover:text-blue-600 transition-colors ${
                    activeSubcategory === subcat.name
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {subcat.name}
                </button>
              )}
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