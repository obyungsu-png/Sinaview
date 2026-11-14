import { ArrowLeft, Search, X } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface RealEstatePageProps {
  onBack: () => void;
}

export function RealEstatePage({ onBack }: RealEstatePageProps) {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = ['전체', '매매', '전세', '월세', '상가', '오피스텔'];

  const properties = [
    {
      id: 1,
      title: '베이징 차오양구 고급 아파트',
      price: '12억원',
      type: '매매',
      location: '차오양구 CBD',
      area: '85㎡',
      rooms: 3,
      bathrooms: 2,
      floor: '15/25층',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      isHot: true,
      description: '지하철역 도보 5분, 명문학군, 풀옵션',
      views: 1234,
      date: '1일 전'
    },
    {
      id: 2,
      title: '상하이 황푸구 신축 오피스텔',
      price: '8.5억원',
      type: '매매',
      location: '황푸구 인민광장',
      area: '45㎡',
      rooms: 1,
      bathrooms: 1,
      floor: '20/30층',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      isHot: true,
      description: '신축 건물, 한국인 밀집지역',
      views: 892,
      date: '2일 전'
    },
    {
      id: 3,
      title: '선전 난산구 아파트',
      price: '6.2억원',
      type: '매매',
      location: '난산구 과학기술단지',
      area: '78㎡',
      rooms: 2,
      bathrooms: 2,
      floor: '10/18층',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      isHot: false,
      description: 'IT 기업 밀집지역, 교통 편리',
      views: 567,
      date: '3일 전'
    },
    {
      id: 4,
      title: '베이징 하이뎬구 학군 아파트',
      price: '300만원/월',
      type: '월세',
      location: '하이뎬구 중관촌',
      area: '92㎡',
      rooms: 3,
      bathrooms: 2,
      floor: '8/15층',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      isHot: false,
      description: '명문대 인근, 한국 마트 도보 거리',
      views: 423,
      date: '4일 전'
    },
    {
      id: 5,
      title: '상하이 푸동 신구 오피스',
      price: '15억원',
      type: '매매',
      location: '푸동신구 루자쭈이',
      area: '120㎡',
      rooms: 4,
      bathrooms: 3,
      floor: '25/35층',
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=300&fit=crop',
      isHot: true,
      description: '금융중심지, 강변뷰',
      views: 1567,
      date: '5일 전'
    },
    {
      id: 6,
      title: '광저우 톈허구 상가',
      price: '9억원',
      type: '매매',
      location: '톈허구 상권',
      area: '65㎡',
      rooms: 0,
      bathrooms: 1,
      floor: '1층',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      isHot: false,
      description: '한국인 상권, 높은 유동인구',
      views: 789,
      date: '1주일 전'
    },
    {
      id: 7,
      title: '베이징 순이구 전세 아파트',
      price: '2억원 (2년)',
      type: '전세',
      location: '순이구 국제공항 인근',
      area: '75㎡',
      rooms: 2,
      bathrooms: 1,
      floor: '12/20층',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      isHot: false,
      description: '공항 접근성 우수, 조용한 주거지',
      views: 345,
      date: '1주일 전'
    },
    {
      id: 8,
      title: '선전 푸톈구 럭셔리 아파트',
      price: '18억원',
      type: '매매',
      location: '푸톈구 CBD',
      area: '150㎡',
      rooms: 4,
      bathrooms: 3,
      floor: '30/40층',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop',
      isHot: true,
      description: '최고급 주거단지, 수영장/헬스장',
      views: 2341,
      date: '2주일 전'
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesCategory = activeCategory === '전체' || property.type === activeCategory;
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 게시판 목록과 같은 구성: 위 흰 바(← 제목 · 검색) → 종류 밑줄 탭 → 매물 목록(사진 왼쪽)
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto h-[52px] px-2 flex items-center gap-1">
          <button onClick={onBack} aria-label="홈으로" className="p-2 text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 min-w-0 text-[19px] font-bold text-gray-900 whitespace-nowrap truncate">중국 부동산</h1>
          <button onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearchQuery(''); }} aria-label="검색" className="p-2 text-gray-700">
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        {searchOpen && (
          <div className="max-w-3xl mx-auto px-4 pb-2.5">
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="지역, 단지명 검색"
              className="w-full h-10 px-4 rounded-full bg-gray-100 text-[16px] outline-none focus:ring-2 focus:ring-[#03c75a]/40"
            />
          </div>
        )}
        <div className="max-w-3xl mx-auto flex gap-5 overflow-x-auto scrollbar-hide px-4" style={{ scrollbarWidth: 'none' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`shrink-0 py-2.5 text-[15.5px] whitespace-nowrap border-b-2 -mb-px ${c === activeCategory ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-500'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <p className="pt-3 text-[13.5px] text-gray-500">
          {activeCategory === '전체' ? '전체 매물' : activeCategory}{searchQuery && ` · "${searchQuery}" 검색`} · {filteredProperties.length}개
        </p>

        {filteredProperties.map((property) => (
          <div key={property.id} className="flex gap-3.5 py-4 border-b border-gray-100 last:border-b-0">
            <ImageWithFallback src={property.image} alt="" className="shrink-0 w-[104px] h-[104px] sm:w-[128px] sm:h-[112px] object-cover rounded-lg bg-gray-100" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#03a94d]">
                {property.type}{property.isHot && <span className="ml-1.5 text-red-500">인기</span>}
              </div>
              <h3 className="mt-0.5 text-[16px] font-medium text-gray-900 leading-snug line-clamp-2">{property.title}</h3>
              <div className="mt-0.5 text-[17px] font-bold text-gray-900">{property.price}</div>
              <div className="mt-0.5 text-[13px] text-gray-500 truncate">
                {property.location}
                {property.rooms > 0 && ` · 방 ${property.rooms}`}
                {` · ${property.area}`}
              </div>
            </div>
          </div>
        ))}

        {filteredProperties.length === 0 && <p className="py-16 text-center text-[15px] text-gray-500">조건에 맞는 매물이 없어요.</p>}

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-[14px] text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800">부동산 거래 안내</p>
          <ul className="mt-1 space-y-1">
            <li>· 중국 부동산 거래는 외국인에게 제한이 있을 수 있어요.</li>
            <li>· 반드시 전문가와 상담한 뒤 진행하세요.</li>
            <li>· 계약 전에 등기와 권리관계를 확인하세요.</li>
            <li>· 시나뷰 부동산은 정보만 제공하며, 거래 책임은 당사자에게 있어요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
