import { useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { MarketNewsItem, timeAgo } from '../utils/market';
import { MarketArticleModal } from './MarketArticleModal';

/** AI 한국어 기사 목록 - 누르면 사이트 안에서 기사 창으로 열림 */
export function AiArticleList({ items, heading }: { items: MarketNewsItem[]; heading?: string }) {
  const [open, setOpen] = useState<MarketNewsItem | null>(null);
  if (!items.length) return null;
  return (
    <div>
      {heading && (
        <div className="flex items-center gap-1 text-[13px] lg:text-sm font-semibold text-gray-800 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" /> {heading}
        </div>
      )}
      <div className="space-y-1">
        {items.map(item => (
          <button
            key={item.url}
            onClick={() => setOpen(item)}
            className="w-full text-left flex items-start gap-2 hover:bg-gray-50 p-2 rounded"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
              {item.summary && <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.summary}</p>}
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <span className="text-teal-600">AI 요약</span>
                <span className="mx-1">·</span>
                <span>{item.category}</span>
                <span className="mx-1">·</span>
                <span>{timeAgo(item.publishedAt)}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
          </button>
        ))}
      </div>
      {open && <MarketArticleModal article={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
