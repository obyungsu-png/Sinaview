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
    <div className="bg-white rounded-2xl lg:rounded-xl border border-gray-200 px-4 pt-4 pb-1.5 lg:p-4">
      <div className="flex items-center justify-between mb-1 lg:mb-2">
        <h2 className="flex items-center gap-1.5 text-[18px] font-bold lg:font-semibold text-gray-900">
          <Flame className="hidden lg:block w-5 h-5 text-red-500" />
          인기글
        </h2>
        <button onClick={onMoreClick} className="flex items-center text-[14px] lg:text-sm text-gray-500 hover:text-gray-700">
          게시판 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <ol className="divide-y divide-gray-100">
        {popular.map((post, i) => (
          <li key={post.id}>
            <button
              onClick={() => onPostClick(post.id)}
              className="w-full flex items-start lg:items-center gap-3 lg:gap-2.5 py-3 lg:py-2 text-left group active:bg-gray-50"
            >
              <span className={`w-5 lg:w-4 shrink-0 text-center text-[17px] lg:text-[13px] font-bold leading-snug ${i < 3 ? 'text-[#03c75a] lg:text-red-500' : 'text-gray-400'}`}>{i + 1}</span>
              <span className="flex-1 min-w-0">
                {/* 휴대폰: 제목은 한 줄 전체 폭, 추천·댓글·조회는 아랫줄 */}
                <span className="block truncate text-[16px] lg:text-sm font-medium lg:font-normal text-gray-900 leading-snug group-hover:text-blue-600">
                  {post.title}
                  {post.comments > 0 && <span className="ml-1 text-blue-600">[{post.comments}]</span>}
                </span>
                <span className="lg:hidden mt-1 flex items-center gap-1.5 text-[13.5px] text-gray-500">
                  <span>{post.category}</span>
                  <span className="text-gray-300">·</span>
                  <span>추천 {post.likes}</span>
                  <span className="text-gray-300">·</span>
                  <span>조회 {post.views.toLocaleString()}</span>
                </span>
              </span>
              <span className="hidden lg:inline shrink-0 text-xs text-gray-400">추천 {post.likes}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
