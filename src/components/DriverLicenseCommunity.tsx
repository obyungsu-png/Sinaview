import { useState } from 'react';
import { CommentSection } from './CommentSection';

interface Post {
  id: number;
  badge?: string;
  badgeType?: 'notice' | 'important';
  title: string;
  author: string;
  authorBadge?: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  content?: string;
}

interface DriverLicenseCommunityProps {
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export function DriverLicenseCommunity({ currentUser, isAdmin }: DriverLicenseCommunityProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '중국생활러',
      content: '정보 감사합니다! 저도 곧 시험 준비해야 하는데 많은 도움이 되었어요.',
      date: '2025.12.24 15:30',
      likes: 2
    },
    {
      id: 2,
      author: '베이징드라이버',
      content: '한국 면허증 교환 절차가 생각보다 간단하더라고요. 파이팅!',
      date: '2025.12.24 16:15',
      likes: 1
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const posts: Post[] = [
    { 
      id: 1052, 
      badge: '필독', 
      badgeType: 'important',
      title: '🚨 2026 중국 운전면허 과목1(필기) 한국어 문제 업데이트', 
      author: 'CN면허스탭', 
      authorBadge: 'S',
      date: '2025.12.24', 
      views: 7296, 
      likes: 22, 
      comments: 130,
      content: `안녕하세요, 중국 운전면허 커뮤니티입니다.

📢 2026년 최신 과목1(필기시험) 한국어 문제가 업데이트되었습니다!

주요 변경사항:
• 출제 기조가 바뀌어 없는 문제 83개 추가
• 기존 문제 중 15개 삭제
• 2024년 국어 및 한국서 책 구매시 공부하라고 하는데 그렇게해도 될까요?

━━━━━━━━━━━━━━━━━━━━━━━

⭐초보 공시생이 반드시 알아야 하는 금★

📋 2024 공무원 사범일정 전직렬 발표!
https://cafe.naver.com/kts9719/3431407

💝 최근 4개년 국가직 9급 행정직/경찰총/디모 전직렬 비교
https://cafe.naver.com/kts9719/3354698

2024년 공시 초보 가이드북 무료다운▶
https://cafe.naver.com/kts9719/3447817

━━━━━━━━━━━━━━━━━━━━━━━

시도에서 자체적으로 내는 문제는
출제기조가 바뀌지 않는다고하여
2024년 국어 및 한국서 책 구매시 공부하라고 하는데
그렇게해도 될까요?`
    },
    { 
      id: 1051, 
      badge: '필독', 
      badgeType: 'important',
      title: '📅 2026 베이징/상하이 교민 면허 교환 일정 확인', 
      author: 'CN면허스탭', 
      authorBadge: 'S',
      date: '2025.12.23', 
      views: 4702, 
      likes: 21, 
      comments: 27,
      content: '베이징과 상하이 지역 한국 교민분들을 위한 면허 교환 일정 안내입니다...'
    },
    { 
      id: 1050, 
      badge: '공지', 
      badgeType: 'notice',
      title: '중국 임시운전면허증 발급 절차 안내 (공항 수령 가능)', 
      author: '매니저', 
      authorBadge: 'M',
      date: '2025.12.17', 
      views: 404, 
      likes: 2, 
      comments: 1,
      content: '중국 임시운전면허증 발급 절차를 안내드립니다...'
    },
    { 
      id: 1049, 
      badge: '공지', 
      badgeType: 'notice',
      title: '2026년 춘절 연휴 차량 5부제 제한 안내 ✍️', 
      author: '매니저', 
      authorBadge: 'M',
      date: '2025.11.14', 
      views: 130, 
      likes: 1, 
      comments: 0,
      content: '2026년 춘절 연휴 기간 차량 운행 제한 안내...'
    },
    { 
      id: 1048, 
      title: '상하이에서 한국 면허증으로 교환하신 분 계신가요?', 
      author: '상하이박', 
      date: '14:20', 
      views: 52, 
      likes: 0, 
      comments: 5,
      content: '안녕하세요, 다음 주에 상하이에서 한국 면허증을 중국 면허증으로 교환하려고 합니다. 경험 있으신 분들 계신가요?'
    },
    { 
      id: 1047, 
      title: '과목1 필기시험 어플 추천 부탁드립니다 (jiakaobaodian)', 
      author: '초보운전', 
      date: '13:10', 
      views: 88, 
      likes: 2, 
      comments: 0,
      content: '과목1 준비 중인데 어떤 앱이 좋을까요? jiakaobaodian이 괜찮다고 들었는데...'
    },
    { 
      id: 1046, 
      title: '중국 전기차 렌트해서 여행 다녀왔습니다. (후기)', 
      author: '여행조아', 
      date: '12:05', 
      views: 210, 
      likes: 15, 
      comments: 12,
      content: '지난 주말에 중국 전기차를 렌트해서 항저우로 여행 다녀왔습니다. 생각보다 편리하더라고요!'
    },
    { 
      id: 1045, 
      title: '교통위반 딱지(파단) 위챗으로 납부하는 방법 정리', 
      author: '정보왕', 
      date: '2025.12.23', 
      views: 340, 
      likes: 8, 
      comments: 0,
      content: '교통위반 벌금을 위챗으로 납부하는 방법을 정리해봤습니다...'
    },
    { 
      id: 1044, 
      title: '베이징 번호판 추첨 드디어 당첨됐네요 ㅠㅠ', 
      author: '북경라이프', 
      date: '2025.12.22', 
      views: 560, 
      likes: 45, 
      comments: 0,
      content: '5년 동안 신청하고 드디어 당첨! 정말 기쁩니다!'
    },
    { 
      id: 1043, 
      title: '고속도로 휴게소 충전기 고장 많나요?', 
      author: 'EV오너', 
      date: '2025.12.21', 
      views: 90, 
      likes: 1, 
      comments: 0,
      content: '전기차 타시는 분들 고속도로 충전 경험 공유 부탁드립니다.'
    },
  ];

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setComments(post.id === 1052 ? [
      {
        id: 1,
        author: '중국생활러',
        content: '정보 감사합니다! 저도 곧 시험 준비해야 하는데 많은 도움이 되었어요.',
        date: '2025.12.24 15:30',
        likes: 2
      },
      {
        id: 2,
        author: '베이징드라이버',
        content: '한국 면허증 교환 절차가 생각보다 간단하더라고요. 파이팅!',
        date: '2025.12.24 16:15',
        likes: 1
      }
    ] : []);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: '나',
        content: newComment,
        date: new Date().toLocaleString('ko-KR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        likes: 0
      };
      setComments([...comments, comment]);
      setNewComment('');
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

        /* 레이아웃 컨테이너 */
        .community-wrapper {
            display: flex;
            max-width: 1080px;
            margin: 0 auto;
            background-color: #fff;
            min-height: 100vh;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
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

        /* === 댓글 영역 === */
        .comments-section {
            margin-top: 30px;
        }

        .comments-header {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #667eea;
        }

        .comment-item {
            padding: 18px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .comment-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .comment-author {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .comment-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #a8b3ff 0%, #c5aeff 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 13px;
        }

        .comment-author-name {
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        .comment-date {
            font-size: 12px;
            color: #999;
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
            transition: color 0.2s;
        }

        .comment-action-btn:hover {
            color: #667eea;
        }

        .comment-input-section {
            margin-top: 25px;
            padding: 20px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }

        .comment-input-header {
            font-size: 13px;
            color: #666;
            margin-bottom: 12px;
        }

        .comment-input-wrapper {
            display: flex;
            gap: 10px;
        }

        .comment-input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            resize: none;
            min-height: 80px;
            transition: all 0.2s;
        }

        .comment-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .comment-submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            height: fit-content;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
        }

        .comment-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .comment-submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
      `}</style>

      <div className="community-wrapper">
        {/* 좌측 사이드바 */}
        <aside className="community-sidebar">
          <div className="profile-card">
            <div className="profile-info">
              <div className="avatar-circle">中</div>
              <div className="user-details">
                <span className="nickname">운전면허 커뮤니티</span>
                <span className="role">공식 카페</span>
              </div>
            </div>
            <div className="stats">
              <span><i className="fa-solid fa-users"></i> 1,520명</span>
              <span><i className="fa-solid fa-comment"></i> 2,340개</span>
            </div>
          </div>

          <ul className="menu-list">
            <li className="title">★ 필독 게시판</li>
            <li><i className="fa-solid fa-bullhorn"></i> 공지사항</li>
            <li><i className="fa-regular fa-file-lines"></i> 가입 인사</li>
            
            <li className="title">중국 면허 정보</li>
            <li>과목1(필기) 기출</li>
            <li>과목2/3(실기) 팁</li>
            <li>한국면허 교환/갱신</li>
            <li>국제운전면허증</li>
            
            <li className="title">지역별 운전</li>
            <li>베이징/상하이</li>
            <li>광저우/심천</li>
            <li>기타 지역</li>
          </ul>
        </aside>

        {/* 우측 메인 콘텐츠 */}
        <main className="community-content">
          {!selectedPost ? (
            <>
              <div className="board-header">
                <h2>중국 운전면허 & 교통 정보 게시판</h2>
                <button className="btn-analyze">통계 보기</button>
              </div>

              <div className="toolbar">
                <div className="tool-left">
                  <span style={{fontSize: '12px', color: '#888'}}>전체 <strong style={{color: '#667eea'}}>1,052</strong>개</span>
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
                  <col style={{width: '30px'}} />
                  <col style={{width: '70px'}} />
                  <col style={{width: 'auto'}} />
                  <col style={{width: '100px'}} />
                  <col style={{width: '90px'}} />
                  <col style={{width: '60px'}} />
                  <col style={{width: '50px'}} />
                </colgroup>
                <thead>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>구분</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>조회</th>
                    <th>추천</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
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
                      <td>{post.date}</td>
                      <td>{post.views.toLocaleString()}</td>
                      <td>{post.likes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="board-footer">
                <div className="footer-left">
                  <input type="checkbox" /> 전체선택
                  <button style={{marginLeft:'10px'}}>선택삭제</button>
                </div>
                <button className="btn-write-blue"><i className="fa-solid fa-pen"></i> 글쓰기</button>
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
                <button className="action-btn">
                  <i className="fa-regular fa-share-from-square"></i>
                  공유
                </button>
              </div>

              {/* 댓글 영역 */}
              <div className="comments-section">
                <div className="comments-header">
                  댓글 {comments.length}
                </div>

                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="comment-avatar">
                          {comment.author[0]}
                        </div>
                        <span className="comment-author-name">{comment.author}</span>
                        <span className="comment-date">{comment.date}</span>
                      </div>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      <button className="comment-action-btn">
                        <i className="fa-regular fa-heart"></i>
                        좋아요 {comment.likes}
                      </button>
                      <button className="comment-action-btn">
                        <i className="fa-regular fa-comment"></i>
                        답글
                      </button>
                    </div>
                  </div>
                ))}

                {/* 댓글 입력 */}
                <div className="comment-input-section">
                  <div className="comment-input-header">댓글을 입력하세요</div>
                  <div className="comment-input-wrapper">
                    <textarea
                      className="comment-input"
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
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}