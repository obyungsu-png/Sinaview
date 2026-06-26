import { useState } from 'react';
import { Home, TrendingUp, ExternalLink, X, Search, MapPin, Bed, Bath, Square, Filter } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import qrImage from 'figma:asset/a11cb83071101d48b38ef71df652771f442731ab.png';
import anjukeQrImage from 'figma:asset/4c1c9d7545c2c2d201ab24bef51bfb98b94277ec.png';

interface RealEstateSectionProps {
  category?: string;
  onMoreClick?: () => void;
  userCity?: string;
}

export function RealEstateSection({ category = '부동산', onMoreClick, userCity = '베이징' }: RealEstateSectionProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'apps'>('listings');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [beikeSubTab, setBeikeSubTab] = useState<'info' | 'guide'>('info');
  const [anjukeSubTab, setAnjukeSubTab] = useState<'info' | 'guide'>('info');

  const categories = ['전체', '매매', '전세', '월세', '상가', '오피스텔'];

  const properties = [
    { id: 1, title: '베이징 차오양구 고급 아파트', price: '12억원', type: '매매', location: '차오양구 CBD', area: '85㎡', rooms: 3, bathrooms: 2, floor: '15/25층', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop', isHot: true, description: '지하철역 도보 5분, 명문학군, 풀옵션', views: 1234, date: '1일 전' },
    { id: 2, title: '상하이 황푸구 신축 오피스텔', price: '8.5억원', type: '매매', location: '황푸구 인민광장', area: '45㎡', rooms: 1, bathrooms: 1, floor: '20/30층', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop', isHot: true, description: '신축 건물, 한국인 밀집지역', views: 892, date: '2일 전' },
    { id: 3, title: '선전 난산구 아파트', price: '6.2억원', type: '매매', location: '난산구 과학기술단지', area: '78㎡', rooms: 2, bathrooms: 2, floor: '10/18층', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', isHot: false, description: 'IT 기업 밀집지역, 교통 편리', views: 567, date: '3일 전' },
    { id: 4, title: '베이징 하이뎬구 학군 아파트', price: '300만원/월', type: '월세', location: '하이뎬구 중관촌', area: '92㎡', rooms: 3, bathrooms: 2, floor: '8/15층', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop', isHot: false, description: '명문대 인근, 한국 마트 도보 거리', views: 423, date: '4일 전' },
    { id: 5, title: '상하이 푸동 신구 오피스', price: '15억원', type: '매매', location: '푸동신구 루자쭈이', area: '120㎡', rooms: 4, bathrooms: 3, floor: '25/35층', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=300&fit=crop', isHot: true, description: '금융중심지, 강변뷰', views: 1567, date: '5일 전' },
    { id: 6, title: '광저우 톈허구 상가', price: '9억원', type: '상가', location: '톈허구 상권', area: '65㎡', rooms: 0, bathrooms: 1, floor: '1층', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', isHot: false, description: '한국인 상권, 높은 유동인구', views: 789, date: '1주일 전' },
    { id: 7, title: '베이징 순이구 전세 아파트', price: '2억원 (2년)', type: '전세', location: '순이구 국제공항 인근', area: '75㎡', rooms: 2, bathrooms: 1, floor: '12/20층', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop', isHot: false, description: '공항 접근성 우수, 조용한 주거지', views: 345, date: '1주일 전' },
    { id: 8, title: '선전 푸톈구 럭셔리 아파트', price: '18억원', type: '매매', location: '푸톈구 CBD', area: '150㎡', rooms: 4, bathrooms: 3, floor: '30/40층', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop', isHot: true, description: '최고급 주거단지, 수영장/헬스장', views: 2341, date: '2주일 전' },
  ];

  // 위젯용 도시별 인기 매물은 제거됨

  const filteredProperties = properties.filter(p => {
    const matchCat = activeCategory === '전체' || p.type === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const WechatIcon = () => (
    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
    </svg>
  );

  return (
    <Card className="p-4" id="realestate">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Home className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-lg">{category}</h2>
        </div>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>

      {/* 탭 */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 pb-2 text-sm transition-colors ${activeTab === 'listings' ? 'border-b-2 border-green-600 text-green-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          부동산
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          className={`flex-1 pb-2 text-sm transition-colors ${activeTab === 'apps' ? 'border-b-2 border-green-600 text-green-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          부동산 앱
        </button>
      </div>

      {/* ===== 매물 탭 ===== */}
      {activeTab === 'listings' && (
        <div>
          {/* 검색 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="지역, 단지명으로 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3" style={{scrollbarWidth:'none'}}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors shrink-0 ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 매물 목록 */}
          <div className="divide-y divide-gray-100">
            {filteredProperties.slice(0, 4).map(p => (
              <button key={p.id} className="w-full text-left py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors -mx-1 px-1 rounded" onClick={onMoreClick}>
                <img src={p.image} alt={p.title} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.location}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-semibold text-green-600">{p.price}</span>
                    <span className="text-xs text-gray-400">{p.type} · {p.area}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">검색 결과가 없습니다</div>
          )}

          <div className="mt-3 text-center">
            <button onClick={onMoreClick} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
              더보기 →
            </button>
          </div>
        </div>
      )}

      {/* ===== 부동산 앱 탭 ===== */}
      {activeTab === 'apps' && (
        <div className="space-y-3">
          {/* Beike */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-900">贝壳找房 (Beike)</h3>
              <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">베이커</span>
            </div>
            <a href="https://ke.com/" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:text-blue-800 mb-2">
              <ExternalLink className="w-3 h-3 mr-1" />
              https://ke.com/
            </a>
            <div className="flex border-b mb-2">
              {(['info', 'guide'] as const).map(t => (
                <button key={t} onClick={() => setBeikeSubTab(t)} className={`flex-1 pb-1 text-xs transition-colors ${beikeSubTab === t ? 'border-b-2 border-green-600 text-green-600 font-semibold' : 'text-gray-500'}`}>
                  {t === 'info' ? '정보' : '사용방법'}
                </button>
              ))}
            </div>
            {beikeSubTab === 'info' && (
              <div>
                <div className="text-center bg-white p-2 rounded-lg border border-gray-200 mb-2">
                  <div className="w-28 h-28 mx-auto flex items-center justify-center">
                    <img src={qrImage} alt="베이커 QR 코드" className="w-24 h-24 rounded object-contain" />
                  </div>
                  <p className="text-xs font-semibold text-green-600 mt-1">앱 다운로드 QR</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">✨ 장점:</p>
                  <p className="text-xs text-gray-600">중국 최대 부동산 플랫폼. VR 방문, 실사진, 상세한 거래 데이터 제공.</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">📍 사용처:</p>
                  <p className="text-xs text-gray-600">매매/전월세 시세 분석과 체계적인 중개 서비스.</p>
                </div>
              </div>
            )}
            {beikeSubTab === 'guide' && (
              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-semibold">📱 앱 사용:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>앱스토어에서 "贝壳找房" 검색 후 설치</li>
                  <li>도시 선택 및 검색 조건 입력</li>
                  <li>VR 방문 또는 실사진으로 매물 확인</li>
                  <li>중개인 연락 또는 직접 방문 신청</li>
                </ol>
              </div>
            )}
          </div>

          {/* Anjuke */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-900">安居客 (Anjuke)</h3>
              <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">안쥐커</span>
            </div>
            <a href="https://anjuke.com/" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-blue-600 hover:text-blue-800 mb-2">
              <ExternalLink className="w-3 h-3 mr-1" />
              https://anjuke.com/
            </a>
            <div className="flex border-b mb-2">
              {(['info', 'guide'] as const).map(t => (
                <button key={t} onClick={() => setAnjukeSubTab(t)} className={`flex-1 pb-1 text-xs transition-colors ${anjukeSubTab === t ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {t === 'info' ? '정보' : '사용방법'}
                </button>
              ))}
            </div>
            {anjukeSubTab === 'info' && (
              <div>
                <div className="text-center bg-white p-2 rounded-lg border border-gray-200 mb-2">
                  <div className="w-28 h-28 mx-auto flex items-center justify-center">
                    <img src={anjukeQrImage} alt="안쥐커 QR 코드" className="w-24 h-24 rounded object-contain" />
                  </div>
                  <p className="text-xs font-semibold text-blue-600 mt-1">위챗 미니프로그램</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">✨ 장점:</p>
                  <p className="text-xs text-gray-600">58同城 계열사. 방대한 매물 정보량과 다양한 옵션 제공.</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">📍 사용처:</p>
                  <p className="text-xs text-gray-600">시장 가격 비교 검토. 개인부터 대형 중개업체까지 폭넓은 매물.</p>
                </div>
              </div>
            )}
            {anjukeSubTab === 'guide' && (
              <div className="text-xs text-gray-700 space-y-1">
                <p className="font-semibold">📱 앱 사용:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>위챗 QR 스캔 또는 웹사이트 접속</li>
                  <li>도시 선택 및 검색 조건 입력</li>
                  <li>매물 상세정보 및 사진 확인</li>
                  <li>중개인 연락 또는 직접 방문 신청</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 위챗 1:1 상담 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#07c160] rounded-xl flex items-center justify-center shadow-md shadow-green-400/40">
              <WechatIcon />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 font-semibold">부동산 1:1 상담</div>
              <div className="text-lg font-black text-gray-900 tracking-tight">matanboy</div>
            </div>
            <button
              className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#07c160] transition-colors shadow-md"
              onClick={() => setShowContactModal(true)}
            >
              상담하기
            </button>
          </div>
        </div>
      </div>

      {/* 상담 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#07c160] rounded-xl flex items-center justify-center">
                  <WechatIcon />
                </div>
                <h3 className="text-xl font-black text-gray-900">부동산 상담</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowContactModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 mb-6">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl flex items-center justify-center border-4 border-[#07c160]">
                  <div className="text-center">
                    <WechatIcon />
                    <p className="text-xs text-gray-500 mt-2">위챗 QR 스캔</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-3 rounded-xl border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">위챗 ID</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">matanboy</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                📱 위챗에서 <span className="font-bold text-[#07c160]">matanboy</span>를 검색하거나<br />QR 코드를 스캔하여 1:1 상담을 시작하세요!
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors" onClick={() => setShowContactModal(false)}>닫기</button>
              <button className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-full font-bold hover:from-[#07c160] hover:to-[#06a850] transition-all shadow-lg" onClick={() => { navigator.clipboard.writeText('matanboy'); alert('위챗 ID가 복사되었습니다!'); }}>ID 복사</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
