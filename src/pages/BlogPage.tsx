import { useState } from 'react';
import { ArrowLeft, Search, X, Heart, MessageCircle, Eye, PenLine } from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
}

export function BlogPage({ onBack }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = ['전체', '여행', '일상', '요리', '문화', '비즈니스', '교육', '기술'];

  const blogPosts = [
    {
      id: 1,
      title: "베이징 겨울 여행 완벽 가이드 - 자금성에서 만리장성까지",
      description: "베이징의 겨울은 춥지만 그만큼 매력적입니다. 눈 덮인 자금성의 아름다움과 한적한 만리장성을 즐길 수 있는 겨울 여행 코스를 소개합니다. 현지인만 아는 숨은 맛집과 따뜻한 실내 관광지도 함께 안내드립니다.",
      category: "여행",
      author: "차이나트래블러",
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=250&fit=crop",
      likes: 1234,
      comments: 89,
      views: 15678,
      isPopular: true,
      tags: ["베이징", "겨울여행", "자금성", "만리장성", "맛집"]
    },
    {
      id: 2,
      title: "상하이에서 경험한 중국 전통차 문화의 깊이",
      description: "상하이 예원 근처 전통 찻집에서 경험한 중국 차 문화에 대한 이야기입니다. 다기 사용법부터 차를 우리는 예법까지, 한국과는 다른 중국만의 독특한 차 문화를 자세히 소개합니다.",
      category: "문화",
      author: "티마스터",
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=250&fit=crop",
      likes: 567,
      comments: 45,
      views: 8920,
      isPopular: false,
      tags: ["상하이", "차문화", "전통", "예원", "찻집"]
    },
    {
      id: 3,
      title: "중국 현지 직장에서 살아남는 비즈니스 매너 10가지",
      description: "중국 회사에서 3년간 근무하며 배운 현지 비즈니스 문화와 매너에 대해 공유합니다. 회식 문화, 명함 교환법, 회의 진행 방식 등 한국과 다른 점들을 실전 경험을 바탕으로 설명드립니다.",
      category: "비즈니스",
      author: "차이나비즈맨",
      time: "6시간 전",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=250&fit=crop",
      likes: 890,
      comments: 67,
      views: 12340,
      isPopular: true,
      tags: ["비즈니스매너", "회사문화", "중국직장", "회식", "회의"]
    },
    {
      id: 4,
      title: "집에서 만드는 정통 마라탕 레시피 - 향신료부터 육수까지",
      description: "청두에서 배운 정통 마라탕 만드는 법을 공개합니다. 현지에서 구입한 정통 향신료 사용법과 깊은 맛의 육수 끓이는 비법까지, 집에서도 현지 맛을 재현할 수 있는 완벽한 레시피입니다.",
      category: "요리",
      author: "마라탕마니아",
      time: "8시간 전",
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=250&fit=crop",
      likes: 2145,
      comments: 156,
      views: 28790,
      isPopular: true,
      tags: ["마라탕", "청두", "향신료", "육수", "중국요리"]
    },
    {
      id: 5,
      title: "HSK 6급 합격 후기 - 3개월 집중 학습법 공개",
      description: "3개월 만에 HSK 6급에 합격한 나만의 학습법을 공유합니다. 효과적인 단어 암기법, 듣기 실력 향상 방법, 작문 팁까지 실전에서 검증된 학습 전략을 상세히 설명드립니다.",
      category: "교육",
      author: "중국어마스터",
      time: "10시간 전",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      likes: 3456,
      comments: 234,
      views: 45670,
      isPopular: true,
      tags: ["HSK6급", "중국어공부", "학습법", "단어암기", "작문팁"]
    },
    {
      id: 6,
      title: "중국 일상 속 디지털 생활 - 위챗페이부터 딜리버리까지",
      description: "중국에서의 일상은 모든 것이 디지털로 연결되어 있습니다. 위챗페이 사용법, 음식 주문 앱, 교통카드 앱 등 중국 생활에 필수적인 디지털 도구들의 사용법을 정리했습니다.",
      category: "일상",
      author: "디지털노마드",
      time: "12시간 전",
      image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400&h=250&fit=crop",
      likes: 1567,
      comments: 78,
      views: 19890,
      isPopular: false,
      tags: ["위챗페이", "디지털생활", "앱사용법", "중국생활", "결제시스템"]
    }
  ];

  const filteredPosts = blogPosts.filter(post => 
    (selectedCategory === '전체' || post.category === selectedCategory) &&
    (searchTerm === '' || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     post.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const popular = blogPosts.filter(post => post.isPopular).slice(0, 3);

  // 게시판 목록과 같은 구성: 위 흰 바(← 제목 · 검색 · 글쓰기) → 분류 밑줄 탭 → 인기 글 → 글 목록
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto h-[52px] px-2 flex items-center gap-1">
          <button onClick={onBack} aria-label="홈으로" className="p-2 text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 min-w-0 text-[19px] font-bold text-gray-900 whitespace-nowrap truncate">뷰 (View)</h1>
          <button onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchTerm(''); }} aria-label="검색" className="p-2 text-gray-700">
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <button onClick={() => alert('글쓰기는 준비 중이에요.')} className="mr-1.5 flex items-center gap-1 px-3.5 h-9 rounded-full bg-[#03a94d] text-white text-[14.5px] font-semibold">
            <PenLine className="w-4 h-4" /> 글쓰기
          </button>
        </div>
        {searchOpen && (
          <div className="max-w-3xl mx-auto px-4 pb-2.5">
            <input
              autoFocus
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목, 내용 검색"
              className="w-full h-10 px-4 rounded-full bg-gray-100 text-[16px] outline-none focus:ring-2 focus:ring-[#03a94d]/40"
            />
          </div>
        )}
        <div className="max-w-3xl mx-auto flex gap-5 overflow-x-auto scrollbar-hide px-4" style={{ scrollbarWidth: 'none' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`shrink-0 py-2.5 text-[15.5px] whitespace-nowrap border-b-2 -mb-px ${c === selectedCategory ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-500'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* 인기 글: 휴대폰은 옆으로 넘김, PC는 3칸 */}
        {selectedCategory === '전체' && !searchTerm && (
          <section className="pt-4">
            <h2 className="text-[18px] font-bold text-gray-900">인기 글</h2>
            <div className="mt-2.5 -mx-4 px-4 flex gap-3 overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible" style={{ scrollbarWidth: 'none' }}>
              {popular.map((post) => (
                <div key={post.id} className="shrink-0 w-[70%] sm:w-auto">
                  <img src={post.image} alt="" loading="lazy" className="w-full aspect-[16/10] object-cover rounded-lg bg-gray-100" />
                  <h3 className="mt-2 text-[15.5px] font-semibold text-gray-900 leading-snug line-clamp-2">{post.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-500 min-w-0">
                    <span className="truncate">{post.author}</span>
                    <span className="shrink-0 text-gray-300">·</span>
                    <span className="shrink-0 flex items-center gap-0.5"><Heart className="w-3.5 h-3.5" />{post.likes.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="pt-5 text-[13.5px] text-gray-500">
          {selectedCategory === '전체' ? '전체 글' : selectedCategory}{searchTerm && ` · "${searchTerm}" 검색`} · {filteredPosts.length}개
        </p>

        {filteredPosts.map((post) => (
          <div key={post.id} className="flex gap-3 py-4 border-b border-gray-100 last:border-b-0">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[#03a94d] font-semibold">
                {post.category}{post.isPopular && <span className="ml-1.5 text-red-500">인기</span>}
              </div>
              <h3 className="mt-0.5 text-[16.5px] font-semibold text-gray-900 leading-snug line-clamp-2">{post.title}</h3>
              <p className="mt-1 text-[14.5px] text-gray-600 leading-snug line-clamp-2">{post.description}</p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-gray-500 min-w-0">
                <span className="min-w-[4.5em] truncate">{post.author}</span>
                <span className="shrink-0 text-gray-300">·</span>
                <span className="shrink-0">{post.time}</span>
                <span className="shrink-0 text-gray-300">·</span>
                <span className="shrink-0 flex items-center gap-0.5"><Heart className="w-3.5 h-3.5" />{post.likes.toLocaleString()}</span>
                <span className="shrink-0 hidden sm:flex items-center gap-0.5"><MessageCircle className="w-3.5 h-3.5" />{post.comments}</span>
                <span className="shrink-0 hidden sm:flex items-center gap-0.5"><Eye className="w-3.5 h-3.5" />{post.views.toLocaleString()}</span>
              </div>
            </div>
            <img src={post.image} alt="" loading="lazy" className="shrink-0 w-[96px] h-[72px] sm:w-[140px] sm:h-[96px] object-cover rounded-lg bg-gray-100" />
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <p className="py-16 text-center text-[15px] text-gray-500">검색 결과가 없어요.</p>
        )}
      </div>
    </div>
  );
}
