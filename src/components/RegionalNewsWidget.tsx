import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';

interface RegionalNewsWidgetProps {
  onMoreClick?: () => void;
}

export function RegionalNewsWidget({ onMoreClick }: RegionalNewsWidgetProps) {
  const [activeRegion, setActiveRegion] = useState('대련');
  const [userRegion, setUserRegion] = useState('');

  // 사용자 지역 가져오기
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.region) {
        setUserRegion(userData.region);
        setActiveRegion(userData.region);
      }
    }
  }, []);

  const regions = [
    { id: 'dalian', name: '대련', count: 450 },
    { id: 'beijing', name: '북경', count: 850 },
    { id: 'shanghai', name: '상해', count: 920 },
    { id: 'suzhou', name: '소주', count: 580 },
    { id: 'wuxi', name: '무석', count: 420 },
    { id: 'nanjing', name: '난징', count: 560 },
    { id: 'hangzhou', name: '항저우', count: 640 },
    { id: 'tianjin', name: '천진', count: 780 },
    { id: 'shenzhen', name: '심천', count: 720 },
    { id: 'shenyang', name: '심양', count: 340 },
    { id: 'yanji', name: '연길', count: 290 },
    { id: 'xian', name: '시안', count: 280 },
    { id: 'wuhan', name: '우한', count: 310 },
    { id: 'chengdu', name: '청두', count: 380 },
    { id: 'guangzhou', name: '광저우', count: 650 },
    { id: 'yantai', name: '연태', count: 220 },
    { id: 'weihai', name: '위해', count: 180 },
    { id: 'qingdao', name: '청도', count: 520 }
  ];

  // 사용자 지역을 맨 앞으로 정렬
  const sortedRegions = React.useMemo(() => {
    if (!userRegion) return regions;
    
    const userRegionObj = regions.find(r => r.name === userRegion);
    if (!userRegionObj) return regions;
    
    const otherRegions = regions.filter(r => r.name !== userRegion);
    return [userRegionObj, ...otherRegions];
  }, [userRegion]);

  // 지역별 소식 데이터
  const regionalNews: Record<string, any[]> = {
    '대련': [
      { id: 1, title: "대련시 한인회, 명절 맞이 전통시장 운영", date: "12-16", category: "행사", views: 1847 },
      { id: 2, title: "개발구 한인마트 '코리아타운' 오늘 오픈", date: "12-15", category: "생활", views: 2341 },
      { id: 3, title: "대련한국학교 2025학년도 신입생 모집", date: "12-15", category: "교육", views: 923 },
      { id: 4, title: "한인 법률상담소 무료 상담 시작...비자·노무 중점", date: "12-14", category: "서비스", views: 1156 },
      { id: 5, title: "대련 한국문화원 K-POP 댄스교실 인기", date: "12-13", category: "문화", views: 634 }
    ],
    '북경': [
      { id: 1, title: "조양구 한국타운, 연말 특별 할인행사 진행", date: "12-16", category: "생활", views: 3127 },
      { id: 2, title: "한인회 골프동호회 신규회원 30명 모집", date: "12-16", category: "모임", views: 891 },
      { id: 3, title: "베이징한국국제학교 입학설명회 19일 개최", date: "12-14", category: "교육", views: 2456 },
      { id: 4, title: "북경 한인사회 송년의 밤 행사 준비 한창", date: "12-13", category: "행사", views: 1789 },
      { id: 5, title: "한국계 IT기업 채용박람회...20개사 참가", date: "12-12", category: "경제", views: 1523 }
    ],
    '상해': [
      { id: 1, title: "푸동신구 한인타운 대형 리모델링 완료", date: "12-16", category: "생활", views: 2934 },
      { id: 2, title: "상해한인회 '찾아가는 법률상담' 시작", date: "12-15", category: "서비스", views: 1267 },
      { id: 3, title: "상해한국학교, 학부모 대상 오픈캠퍼스", date: "12-15", category: "교육", views: 1678 },
      { id: 4, title: "한인 테니스클럽 주말리그 개막", date: "12-14", category: "모임", views: 743 },
      { id: 5, title: "상해국제영화제 한국영화 특별전", date: "12-12", category: "문화", views: 2089 }
    ],
    '심양': [
      { id: 1, title: "한인 FC심양 시민리그 3연패 달성", date: "12-16", category: "스포츠", views: 1423 },
      { id: 2, title: "심양시, 한국기업 투자유치 설명회 개최", date: "12-15", category: "경제", views: 967 },
      { id: 3, title: "심양한글학교 겨울특강 수강생 모집중", date: "12-14", category: "교육", views: 512 },
      { id: 4, title: "한인회 연말 자선행사 모금액 10만위안 돌파", date: "12-13", category: "행사", views: 834 },
      { id: 5, title: "코리안타운 먹자골목 새단장", date: "12-11", category: "생활", views: 1891 }
    ],
    '시안': [
      { id: 1, title: "시안 한인회 송년회 23일 개최 예정", date: "12-15", category: "행사", views: 678 },
      { id: 2, title: "한국음식점 거리 조성사업 본격화", date: "12-14", category: "생활", views: 1234 },
      { id: 3, title: "한국어말하기대회 참가자 50명 돌파", date: "12-13", category: "교육", views: 445 },
      { id: 4, title: "등산동호회 신년 산행 참가자 모집", date: "12-13", category: "모임", views: 289 },
      { id: 5, title: "한국문화체험관 방문객 1만명 돌파", date: "12-10", category: "문화", views: 723 }
    ],
    '소주': [
      { id: 1, title: "소주 한인회 신년 하례식 내달 6일 개최", date: "12-17", category: "행사", views: 1234 },
      { id: 2, title: "소주공단 한국기업 채용박람회 성황", date: "12-16", category: "경제", views: 1567 },
      { id: 3, title: "소주한국학교 2025학년도 신입생 모집", date: "12-15", category: "교육", views: 892 },
      { id: 4, title: "한인 테니스동호회 월례전 개최", date: "12-14", category: "스포츠", views: 645 },
      { id: 5, title: "한국문화원 K-드라마 페스티벌 개막", date: "12-13", category: "문화", views: 1123 }
    ],
    '무석': [
      { id: 1, title: "무석 한인타운 먹자골목 리뉴얼 오픈", date: "12-17", category: "생활", views: 987 },
      { id: 2, title: "한인회 송년의 밤 행사 참가 신청 시작", date: "12-16", category: "행사", views: 756 },
      { id: 3, title: "무석한국어학원 신규 과정 개설 안내", date: "12-15", category: "교육", views: 534 },
      { id: 4, title: "한국기업 투자설명회 현지 기업 관심", date: "12-14", category: "경제", views: 1089 },
      { id: 5, title: "골프동호회 정기모임 회원 모집중", date: "12-13", category: "모임", views: 423 }
    ],
    '난징': [
      { id: 1, title: "난징 한인회 송년회 준비위원회 구성", date: "12-17", category: "행사", views: 1345 },
      { id: 2, title: "한국국제학교 입학설명회 참석자 150명", date: "12-16", category: "교육", views: 1678 },
      { id: 3, title: "한인 바둑동호회 연말 토너먼트 개최", date: "12-15", category: "모임", views: 567 },
      { id: 4, title: "한국음식점 특화거리 조성 본격 추진", date: "12-14", category: "생활", views: 1234 },
      { id: 5, title: "IT한인회 테크 세미나 성황리 개최", date: "12-13", category: "경제", views: 892 }
    ],
    '항저우': [
      { id: 1, title: "항저우 한인회 신년 하례식 내달 8일", date: "12-17", category: "행사", views: 1456 },
      { id: 2, title: "한국IT기업 채용설명회 참가자 200명", date: "12-16", category: "경제", views: 1789 },
      { id: 3, title: "항저우한국학교 오픈캠퍼스 성황", date: "12-15", category: "교육", views: 1123 },
      { id: 4, title: "한인 마라톤동호회 신년 마라톤 준비", date: "12-14", category: "스포츠", views: 678 },
      { id: 5, title: "한국영화제 개막...15편 상영 예정", date: "12-13", category: "문화", views: 1345 }
    ],
    '천진': [
      { id: 1, title: "천진 한인회 송년회 다음주 개최", date: "12-17", category: "행사", views: 1567 },
      { id: 2, title: "한국타운 특화거리 조성사업 완료", date: "12-16", category: "생활", views: 1892 },
      { id: 3, title: "천진한국학교 2025 신입생 모집 시작", date: "12-15", category: "교육", views: 1234 },
      { id: 4, title: "한국기업 채용박람회 25개사 참가", date: "12-14", category: "경제", views: 1456 },
      { id: 5, title: "한인 골프대회 참가자 80명 돌파", date: "12-13", category: "스포츠", views: 789 }
    ],
    '연길': [
      { id: 1, title: "연길 한인회 설맞이 준비 본격화", date: "12-17", category: "행사", views: 1123 },
      { id: 2, title: "한국어교육원 겨울특강 수강생 모집", date: "12-16", category: "교육", views: 856 },
      { id: 3, title: "한인 기업인협회 신년 간담회 개최", date: "12-15", category: "경제", views: 645 },
      { id: 4, title: "연길 김치축제 방문객 2만명 돌파", date: "12-14", category: "문화", views: 1567 },
      { id: 5, title: "한인 축구리그 챔피언 결정전 주말 개최", date: "12-13", category: "스포츠", views: 934 }
    ],
    '연변': [
      { id: 1, title: "연변 김치명인 경연대회 성황리 마무리", date: "12-16", category: "문화", views: 2145 },
      { id: 2, title: "한국어교육센터 야간반 신규 개설", date: "12-15", category: "교육", views: 856 },
      { id: 3, title: "한인 기업인협회 정기총회 및 송년회", date: "12-14", category: "경제", views: 534 },
      { id: 4, title: "연변 한인 축구대회 16개팀 참가", date: "12-13", category: "스포츠", views: 1067 },
      { id: 5, title: "전통음식 페스티벌 방문객 3만명", date: "12-11", category: "행사", views: 1789 }
    ],
    '연태': [
      { id: 1, title: "한인회 사랑의 바자회...수익금 전액 기부", date: "12-16", category: "행사", views: 623 },
      { id: 2, title: "연태시 한국투자기업간담회 성료", date: "12-15", category: "경제", views: 891 },
      { id: 3, title: "연태한국학교 전학생 수시모집", date: "12-14", category: "교육", views: 456 },
      { id: 4, title: "한인 골프동호회 정기모임 회원 모집중", date: "12-13", category: "모임", views: 378 },
      { id: 5, title: "한국문화원 겨울학기 수강 신청 시작", date: "12-12", category: "문화", views: 512 }
    ],
    '위해': [
      { id: 1, title: "등산동호회 신년 해돋이 산행 계획", date: "12-15", category: "모임", views: 534 },
      { id: 2, title: "한국문화체험관 리뉴얼...체험 프로그램 확대", date: "12-15", category: "문화", views: 789 },
      { id: 3, title: "위해한국어학원 신입생 등록 마감 임박", date: "12-14", category: "교육", views: 423 },
      { id: 4, title: "한인회 신년 하례식 내년 1월 5일 개최", date: "12-13", category: "행사", views: 667 },
      { id: 5, title: "한국기업 채용설명회 참가자 200명 돌파", date: "12-11", category: "경제", views: 1045 }
    ],
    '광저우': [
      { id: 1, title: "광저우 한인타운 K-뷰티 특화거리 조성", date: "12-17", category: "생활", views: 2134 },
      { id: 2, title: "한인회 춘절맞이 대청소 봉사활동 참가자 모집", date: "12-16", category: "행사", views: 876 },
      { id: 3, title: "광저우한국학교 2025 신입생 입학설명회", date: "12-15", category: "교육", views: 1245 },
      { id: 4, title: "한국기업 채용박람회 3개 구역서 동시 개최", date: "12-14", category: "경제", views: 1678 },
      { id: 5, title: "광저우 K-POP 댄스대회 참가팀 30팀 돌파", date: "12-13", category: "문화", views: 945 }
    ],
    '심천': [
      { id: 1, title: "심천 IT한인회 스타트업 네트워킹 데이", date: "12-17", category: "경제", views: 1892 },
      { id: 2, title: "한인 테크 커뮤니티 5G·AI 세미나 개최", date: "12-16", category: "교육", views: 1456 },
      { id: 3, title: "심천한국국제학교 신규 교사 채용 공고", date: "12-15", category: "교육", views: 734 },
      { id: 4, title: "한식당 '서울의 맛' 난산구 지점 오픈", date: "12-14", category: "생활", views: 1123 },
      { id: 5, title: "한인회 송년회 겸 신년맞이 행사 안내", date: "12-13", category: "행사", views: 1089 }
    ],
    '우한': [
      { id: 1, title: "우한 한인회 신년회 준비위원회 발족", date: "12-16", category: "행사", views: 923 },
      { id: 2, title: "한국식당협회 창립...25개 업체 참여", date: "12-15", category: "생활", views: 1234 },
      { id: 3, title: "한국교육원 무료 한국어강좌 수강생 모집", date: "12-14", category: "교육", views: 678 },
      { id: 4, title: "테니스동호회 정기전 개최...10개팀 참가", date: "12-13", category: "모임", views: 445 },
      { id: 5, title: "우한 한국문화제 방문객 5천명 돌파", date: "12-11", category: "문화", views: 1567 }
    ],
    '청도': [
      { id: 1, title: "제3회 한인 골프대회 성황...70명 참가", date: "12-16", category: "스포츠", views: 1456 },
      { id: 2, title: "청도시 '한국문화거리' 조성 본격 추진", date: "12-15", category: "문화", views: 1823 },
      { id: 3, title: "청도한국학교 입학설명회 참석자 120명", date: "12-14", category: "교육", views: 934 },
      { id: 4, title: "한인회 연말 송년회 다음주 개최", date: "12-13", category: "행사", views: 756 },
      { id: 5, title: "한국 중소기업 투자설명회 관심 집중", date: "12-12", category: "경제", views: 1189 }
    ],
    '청두': [
      { id: 1, title: "청두 한인회 신년 하례식 참가 신청 시작", date: "12-16", category: "행사", views: 867 },
      { id: 2, title: "한국기업 채용박람회...20개사 100명 채용", date: "12-15", category: "경제", views: 1534 },
      { id: 3, title: "청두한국어학원 신규 과정 개설 안내", date: "12-14", category: "교육", views: 623 },
      { id: 4, title: "골프동호회 정기모임 참가자 모집", date: "12-13", category: "모임", views: 489 },
      { id: 5, title: "한국영화제 개막...일주일간 10편 상영", date: "12-12", category: "문화", views: 1278 }
    ]
  };

  const currentNews = regionalNews[activeRegion] || regionalNews['대련'];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">📰 지역 소식</h2>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">HOT</span>
          </div>
        </div>
        
        {/* 지역 선택 탭 */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">지역 선택</div>
          <div className="flex flex-wrap gap-1.5">
            {sortedRegions.map((region) => (
              <button
                key={region.id}
                onClick={() => setActiveRegion(region.name)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  activeRegion === region.name
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 지역 소식 목록 */}
      <div className="space-y-3">
        {currentNews.map((news) => (
          <div key={news.id} className="group cursor-pointer hover:bg-gray-50 p-2.5 rounded-lg transition-colors border-b border-gray-100 last:border-b-0">
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                    news.category === '행사' ? 'bg-orange-100 text-orange-700' :
                    news.category === '생활' ? 'bg-blue-100 text-blue-700' :
                    news.category === '교육' ? 'bg-blue-100 text-blue-700' :
                    news.category === '문화' ? 'bg-orange-100 text-orange-700' :
                    news.category === '스포츠' ? 'bg-orange-100 text-orange-700' :
                    news.category === '경제' ? 'bg-gray-100 text-gray-700' :
                    news.category === '모임' ? 'bg-gray-100 text-gray-700' :
                    news.category === '서비스' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {news.category}
                  </span>
                </div>
                <h4 className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 font-medium mb-1.5">
                  {news.title}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{news.date}</span>
                  <span>👁️ {news.views.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button 
          onClick={onMoreClick}
          className="w-full text-sm text-gray-500 hover:text-gray-700 text-center transition-colors"
        >
          더 많은 소식 보기 &gt;
        </button>
      </div>
    </Card>
  );
}