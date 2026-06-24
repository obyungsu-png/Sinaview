import { useState } from 'react';
import { Cross, Phone, MapPin, ExternalLink, X, Clock, Star } from 'lucide-react';
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
      { id: 1, name: '베이징 화신 국제의료센터', nameEn: 'Sino-Japanese Friendship Hospital', dept: '내과·외과·산부인과', location: '차오양구 영수로', phone: '010-8456-1234', korean: true, rating: 4.8, hours: '09:00~18:00', isHot: true },
      { id: 2, name: '베이징유나이티드가정병원', nameEn: 'Beijing United Family Hospital', dept: '종합진료·소아과', location: '차오양구 리앙마교', phone: '010-5927-7000', korean: true, rating: 4.7, hours: '24시간', isHot: true },
      { id: 3, name: '베이징 협화의원', nameEn: 'Peking Union Medical', dept: '전문진료·검진', location: '둥청구 솨이푸위안', phone: '010-6915-6114', korean: false, rating: 4.9, hours: '08:00~17:00', isHot: false },
    ],
    '상하이': [
      { id: 1, name: '상하이 화산병원 국제부', nameEn: 'Huashan Hospital International', dept: '내과·신경과', location: '징안구 우루무치중로', phone: '021-5288-9999', korean: true, rating: 4.7, hours: '08:00~17:30', isHot: true },
      { id: 2, name: '상하이유나이티드가정병원', nameEn: 'Shanghai United Family Hospital', dept: '종합·소아·산부인과', location: '창닝구 진쭝로', phone: '021-2216-3900', korean: true, rating: 4.8, hours: '24시간', isHot: true },
      { id: 3, name: '루이금병원 국제부', nameEn: "Ruijin Hospital Int'l", dept: '내과·외과·정형외과', location: '황푸구 루이진 2로', phone: '021-6437-6761', korean: false, rating: 4.6, hours: '08:00~17:00', isHot: false },
    ],
    '광저우': [
      { id: 1, name: '광저우 중산대학부속병원', nameEn: 'Sun Yat-sen University Hospital', dept: '종합진료·암센터', location: '위에슈구 중산 2로', phone: '020-8733-3090', korean: false, rating: 4.8, hours: '08:00~17:00', isHot: true },
      { id: 2, name: '광저우 글로벌닥터 클리닉', nameEn: 'Global Doctor Clinic', dept: '내과·가정의학', location: '톈허구 주장신청', phone: '020-3825-6622', korean: true, rating: 4.6, hours: '09:00~18:00', isHot: true },
      { id: 3, name: '광저우 선프라이즈 병원', nameEn: 'Sunrise Hospital Guangzhou', dept: '산부인과·소아과', location: '하이주구', phone: '020-8411-1111', korean: true, rating: 4.5, hours: '09:00~17:30', isHot: false },
    ],
    '선전': [
      { id: 1, name: '선전 인민병원 국제부', nameEn: "Shenzhen People's Hospital Int'l", dept: '종합진료', location: '뤄후구 둥먼북로', phone: '0755-2553-3018', korean: false, rating: 4.7, hours: '08:00~17:00', isHot: true },
      { id: 2, name: '선전 베이커 국제클리닉', nameEn: 'Baker McKenzie Clinic', dept: '내과·검진·예방접종', location: '푸톈구 CBD', phone: '0755-8828-6677', korean: true, rating: 4.6, hours: '09:00~18:00', isHot: false },
      { id: 3, name: '홍콩대학교 선전병원', nameEn: 'HKU-Shenzhen Hospital', dept: '국제표준 종합진료', location: '푸톈구 하이웬로', phone: '0755-8600-0000', korean: false, rating: 4.9, hours: '08:00~17:30', isHot: true },
    ],
    '대련': [
      { id: 1, name: '대련의과대학부속 1병원', nameEn: 'Dalian Medical University Hospital', dept: '종합진료', location: '중산구 롄허로', phone: '0411-8369-1008', korean: false, rating: 4.6, hours: '08:00~17:00', isHot: true },
      { id: 2, name: '대련 한인 의원', nameEn: 'Dalian Korean Clinic', dept: '내과·한국어 진료', location: '시강구 한인타운', phone: '0411-8271-5566', korean: true, rating: 4.7, hours: '09:00~18:00', isHot: true },
      { id: 3, name: '대련 센트럴 클리닉', nameEn: 'Dalian Central Clinic', dept: '검진·예방접종', location: '중산구 중앙광장', phone: '0411-8255-3344', korean: true, rating: 4.5, hours: '09:00~17:30', isHot: false },
    ],
  };

  const hospitals = cityData[userCity] ?? cityData['베이징'];

  const emergencyInfo = [
    { label: '중국 응급', number: '120', desc: '응급구조대 (24시간)' },
    { label: '경찰', number: '110', desc: '긴급 신고' },
    { label: '화재', number: '119', desc: '소방서' },
    { label: '한국 대사관', number: '010-8531-0700', desc: '영사 콜센터 (베이징)' },
  ];

  const WechatIcon = () => (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
    </svg>
  );

  return (
    <Card className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Cross className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold">병원 정보</h2>
        </div>
        <span className="text-xs text-gray-400">{userCity}</span>
      </div>

      {/* 탭 */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`flex-1 pb-2 text-sm transition-colors ${activeTab === 'hospitals' ? 'border-b-2 border-red-500 text-red-500 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          병원 목록
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 pb-2 text-sm transition-colors ${activeTab === 'info' ? 'border-b-2 border-red-500 text-red-500 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
        >
          긴급 연락처
        </button>
      </div>

      {/* 병원 목록 탭 */}
      {activeTab === 'hospitals' && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          {hospitals.map(h => (
            <div
              key={h.id}
              className="bg-white p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedHospital(h)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">{h.name}</span>
                    {h.isHot && <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded font-bold">HOT</span>}
                    {h.korean && <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded font-bold">한국어</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{h.dept}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{h.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">{h.rating}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-400">항목을 클릭하면 상세 정보를 볼 수 있어요</span>
          </div>
        </div>
      )}

      {/* 긴급 연락처 탭 */}
      {activeTab === 'info' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3">🚨 중국 내 긴급 상황 시 바로 전화하세요</p>
          {emergencyInfo.map((e, i) => (
            <div key={i} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg p-3">
              <div>
                <div className="text-xs font-semibold text-gray-700">{e.label}</div>
                <div className="text-xs text-gray-500">{e.desc}</div>
              </div>
              <a href={`tel:${e.number}`} className="text-lg font-black text-red-600 hover:text-red-800 transition-colors">
                {e.number}
              </a>
            </div>
          ))}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">💡 중국 병원 이용 팁</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 여권 및 비자 사본 항상 지참</li>
              <li>• 여행자 보험 가입 권장</li>
              <li>• 국제부(国际部) 이용 시 한국어 가능</li>
              <li>• 위챗페이/알리페이 결제 준비</li>
            </ul>
          </div>
        </div>
      )}

      {/* 병원 상세 모달 */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHospital(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="font-black text-2xl text-gray-900 leading-tight mb-1">{selectedHospital.name}</h3>
                <p className="text-xs text-gray-500">{selectedHospital.nameEn}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 ml-2" onClick={() => setSelectedHospital(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 뱃지 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedHospital.isHot && <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-bold">🔥 HOT</span>}
              {selectedHospital.korean && <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full font-bold">🇰🇷 한국어</span>}
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{selectedHospital.dept}</span>
            </div>

            {/* 정보 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-gray-700">{selectedHospital.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-sm text-gray-700">{selectedHospital.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500 shrink-0" />
                <a href={`tel:${selectedHospital.phone}`} className="text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors">{selectedHospital.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />
                <span className="text-sm text-gray-700"><strong className="text-lg">{selectedHospital.rating}</strong> / 5.0</span>
              </div>
            </div>

            {/* 버튼 */}
            <a
              href={`tel:${selectedHospital.phone}`}
              className="block w-full bg-red-500 hover:bg-red-600 text-white text-center py-3 rounded-full font-bold text-sm transition-colors"
            >
              📞 전화하기
            </a>
          </div>
        </div>
      )}

      {/* 위챗 1:1 상담 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="bg-white/90 p-3 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#07c160] rounded-xl flex items-center justify-center shadow-md shadow-green-400/40">
              <WechatIcon />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 font-semibold">병원 1:1 상담</div>
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
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#07c160] rounded-xl flex items-center justify-center">
                  <WechatIcon />
                </div>
                <h3 className="text-xl font-black text-gray-900">병원 상담</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowContactModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 rounded-xl border border-green-200 text-center mb-6">
              <p className="text-xs text-gray-600 mb-1">위챗 ID</p>
              <p className="text-2xl font-black text-gray-900">matanboy</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                📱 위챗에서 <span className="font-bold text-[#07c160]">matanboy</span>를 검색하거나<br />QR 코드를 스캔해 1:1 상담을 시작하세요!
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors" onClick={() => setShowContactModal(false)}>닫기</button>
              <button className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-[#07c160] transition-all shadow-lg" onClick={() => { navigator.clipboard.writeText('matanboy'); alert('위챗 ID가 복사되었습니다!'); }}>ID 복사</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
