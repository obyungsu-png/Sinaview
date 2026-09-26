import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Globe, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { fetchMarketQuotes, fetchMarketNews, formatUpdatedAt, timeAgo, MarketQuote, MarketNewsItem } from '../utils/market';
import { MarketArticleModal } from '../components/MarketArticleModal';

interface SecuritiesPageProps {
  onBack: () => void;
}

// 서버 데이터가 없을 때 보여 줄 예시 (중국·홍콩 증시)
const SAMPLE_QUOTES: MarketQuote[] = [
  { code: 'sh000001', name: '상하이종합', type: 'index', market: '상하이', price: 3125.67, change: 24.52, percent: 0.79 },
  { code: 'sz399001', name: '선전성분', type: 'index', market: '선전', price: 9876.23, change: -15.38, percent: -0.16 },
  { code: 'sh000300', name: 'CSI300', type: 'index', market: '상하이·선전', price: 3712.4, change: 10.2, percent: 0.28 },
  { code: 'sz399006', name: '창업판', type: 'index', market: '선전', price: 1932.1, change: -5.6, percent: -0.29 },
  { code: 'hkHSI', name: '항셍지수', type: 'index', market: '홍콩', price: 17234.89, change: 89.45, percent: 0.52 },
  { code: 'hkHSTECH', name: '항셍테크', type: 'index', market: '홍콩', price: 3785.3, change: 21.7, percent: 0.58 },
  { code: 'hk00700', name: '텐센트', type: 'stock', market: '홍콩', currency: 'HK$', price: 365.4, change: -8.6, percent: -2.3 },
  { code: 'hk09988', name: '알리바바', type: 'stock', market: '홍콩', currency: 'HK$', price: 84.52, change: 2.34, percent: 2.85 },
  { code: 'hk01211', name: 'BYD', type: 'stock', market: '홍콩', currency: 'HK$', price: 245.8, change: 8.2, percent: 3.45 },
  { code: 'hk01810', name: '샤오미', type: 'stock', market: '홍콩', currency: 'HK$', price: 28.45, change: 1.35, percent: 4.98 },
  { code: 'sh600519', name: '구이저우마오타이', type: 'stock', market: '상하이', currency: '¥', price: 1520.0, change: -12.0, percent: -0.78 },
  { code: 'sz300750', name: 'CATL(닝더스다이)', type: 'stock', market: '선전', currency: '¥', price: 186.3, change: 3.1, percent: 1.69 },
];

const SAMPLE_NEWS: MarketNewsItem[] = [
  { title: '중국 증시, 부동산 규제 완화 기대감에 상승 마감', originalTitle: '', summary: '', category: '상하이증시', url: '', source: '예시', publishedAt: new Date().toISOString() },
  { title: '항셍지수, 기술주 반등에 3거래일 연속 상승', originalTitle: '', summary: '', category: '홍콩증시', url: '', source: '예시', publishedAt: new Date().toISOString() },
  { title: '중국 인민은행, 지급준비율 인하 시사', originalTitle: '', summary: '', category: 'A주', url: '', source: '예시', publishedAt: new Date().toISOString() },
];

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (n: number, digits = 2) => `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`;

export function SecuritiesPage({ onBack }: SecuritiesPageProps) {
  const [quotes, setQuotes] = useState<MarketQuote[] | null>(null);
  const [quotesUpdatedAt, setQuotesUpdatedAt] = useState<string | null>(null);
  const [news, setNews] = useState<MarketNewsItem[] | null>(null);
  const [briefing, setBriefing] = useState('');
  const [newsUpdatedAt, setNewsUpdatedAt] = useState<string | null>(null);
  const [openArticle, setOpenArticle] = useState<MarketNewsItem | null>(null);

  useEffect(() => {
    const loadQuotes = async () => {
      const data = await fetchMarketQuotes();
      if (data) { setQuotes(data.quotes); setQuotesUpdatedAt(data.updatedAt); }
    };
    loadQuotes();
    fetchMarketNews().then(data => {
      if (!data) return;
      if (data.items.length) setNews(data.items);
      setBriefing(data.briefing || '');
      setNewsUpdatedAt(data.updatedAt);
    });
    const timer = setInterval(loadQuotes, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const isLive = !!quotes;
  const allQuotes = quotes ?? SAMPLE_QUOTES;
  const indexes = allQuotes.filter(q => q.type === 'index');
  const stocks = allQuotes.filter(q => q.type !== 'index');
  const newsItems = news ?? SAMPLE_NEWS;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>메인으로</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">증권</h1>
              <div className="text-sm text-gray-500 hidden sm:block">중국·홍콩 증시 정보</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>{isLive ? '5분마다 갱신' : '예시 데이터'}</span>
              </Badge>
              {quotesUpdatedAt && (
                <div className="text-xs text-gray-500">마지막 업데이트: {formatUpdatedAt(quotesUpdatedAt)}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 주요 지수 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold mb-3">주요 지수</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {indexes.map(index => (
              <div key={index.code} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{index.name}</div>
                <div className="font-semibold">{fmt(index.price)}</div>
                <div className={`text-xs ${index.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {signed(index.change)} ({signed(index.percent)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stocks">종목정보</TabsTrigger>
            <TabsTrigger value="news">증시뉴스</TabsTrigger>
            <TabsTrigger value="briefing">AI 시장 브리핑</TabsTrigger>
          </TabsList>

          {/* 종목정보 */}
          <TabsContent value="stocks" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">중국·홍콩 주요 종목</h3>
              <div className="space-y-3">
                {stocks.map(stock => (
                  <div key={stock.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.market} · {stock.code.replace(/^(sh|sz|hk)/, '').toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{stock.currency}{fmt(stock.price)}</div>
                      <div className={`text-sm flex items-center justify-end space-x-1 ${stock.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{signed(stock.change)} ({signed(stock.percent)}%)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* 증시뉴스 (AI 한국어 요약) */}
          <TabsContent value="news" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">중국 증시 뉴스</h3>
                {newsUpdatedAt && <span className="text-xs text-gray-500">AI 기사 · {formatUpdatedAt(newsUpdatedAt)} 업데이트</span>}
              </div>
              <div className="grid gap-3">
                {newsItems.map((item, i) => {
                  const body = (
                    <>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <span className="text-xs text-gray-500">{item.content ? 'AI 기사 · ' : ''}{timeAgo(item.publishedAt)}</span>
                      </div>
                      <h4 className="font-medium line-clamp-2">{item.title}</h4>
                      {item.summary && <p className="text-sm text-gray-600 mt-1">{item.summary}</p>}
                    </>
                  );
                  return item.content ? (
                    <button key={item.url} onClick={() => setOpenArticle(item)}
                      className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                      {body}
                    </button>
                  ) : (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">{body}</div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* AI 시장 브리핑 */}
          <TabsContent value="briefing" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" /> 오늘의 중국 증시 브리핑
              </h3>
              {briefing ? (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-5 text-[15px] leading-relaxed whitespace-pre-line text-gray-800">
                  {briefing}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">브리핑을 준비하고 있습니다. 잠시 후 다시 확인해 주세요.</p>
              )}
              <p className="text-xs text-gray-400 mt-3">
                AI(GLM)가 지수와 뉴스를 바탕으로 1시간마다 자동 작성합니다. 투자 권유가 아닙니다.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {openArticle && <MarketArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />}

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
