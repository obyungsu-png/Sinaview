import { useState, useEffect } from 'react';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface Ad {
  id: string;
  title: string;
  description: string;
  company: string;
  image: string;
  link: string;
  type: 'company' | 'academy' | 'service';
}

export function AdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const ads: Ad[] = [
    {
      id: '1',
      title: '투벌 한우 꽃등심 한상 55% 할인중',
      description: '프리미엄 한우 꽃등심 세트를 전국농부들에서 특가로 만나보세요.',
      company: '전국농부들',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=80&fit=crop',
      link: '#',
      type: 'service'
    },
    {
      id: '2',
      title: '중국 비즈니스 아카데미 신규 과정',
      description: '중국 진출을 위한 전문 교육과정 ✨ 무료 상담 진행 중!',
      company: '차이나업 교육원',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=80&fit=crop',
      link: '#',
      type: 'academy'
    },
    {
      id: '3',
      title: 'HSK 중국어 온라인 과정 특가',
      description: 'HSK 1급부터 6급까지 체계적인 중국어 학습 📚 첫 달 50% 할인!',
      company: '중국어마스터',
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
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - Advertisement */}
          <div className="flex items-center w-full max-w-4xl bg-gray-100 border border-gray-200 rounded-lg p-3 mr-4">
            <div className="flex items-center flex-1">
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
                    AD
                  </span>
                  <span className="text-xs text-gray-600 font-medium">{currentAd.company}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{currentAd.title}</h3>
                <p className="text-sm text-gray-700 leading-tight">{currentAd.description}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-500 ml-2" />
            </div>
          </div>

          {/* Right Side - Social Login */}
          <div className="flex items-center space-x-2">
            {/* KakaoTalk Login */}
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              onClick={() => console.log('KakaoTalk login')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>카카오 로그인</span>
            </Button>

            {/* WeChat Login */}
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              onClick={() => console.log('WeChat login')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>웨이신 로그인</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}