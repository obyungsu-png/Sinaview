import { Flame, ChevronRight } from 'lucide-react';
import { useCommunityPosts } from '../utils/community';

interface PopularPostsProps {
  onPostClick: (postId: number) => void;
  onMoreClick: () => void;
  limit?: number;
}

/** 메인 인기글 박스 - 게시판에서 추천이 많은 글 (공지 제외) */
export function PopularPosts({ onPostClick, onMoreClick, limit = 5 }: PopularPostsProps) {
  const popular = useCommunityPosts()
    .filter(p => !p.badgeType)
    .sort((a, b) => b.likes - a.likes || b.views - a.views)
    .slice(0, limit);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-1.5 text-[15px] lg:text-lg font-semibold text-gray-900">
          <Flame className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
          인기글
        </h2>
        <button onClick={onMoreClick} className="flex items-center text-[12px] lg:text-sm text-gray-500 hover:text-gray-700">
          게시판 <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <ol className="divide-y divide-gray-100">
        {popular.map((post, i) => (
          <li key={post.id}>
            <button
              onClick={() => onPostClick(post.id)}
              className="w-full flex items-center gap-2.5 py-2 text-left group"
            >
              <span className={`w-4 shrink-0 text-center text-[13px] font-bold ${i < 3 ? 'text-red-500' : 'text-gray-400'}`}>{i + 1}</span>
              <span className="flex-1 min-w-0 truncate text-[13px] lg:text-sm text-gray-900 group-hover:text-blue-600">
                {post.title}
                {post.comments > 0 && <span className="ml-1 text-blue-600">[{post.comments}]</span>}
              </span>
              <span className="shrink-0 text-[11px] lg:text-xs text-gray-400">추천 {post.likes}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
