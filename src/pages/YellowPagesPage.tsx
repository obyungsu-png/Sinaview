// 엘로우 페이지 (한인 업체 찾기) — 홈 섹션과 같은 업체 자료(data/yellowPages.ts)를 씀
// 구성: 위 흰 바(← 제목 · 검색) → 분류 밑줄 탭 → 지역 한 줄 → 업체 목록 (게시판 목록과 같은 모양)
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, X, MapPin, Phone, Clock, Star } from 'lucide-react';
import { regionBusinesses, REGIONS_WITH_BUSINESSES, type Business } from '../data/yellowPages';

interface YellowPagesPageProps {
  onBack: () => void;
}

const CATEGORIES = ['전체', '병원', '음식점', '교육', '서비스'];
const REGIONS = ['대련', '북경', '상해', '소주', '무석', '난징', '항저우', '천진', '심천', '심양', '연길', '시안', '우한', '청두', '광저우', '연태', '위해', '청도'];
const ALL = '전체 지역';

const mapUrl = (b: Business) => `https://map.baidu.com/search/${encodeURIComponent(b.chineseAddress || b.address)}`;

function BusinessRow({ b }: { b: Business }) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-[#03a94d] font-semibold">{b.category}</div>
          <h3 className="mt-0.5 text-[17px] font-bold text-gray-900 leading-snug">{b.name}</h3>
          <p className="mt-1 text-[14.5px] text-gray-600 leading-snug line-clamp-2">{b.description}</p>
        </div>
        {b.imageUrl && (
          <img src={b.imageUrl.replace('w=1080', 'w=300')} alt="" loading="lazy" className="shrink-0 w-[92px] h-[92px] sm:w-[120px] sm:h-[100px] object-cover rounded-lg bg-gray-100" />
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-gray-500">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          <b className="font-semibold text-gray-800">{b.rating}</b> 리뷰 {b.reviews.toLocaleString()}
        </span>
        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{b.address}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.hours}</span>
      </div>
      {b.features?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {b.features.slice(0, 4).map((f) => (
            <span key={f} className="px-2 py-0.5 rounded bg-gray-100 text-[13px] text-gray-600">{f}</span>
          ))}
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:gap-2">
        <a href={`tel:${b.phone.replace(/[^+\d]/g, '')}`} className="flex items-center justify-center gap-1.5 h-10 sm:px-4 rounded-lg border border-gray-200 text-[14.5px] font-medium text-gray-800 active:bg-gray-50">
          <Phone className="w-4 h-4 text-[#03a94d]" /> 전화
        </a>
        <a href={mapUrl(b)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 h-10 sm:px-4 rounded-lg border border-gray-200 text-[14.5px] font-medium text-gray-800 active:bg-gray-50">
          <MapPin className="w-4 h-4 text-[#03a94d]" /> 지도
        </a>
      </div>
    </div>
  );
}

export function YellowPagesPage({ onBack }: YellowPagesPageProps) {
  const [category, setCategory] = useState('전체');
  const [region, setRegion] = useState(ALL);
  const [term, setTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userRegion, setUserRegion] = useState('');

  // 회원 지역을 맨 앞에 두고, 그 지역에 업체가 있으면 처음부터 그 지역을 보여 줌
  useEffect(() => {
    try {
      const region = JSON.parse(localStorage.getItem('currentUser') || 'null')?.region;
      if (region) {
        setUserRegion(region);
        if (REGIONS_WITH_BUSINESSES.includes(region)) setRegion(region);
      }
    } catch {}
  }, []);

  const regions = useMemo(() => {
    const list = userRegion && REGIONS.includes(userRegion) ? [userRegion, ...REGIONS.filter((r) => r !== userRegion)] : REGIONS;
    return [ALL, ...list];
  }, [userRegion]);

  const shown = useMemo(() => {
    const base = region === ALL ? REGIONS_WITH_BUSINESSES.flatMap(regionBusinesses) : regionBusinesses(region);
    const q = term.trim().toLowerCase();
    return base.filter(
      (b) =>
        (category === '전체' || b.category === category) &&
        (!q || [b.name, b.description, b.address, ...(b.features || [])].some((t) => t.toLowerCase().includes(q))),
    );
  }, [category, region, term]);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto h-[52px] px-2 flex items-center gap-1">
          <button onClick={onBack} aria-label="홈으로" className="p-2 text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 min-w-0 text-[19px] font-bold text-gray-900 whitespace-nowrap truncate">엘로우 페이지</h1>
          <button onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setTerm(''); }} aria-label="검색" className="p-2 text-gray-700">
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        {searchOpen && (
          <div className="max-w-3xl mx-auto px-4 pb-2.5">
            <input
              autoFocus
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="업체명, 서비스 검색"
              className="w-full h-10 px-4 rounded-full bg-gray-100 text-[16px] outline-none focus:ring-2 focus:ring-[#03a94d]/40"
            />
          </div>
        )}
        <div className="max-w-3xl mx-auto flex gap-5 overflow-x-auto scrollbar-hide px-4" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((c) => (
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
        <div className="-mx-4 px-4 pt-3 flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap" style={{ scrollbarWidth: 'none' }}>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`shrink-0 px-3.5 h-9 rounded-full text-[14.5px] whitespace-nowrap border ${r === region ? 'bg-gray-900 border-gray-900 text-white font-semibold' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="pt-3 text-[13.5px] text-gray-500">
          {region}{category !== '전체' && ` · ${category}`} · 업체 {shown.length}곳
        </p>

        {shown.map((b) => <BusinessRow key={b.name + b.address} b={b} />)}

        {shown.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[16px] font-semibold text-gray-800">
              {term ? `"${term}" 검색 결과가 없어요.` : `${region}${category !== '전체' ? ` ${category}` : ''} 업체는 아직 등록 전이에요.`}
            </p>
            {!term && region !== ALL && (
              <button onClick={() => setRegion(ALL)} className="mt-4 px-4 h-10 rounded-full border border-gray-300 text-[14.5px] text-gray-700">
                전체 지역 업체 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
