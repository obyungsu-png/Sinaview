import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';

export function StockWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allStocks = [
    { name: "상하이종합", price: "3,127.45", change: "+18.32", percent: "+0.59%", isUp: true },
    { name: "선전성분", price: "10,234.78", change: "-68.90", percent: "-0.67%", isUp: false },
    { name: "항셍지수", price: "19,823.45", change: "+134.56", percent: "+0.68%", isUp: true },
    { name: "알리바바", price: "84.52", change: "+2.34", percent: "+2.85%", isUp: true },
    { name: "텐센트", price: "365.40", change: "-8.60", percent: "-2.30%", isUp: false },
    { name: "바이두", price: "102.80", change: "+4.20", percent: "+4.26%", isUp: true },
    { name: "샤오미", price: "28.45", change: "+1.35", percent: "+4.98%", isUp: true },
    { name: "BYD", price: "245.80", change: "+12.40", percent: "+5.32%", isUp: true }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allStocks.length);
    }, 3000); // 3초마다 종목 변경

    return () => clearInterval(interval);
  }, [allStocks.length]);

  const currentStock = allStocks[currentIndex];

  return (
    <Card className="p-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">증권</h2>
        <div className="flex items-center space-x-1">
          <RefreshCw className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-xs text-gray-500">09.29. 13:39</span>
        </div>
      </div>

      {/* Main Stock Display */}
      <div className="bg-gray-50 rounded p-2 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs text-gray-900 mb-0.5">{currentStock.name}</h3>
            <div className="text-lg font-bold text-gray-900">{currentStock.price}</div>
          </div>
          <div className={`text-right ${currentStock.isUp ? 'text-red-500' : 'text-blue-500'}`}>
            <div className="flex items-center justify-end space-x-1 mb-0.5">
              {currentStock.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="text-xs font-medium">{currentStock.percent}</span>
            </div>
            <div className="text-xs">{currentStock.change}</div>
          </div>
        </div>
      </div>

      {/* Quick Stock List */}
      <div className="space-y-1">
        {allStocks.slice(0, 3).map((stock, index) => (
          <div key={index} className={`flex items-center justify-between py-1 px-1 rounded hover:bg-gray-50 cursor-pointer transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
            <span className="text-xs text-gray-700">{stock.name}</span>
            <div className="flex items-center space-x-1 text-xs">
              <span className="font-medium">{stock.price}</span>
              <div className={`flex items-center space-x-0.5 ${stock.isUp ? 'text-red-500' : 'text-blue-500'}`}>
                {stock.isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                <span>{stock.percent}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t">
        <button className="text-xs text-gray-500 hover:text-gray-700 w-full text-center">
          인기종목 더보기 &gt;
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center space-x-1 mt-2">
        {allStocks.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-1 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </Card>
  );
}