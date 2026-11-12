// 홈 · 중국소식 섹션 — 중국소식 게시판(BoardPage)과 같은 AI 기사, 누르면 그 기사 상세로
import { BoardSection } from './board/Board';
import type { BoardItem } from '../utils/portalBoards';

interface NewsSectionProps {
  category?: string;
  onMoreClick?: (sub?: string) => void;
  onArticleClick?: (item: BoardItem) => void;
}

export function NewsSection({ onMoreClick, onArticleClick }: NewsSectionProps) {
  return <BoardSection board="news" onOpen={onArticleClick} onMore={onMoreClick} />;
}
