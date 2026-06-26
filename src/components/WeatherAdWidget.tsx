import { useState } from 'react';
import { AdModal, AdContent } from './AdModal';
import { Card } from './ui/card';
import { ExternalLink } from 'lucide-react';

export function WeatherAdWidget() {
  const [selectedAd, setSelectedAd] = useState<AdContent | null>(null);
  const adData: AdContent = {
    id: 'weather-1', title: '차이나업 프리미엄', company: '차이나업',
    description: '중국 비즈니스 솔루션. 법인 설립·세무·인사 등 원스톱 서비스.',
    imageUrl: 'https://images.unsplash.com/photo-1707487948595-dbc4558f7850?w=600&h=400&fit=crop',
  };

  return (
    <>
      <Card className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedAd(adData)}>
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1707487948595-dbc4558f7850?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGFkdmVydGlzZW1lbnQlMjBiYW5uZXJ8ZW58MXx8fHwxNzU5MTI2MTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="비즈니스 광고" className="w-full h-24 object-cover" />
          <div className="absolute top-2 right-2"><span className="text-xs px-2 py-1 bg-black bg-opacity-50 text-white rounded">AD</span></div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-semibold">차이나업 프리미엄</h3>
                <p className="text-xs opacity-90">중국 비즈니스 솔루션</p>
              </div>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>
      {selectedAd && <AdModal ad={selectedAd} onClose={() => setSelectedAd(null)} />}
    </>
  );
}