import { Card } from './ui/card';
import { Home, TrendingUp, ExternalLink, X } from 'lucide-react';
import qrImage from 'figma:asset/a11cb83071101d48b38ef71df652771f442731ab.png';
import anjukeQrImage from 'figma:asset/4c1c9d7545c2c2d201ab24bef51bfb98b94277ec.png';
import { useState } from 'react';

interface RealEstateWidgetProps {
  onMoreClick?: () => void;
  userCity?: string; // 사용자 등록 지역
}

export function RealEstateWidget({ onMoreClick, userCity = '베이징' }: RealEstateWidgetProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'apps'>('listings');
  const [beikeSubTab, setBeikeSubTab] = useState<'info' | 'guide'>('info');
  const [anjukeSubTab, setAnjukeSubTab] = useState<'info' | 'guide'>('info');
  const [showContactModal, setShowContactModal] = useState(false);

  // 중국 주요 도시별 인기 지역 데이터 (Beike & Anjuke 기준)
  const cityData: Record<string, {
    hotDistricts: Array<{
      id: number;
      title: string;
      price: string;
      area: string;
      location: string;
      isHot: boolean;
    }>;
  }> = {
    '베이징': {
      hotDistricts: [
        { id: 1, title: "차오양구 CBD 아파트", price: "15억원", area: "95㎡", location: "차오양구 CBD", isHot: true },
        { id: 2, title: "하이덴구 중관촌 아파트", price: "12억원", area: "85㎡", location: "하이덴구 중관촌", isHot: true },
        { id: 3, title: "둥청구 왕징 신축", price: "10억원", area: "78㎡", location: "차오양구 왕징", isHot: false }
      ]
    },
    '상하이': {
      hotDistricts: [
        { id: 1, title: "푸동신구 루자주이 아파트", price: "18억원", area: "100㎡", location: "푸동신구 루자주이", isHot: true },
        { id: 2, title: "징안구 난징서로 오피스텔", price: "13억원", area: "68㎡", location: "징안구 난징서로", isHot: true },
        { id: 3, title: "쉬후이구 쉬자후이 아파트", price: "11억원", area: "80㎡", location: "쉬후이구 쉬자후이", isHot: false }
      ]
    },
    '광저우': {
      hotDistricts: [
        { id: 1, title: "티엔허구 주장신청 아파트", price: "9억원", area: "88㎡", location: "티엔허구 주장신청", isHot: true },
        { id: 2, title: "위에슈구 북경로 오피스텔", price: "7억원", area: "65㎡", location: "위에슈구 북경로", isHot: false },
        { id: 3, title: "하이주구 주장신청 신축", price: "8.5억원", area: "92㎡", location: "하이주구", isHot: true }
      ]
    },
    '선전': {
      hotDistricts: [
        { id: 1, title: "난산구 커지 아파트", price: "11억원", area: "85㎡", location: "난산구 커지", isHot: true },
        { id: 2, title: "푸톈구 CBD 오피스텔", price: "9억원", area: "70㎡", location: "푸톈구 CBD", isHot: true },
        { id: 3, title: "лё후구 동먼 아파트", price: "6.2억원", area: "78㎡", location: "лё후구 동먼", isHot: false }
      ]
    },
    '대련': {
      hotDistricts: [
        { id: 1, title: "시강구 동항광장 아파트", price: "4억원", area: "90㎡", location: "시강구 동항광장", isHot: true },
        { id: 2, title: "중산구 칭니와광장 아파트", price: "3.5억원", area: "85㎡", location: "중산구 칭니와", isHot: true },
        { id: 3, title: "사허커우구 신축 아파트", price: "3.2억원", area: "78㎡", location: "사허커우구", isHot: false }
      ]
    },
    '청두': {
      hotDistricts: [
        { id: 1, title: "진장구 텐푸광장 아파트", price: "5.5억원", area: "88㎡", location: "진장구 텐푸광장", isHot: true },
        { id: 2, title: "우허우구 춘시로 오피스텔", price: "4.8억원", area: "72㎡", location: "우허우구 춘시로", isHot: true },
        { id: 3, title: "가오신구 신축 아파트", price: "5억원", area: "80㎡", location: "가오신구", isHot: false }
      ]
    },
    '항저우': {
      hotDistricts: [
        { id: 1, title: "빈장구 첸장신청 아파트", price: "8억원", area: "95㎡", location: "빈장구 첸장신청", isHot: true },
        { id: 2, title: "시후구 황룽 오피스텔", price: "6.5억원", area: "70㎡", location: "시후구 황룽", isHot: false },
        { id: 3, title: "샹청구 신축 아파트", price: "7.2억원", area: "85㎡", location: "샹청구", isHot: true }
      ]
    }
  };

  // 사용자 도시의 매물 가져오기 (없으면 베이징 기본)
  const realEstateItems = cityData[userCity] ? cityData[userCity].hotDistricts : cityData['베이징'].hotDistricts;

  const realEstateApps = [
    {
      id: 1,
      name: "贝壳找房 (Beike)",
      nameKr: "베이커",
      advantage: "중국 최대 부동산 플랫폼. VR 방문, 실사진, 상세한 거래 데이터 제공.",
      usage: "매매/전월세 시세 분석과 체계적인 중개 서비스.",
      color: "bg-green-50 border-green-200"
    },
    {
      id: 2,
      name: "安居客 (Anjuke)",
      nameKr: "안쥐커",
      advantage: "58同城 계열사. 방대한 매물 정보량과 다양한 옵션 제공.",
      usage: "시장 가격 비교 검토. 개인부터 대형 중개업체까지 폭넓은 매물.",
      color: "bg-blue-50 border-blue-200"
    }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Home className="w-4 h-4 text-green-600" />
          <h2 className="font-semibold">부동산</h2>
        </div>
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 pb-2 text-sm transition-colors ${
            activeTab === 'listings'
              ? 'border-b-2 border-green-600 text-green-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          부동산
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          className={`flex-1 pb-2 text-sm transition-colors ${
            activeTab === 'apps'
              ? 'border-b-2 border-green-600 text-green-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          부동산 앱
        </button>
      </div>

      {/* Tab Content - Listings */}
      {activeTab === 'listings' && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="space-y-3">
            {realEstateItems.map((item) => (
              <div 
                key={item.id} 
                className="hover:bg-gray-100 bg-white p-2 rounded cursor-pointer"
                onClick={onMoreClick}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      {item.isHot && (
                        <span className="bg-red-100 text-red-700 px-1 py-0.5 text-xs font-bold rounded">
                          HOT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{item.area}</span>
                      <span>•</span>
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600 ml-2">
                    {item.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={onMoreClick}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              부동산 더보기 &gt;
            </button>
          </div>
        </div>
      )}

      {/* Tab Content - Apps */}
      {activeTab === 'apps' && (
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="space-y-3">
            {/* Beike App */}
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-sm text-gray-900">
                  贝壳找房 (Beike)
                </h3>
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">베이커</span>
              </div>
              
              {/* Website Link */}
              <a 
                href="https://ke.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 mb-2"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                https://ke.com/
              </a>
              
              {/* Sub Tabs */}
              <div className="flex border-b mb-2">
                <button
                  onClick={() => setBeikeSubTab('info')}
                  className={`flex-1 pb-1 text-xs transition-colors ${
                    beikeSubTab === 'info'
                      ? 'border-b-2 border-green-600 text-green-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  정보
                </button>
                <button
                  onClick={() => setBeikeSubTab('guide')}
                  className={`flex-1 pb-1 text-xs transition-colors ${
                    beikeSubTab === 'guide'
                      ? 'border-b-2 border-green-600 text-green-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  사용방법
                </button>
              </div>
              
              {/* Info Tab */}
              {beikeSubTab === 'info' && (
                <div>
                  <div className="text-center bg-white p-2 rounded-lg border border-gray-200 mb-2">
                    <div className="w-32 h-32 mx-auto flex items-center justify-center">
                      <img 
                        src={qrImage} 
                        alt="베이커 부동산 QR 코드" 
                        className="w-28 h-28 rounded object-contain"
                      />
                    </div>
                    <p className="text-xs font-semibold text-blue-600 mt-1">위챗 스캔</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700">✨ 장점:</h4>
                      <p className="text-xs text-gray-600">중국 최대 부동산 플랫폼. VR 방문, 실사진, 상세한 거래 데이터 제공.</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700">📍 사용처:</h4>
                      <p className="text-xs text-gray-600">매매/전월세 시세 분석과 체계적인 중개 서비스.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Guide Tab */}
              {beikeSubTab === 'guide' && (
                <div className="text-xs text-gray-700 space-y-2">
                  <div>
                    <p className="font-semibold mb-1">📱 앱 사용:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      <li>위챗 QR 스캔 또는 웹사이트 접속</li>
                      <li>지역/가격/면적 등 조건 설정</li>
                      <li>VR 투어로 매물 미리보기</li>
                      <li>중개인 연락 및 방문 예약</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Anjuke App */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-sm text-gray-900">
                  安居客 (Anjuke)
                </h3>
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">안쥐커</span>
              </div>
              
              {/* Website Link */}
              <a 
                href="https://anjuke.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 mb-2"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                https://anjuke.com/
              </a>
              
              {/* Sub Tabs */}
              <div className="flex border-b mb-2">
                <button
                  onClick={() => setAnjukeSubTab('info')}
                  className={`flex-1 pb-1 text-xs transition-colors ${
                    anjukeSubTab === 'info'
                      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  정보
                </button>
                <button
                  onClick={() => setAnjukeSubTab('guide')}
                  className={`flex-1 pb-1 text-xs transition-colors ${
                    anjukeSubTab === 'guide'
                      ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  사용방법
                </button>
              </div>
              
              {/* Info Tab */}
              {anjukeSubTab === 'info' && (
                <div>
                  <div className="text-center bg-white p-2 rounded-lg border border-gray-200 mb-2">
                    <div className="w-32 h-32 mx-auto flex items-center justify-center">
                      <img 
                        src={anjukeQrImage} 
                        alt="안쥐커 QR 코드" 
                        className="w-28 h-28 rounded object-contain"
                      />
                    </div>
                    <p className="text-xs font-semibold text-green-600 mt-1">위챗 미니프로그램</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700">✨ 장점:</h4>
                      <p className="text-xs text-gray-600">58同城 계열사. 방대한 매물 정보량과 다양한 옵션 제공.</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700">📍 사용처:</h4>
                      <p className="text-xs text-gray-600">시장 가격 비교 검토. 개인부터 대형 중개업체까지 폭넓은 매물.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Guide Tab */}
              {anjukeSubTab === 'guide' && (
                <div className="text-xs text-gray-700 space-y-2">
                  <div>
                    <p className="font-semibold mb-1">�� 앱 사용:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      <li>위챗 QR 스캔 또는 웹사이트 접속</li>
                      <li>도시 선택 및 검색 조건 입력</li>
                      <li>매물 상세정보 및 사진 확인</li>
                      <li>중개인 연락 또는 직접 방문 신청</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 하단 위챗 상담 섹션 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center gap-3">
            {/* 위챗 로고 박스 */}
            <div className="w-12 h-12 bg-[#07c160] rounded-xl flex items-center justify-center shadow-md shadow-green-400/40">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
            </div>
            
            {/* 텍스트 정보 */}
            <div className="flex-1">
              <div className="text-xs text-gray-600 font-semibold">부동산 1:1 상담</div>
              <div className="text-lg font-black text-gray-900 tracking-tight">matanboy</div>
            </div>

            {/* 상담하기 버튼 */}
            <button 
              className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#07c160] transition-colors shadow-md"
              onClick={() => setShowContactModal(true)}
            >
              상담하기
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#07c160] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-black text-gray-900">부동산 상담</h3>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowContactModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* QR 코드 영역 */}
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 mb-6">
              <div className="text-center">
                {/* QR 코드 placeholder - 실제 QR 코드 이미지로 교체 가능 */}
                <div className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl flex items-center justify-center border-4 border-[#07c160]">
                  <div className="text-center">
                    <svg className="w-32 h-32 text-[#07c160] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                    </svg>
                    <p className="text-xs text-gray-500">위챗 QR 스캔</p>
                  </div>
                </div>
                
                {/* 위챗 ID */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-3 rounded-xl border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">위챗 ID</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">matanboy</p>
                </div>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                📱 위챗에서 <span className="font-bold text-[#07c160]">matanboy</span>를 검색하거나<br/>
                QR 코드를 스캔하여 1:1 상담을 시작하세요!
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors"
                onClick={() => setShowContactModal(false)}
              >
                닫기
              </button>
              <button 
                className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-full font-bold hover:from-[#07c160] hover:to-[#06a850] transition-all shadow-lg"
                onClick={() => {
                  // 위챗 ID 복사
                  navigator.clipboard.writeText('matanboy');
                  alert('위챗 ID가 복사되었습니다!');
                }}
              >
                ID 복사
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}