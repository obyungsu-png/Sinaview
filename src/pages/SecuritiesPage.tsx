import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, LineChart, Calendar, Globe } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface SecuritiesPageProps {
  onBack: () => void;
}

export function SecuritiesPage({ onBack }: SecuritiesPageProps) {
  const stockData = [
    {
      symbol: "AAPL",
      name: "애플",
      price: "$193.52",
      change: "+2.15",
      changePercent: "+1.12%",
      isUp: true,
      volume: "45.2M",
      marketCap: "$3.01T"
    },
    {
      symbol: "TSLA",
      name: "테슬라",
      price: "$248.87",
      change: "-3.42",
      changePercent: "-1.36%",
      isUp: false,
      volume: "67.8M",
      marketCap: "$789.2B"
    },
    {
      symbol: "NVDA",
      name: "엔비디아",
      price: "$875.31",
      change: "+15.67",
      changePercent: "+1.82%",
      isUp: true,
      volume: "89.1M",
      marketCap: "$2.15T"
    },
    {
      symbol: "BYD",
      name: "비야디",
      price: "HK$245.80",
      change: "+8.20",
      changePercent: "+3.45%",
      isUp: true,
      volume: "12.5M",
      marketCap: "HK$715B"
    },
    {
      symbol: "BABA",
      name: "알리바바",
      price: "$78.92",
      change: "-1.25",
      changePercent: "-1.56%",
      isUp: false,
      volume: "23.7M",
      marketCap: "$201.3B"
    },
    {
      symbol: "005930",
      name: "삼성전자",
      price: "₩71,500",
      change: "+1,000",
      changePercent: "+1.42%",
      isUp: true,
      volume: "8.9M",
      marketCap: "₩427조"
    }
  ];

  const newsData = [
    {
      id: 1,
      title: "중국 증시, 부동산 규제 완화 기대감에 상승 마감",
      source: "차이나데일리",
      time: "1시간 전",
      category: "중국증시",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=120&fit=crop"
    },
    {
      id: 2,
      title: "미국 연준 금리 인하 시사, 아시아 증시 일제히 상승",
      source: "월스트리트저널",
      time: "2시간 전",
      category: "미국증시",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&h=120&fit=crop"
    },
    {
      id: 3,
      title: "한국 코스피, 반도체 대장주 강세에 2,700선 돌파",
      source: "한국경제",
      time: "3시간 전",
      category: "한국증시",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=120&fit=crop"
    },
    {
      id: 4,
      title: "테슬라 3분기 실적 부진, 전기차 경쟁 심화 우려",
      source: "블룸버그",
      time: "4시간 전",
      category: "기업분석",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&h=120&fit=crop"
    }
  ];

  const analysisData = [
    {
      id: 1,
      title: "2024년 4분기 중국 증시 전망: 정책 부양책 기대감 지속",
      analyst: "김증권 (골드만삭스)",
      rating: "매수",
      target: "상승",
      summary: "중국 정부의 경기 부양책과 부동산 규제 완화 기대감으로 상승 전망",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=120&fit=crop"
    },
    {
      id: 2,
      title: "AI 반도체 대장주 엔비디아, 목표가 상향 조정",
      analyst: "박애널 (모건스탠리)",
      rating: "강력매수",
      target: "$950",
      summary: "AI 수요 폭증과 데이터센터 투자 확대로 실적 개선 지속 예상",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=200&h=120&fit=crop"
    },
    {
      id: 3,
      title: "한국 전기차 배터리 3사, 글로벌 점유율 확대 전략",
      analyst: "이리서치 (JP모건)",
      rating: "매수",
      target: "상승",
      summary: "LG엔솔, SK온, 삼성SDI의 북미 진출 가속화로 성장 모멘텀 강화",
      image: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=200&h=120&fit=crop"
    }
  ];

  const indexData = [
    { name: "상하이종합", value: "3,125.67", change: "+24.52", changePercent: "+0.79%" },
    { name: "선전성분", value: "9,876.23", change: "-15.38", changePercent: "-0.16%" },
    { name: "항셍지수", value: "17,234.89", change: "+89.45", changePercent: "+0.52%" },
    { name: "코스피", value: "2,712.34", change: "+18.92", changePercent: "+0.70%" },
    { name: "나스닥", value: "15,567.89", change: "+67.23", changePercent: "+0.43%" },
    { name: "S&P500", value: "4,789.56", change: "+12.84", changePercent: "+0.27%" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={onBack}
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>메인으로</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">증권</h1>
              <div className="text-sm text-gray-500">
                글로벌 증시 및 투자 정보
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>실시간</span>
              </Badge>
              <div className="text-xs text-gray-500">
                마지막 업데이트: 2024.09.29 15:30
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold mb-3">주요 지수</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {indexData.map((index, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{index.name}</div>
                <div className="font-semibold">{index.value}</div>
                <div className={`text-xs ${index.change.startsWith('+') ? 'text-red-500' : 'text-blue-500'}`}>
                  {index.change} ({index.changePercent})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stocks">종목정보</TabsTrigger>
            <TabsTrigger value="news">증시뉴스</TabsTrigger>
            <TabsTrigger value="analysis">투자분석</TabsTrigger>
            <TabsTrigger value="charts">차트분석</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="mt-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">주요 종목</h3>
                <div className="space-y-4">
                  {stockData.map((stock, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-semibold">{stock.name}</div>
                          <div className="text-sm text-gray-500">{stock.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{stock.price}</div>
                        <div className={`text-sm flex items-center space-x-1 ${stock.isUp ? 'text-red-500' : 'text-blue-500'}`}>
                          {stock.isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>{stock.change} ({stock.changePercent})</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>거래량: {stock.volume}</div>
                        <div>시가총액: {stock.marketCap}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news" className="mt-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">증시 뉴스</h3>
                <div className="grid gap-4">
                  {newsData.map((news) => (
                    <div key={news.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <ImageWithFallback
                        src={news.image}
                        alt={news.title}
                        className="w-24 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {news.category}
                          </Badge>
                          <span className="text-xs text-gray-500">{news.time}</span>
                        </div>
                        <h4 className="font-medium line-clamp-2 mb-1">{news.title}</h4>
                        <div className="text-sm text-gray-600">{news.source}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">투자 분석 리포트</h3>
                <div className="grid gap-6">
                  {analysisData.map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4 hover:shadow-md cursor-pointer">
                      <div className="flex space-x-4">
                        <ImageWithFallback
                          src={analysis.image}
                          alt={analysis.title}
                          className="w-32 h-20 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={`text-xs ${analysis.rating === '강력매수' ? 'bg-red-500' : analysis.rating === '매수' ? 'bg-green-500' : 'bg-gray-500'}`}>
                              {analysis.rating}
                            </Badge>
                            <span className="text-sm text-gray-600">{analysis.analyst}</span>
                          </div>
                          <h4 className="font-semibold mb-2">{analysis.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{analysis.summary}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-500">목표: <span className="font-medium">{analysis.target}</span></span>
                            <span className="text-gray-500">분석가: {analysis.analyst.split('(')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">차트 분석</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      일봉
                    </Button>
                    <Button variant="outline" size="sm">
                      <LineChart className="w-4 h-4 mr-2" />
                      주봉
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      월봉
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">차트 분석 도구</p>
                  <p className="text-sm text-gray-500">종목을 선택하여 상세 차트를 확인하세요</p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    차트 보기
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2 font-semibold">투자 유의사항</p>
            <p>투자에는 위험이 따릅니다. 투자 결정은 신중하게 하시기 바랍니다.</p>
            <p>제공되는 정보는 투자 권유가 아니며, 투자 판단의 참고용으로만 활용하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}