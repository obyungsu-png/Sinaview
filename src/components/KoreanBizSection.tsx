import { useState } from 'react';
import { X, ExternalLink, Play, MapPin, Phone, Globe } from 'lucide-react';
import { Card } from './ui/card';

interface BizCompany {
  id: number;
  name: string;
  slogan: string;
  category: string;
  region: string;
  description: string;
  image: string;
  logo?: string;
  videoUrl?: string;
  phone?: string;
  website?: string;
  wechat?: string;
  tiktok?: string;
  xiaohongshu?: string;
  tags: string[];
}

const companies: BizCompany[] = [
  {
    id: 1,
    name: 'BRIDGE CO.',
    slogan: '중국과 한국을 잇는 다리',
    category: '무역·컨설팅',
    region: '베이징',
    description: '한중 무역 및 현지 비즈니스 컨설팅 전문. 법인 설립부터 운영까지 원스톱 솔루션을 제공합니다.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&q=80',
    phone: '+86-10-8888-1234',
    website: 'https://bridge-co.kr',
    wechat: 'bridgecokr',
    tiktok: '@bridgeco_china',
    xiaohongshu: 'bridgeco',
    tags: ['무역', '법인설립', '컨설팅'],
  },
  {
    id: 2,
    name: 'SEOUL KITCHEN',
    slogan: '베이징 한가운데 서울의 맛',
    category: '요식업',
    region: '베이징 왕징',
    description: '왕징 한인타운 중심에 위치한 정통 한식당. 매일 직접 담근 김치와 신선한 재료로 고향의 맛을 전합니다.',
    image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&h=400&fit=crop&q=80',
    phone: '+86-10-6432-5678',
    wechat: 'seoulkitchen_bj',
    xiaohongshu: 'seoulkitchen',
    tiktok: '@seoulkitchen_bj',
    tags: ['한식당', '왕징', '배달가능'],
  },
  {
    id: 3,
    name: 'NOVA EDU',
    slogan: '미래를 여는 교육의 문',
    category: '교육',
    region: '상하이',
    description: '한국 교육과정 기반의 입시·특례 전문 학원. 서울대·연대·고대 합격생을 매년 배출하고 있습니다.',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop&q=80',
    phone: '+86-21-5566-7788',
    website: 'https://novaedu.co.kr',
    wechat: 'novaedu_sh',
    xiaohongshu: 'novaedu',
    tags: ['입시', '특례', '한국어'],
  },
  {
    id: 4,
    name: 'AURA CLINIC',
    slogan: '당신의 건강, 한국어로 상담합니다',
    category: '의료·뷰티',
    region: '광저우',
    description: '한국어 진료 가능한 피부과·성형외과. 한국 의료진이 직접 시술하며 최신 장비를 보유하고 있습니다.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&q=80',
    phone: '+86-20-3344-9900',
    wechat: 'auraclinic_gz',
    tiktok: '@auraclinic',
    xiaohongshu: 'auraclinic_gz',
    tags: ['피부과', '한국어진료', '뷰티'],
  },
];

export function KoreanBizSection() {
  const [selectedCompany, setSelectedCompany] = useState<BizCompany | null>(null);
  const [activeFilter, setActiveFilter] = useState('전체');

  const filters = ['전체', '무역·컨설팅', '요식업', '교육', '의료·뷰티'];
  const filtered = activeFilter === '전체' ? companies : companies.filter(c => c.category === activeFilter);

  const WechatIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
    </svg>
  );

  const TiktokIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/>
    </svg>
  );

  const XiaohongshuIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5h-3v1.5h2.5c.3 1.7-.5 3.5-2.5 4.2v1.3h1.5c1.8-1.6 2.5-4 1.5-7zm-5 0H9v1.5h1v5.5h1.5V9.5z"/>
    </svg>
  );

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">재중 한인 기업</h3>
            <p className="text-xs text-gray-400 mt-0.5">중국에서 활동하는 한인 기업들을 소개합니다</p>
          </div>
          <button className="text-xs text-gray-400 hover:text-gray-600">더보기 &gt;</button>
        </div>

        {/* 필터 */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                activeFilter === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(company => (
            <div
              key={company.id}
              className="group cursor-pointer rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all"
              onClick={() => setSelectedCompany(company)}
            >
              {/* 이미지 */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={company.image}
                  alt={company.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-2">
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {company.category}
                  </span>
                </div>
              </div>

              {/* 텍스트 */}
              <div className="p-2.5">
                <p className="text-sm font-bold text-gray-900 tracking-tight">{company.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{company.slogan}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                  <span className="text-[10px] text-gray-400">{company.region}</span>
                </div>
                {/* SNS 아이콘 */}
                <div className="flex gap-2 mt-2">
                  {company.wechat && <span className="text-green-500"><WechatIcon /></span>}
                  {company.tiktok && <span className="text-gray-800"><TiktokIcon /></span>}
                  {company.xiaohongshu && <span className="text-red-500"><XiaohongshuIcon /></span>}
                  {company.website && <Globe className="w-4 h-4 text-blue-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 기업 상세 모달 */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* 대표 이미지 */}
            <div className="relative aspect-video">
              <img
                src={selectedCompany.image}
                alt={selectedCompany.name}
                className="w-full h-full object-cover rounded-t-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-2xl" />
              <button
                className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedCompany(null)}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 p-4">
                <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded mb-1 inline-block backdrop-blur-sm">
                  {selectedCompany.category}
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">{selectedCompany.name}</h2>
                <p className="text-sm text-white/80">{selectedCompany.slogan}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* 소개 */}
              <p className="text-sm text-gray-700 leading-relaxed">{selectedCompany.description}</p>

              {/* 태그 */}
              <div className="flex flex-wrap gap-1.5">
                {selectedCompany.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 동영상 연결 */}
              {selectedCompany.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src={selectedCompany.videoUrl}
                    className="w-full aspect-video"
                    allowFullScreen
                    title={selectedCompany.name}
                  />
                </div>
              )}
              {!selectedCompany.videoUrl && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-dashed border-gray-200">
                  <Play className="w-8 h-8 text-gray-300" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">기업 소개 영상</p>
                    <p className="text-xs text-gray-400">동영상 URL을 등록하면 여기에 표시됩니다</p>
                  </div>
                </div>
              )}

              {/* 연락처 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">연락처</p>
                {selectedCompany.phone && (
                  <a href={`tel:${selectedCompany.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedCompany.phone}
                  </a>
                )}
                {selectedCompany.website && (
                  <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Globe className="w-4 h-4" />
                    {selectedCompany.website}
                  </a>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {selectedCompany.region}
                </div>
              </div>

              {/* SNS 버튼 */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SNS · 채널</p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCompany.wechat && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedCompany.wechat!); alert(`위챗 ID 복사됨: ${selectedCompany.wechat}`); }}
                      className="flex items-center gap-3 px-4 py-2.5 bg-[#07c160] hover:bg-[#06a850] text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <WechatIcon />
                      <span>WeChat · {selectedCompany.wechat}</span>
                    </button>
                  )}
                  {selectedCompany.tiktok && (
                    <a
                      href={`https://www.tiktok.com/${selectedCompany.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <TiktokIcon />
                      <span>TikTok · {selectedCompany.tiktok}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                    </a>
                  )}
                  {selectedCompany.xiaohongshu && (
                    <a
                      href={`https://www.xiaohongshu.com/user/profile/${selectedCompany.xiaohongshu}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <XiaohongshuIcon />
                      <span>小红书 · {selectedCompany.xiaohongshu}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
