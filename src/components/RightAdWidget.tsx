import { useState } from 'react';
import { AdModal, AdContent } from './AdModal';
import { Card } from './ui/card';
import adImage from 'figma:asset/f18dd51a3ec264f5ea87b79b451b7a548a92bac7.png';

export function RightAdWidget() {
  const [selectedAd, setSelectedAd] = useState<AdContent | null>(null);
  const adData: AdContent = {
    id: 'right-1', title: '광고 공간', company: '광고',
    description: '이 공간에 광고를 등록하세요. 사진, 동영상, 텍스트 모두 가능합니다.',
  };

  return (
    <>
      <Card className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedAd(adData)}>
        <div className="relative">
          <img src={adImage} alt="광고" className="w-full h-auto object-cover" />
          <div className="absolute top-2 right-2">
            <span className="text-xs px-2 py-1 bg-black bg-opacity-50 text-white rounded">AD</span>
          </div>
        </div>
      </Card>
      {selectedAd && <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
    </>
  );
}