import { useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { MarketNewsItem, timeAgo } from '../utils/market';

/** AI가 한국어로 다시 쓴 증권 기사 - 사이트 안에서 바로 읽기 */
export function MarketArticleModal({ article, onClose }: { article: MarketNewsItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <article
        className="bg-white w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{article.category}</span>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="닫기">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-5">
          <h2 className="text-[19px] sm:text-2xl font-bold text-gray-900 leading-snug">{article.title}</h2>
          <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center gap-x-2">
            <span className="flex items-center gap-1 text-teal-700"><Sparkles className="w-3.5 h-3.5" /> AI 기사</span>
            <span>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
          {article.summary && (
            <p className="mt-4 p-3 bg-gray-50 rounded-lg text-[14px] text-gray-700 leading-relaxed">{article.summary}</p>
          )}
          <div className="mt-4 text-[15px] text-gray-800 leading-[1.8] whitespace-pre-line">
            {article.content || article.summary}
          </div>
          <p className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
            이 글은 AI(GLM)가 {article.source} 보도를 바탕으로 한국어로 요약·재구성한 기사입니다. 투자 권유가 아닙니다.
          </p>
        </div>
      </article>
    </div>
  );
}
