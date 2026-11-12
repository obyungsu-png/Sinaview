// 홈 · 자동차 섹션 — 자동차 게시판(BoardPage)과 같은 글 + 운전면허 공부 바로가기
import { MemberStories } from './MemberStories';
import { BoardSection } from './board/Board';
import type { BoardItem } from '../utils/portalBoards';

interface AutoSectionProps {
  category?: string;
  onMoreClick?: (sub?: string) => void;
  onArticleClick?: (item: BoardItem) => void;
  onDriverLicenseClick?: () => void;
}

export function AutoSection({ onMoreClick, onArticleClick, onDriverLicenseClick }: AutoSectionProps) {
  return (
    <BoardSection
      board="auto"
      onOpen={onArticleClick}
      onMore={onMoreClick}
      extra={
        onDriverLicenseClick && (
          <button
            onClick={onDriverLicenseClick}
            className="shrink-0 self-center my-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-[13px] font-medium whitespace-nowrap"
          >
            운전면허 공부
          </button>
        )
      }
      footer={<MemberStories category="자동차" />}
    />
  );
}
