// 홈 · 교육 섹션 — 교육 게시판(BoardPage)과 같은 글을 보여 주고, 누르면 그 글 상세로
import { MemberStories } from './MemberStories';
import { BoardSection } from './board/Board';
import type { BoardItem } from '../utils/portalBoards';

interface EducationSectionProps {
  category?: string;
  onMoreClick?: (sub?: string) => void;
  onArticleClick?: (item: BoardItem) => void;
  userRegion?: string;
}

export function EducationSection({ onMoreClick, onArticleClick }: EducationSectionProps) {
  return <BoardSection board="education" onOpen={onArticleClick} onMore={onMoreClick} footer={<MemberStories category="교육" />} />;
}
