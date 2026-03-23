import { TrendingUp, Gift } from 'lucide-react';
import { Card } from './ui/card';

export function ChinaSecuritiesAdWidget() {
  const handleLearnMore = () => {
    window.open('https://www.daishin.com', '_blank');
  };

  return (
    <Card className="overflow-hidden border border-gray-200">
      <div className="relative">
        <img 
          src="https://images.unsplash.com/photo-1588592378201-4a1aee5ab493?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBpbnZlc3RtZW50JTIwb2ZmaWNlfGVufDF8fHx8MTc1OTEyODgwN3ww&ixlib=rb-4.1.0&q=80&utm_source=figma&utm_medium=referral"
          alt="동아시아증권 강남지점"
          className="w-full h-16 object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
          AD
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          신규혜택
        </div>
      </div>
      
      <div className="p-2">
        <div className="mb-1">
          <h3 className="text-xs font-bold text-gray-900 mb-0.5">
            동아시아증권 강남지점
          </h3>
          <p className="text-xs text-gray-600 mb-1">
            중국증시 전문 투자상담
          </p>
        </div>
        
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-2.5 h-2.5 text-green-600" />
              <span className="text-gray-600">알리바바</span>
            </div>
            <span className="text-green-600 font-medium">+4.2%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-2.5 h-2.5 text-green-600" />
              <span className="text-gray-600">텐센트</span>
            </div>
            <span className="text-green-600 font-medium">+2.8%</span>
          </div>
        </div>
        
        <button 
          onClick={handleLearnMore}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1"
        >
          <span>더 알아보기</span>
          <span className="text-gray-500">›</span>
        </button>
      </div>
    </Card>
  );
}