import { createContext, useContext } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { BoardCategory } from '../data/chinaLifePosts';
import { useCommunityPosts } from '../utils/community';

/** 섹션 → 게시판 이동 (Portal 에서 제공) */
export const CommunityNavContext = createContext<{
  openPost: (postId: number) => void;
  openBoard: (category: string) => void;
} | null>(null);

/** 각 메뉴 섹션 아래 "회원 이야기" - 같은 분류의 최신 게시판 글 3개 */
export function MemberStories({ category, limit = 3 }: { category: BoardCategory; limit?: number }) {
  const nav = useContext(CommunityNavContext);
  const stories = useCommunityPosts()
    .filter(p => p.category === category && !p.badgeType)
    .sort((a, b) => b.id - a.id)
    .slice(0, limit);
  if (!nav || stories.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1 text-[13px] lg:text-sm font-semibold text-gray-800">
          <MessageCircle className="w-3.5 h-3.5 text-teal-600" /> 회원 이야기
        </span>
        <button onClick={() => nav.openBoard(category)} className="flex items-center text-[11px] lg:text-xs text-gray-500 hover:text-gray-700">
          게시판 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <ul>
        {stories.map(post => (
          <li key={post.id}>
            <button
              onClick={() => nav.openPost(post.id)}
              className="w-full flex items-center gap-2 py-1 text-left group"
            >
              <span className="flex-1 min-w-0 truncate text-[13px] lg:text-sm text-gray-700 group-hover:text-blue-600">
                {post.title}
              </span>
              {post.comments > 0 && <span className="shrink-0 text-[11px] lg:text-xs text-blue-600">[{post.comments}]</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
