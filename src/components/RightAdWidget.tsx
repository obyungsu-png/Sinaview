import { Card } from './ui/card';
import adImage from 'figma:asset/f18dd51a3ec264f5ea87b79b451b7a548a92bac7.png';

export function RightAdWidget() {
  return (
    <Card className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={adImage}
          alt="네이버 공식 데이트 코스 센스 있게 짜는 법"
          className="w-full h-auto object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-1 bg-black bg-opacity-50 text-white rounded">
            AD
          </span>
        </div>
      </div>
    </Card>
  );
}