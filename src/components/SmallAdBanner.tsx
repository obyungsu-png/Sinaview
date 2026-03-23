import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SmallAd {
  id: string;
  title: string;
  company: string;
  image: string;
  link: string;
}

export function SmallAdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const ads: SmallAd[] = [
    {
      id: '1',
      title: '🎯 중국 진출 전문 컨설팅 무료 상담',
      company: '코리아Up 컨설팅',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&h=60&fit=crop',
      link: '#'
    },
    {
      id: '2',
      title: '📚 HSK 시험대비 집중 특강 모집중',
      company: '프리미엄 중국어학원',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=60&fit=crop',
      link: '#'
    },
    {
      id: '3',
      title: '💼 중국 현지 취업 정보 세미나',
      company: '글로벌 커리어센터',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=60&fit=crop',
      link: '#'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 4000); // 4초마다 광고 변경

    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentAdIndex];

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="flex items-center cursor-pointer hover:bg-gray-200 transition-colors rounded-lg p-2">
        {/* Ad Image - 40% */}
        <div className="w-2/5 pr-3">
          <img 
            src={currentAd.image} 
            alt={currentAd.title}
            className="w-full h-16 object-cover rounded"
          />
        </div>

        {/* Ad Content - 60% */}
        <div className="w-3/5 pl-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-md font-semibold">
              광고
            </span>
            <span className="text-xs text-gray-600 font-medium">{currentAd.company}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{currentAd.title}</h3>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-500 ml-2" />
      </div>

      {/* Progress dots */}
      <div className="flex justify-center space-x-1 mt-2">
        {ads.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              index === currentAdIndex ? 'bg-gray-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}