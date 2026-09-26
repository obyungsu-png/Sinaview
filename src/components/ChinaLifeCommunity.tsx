import { useState, useEffect } from 'react';
import { CITY_ROOMS, NAVER_CAFE_URL } from '../config/communityLinks';
import { Post, CHINA_LIFE_POSTS, BOARD_CATEGORIES, CATEGORY_PAGES } from '../data/chinaLifePosts';

// 필독(공지) 글을 위로, 나머지는 최신순
const posts = [...CHINA_LIFE_POSTS].sort((a, b) => Number(!!b.badgeType) - Number(!!a.badgeType) || b.id - a.id);
import { CityRoomCard, ShareButtons } from './CommunityConnect';


interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  likes: number;
}

interface ChinaLifeCommunityProps {
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
  onBack?: () => void;
  initialPostId?: number | null;
  initialCategory?: string | null;
  onNavigate?: (page: string) => void;
}

export function ChinaLifeCommunity({ currentUser, isAdmin, onBack, initialPostId, initialCategory, onNavigate }: ChinaLifeCommunityProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(() => posts.find(p => p.id === initialPostId) ?? null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory || '전체');
  // 지역은 분류와 따로 선택 (분류 + 지역 조합)
  const [activeCityName, setActiveCityName] = useState('전체');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '베이징러버',
      content: '정말 유용한 정보네요! 감사합니다 ^^',
      date: '2025.12.24 15:30',
      likes: 5
    },
    {
      id: 2,
      author: '상하이맨',
      content: '저도 이 정보 필요했는데 딱 좋네요!',
      date: '2025.12.24 16:15',
      likes: 3
    }
  ]);
  const [newComment, setNewComment] = useState('');


  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearchTerm('');
    setSearchInput('');
  };

  const categoryFilterMap: Record<string, (post: Post) => boolean> = {
    '전체': () => true,
    '공지사항': (p) => p.badgeType === 'notice',
    '신입 가이드': (p) => p.title.includes('가이드') || p.title.includes('1년차') || p.title.includes('꼭 알'),
    ...Object.fromEntries(BOARD_CATEGORIES.map(cat => [cat, (p: Post) => p.category === cat])),
  };
  const activeCity = CITY_ROOMS.find(room => room.name === activeCityName);
  const categoryPage = CATEGORY_PAGES[activeCategory as keyof typeof CATEGORY_PAGES];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === '전체' || 
      (categoryFilterMap[activeCategory] ? categoryFilterMap[activeCategory](post) : true);
    const matchesCity = !activeCity || activeCity.keywords.some(k => post.title.includes(k));
    return matchesSearch && matchesCategory && matchesCity;
  });

  const handleAddComment = () => {
    if (newComment.trim() && currentUser) {
      const comment: Comment = {
        id: comments.length + 1,
        author: currentUser.name,
        content: newComment,
        date: new Date().toLocaleString('ko-KR'),
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (isAdmin) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Noto Sans KR', sans-serif", backgroundColor: '#f5f6f7', color: '#333', fontSize: '13px' }}>
      <style>{`
        /* 초기화 및 공통 스타일 */
        * { box-sizing: border-box; }
        a { text-decoration: none; color: inherit; }
        ul { list-style: none; }
        button { cursor: pointer; border: none; font-family: inherit; }

        /* 상단 헤더 바 */
        .community-top-bar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .community-top-bar h1 {
            color: white;
            font-size: 20px;
            font-weight: 600;
            margin: 0;
        }
        .btn-home {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn-home:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        /* 레이아웃 컨테이너 */
        .community-wrapper {
            display: flex;
            max-width: 1280px; /* 메인 화면(max-w-7xl)과 같은 폭 */
            margin: 0 auto;
            background-color: #fff;
            min-height: calc(100vh - 60px);
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }

        /* === 모바일 최적화 === */
        @media (max-width: 768px) {
            .community-wrapper {
                flex-direction: column;
                border-left: none;
                border-right: none;
            }
            .community-sidebar {
                width: 100% !important;
                border-right: none !important;
                border-bottom: 1px solid #eee;
                padding: 10px 12px !important;
                background: #fff !important;
            }
            /* 프로필 카드: 아바타 + 텍스트 + 통계 한 줄 가로 배치 */
            .profile-card {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 10px;
                padding: 8px 10px !important;
                margin-bottom: 0 !important;
                text-align: left !important;
                border-radius: 8px;
            }
            .profile-info {
                flex: 1;
                min-width: 0; /* 핵심: 세로 줄바꿈 방지 */
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                gap: 8px !important;
                margin-bottom: 0 !important;
            }
            .avatar-circle {
                width: 34px !important;
                height: 34px !important;
                font-size: 15px !important;
                flex-shrink: 0 !important;
            }
            .user-details {
                min-width: 0; /* 핵심: 텍스트 overflow 허용 */
                flex: 1;
            }
            .nickname {
                font-size: 12px !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                display: block !important;
            }
            .role {
                font-size: 9px !important;
                padding: 1px 4px !important;
                white-space: nowrap;
            }
            .stats {
                flex-direction: row !important;
                gap: 6px !important;
                margin-top: 0 !important;
                justify-content: flex-start !important;
                font-size: 10px !important;
                flex-shrink: 0;
                white-space: nowrap;
            }
            /* 모바일에서 사이드바 메뉴는 가로 스크롤 */
            .menu-list {
                display: flex;
                gap: 6px;
                overflow-x: auto;
                padding-bottom: 4px;
                margin-top: 8px;
                -webkit-overflow-scrolling: touch;
            }
            .menu-list::-webkit-scrollbar { display: none; }
            .menu-list li {
                border-bottom: none !important;
                border-radius: 20px;
                background: #f5f5f5;
                padding: 5px 10px !important;
                font-size: 11px !important;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .menu-list li.title {
                display: none !important;
            }
            .community-content {
                padding: 12px 10px !important;
            }
            .board-header h2 {
                font-size: 14px !important;
                white-space: nowrap;
            }
            .board-header {
                padding-bottom: 8px !important;
                margin-bottom: 12px !important;
            }
            /* 게시판 테이블 모바일 최적화 */
            .board-table {
                font-size: 12px !important;
                width: 100%;
            }
            .board-table th, .board-table td {
                padding: 8px 4px !important;
                font-size: 11px !important;
            }
            .board-table .title-col {
                max-width: 160px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .board-table .author-col {
                max-width: 70px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            /* 모바일에서 조회/추천/날짜 숨기기 (col 너비도 함께 제거) */
            .col-views, .col-likes, .col-date {
                display: none;
            }
            .board-table col.col-check { width: 26px !important; }
            .board-table col.col-type { width: 52px !important; }
            .board-table .badge-box { white-space: nowrap; padding: 2px 5px; font-size: 10px; }
            .board-table col.col-author { width: 76px !important; }
            .board-table .title-col { max-width: none; }
            .toolbar {
                flex-wrap: wrap;
                gap: 6px;
                font-size: 11px !important;
            }
            .btn-analyze {
                font-size: 11px !important;
                padding: 4px 10px !important;
            }
            .btn-write-blue {
                font-size: 12px !important;
                padding: 6px 12px !important;
            }
            .board-footer {
                flex-wrap: wrap;
                gap: 6px;
                font-size: 12px !important;
            }
            /* 게시판 상단 카테고리 탭 가로 스크롤 */
            .category-tabs {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                flex-wrap: nowrap !important;
            }
            .category-tabs::-webkit-scrollbar { display: none; }
        }

        /* === 좌측 사이드바 === */
        .community-sidebar {
            width: 220px;
            padding: 20px 15px;
            border-right: 1px solid #ddd;
            background-color: #fafafa;
        }

        /* 프로필 영역 */
        .profile-card {
            margin-bottom: 25px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            background-color: #fff;
        }
        .profile-info { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .avatar-circle {
            width: 55px; height: 55px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%; display: flex; justify-content: center; align-items: center; 
            font-size: 26px; color: #fff; font-weight: bold;
        }
        .user-details { text-align: left; }
        .nickname { font-weight: 600; display: block; font-size: 14px; color: #333; }
        .role { font-size: 10px; color: #666; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; margin-top: 4px; display: inline-block; }
        .stats { display: flex; font-size: 11px; color: #888; gap: 12px; margin-top: 12px; justify-content: center; }
        .stats i { color: #667eea; margin-right: 4px; }

        /* 메뉴 리스트 */
        .menu-list { padding: 0; margin: 0; }
        .menu-list li { 
            padding: 10px 8px; 
            border-bottom: 1px solid #f0f0f0; 
            display: flex; 
            justify-content: space-between; 
            cursor: pointer;
            font-size: 13px;
            color: #555;
            transition: all 0.2s;
        }
        .menu-list li.title { 
            font-weight: 600; 
            color: #333; 
            border-bottom: 2px solid #ddd; 
            padding-bottom: 8px; 
            margin-bottom: 5px; 
            margin-top: 20px; 
            cursor: default;
            font-size: 13px;
        }
        .menu-list li.title:first-child {
            margin-top: 0;
        }
        .menu-list li i { color: #ccc; font-size: 11px; }
        .menu-list li:hover:not(.title) { 
            background-color: #f8f9fa; 
            color: #667eea;
            padding-left: 12px;
        }

        /* === 우측 콘텐츠 === */
        .community-content { flex: 1; padding: 25px 30px; background-color: #fff; }

        /* 헤더 */
        .board-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 2px solid #667eea; 
            padding-bottom: 12px; 
            margin-bottom: 20px; 
        }
        .board-header h2 { font-size: 19px; font-weight: 600; color: #333; }
        .btn-analyze { 
            background: #f8f9fa; 
            border: 1px solid #ddd; 
            padding: 6px 12px; 
            font-size: 12px; 
            border-radius: 4px;
            color: #666;
            transition: all 0.2s;
        }
        .btn-analyze:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        /* 툴바 */
        .toolbar { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 15px; 
            font-size: 12px; 
            color: #666;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .tool-left { display: flex; align-items: center; gap: 15px; }
        .tool-right i { margin-left: 10px; cursor: pointer; color: #999; transition: all 0.2s; }
        .tool-right i.active { color: #667eea; }
        .tool-right i:hover { color: #667eea; }
        .select-rows { 
            border: 1px solid #ddd; 
            padding: 4px 8px; 
            color: #666; 
            border-radius: 4px;
            font-size: 12px;
            background: white;
        }

        /* 게시판 테이블 */
        .board-table { width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; }
        .board-table th { 
            border-bottom: 1px solid #e0e0e0; 
            padding: 12px 8px; 
            color: #666; 
            font-weight: 500; 
            background-color: #fafafa;
            font-size: 12px;
        }
        .board-table td { 
            border-bottom: 1px solid #f5f5f5; 
            padding: 12px 8px; 
            color: #666; 
            text-align: center; 
            vertical-align: middle; 
        }
        
        .board-table td.title-col { 
            text-align: left; 
            padding-left: 10px; 
            color: #333; 
            cursor: pointer; 
            text-overflow: ellipsis; 
            white-space: nowrap; 
            overflow: hidden;
            transition: color 0.2s;
        }
        .board-table td.title-col:hover { 
            color: #667eea;
        }
        .board-table td.author-col { cursor: pointer; }
        .board-table tr:hover {
            background-color: #fafafa;
        }

        /* 공지/필독 스타일 */
        .badge-box {
            display: inline-block;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 600;
            color: #667eea;
            background-color: #f0f2ff;
            border: 1px solid #d0d5ff;
            border-radius: 3px;
            line-height: 1;
        }
        
        .badge-box.notice {
            color: #ff6b6b;
            background-color: #fff0f0;
            border-color: #ffd0d0;
        }

        .title-notice {
            color: #333 !important;
            font-weight: 500;
        }
        
        .comment-count {
            color: #667eea;
            font-weight: 600;
            font-size: 11px;
            margin-left: 5px;
        }

        /* 아이콘 멤버 등급 */
        .icon-member { 
            font-size: 10px; 
            color: #667eea; 
            border: 1px solid #667eea; 
            padding: 1px 4px; 
            border-radius: 3px; 
            font-weight: 600; 
            margin-left: 4px; 
        }
        .icon-staff { 
            font-size: 10px; 
            color: #764ba2; 
            border: 1px solid #764ba2; 
            padding: 1px 4px; 
            border-radius: 3px; 
            font-weight: 600; 
            margin-left: 4px; 
        }

        /* 하단 버튼 */
        .board-footer { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 1px solid #f0f0f0;
        }
        .footer-left { display: flex; gap: 8px; align-items: center; font-size: 12px; }
        .footer-left button { 
            background: #f8f9fa; 
            border: 1px solid #ddd; 
            padding: 6px 12px; 
            font-size: 12px; 
            border-radius: 4px;
            color: #666;
            transition: all 0.2s;
        }
        .footer-left button:hover {
            background: #e9ecef;
        }
        .btn-write-blue { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            border: none;
            padding: 8px 16px; 
            font-weight: 600; 
            border-radius: 6px; 
            display: flex; 
            align-items: center; 
            gap: 6px;
            font-size: 13px;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
        }
        .btn-write-blue:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        input[type="checkbox"] { vertical-align: middle; cursor: pointer; }

        /* === 게시글 상세 페이지 === */
        .post-detail {
            padding: 0;
        }

        .post-detail-header {
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }

        .post-title {
            font-size: 22px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            line-height: 1.4;
        }

        .post-meta {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 13px;
            color: #888;
        }

        .post-author {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .author-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }

        .author-name {
            font-weight: 600;
            color: #333;
        }

        .post-stats {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .post-content {
            font-size: 15px;
            line-height: 1.8;
            color: #333;
            padding: 25px 0;
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 25px;
            white-space: pre-wrap;
        }

        .post-content a {
            color: #667eea;
            text-decoration: underline;
        }

        .post-actions {
            display: flex;
            gap: 15px;
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 30px;
        }

        .action-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            color: #666;
            font-size: 13px;
            transition: all 0.2s;
        }

        .action-btn:hover {
            border-color: #667eea;
            color: #667eea;
        }

        .action-btn.liked {
            border-color: #ff6b6b;
            color: #ff6b6b;
            background: #fff5f5;
        }

        .back-to-list {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            color: #666;
            font-size: 13px;
            margin-bottom: 20px;
            transition: all 0.2s;
        }

        .back-to-list:hover {
            border-color: #667eea;
            color: #667eea;
        }

        /* 댓글 섹션 */
        .comments-section {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 2px solid #f0f0f0;
        }

        .comments-header {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }

        .comment-item {
            padding: 15px 0;
            border-bottom: 1px solid #f5f5f5;
        }

        .comment-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .comment-author-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .comment-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 12px;
        }

        .comment-author-name {
            font-weight: 600;
            color: #333;
            font-size: 13px;
        }

        .comment-date {
            font-size: 12px;
            color: #999;
        }

        .comment-delete-btn {
            padding: 4px 10px;
            border: 1px solid #ff6b6b;
            border-radius: 4px;
            background: white;
            color: #ff6b6b;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .comment-delete-btn:hover {
            background: #ff6b6b;
            color: white;
        }

        .comment-content {
            font-size: 14px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 10px;
            padding-left: 42px;
        }

        .comment-actions {
            display: flex;
            gap: 12px;
            padding-left: 42px;
        }

        .comment-action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #888;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }

        .comment-action-btn:hover {
            color: #667eea;
        }

        .comment-input-wrapper {
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            padding: 15px;
            margin-top: 20px;
        }

        .comment-input-header {
            font-size: 13px;
            font-weight: 600;
            color: #666;
            margin-bottom: 10px;
        }

        .comment-input-box {
            display: flex;
            gap: 10px;
        }

        .comment-textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 13px;
            font-family: inherit;
            resize: none;
            min-height: 80px;
        }

        .comment-textarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .comment-submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            height: fit-content;
        }

        .comment-submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .comment-submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .login-required {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
            margin-top: 20px;
            text-align: center;
        }
      `}</style>

      <div className="community-top-bar">
        <h1>중국생활 커뮤니티</h1>
        <button className="btn-home" onClick={onBack}>
          <i className="fa-solid fa-house"></i>
          홈으로
        </button>
      </div>

      <div className="community-wrapper">
        {/* 좌측 사이드바 */}
        <aside className="community-sidebar">
          <div className="profile-card">
            <div className="profile-info">
              <div className="avatar-circle">中</div>
              <div className="user-details">
                <span className="nickname">중국생활 커뮤니티</span>
                <span className="role">공식 게시판</span>
              </div>
            </div>
            <div className="stats">
              <span><i className="fa-solid fa-users"></i> 2,850명</span>
              <span><i className="fa-solid fa-comment"></i> 5,240개</span>
            </div>
            {NAVER_CAFE_URL && (
              <a
                href={NAVER_CAFE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  marginTop: '14px', background: 'linear-gradient(135deg, #03c75a, #00a843)',
                  color: 'white', padding: '8px 12px', borderRadius: '6px',
                  fontSize: '12px', fontWeight: '600', textDecoration: 'none', width: '100%'
                }}
              >
                N 네이버 카페 바로가기
              </a>
            )}
          </div>

          <ul className="menu-list">
            <li className="title">★ 필독 게시판</li>
            <li onClick={() => handleCategoryClick('공지사항')} style={activeCategory === '공지사항' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}><i className="fa-solid fa-bullhorn"></i> 공지사항</li>
            <li onClick={() => handleCategoryClick('신입 가이드')} style={activeCategory === '신입 가이드' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}><i className="fa-regular fa-file-lines"></i> 신입 가이드</li>
            
            <li className="title">게시판</li>
            {['전체', ...BOARD_CATEGORIES].map(cat => (
              <li key={cat} onClick={() => handleCategoryClick(cat)} style={activeCategory === cat ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>{cat}</li>
            ))}
          </ul>
        </aside>

        {/* 우측 메인 콘텐츠 */}
        <main className="community-content">
          {!selectedPost ? (
            <>
              <div className="board-header">
                <h2>
                  {activeCategory === '전체' ? '중국 생활 정보 게시판' : activeCategory}
                  {activeCityName !== '전체' && <span style={{fontSize: '14px', color: '#667eea', marginLeft: '8px'}}>📍 {activeCityName}</span>}
                </h2>
                <button className="btn-analyze">통계 보기</button>
              </div>

              {/* 우리 동네 선택 */}
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px'}}>
                {['전체', ...CITY_ROOMS.map(room => room.name)].map(name => (
                  <button
                    key={name}
                    onClick={() => setActiveCityName(name)}
                    style={{
                      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
                      border: activeCityName === name ? '1px solid #667eea' : '1px solid #ddd',
                      background: activeCityName === name ? '#667eea' : 'white',
                      color: activeCityName === name ? 'white' : '#555',
                    }}
                  >{name === '전체' ? '전체 지역' : name}</button>
                ))}
              </div>
              {activeCity && <CityRoomCard room={activeCity} />}

              {/* 분류 → 메뉴 섹션 정보로 연결 */}
              {categoryPage && onNavigate && (
                <button
                  onClick={() => onNavigate(categoryPage.page)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', cursor: 'pointer',
                    border: '1px solid #cdeee8', background: '#f0fbf9', color: '#0f766e', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  <span>📋 {categoryPage.label}</span>
                  <span>→</span>
                </button>
              )}

              {/* 검색바 */}
              <div style={{
                display: 'flex', gap: '8px', marginBottom: '16px',
                padding: '12px 0', borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{position: 'relative', flex: 1}}>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="제목, 내용, 작성자로 검색..."
                    style={{
                      width: '100%', padding: '8px 36px 8px 12px',
                      border: '1px solid #ddd', borderRadius: '6px',
                      fontSize: '13px', outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#667eea')}
                    onBlur={e => (e.target.style.borderColor = '#ddd')}
                  />
                  {searchInput && (
                    <button
                      onClick={() => { setSearchInput(''); setSearchTerm(''); }}
                      style={{
                        position: 'absolute', right: '8px', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px'
                      }}
                    >×</button>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white', border: 'none', borderRadius: '6px',
                    padding: '8px 16px', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass" style={{marginRight: '5px'}}></i>
                  검색
                </button>
              </div>

              <div className="toolbar">
                <div className="tool-left">
                  <span style={{fontSize: '12px', color: '#888'}}>
                    {searchTerm ? (
                      <>검색결과 <strong style={{color: '#667eea'}}>{filteredPosts.length}</strong>개 / 전체 <strong style={{color: '#667eea'}}>1,052</strong>개</>
                    ) : (
                      <>전체 <strong style={{color: '#667eea'}}>1,052</strong>개</>
                    )}
                  </span>
                  <span><input type="checkbox" /> 공지 제외</span>
                </div>
                <div className="tool-right">
                  <i className="fa-solid fa-list active"></i>
                  <i className="fa-solid fa-table-cells-large"></i>
                  <select className="select-rows">
                    <option>15개씩</option>
                    <option>30개씩</option>
                    <option>50개씩</option>
                  </select>
                </div>
              </div>

              <table className="board-table">
                <colgroup>
                  <col className="col-check" style={{width: '30px'}} />
                  <col className="col-type" style={{width: '70px'}} />
                  <col style={{width: 'auto'}} />
                  <col className="col-author" style={{width: '100px'}} />
                  <col className="col-date" style={{width: '90px'}} />
                  <col className="col-views" style={{width: '60px'}} />
                  <col className="col-likes" style={{width: '50px'}} />
                </colgroup>
                <thead>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>구분</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th className="col-date">작성일</th>
                    <th className="col-views">조회</th>
                    <th className="col-likes">추천</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px'}}>
                        <i className="fa-solid fa-magnifying-glass" style={{fontSize: '24px', marginBottom: '10px', display: 'block'}}></i>
                        {searchTerm ? `"${searchTerm}"에 해당하는 게시글이 없습니다.` : '게시글이 없습니다.'}
                      </td>
                    </tr>
                  ) : filteredPosts.map((post) => (
                    <tr key={post.id} style={post.badgeType === 'important' ? {backgroundColor: '#fafafa'} : {}}>
                      <td><input type="checkbox" /></td>
                      <td>
                        {post.badge ? (
                          <span className={`badge-box ${post.badgeType === 'important' ? 'notice' : ''}`}>
                            {post.badge}
                          </span>
                        ) : (
                          post.id
                        )}
                      </td>
                      <td className="title-col" onClick={() => handlePostClick(post)}>
                        {post.title} {post.comments > 0 && <span className="comment-count">[{post.comments}]</span>}
                      </td>
                      <td className="author-col">
                        {post.author} 
                        {post.authorBadge && (
                          <span className={post.authorBadge === 'S' ? 'icon-staff' : 'icon-member'}>
                            {post.authorBadge}
                          </span>
                        )}
                      </td>
                      <td className="col-date">{post.date}</td>
                      <td className="col-views">{post.views.toLocaleString()}</td>
                      <td className="col-likes">{post.likes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="board-footer">
                <div className="footer-left">
                  <input type="checkbox" /> 전체선택
                  <button style={{marginLeft:'10px'}}>선택삭제</button>
                </div>
                {currentUser ? (
                  <button className="btn-write-blue"><i className="fa-solid fa-pen"></i> 글쓰기</button>
                ) : (
                  <button
                    className="btn-write-blue"
                    style={{opacity: 0.5, cursor: 'not-allowed', background: '#aaa'}}
                    title="로그인 후 이용 가능합니다"
                    onClick={() => alert('글쓰기는 로그인 후 이용 가능합니다.')}
                  >
                    <i className="fa-solid fa-lock" style={{marginRight:'5px'}}></i> 글쓰기
                  </button>
                )}
              </div>
            </>
          ) : (
            /* 게시글 상세 페이지 */
            <div className="post-detail">
              <button className="back-to-list" onClick={() => setSelectedPost(null)}>
                <i className="fa-solid fa-chevron-left"></i>
                목록으로
              </button>

              <div className="post-detail-header">
                <h1 className="post-title">{selectedPost.title}</h1>
                <div className="post-meta">
                  <div className="post-author">
                    <div className="author-avatar">
                      {selectedPost.author[0]}
                    </div>
                    <span className="author-name">
                      {selectedPost.author}
                      {selectedPost.authorBadge && (
                        <span className={selectedPost.authorBadge === 'S' ? 'icon-staff' : 'icon-member'} style={{marginLeft: '6px'}}>
                          {selectedPost.authorBadge}
                        </span>
                      )}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                  <span>•</span>
                  <div className="post-stats">
                    <span><i className="fa-regular fa-eye"></i> {selectedPost.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="post-content">
                {selectedPost.content}
              </div>

              <div className="post-actions">
                <button className="action-btn">
                  <i className="fa-regular fa-heart"></i>
                  좋아요 {selectedPost.likes}
                </button>
                <button className="action-btn">
                  <i className="fa-regular fa-bookmark"></i>
                  북마크
                </button>
              </div>

              <ShareButtons title={selectedPost.title} />

              {/* 댓글 섹션 */}
              <div className="comments-section">
                <div className="comments-header">
                  댓글 {comments.length}개
                </div>

                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <div className="comment-avatar">
                          {comment.author?.[0] || '?'}
                        </div>
                        <div>
                          <div className="comment-author-name">{comment.author || 'Unknown'}</div>
                          <div className="comment-date">{comment.date}</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <button 
                          className="comment-delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      <button className="comment-action-btn">
                        <i className="fa-regular fa-heart"></i>
                        좋아요 {comment.likes}
                      </button>
                    </div>
                  </div>
                ))}

                {currentUser ? (
                  <div className="comment-input-wrapper">
                    <div className="comment-input-header">댓글 작성</div>
                    <div className="comment-input-box">
                      <textarea
                        className="comment-textarea"
                        placeholder="댓글을 입력하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        className="comment-submit-btn"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="login-required">
                    ⚠️ 댓글을 작성하려면 로그인이 필요합니다.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}