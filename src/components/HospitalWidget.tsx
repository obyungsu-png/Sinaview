import { useState } from 'react';
import { Phone, MapPin, X, Clock, Star } from 'lucide-react';
import { Card } from './ui/card';

interface HospitalWidgetProps {
  userCity?: string;
}

export function HospitalWidget({ userCity = '베이징' }: HospitalWidgetProps) {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'info'>('hospitals');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  const cityData: Record<string, any[]> = {
    '베이징': [
      { id: 1, name: '베이징 화신 국제의료센터', dept: '내과 · 외과 · 산부인과', location: '차오양구 영수로', phone: '010-8456-1234', korean: true, rating: 4.8, hours: '09:00 – 18:00', isHot: true },
      { id: 2, name: '베이징유나이티드가정병원', dept: '종합진료 · 소아과', location: '차오양구 리앙마교', phone: '010-5927-7000', korean: true, rating: 4.7, hours: '24시간', isHot: true },
      { id: 3, name: '베이징 협화의원', dept: '전문진료 · 검진', location: '둥청구 솨이푸위안', phone: '010-6915-6114', korean: false, rating: 4.9, hours: '08:00 – 17:00', isHot: false },
    ],
    '상하이': [
      { id: 1, name: '상하이 화산병원 국제부', dept: '내과 · 신경과', location: '징안구 우루무치중로', phone: '021-5288-9999', korean: true, rating: 4.7, hours: '08:00 – 17:30', isHot: true },
      { id: 2, name: '상하이유나이티드가정병원', dept: '종합 · 소아 · 산부인과', location: '창닝구 진쭝로', phone: '021-2216-3900', korean: true, rating: 4.8, hours: '24시간', isHot: true },
      { id: 3, name: '루이진병원 국제부', dept: '내과 · 외과 · 정형외과', location: '황푸구 루이진 2로', phone: '021-6437-6761', korean: false, rating: 4.6, hours: '08:00 – 17:00', isHot: false },
    ],
    '광저우': [
      { id: 1, name: '중산대학부속병원', dept: '종합진료 · 암센터', location: '위에슈구 중산 2로', phone: '020-8733-3090', korean: false, rating: 4.8, hours: '08:00 – 17:00', isHot: true },
      { id: 2, name: '광저우 글로벌닥터 클리닉', dept: '내과 · 가정의학', location: '톈허구 주장신청', phone: '020-3825-6622', korean: true, rating: 4.6, hours: '09:00 – 18:00', isHot: false },
      { id: 3, name: '광저우 선프라이즈 병원', dept: '산부인과 · 소아과', location: '하이주구', phone: '020-8411-1111', korean: true, rating: 4.5, hours: '09:00 – 17:30', isHot: false },
    ],
    '선전': [
      { id: 1, name: '선전 인민병원 국제부', dept: '종합진료', location: '뤄후구 둥먼북로', phone: '0755-2553-3018', korean: false, rating: 4.7, hours: '08:00 – 17:00', isHot: true },
      { id: 2, name: '선전 베이커 국제클리닉', dept: '내과 · 검진 · 예방접종', location: '푸톈구 CBD', phone: '0755-8828-6677', korean: true, rating: 4.6, hours: '09:00 – 18:00', isHot: false },
      { id: 3, name: '홍콩대학교 선전병원', dept: '국제표준 종합진료', location: '푸톈구 하이웬로', phone: '0755-8600-0000', korean: false, rating: 4.9, hours: '08:00 – 17:30', isHot: false },
    ],
    '대련': [
      { id: 1, name: '대련의과대학부속 1병원', dept: '종합진료', location: '중산구 롄허로', phone: '0411-8369-1008', korean: false, rating: 4.6, hours: '08:00 – 17:00', isHot: true },
      { id: 2, name: '대련 한인 의원', dept: '내과 · 한국어 진료', location: '시강구 한인타운', phone: '0411-8271-5566', korean: true, rating: 4.7, hours: '09:00 – 18:00', isHot: true },
      { id: 3, name: '대련 센트럴 클리닉', dept: '검진 · 예방접종', location: '중산구 중앙광장', phone: '0411-8255-3344', korean: true, rating: 4.5, hours: '09:00 – 17:30', isHot: false },
    ],
  };

  const hospitals = cityData[userCity] ?? cityData['베이징'];

  const emergencyInfo = [
    { label: '응급구조', number: '120' },
    { label: '경찰', number: '110' },
    { label: '소방', number: '119' },
    { label: '한국 영사 콜센터', number: '010-8531-0700' },
  ];

  const WechatIcon = () => (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
    </svg>
  );

  return (
    <Card className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-900">병원 정보</span>
        <span className="text-xs text-gray-400">{userCity}</span>
      </div>

      {/* 탭 */}
      <div className="flex border-b mb-3">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex-1 pb-2 text-sm transition-colors ${activeTab === 'hospitals' ? 'border-b-2 border-gray-900 text-gray-900 font-medium' : 'text-gray-400'}`}
        >
          병원
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 pb-2 text-sm transition-colors ${activeTab === 'info' ? 'border-b-2 border-gray-900 text-gray-900 font-medium' : 'text-gray-400'}`}
        >
          긴급연락처
        </button>
      </div>

      {/* 병원 목록 */}
      {activeTab === 'hospitals' && (
        <div className="divide-y divide-gray-100">
          {hospitals.map(h => (
            <button
              key={h.id}
              className="w-full text-left py-3 hover:bg-gray-50 transition-colors px-1 -mx-1"
              onClick={() => setSelectedHospital(h)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{h.name}</span>
                    {h.korean && (
                      <span className="text-[10px] text-blue-500 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">한국어</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{h.dept}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {h.location}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-500">{h.rating}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 긴급 연락처 */}
      {activeTab === 'info' && (
        <div className="divide-y divide-gray-100">
          {emergencyInfo.map((e, i) => (
            <a
              key={i}
              href={`tel:${e.number}`}
              className="flex items-center justify-between py-3 px-1 -mx-1 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-600">{e.label}</span>
              <span className="text-sm font-semibold text-gray-900">{e.number}</span>
            </a>
          ))}
          <div className="pt-3 text-xs text-gray-400 space-y-1">
            <p>· 여권 사본 지참 권장</p>
            <p>· 국제부(国际部) 이용 시 한국어 가능</p>
          </div>
        </div>
      )}

      {/* 위챗 상담 */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#07c160] rounded-lg flex items-center justify-center">
              <WechatIcon />
            </div>
            <div>
              <div className="text-[11px] text-gray-400">병원 1:1 상담</div>
              <div className="text-sm font-semibold text-gray-900">matanboy</div>
            </div>
          </div>
          <button
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
            onClick={() => setShowContactModal(true)}
          >
            상담하기
          </button>
        </div>
      </div>

      {/* 병원 상세 모달 */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHospital(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-snug">{selectedHospital.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedHospital.dept}</p>
              </div>
              <button className="text-gray-300 hover:text-gray-500 ml-3" onClick={() => setSelectedHospital(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-gray-600">{selectedHospital.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-gray-600">{selectedHospital.hours}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                <a href={`tel:${selectedHospital.phone}`} className="text-gray-900 font-medium">{selectedHospital.phone}</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                <span className="text-gray-600">{selectedHospital.rating} / 5.0</span>
                {selectedHospital.korean && <span className="ml-auto text-[11px] text-blue-500 border border-blue-200 px-2 py-0.5 rounded">한국어 가능</span>}
              </div>
            </div>

            <a
              href={`tel:${selectedHospital.phone}`}
              className="block w-full text-center bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              전화하기
            </a>
          </div>
        </div>
      )}

      {/* 상담 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-semibold text-gray-900">위챗 상담</span>
              <button className="text-gray-300 hover:text-gray-500" onClick={() => setShowContactModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mb-5">
              <p className="text-xs text-gray-400 mb-1">위챗 ID</p>
              <p className="text-2xl font-bold text-gray-900">matanboy</p>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                onClick={() => setShowContactModal(false)}
              >
                닫기
              </button>
              <button
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-colors"
                onClick={() => { navigator.clipboard.writeText('matanboy'); alert('복사됐습니다.'); }}
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
