import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { AdModal, AdContent } from './AdModal';
interface Ad {
  id: string;
  title: string;
  description: string;
  company: string;
  image: string;
  link: string;
  type: 'company' | 'academy' | 'service';
}

export function CenterAdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [selectedAd, setSelectedAd] = useState<AdContent | null>(null);

  const ads: Ad[] = [
    {
      id: '1',
      title: '프리미엄 한우 꽃등심 특가 이벤트 진행중',
      description: '투벌 한우 꽃등심 1kg + 양념 세트 55% 할인 🥩 무료배송',
      company: '전국농부들',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=80&fit=crop',
      link: '#',
      type: 'service'
    },
    {
      id: '2',
      title: '중국 비즈니스 전문가 양성과정 모집',
      description: '중국 시장 진출을 위한 실전 교육 프로그램 ✨ 무료 상담 진행중',
      company: '코리아Up 비즈니스 아카데미',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=80&fit=crop',
      link: '#',
      type: 'academy'
    },
    {
      id: '3',
      title: 'HSK 중국어 완전정복 온라인 강좌',
      description: 'HSK 1급부터 6급까지 체계적 학습 📚 첫 달 수강료 50% 할인',
      company: '중국어 마스터',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=80&fit=crop',
      link: '#',
      type: 'academy'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // 5초마다 광고 변경

    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentAdIndex];

  return (
    <div className="bg-white py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            {/* Ad Image - 25% */}
            <div className="w-1/4 pr-4">
              <img 
                src={currentAd.image} 
                alt={currentAd.title}
                className="w-full h-20 object-cover rounded"
              />
            </div>

            {/* Ad Content - 70% */}
            <div className="w-3/4 px-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-md font-semibold">
                  AD
                </span>
                <span className="text-xs text-gray-600 font-medium">{currentAd.company}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{currentAd.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{currentAd.description}</p>
            </div>

            {/* Arrow - 5% */}
            <div className="w-auto pl-4">
              <ChevronRight className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentAdIndex ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    {selectedAd && <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
  );
}