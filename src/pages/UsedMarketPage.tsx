import { useState } from 'react';
import { ArrowLeft, Package, Heart, Search, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface UsedMarketPageProps {
  onBack: () => void;
}

export function UsedMarketPage({ onBack }: UsedMarketPageProps) {
  const marketItems = [
    {
      id: 1,
      title: "아이폰 14 Pro Max 256GB 퍼플 색상 판매",
      price: "5,200위안",
      originalPrice: "7,500위안",
      location: "베이징 차오양구",
      seller: "김서울",
      sellerRating: 4.8,
      time: "30분 전",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      category: "전자제품",
      likes: 15,
      views: 234,
      description: "작년에 구입한 아이폰으로 케이스 끼고 사용해서 깨끗합니다. 박스, 충전기 모두 포함."
    },
    {
      id: 2,
      title: "삼성 김치냉장고 327L 스탠드형 (거의 새것)",
      price: "3,200위안",
      originalPrice: "4,800위안",
      location: "상하이 푸동신구",
      seller: "박중국",
      sellerRating: 4.9,
      time: "1시간 전",
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=200&fit=crop",
      delivery: "중통택배",
      status: "예약중",
      category: "한국식품",
      likes: 28,
      views: 445,
      description: "한국에서 가져온 김치냉장고입니다. 6개월만 사용했고 이사로 인해 판매합니다."
    },
    {
      id: 3,
      title: "한국 화장품 세트 (설화수, 후, 이니스프리)",
      price: "850위안",
      originalPrice: "1,200위안",
      location: "광저우 천허구",
      seller: "이차이나",
      sellerRating: 4.7,
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop",
      delivery: "신다택배",
      status: "판매중",
      category: "화장품",
      likes: 42,
      views: 678,
      description: "한국 면세점에서 구입한 정품입니다. 미개봉 상태로 판매합니다."
    },
    {
      id: 4,
      title: "쿠쿠 압력밥솥 10인용 + 한국 라면 박스",
      price: "1,400위안",
      originalPrice: "2,100위안",
      location: "선전 난산구",
      seller: "최한국",
      sellerRating: 4.6,
      time: "3시간 전",
      image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&h=200&fit=crop",
      delivery: "원통택배",
      status: "판매중",
      category: "생활용품",
      likes: 19,
      views: 312,
      description: "한국 쿠쿠 밥솥과 신라면, 불닭볶음면 등 한국 라면 50개 세트로 판매합니다."
    },
    {
      id: 5,
      title: "LG 세탁기 12kg 드럼세탁기 (1년 사용)",
      price: "2,800위안",
      originalPrice: "4,200위안",
      location: "베이징 하이디안구",
      seller: "정베이징",
      sellerRating: 4.8,
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      category: "생활용품",
      likes: 31,
      views: 521,
      description: "LG 트롬 세탁기 12kg 용량입니다. 이사로 인해 판매하며 상태 매우 좋습니다."
    },
    {
      id: 6,
      title: "애플 맥북 프로 13인치 M2 512GB (6개월 사용)",
      price: "8,900위안",
      originalPrice: "12,500위안",
      location: "상하이 징안구",
      seller: "윤상하이",
      sellerRating: 4.9,
      time: "5시간 전",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop",
      delivery: "중통택배",
      status: "판매중",
      category: "전자제품",
      likes: 56,
      views: 892,
      description: "맥북 프로 M2칩 512GB 모델입니다. 케이스와 파우치, 어댑터 모두 포함합니다."
    }
  ];

  const categories = ["전체", "전자제품", "한국식품", "화장품", "생활용품"];
  const cities = ["전체", "베이징", "상하이", "광저우", "선전", "항저우", "난징"];
  const [category, setCategory] = useState('전체');
  const [city, setCity] = useState('전체');
  const [term, setTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const q = term.trim().toLowerCase();
  const shown = marketItems.filter(
    (item) =>
      (category === '전체' || item.category === category) &&
      (city === '전체' || item.location.startsWith(city)) &&
      (!q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
  );

  // 게시판 목록과 같은 구성: 위 흰 바(← 제목 · 검색 · 판매하기) → 분류 밑줄 탭 → 지역 한 줄 → 상품 목록(사진 왼쪽)
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto h-[52px] px-2 flex items-center gap-1">
          <button onClick={onBack} aria-label="홈으로" className="p-2 text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 min-w-0 text-[19px] font-bold text-gray-900 whitespace-nowrap truncate">화개장터</h1>
          <button onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setTerm(''); }} aria-label="검색" className="p-2 text-gray-700">
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
          <button onClick={() => alert('판매 글 올리기는 준비 중이에요.')} className="mr-1.5 flex items-center gap-1 px-3.5 h-9 rounded-full bg-[#03c75a] text-white text-[14.5px] font-semibold">
            <Package className="w-4 h-4" /> 판매하기
          </button>
        </div>
        {searchOpen && (
          <div className="max-w-3xl mx-auto px-4 pb-2.5">
            <input
              autoFocus
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="물품명, 브랜드 검색"
              className="w-full h-10 px-4 rounded-full bg-gray-100 text-[16px] outline-none focus:ring-2 focus:ring-[#03c75a]/40"
            />
          </div>
        )}
        <div className="max-w-3xl mx-auto flex gap-5 overflow-x-auto scrollbar-hide px-4" style={{ scrollbarWidth: 'none' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 py-2.5 text-[15.5px] whitespace-nowrap border-b-2 -mb-px ${c === category ? 'border-gray-900 text-gray-900 font-bold' : 'border-transparent text-gray-500'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="-mx-4 px-4 pt-3 flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`shrink-0 px-3.5 h-9 rounded-full text-[14.5px] whitespace-nowrap border ${c === city ? 'bg-gray-900 border-gray-900 text-white font-semibold' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              {c === '전체' ? '전체 지역' : c}
            </button>
          ))}
        </div>
        <p className="pt-3 text-[13.5px] text-gray-500">
          {city === '전체' ? '전체 지역' : city}{category !== '전체' && ` · ${category}`} · 상품 {shown.length}개
        </p>

        {shown.map((item) => (
          <div key={item.id} className="flex gap-3.5 py-4 border-b border-gray-100 last:border-b-0">
            <ImageWithFallback src={item.image} alt="" className="shrink-0 w-[104px] h-[104px] sm:w-[120px] sm:h-[120px] object-cover rounded-lg bg-gray-100" />
            <div className="flex-1 min-w-0 flex flex-col">
              <h3 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</h3>
              <div className="mt-1 text-[13.5px] text-gray-500 truncate">
                {item.location} · {item.time}
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                {item.status !== '판매중' && (
                  <span className="self-center px-1.5 py-0.5 rounded bg-gray-800 text-white text-[12px] font-semibold whitespace-nowrap">{item.status}</span>
                )}
                <span className="text-[17px] font-bold text-gray-900 whitespace-nowrap">{item.price}</span>
                {item.originalPrice && <span className="text-[13px] text-gray-400 line-through whitespace-nowrap">{item.originalPrice}</span>}
              </div>
              <div className="mt-auto pt-1 flex items-center justify-end gap-2.5 text-[13px] text-gray-500">
                <span>{item.delivery}</span>
                <span className="flex items-center gap-0.5"><Heart className="w-3.5 h-3.5" />{item.likes}</span>
                <span>조회 {item.views}</span>
              </div>
            </div>
          </div>
        ))}

        {shown.length === 0 && <p className="py-16 text-center text-[15px] text-gray-500">조건에 맞는 상품이 없어요.</p>}

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-[14px] text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800">거래 안내</p>
          <p className="mt-1">이사·귀국 정리, 사용감 적은 물품을 직거래 또는 택배(순풍·중통·신다·원통택배, EMS)로 거래해요. 직접 만나서 확인하거나 믿을 수 있는 택배를 이용하세요.</p>
        </div>
      </div>
    </div>
  );
}
