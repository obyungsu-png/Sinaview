// 홈 · 자동차 섹션 — 자동차 게시판(BoardPage)과 같은 글 + 운전면허 연습 바로가기(맨 위)
import { MemberStories } from './MemberStories';
import { DriverLicenseBanner } from './DriverLicenseBanner';
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
      top={onDriverLicenseClick && <DriverLicenseBanner onClick={onDriverLicenseClick} />}
      footer={<MemberStories category="자동차" />}
    />
  );
}
