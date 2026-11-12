// 홈 · 비자/서류 섹션 — 비자/서류 게시판(BoardPage)과 같은 글을 보여 주고, 누르면 그 글 상세로
import { MemberStories } from './MemberStories';
import { BoardSection } from './board/Board';
import type { BoardItem } from '../utils/portalBoards';

interface VisaDocumentSectionProps {
  category?: string;
  onMoreClick?: (sub?: string) => void;
  onArticleClick?: (item: BoardItem) => void;
}

export function VisaDocumentSection({ onMoreClick, onArticleClick }: VisaDocumentSectionProps) {
  return <BoardSection board="visa" onOpen={onArticleClick} onMore={onMoreClick} footer={<MemberStories category="비자/서류" />} />;
}
