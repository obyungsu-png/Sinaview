import { useState } from 'react';
import { AdModal, AdContent } from './AdModal';
import { Card } from './ui/card';

export function ChinaAutoAdWidget() {
  const [selectedAd, setSelectedAd] = useState<AdContent | null>(null);

  const adData: AdContent = {
    id: 'auto-1',
    title: '한성자동차 강남전시장',
    company: '한성자동차',
    description: 'BYD · NIO · 샤오펑 공식딜러. BYD 한 EV 4,290만원 / 할인혜택 600만원↓',
    imageUrl: 'https://images.unsplash.com/photo-1705747401901-28363172fe7e?w=600&h=400&fit=crop',
    link: 'https://www.hanseongauto.co.kr',
    linkLabel: '한성자동차 바로가기',
  };

  return (
    <>
      <Card className="overflow-hidden border border-gray-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAd(adData)}>
      <div className="relative">
        <img 
          src="https://images.unsplash.com/photo-1705747401901-28363172fe7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjBzaG93cm9vbXxlbnwxfHx8fDE3NTkwNjY5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="한성자동차 전시장"
          className="w-full h-16 object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">AD</div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">신차출시</div>
      </div>
      <div className="p-2">
        <h3 className="text-xs font-bold text-gray-900 mb-0.5">한성자동차 강남전시장</h3>
        <p className="text-xs text-gray-600 mb-1">BYD · NIO · 샤오펑 공식딜러</p>
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">BYD 한 EV</span>
            <span className="text-red-600 font-medium">4,290만원</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">할인혜택</span>
            <span className="text-green-600 font-medium">600만원↓</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 text-gray-700 py-1.5 rounded text-xs font-medium text-center">더 알아보기 ›</div>
      </div>
    </Card>
    {selectedAd && <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
    </>
  );
}