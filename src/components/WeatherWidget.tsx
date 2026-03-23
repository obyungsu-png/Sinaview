import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, MapPin } from 'lucide-react';
import { Card } from './ui/card';

export function WeatherWidget() {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const cities = [
    { 
      name: "강릉", 
      subName: "구름조금", 
      temp: 23, 
      high: 24, 
      low: 15, 
      icon: Sun,
      iconColor: "text-yellow-500",
      dust: "미세 - 초미세 -"
    },
    { 
      name: "베이징", 
      subName: "맑음", 
      temp: 18, 
      high: 21, 
      low: 12, 
      icon: Sun,
      iconColor: "text-yellow-500",
      dust: "미세 좋음 초미세 보통"
    },
    { 
      name: "상하이", 
      subName: "비", 
      temp: 16, 
      high: 19, 
      low: 13, 
      icon: CloudRain,
      iconColor: "text-gray-500",
      dust: "미세 나쁨 초미세 나쁨"
    },
    { 
      name: "광저우", 
      subName: "흐림", 
      temp: 25, 
      high: 28, 
      low: 22, 
      icon: Cloud,
      iconColor: "text-gray-400",
      dust: "미세 보통 초미세 좋음"
    },
    { 
      name: "선전", 
      subName: "구름조금", 
      temp: 27, 
      high: 30, 
      low: 24, 
      icon: Sun,
      iconColor: "text-yellow-500",
      dust: "미세 좋음 초미세 좋음"
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentCityIndex((prev) => (prev + 1) % cities.length);
    }, 3000); // 3초마다 도시 변경

    return () => clearInterval(interval);
  }, [cities.length, isAutoPlay]);

  const handleDotClick = (index: number) => {
    setCurrentCityIndex(index);
    setIsAutoPlay(false); // 수동 선택 시 자동 재생 중지
    
    // 5초 후 자동 재생 재개
    setTimeout(() => {
      setIsAutoPlay(true);
    }, 5000);
  };

  const currentCity = cities[currentCityIndex];
  const IconComponent = currentCity.icon;

  return (
    <Card className="p-4 bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        {/* Left Side - Weather Icon and Info */}
        <div className="flex items-center space-x-3">
          <IconComponent className={`w-8 h-8 ${currentCity.iconColor}`} />
          <div>
            <div className="text-base font-medium text-black">
              {currentCity.name} {currentCity.subName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {currentCity.dust}
            </div>
          </div>
        </div>

        {/* Right Side - Temperature */}
        <div className="text-right">
          <div className="text-2xl font-normal text-black">
            {currentCity.temp}°
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {currentCity.high}° / {currentCity.low}°
          </div>
        </div>
      </div>

      {/* City indicator dots */}
      <div className="flex justify-center space-x-1 mt-3">
        {cities.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              handleDotClick(index);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 hover:scale-150 ${
              index === currentCityIndex ? 'bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`${cities[index].name} 날씨 보기`}
          />
        ))}
      </div>
    </Card>
  );
}