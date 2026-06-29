import { useState, useEffect } from 'react';

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
}

export function ChinaLifeCommunity({ currentUser, isAdmin, onBack }: ChinaLifeCommunityProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [naverCafeUrl, setNaverCafeUrl] = useState(() => {
    return localStorage.getItem('naverCafeUrl') || '';
  });
  const [isNaverTabOpen, setIsNaverTabOpen] = useState(false);
  const [naverCafeInput, setNaverCafeInput] = useState('');
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

  const posts: Post[] = [
    { 
      id: 1052, 
      badge: '필독', 
      badgeType: 'important',
      title: '🚨 2025년 중국 생활 필수 앱 총정리 (최신판)', 
      author: '중국생활관리자', 
      authorBadge: 'S',
      date: '2025.12.24', 
      views: 12596, 
      likes: 48, 
      comments: 230,
      content: `안녕하세요, 중국생활 커뮤니티입니다.

📱 2025년 중국 생활 필수 앱 총정리!

━━━━━━━━━━━━━━━━━━━━━━━

⭐ 결제/금융 앱 ⭐
• 위챗페이 (微信支付) - 필수! 모든 결제의 기본
• 알리페이 (支付宝) - 위챗과 함께 양대 결제 앱
• 중국은행 앱 (中国银行) - 은행 업무, 송금

━━━━━━━━━━━━━━━━━━━━━━━

🍔 배달/음식 앱 🍔
• 메이투안 (美团) - 배달의민족 같은 앱
• 어러머 (饿了么) - 알리바바의 배달 앱
• 따중띠엔핑 (大众点评) - 식당 리뷰, 예약

━━━━━━━━━━━━━━━━━━━━━━━

🚕 교통/지도 앱 🚕
• 디디추싱 (滴滴出行) - 중국판 우버/카카오택시
• 바이두지도 (百度地图) - 구글맵 대신
• 가오더지도 (高德地图) - 바이두와 함께 양대 지도

━━━━━━━━━━━━━━━━━━━━━━━

🛒 쇼핑 앱 🛒
• 타오바오 (淘宝) - 중국 최대 쇼핑몰
• 징동 (京东) - 빠른 배송의 쇼핑몰
• 핀둬둬 (拼多多) - 저렴한 가격

━━━━━━━━━━━━━━━━━━━━━━━

💬 기타 필수 앱 💬
• 위챗 (微信) - SNS, 메신저의 모든 것
• 웨이보 (微博) - 중국판 트위터
• 샤오홍슈 (小红书) - 중국판 인스타그램

━━━━━━━━━━━━━━━━━━━━━━━

📌 설치 팁:
1. 중국 앱스토어 계정 필요
2. VPN 사용 시 일부 앱 작동 안 됨
3. 실명인증 필요한 앱 많음

이 앱들만 있으면 중국 생활 걱정 없습니다! 💪`
    },
    { 
      id: 1051, 
      badge: '필독', 
      badgeType: 'important',
      title: '📅 2025년 중국 공휴일 & 연휴 일정 정리', 
      author: '중국생활관리자', 
      authorBadge: 'S',
      date: '2025.12.23', 
      views: 8702, 
      likes: 35, 
      comments: 47,
      content: `2025년 중국 법정 공휴일 및 연휴 일정을 안내드립니다.

🎊 춘절 (春节): 1월 28일 ~ 2월 3일 (7일간)
🌸 청명절 (清明节): 4월 4일 ~ 4월 6일 (3일간)
💼 노동절 (劳动节): 5월 1일 ~ 5월 5일 (5일간)
🌙 단오절 (端午节): 5월 31일 ~ 6월 2일 (3일간)
🥮 중추절 (中秋节): 10월 6일 ~ 10월 8일 (3일간)
🇨🇳 국경절 (国庆节): 10월 1일 ~ 10월 7일 (7일간)

※ 연휴 기간 전후 토요일 출근일 있을 수 있음
※ 기차표, 비행기표 미리 예약 필수!`
    },
    { 
      id: 1050, 
      badge: '공지', 
      badgeType: 'notice',
      title: '중국 택배 수령 방법 총정리 (스마트함, 집앞배달)', 
      author: '매니저', 
      authorBadge: 'M',
      date: '2025.12.20', 
      views: 2404, 
      likes: 18, 
      comments: 32,
      content: `중국 택배 수령 방법을 안내드립니다.

1️⃣ 스마트함 (快递柜):
- 가장 흔한 방법
- 문자로 받은 코드 입력
- 24시간 이내 찾아가야 함

2️⃣ 문앞 배달:
- 택배 주문 시 요청
- "请送到门口" 메모

3️⃣ 경비실 수령:
- 아파트 경비실에서 보관
- 신분증 필요한 경우 있음`
    },
    { 
      id: 1049, 
      badge: '공지', 
      badgeType: 'notice',
      title: '중국 병원 이용 방법 & 한국어 가능 병원 리스트 ✍️', 
      author: '매니저', 
      authorBadge: 'M',
      date: '2025.12.18', 
      views: 3430, 
      likes: 25, 
      comments: 18,
      content: `중국에서 병원 이용하는 방법과 한국어 가능 병원을 안내드립니다.

🏥 병원 이용 절차:
1. 병원 앱에서 예약 (挂号)
2. 접수/신분증 제시
3. 진료비 선결제
4. 진료
5. 약 수령

💊 한국어 가능 병원:
베이징: 북경한인병원, 차이나한의원
상하이: 상해한인병원, 파크웨이헬스
광저우: 광저우한인병원

※ 보험 가입 여부 확인하세요!`
    },
    { 
      id: 1048, 
      title: '베이징 맛집 추천 좀 해주세요! (한식, 중식 둘 다)', 
      author: '베이징러', 
      date: '14:20', 
      views: 452, 
      likes: 12, 
      comments: 28,
      content: `다음 주에 베이징으로 발령받아서 가게 되었습니다. 베이징에서 꼭 가봐야 할 맛집 있으면 추천 부탁드려요! 한식, 중식 다 좋습니다.`
    },
    { 
      id: 1047, 
      title: '중국 전화번호 개통 어디서 하는 게 좋을까요?', 
      author: '초보차이나', 
      date: '13:10', 
      views: 688, 
      likes: 8, 
      comments: 15,
      content: `이번 주에 중국 가는데 전화번호 개통은 어디서 하는 게 좋을까요? 차이나모바일, 차이나유니콤, 차이나텔레콤 중에 어떤 게 나을까요?`
    },
    { 
      id: 1046, 
      title: '중국 아파트 월세 계약 시 주의사항 (경험담)', 
      author: '집구하기힘들어', 
      date: '12:05', 
      views: 1210, 
      likes: 45, 
      comments: 38,
      content: `중국에서 5년째 살면서 3번 이사한 경험을 공유합니다. 계약 전 꼭 확인해야 할 사항들을 정리해봤어요.

1. 중개수수료 (中介费) - 보통 한 달 월세
2. 관리비 포함 여부
3. 수도/전기/가스비 정산 방법
4. 보증금 반환 조건
5. 가전제품 작동 상태

특히 퇴실 시 청소 상태로 보증금 안 돌려주는 경우 많으니 입주 시 사진 찍어두세요!`
    },
    { 
      id: 1045, 
      title: '타오바오 구매대행 vs 직구, 어떤 게 나을까요?', 
      author: '쇼핑러버', 
      date: '2025.12.23', 
      views: 840, 
      likes: 22, 
      comments: 19,
      content: `타오바오에서 옷 사려고 하는데, 구매대행 업체 이용할까 직접 살까 고민 중이에요. 어떤 게 더 나을까요?`
    },
    { 
      id: 1044, 
      title: '중국에서 한국 음식 만들기 재료 구하는 곳', 
      author: '요리왕', 
      date: '2025.12.22', 
      views: 1560, 
      likes: 58, 
      comments: 42,
      content: `중국에서 한국 음식 해먹고 싶을 때 재료 사는 곳 공유합니다!

🛒 온라인:
- 타오바오 "韩国食品"
- 징동 한국관
- 허마셴셩 (盒马鲜生) 앱

🏪 오프라인:
- 한국 마트 (한인타운)
- 이마트/롯데마트 (대도시)
- 로컬 슈퍼 외국 식품 코너

고춧가루, 된장, 김은 한국에서 미리 챙겨오는 게 좋아요!`
    },
    { 
      id: 1043, 
      title: '중국 VPN 추천 부탁드립니다 (유료/무료)', 
      author: '넷플릭스보고싶어', 
      date: '2025.12.21', 
      views: 2190, 
      likes: 35, 
      comments: 67,
      content: `중국에서 유튜브, 구글 쓰려면 VPN이 필요하잖아요. 다들 어떤 VPN 쓰시나요? 추천 부탁드립니다!`
    },
    { 
      id: 1042, 
      title: '중국 생활 1년차, 이것만은 꼭 알아두세요!', 
      author: '중국1년차', 
      date: '2025.12.20', 
      views: 3450, 
      likes: 89, 
      comments: 53,
      content: `중국 생활 1년 하면서 배운 꿀팁들 공유합니다.

✅ 꼭 알아야 할 것:
1. 위챗은 필수! 모든 게 위챗으로 연결됨
2. 현금 거의 안 씀, 모바일 결제 필수
3. VPN 미리 준비 (중국 들어가면 다운 안 됨)
4. 배달 음식 저렴함 (메이투안, 어러머)
5. 택시는 디디로, 현금 받는 택시 거의 없음
6. 아파트 입주 시 신분증 등록 필수
7. 공공와이파이 거의 없음
8. 택배는 스마트함에서 픽업
9. 병원 가기 전 앱으로 예약
10. 은행 업무는 시간 오래 걸림

더 궁금한 거 있으면 댓글 주세요!`
    },
  ];

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

  const handleNaverCafeSave = () => {
    let url = naverCafeInput.trim();
    if (url && !url.startsWith('http')) url = 'https://' + url;
    setNaverCafeUrl(url);
    localStorage.setItem('naverCafeUrl', url);
    setIsNaverTabOpen(false);
    setNaverCafeInput('');
  };

  const categoryFilterMap: Record<string, (post: Post) => boolean> = {
    '전체': () => true,
    '공지사항': (p) => p.badgeType === 'notice',
    '신입 가이드': (p) => p.title.includes('가이드') || p.title.includes('1년차') || p.title.includes('꼭 알'),
    '주거·부동산': (p) => p.title.includes('아파트') || p.title.includes('월세') || p.title.includes('부동산') || p.title.includes('집'),
    '음식·맛집': (p) => p.title.includes('맛집') || p.title.includes('음식') || p.title.includes('재료') || p.title.includes('요리'),
    '쇼핑·배달': (p) => p.title.includes('타오바오') || p.title.includes('쇼핑') || p.title.includes('배달') || p.title.includes('택배') || p.title.includes('구매'),
    '교통·이동': (p) => p.title.includes('교통') || p.title.includes('이동') || p.title.includes('택시'),
    '비자·거류증': (p) => p.title.includes('비자') || p.title.includes('거류'),
    '은행·금융': (p) => p.title.includes('은행') || p.title.includes('금융') || p.title.includes('결제'),
    '통신·인터넷': (p) => p.title.includes('전화') || p.title.includes('VPN') || p.title.includes('통신') || p.title.includes('인터넷') || p.title.includes('앱'),
    '베이징/상하이': (p) => p.title.includes('베이징') || p.title.includes('상하이'),
    '광저우/심천': (p) => p.title.includes('광저우') || p.title.includes('심천'),
    '기타 지역': (p) => !p.title.includes('베이징') && !p.title.includes('상하이') && !p.title.includes('광저우'),
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === '전체' || 
      (categoryFilterMap[activeCategory] ? categoryFilterMap[activeCategory](post) : true);
    return matchesSearch && matchesCategory;
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
            max-width: 1080px;
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
            /* 모바일에서 조회/추천/날짜 숨기기 */
            .col-views, .col-likes, .col-date {
                display: none;
            }
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
            {/* 네이버 카페 연결 탭 */}
            <div style={{marginTop: '14px', borderTop: '1px solid #f0f0f0', paddingTop: '12px'}}>
              {naverCafeUrl ? (
                <div>
                  <a
                    href={naverCafeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: 'linear-gradient(135deg, #03c75a, #00a843)',
                      color: 'white', padding: '8px 12px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                      transition: 'all 0.2s', width: '100%'
                    }}
                  >
                    <i className="fa-solid fa-square-n" style={{fontSize:'14px'}}></i>
                    네이버 카페 바로가기
                  </a>
                  <button
                    onClick={() => { setNaverCafeInput(naverCafeUrl); setIsNaverTabOpen(true); }}
                    style={{
                      marginTop: '6px', width: '100%', background: 'none',
                      border: '1px solid #ddd', borderRadius: '4px', padding: '4px',
                      fontSize: '11px', color: '#999', cursor: 'pointer'
                    }}
                  >
                    ✏️ URL 변경
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsNaverTabOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: '#f8f9fa', border: '1px dashed #03c75a',
                    color: '#03c75a', padding: '8px 12px', borderRadius: '6px',
                    fontSize: '12px', fontWeight: '600', width: '100%', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="fa-solid fa-link" style={{fontSize:'12px'}}></i>
                  네이버 카페 연결하기
                </button>
              )}
            </div>
            {/* 네이버 카페 URL 입력 팝업 */}
            {isNaverTabOpen && (
              <div style={{
                marginTop: '10px', background: '#f0fff4', border: '1px solid #03c75a',
                borderRadius: '8px', padding: '12px'
              }}>
                <div style={{fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '8px'}}>
                  네이버 카페 URL 입력
                </div>
                <input
                  type="text"
                  value={naverCafeInput}
                  onChange={e => setNaverCafeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNaverCafeSave()}
                  placeholder="https://cafe.naver.com/..."
                  style={{
                    width: '100%', padding: '6px 8px', border: '1px solid #ddd',
                    borderRadius: '4px', fontSize: '11px', marginBottom: '8px'
                  }}
                />
                <div style={{display: 'flex', gap: '6px'}}>
                  <button
                    onClick={handleNaverCafeSave}
                    style={{
                      flex: 1, background: '#03c75a', color: 'white', border: 'none',
                      borderRadius: '4px', padding: '6px', fontSize: '11px',
                      fontWeight: '600', cursor: 'pointer'
                    }}
                  >저장</button>
                  <button
                    onClick={() => { setIsNaverTabOpen(false); setNaverCafeInput(''); }}
                    style={{
                      flex: 1, background: '#f8f9fa', color: '#666', border: '1px solid #ddd',
                      borderRadius: '4px', padding: '6px', fontSize: '11px', cursor: 'pointer'
                    }}
                  >취소</button>
                </div>
              </div>
            )}
          </div>

          <ul className="menu-list">
            <li className="title">★ 필독 게시판</li>
            <li onClick={() => handleCategoryClick('공지사항')} style={activeCategory === '공지사항' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}><i className="fa-solid fa-bullhorn"></i> 공지사항</li>
            <li onClick={() => handleCategoryClick('신입 가이드')} style={activeCategory === '신입 가이드' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}><i className="fa-regular fa-file-lines"></i> 신입 가이드</li>
            
            <li className="title">생활 정보</li>
            <li onClick={() => handleCategoryClick('주거·부동산')} style={activeCategory === '주거·부동산' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>주거·부동산</li>
            <li onClick={() => handleCategoryClick('음식·맛집')} style={activeCategory === '음식·맛집' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>음식·맛집</li>
            <li onClick={() => handleCategoryClick('쇼핑·배달')} style={activeCategory === '쇼핑·배달' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>쇼핑·배달</li>
            <li onClick={() => handleCategoryClick('교통·이동')} style={activeCategory === '교통·이동' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>교통·이동</li>
            
            <li className="title">행정·비자</li>
            <li onClick={() => handleCategoryClick('비자·거류증')} style={activeCategory === '비자·거류증' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>비자·거류증</li>
            <li onClick={() => handleCategoryClick('은행·금융')} style={activeCategory === '은행·금융' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>은행·금융</li>
            <li onClick={() => handleCategoryClick('통신·인터넷')} style={activeCategory === '통신·인터넷' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>통신·인터넷</li>
            
            <li className="title">지역별</li>
            <li onClick={() => handleCategoryClick('베이징/상하이')} style={activeCategory === '베이징/상하이' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>베이징/상하이</li>
            <li onClick={() => handleCategoryClick('광저우/심천')} style={activeCategory === '광저우/심천' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>광저우/심천</li>
            <li onClick={() => handleCategoryClick('기타 지역')} style={activeCategory === '기타 지역' ? {color:'#667eea', fontWeight:'600', backgroundColor:'#f0f2ff'} : {}}>기타 지역</li>
          </ul>
        </aside>

        {/* 우측 메인 콘텐츠 */}
        <main className="community-content">
          {!selectedPost ? (
            <>
              <div className="board-header">
                <h2>
                  {activeCategory === '전체' ? '중국 생활 정보 게시판' : activeCategory}
                </h2>
                <button className="btn-analyze">통계 보기</button>
              </div>

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
                <button className="action-btn">
                  <i className="fa-regular fa-share-from-square"></i>
                  공유
                </button>
              </div>

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