import React, { useState } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, FileText, Award } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface TOPIKPageProps {
  onBack: () => void;
}

export function TOPIKPage({ onBack }: TOPIKPageProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'universities' | 'preparation'>('info');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">TOPIK (한국어능력시험)</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              TOPIK 소개
            </button>
            <button
              onClick={() => setActiveTab('universities')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'universities'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              대학 정보
            </button>
            <button
              onClick={() => setActiveTab('preparation')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'preparation'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              시험 준비
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="text-center">
                <GraduationCap className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  한국 유학의 첫걸음, TOPIK
                </h2>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  한국어능력시험(TOPIK)은 한국어를 모국어로 하지 않는 외국인 및 재외동포를 대상으로
                  한국어 사용 능력을 측정·평가하는 시험입니다.
                </p>
              </div>
            </Card>

            {/* Level Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">등급 안내</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TOPIK I */}
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">TOPIK I (초급)</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-900">1급</span>
                        <span className="text-sm text-blue-700">80점 이상</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        자기소개, 물건 사기, 음식 주문 등 생활에 필요한 기초적인 언어 기능을 수행할 수 있다.
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-900">2급</span>
                        <span className="text-sm text-blue-700">140점 이상</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        전화하기, 부탁하기 등의 일상생활에 필요한 기능과 우체국, 은행 등의 공공시설 이용에 필요한 기능을 수행할 수 있다.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* TOPIK II */}
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">TOPIK II (중·고급)</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-900">3급</span>
                        <span className="text-sm text-green-700">120점 이상</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        일상생활을 영위하는 데 별 어려움을 느끼지 않으며, 다양한 공공시설의 이용과 사회적 관계 유지에 필요한 기초적 언어 기능을 수행할 수 있다.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-900">4급</span>
                        <span className="text-sm text-green-700">150점 이상</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        공공시설 이용과 사회적 관계 유지에 필요한 언어 기능을 수행할 수 있으며, 일반적인 업무 수행에 필요한 기능을 어느 정도 수행할 수 있다.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-900">5급</span>
                        <span className="text-sm text-green-700">190점 이상</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        전문 분야에서의 연구나 업무 수행에 필요한 언어 기능을 어느 정도 수행할 수 있다.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-900">6급</span>
                        <span className="text-sm text-green-700">230점 이상</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        전문 분야에서의 연구나 업무 수행에 필요한 언어 기능을 비교적 정확하고 유창하게 수행할 수 있다.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Test Information */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">시험 안내</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">시험 구성</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>TOPIK I:</strong> 듣기(40문항, 40분), 읽기(40문항, 60분)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>TOPIK II:</strong> 듣기(50문항, 60분), 쓰기(4문항, 50분), 읽기(50문항, 70분)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">시험 일정</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>연 6회 실시 (한국: 1, 4, 5, 7, 10, 11월)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>중국: 연 4-6회 (지역별 상이)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>응시료: 약 40,000원 ~ 70,000원 (국가별 상이)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Application Process */}
            <Card className="p-6 bg-blue-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">접수 방법</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-blue-600">1</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">회원가입</h4>
                    <p className="text-sm text-gray-600">TOPIK 공식 사이트 회원가입</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-blue-600">2</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">시험 선택</h4>
                    <p className="text-sm text-gray-600">TOPIK I 또는 TOPIK II 선택</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-blue-600">3</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">응시료 결제</h4>
                    <p className="text-sm text-gray-600">온라인 결제 진행</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold text-blue-600">4</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">수험표 출력</h4>
                    <p className="text-sm text-gray-600">시험 일주일 전 출력 가능</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'universities' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">한국 주요 대학 정보</h2>
            <p className="text-gray-600 mb-8">
              중국인 유학생들이 많이 지원하는 한국의 주요 대학교 정보입니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: '서울대학교',
                  location: '서울 관악구',
                  topik: 'TOPIK 4급 이상',
                  tuition: '약 400만원/학기',
                  features: ['QS 세계대학 순위 41위', '국내 1위 명문대', '다양한 장학금 제도']
                },
                {
                  name: '연세대학교',
                  location: '서울 서대문구',
                  topik: 'TOPIK 3급 이상',
                  tuition: '약 450만원/학기',
                  features: ['국내 3위 사립대', '활발한 국제교류', '우수한 한국어 프로그램']
                },
                {
                  name: '고려대학교',
                  location: '서울 성북구',
                  topik: 'TOPIK 3급 이상',
                  tuition: '약 450만원/학기',
                  features: ['국내 3위 사립대', '우수한 경영학과', '글로벌 네트워크']
                },
                {
                  name: '성균관대학교',
                  location: '서울/수원',
                  topik: 'TOPIK 3급 이상',
                  tuition: '약 430만원/학기',
                  features: ['삼성그룹 지원', '우수한 공학계열', '역사와 전통']
                },
                {
                  name: '한양대학교',
                  location: '서울 성동구',
                  topik: 'TOPIK 3급 이상',
                  tuition: '약 420만원/학기',
                  features: ['실용학문 강조', '우수한 공과대학', '산학협력 활발']
                },
                {
                  name: '경희대학교',
                  location: '서울 동대문구',
                  topik: 'TOPIK 3급 이상',
                  tuition: '약 400만원/학기',
                  features: ['외국인 학생 다수', '호텔관광학 유명', '아름다운 캠퍼스']
                }
              ].map((university, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{university.name}</h3>
                    <p className="text-sm text-gray-600">{university.location}</p>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <span className="text-green-600 font-semibold mr-2">📚</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <strong>요구 등급:</strong> {university.topik}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 font-semibold mr-2">💰</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          <strong>등록금:</strong> {university.tuition}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-600 font-semibold mb-2">주요 특징</p>
                    <ul className="space-y-1">
                      {university.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <span className="text-green-500 mr-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                    상세 정보 보기
                  </Button>
                </Card>
              ))}
            </div>

            {/* AD Banner */}
            <Card className="p-8 bg-gradient-to-r from-purple-100 to-pink-100 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">대학 입학 상담</h3>
              <p className="text-gray-700 mb-4">
                전문 컨설턴트가 맞춤형 유학 설계를 도와드립니다
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                무료 상담 신청
              </Button>
            </Card>
          </div>
        )}

        {activeTab === 'preparation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">TOPIK 준비 가이드</h2>
            
            {/* Study Tips */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">학습 전략</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-center">듣기 영역</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>매일 한국 드라마/뉴스 시청</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>기출문제 반복 청취</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>받아쓰기 연습</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-center">읽기 영역</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>한국 신문 기사 읽기</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>문법 패턴 암기</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>어휘력 확장</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-center">쓰기 영역</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>모범 답안 암기 및 활용</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>매일 글쓰기 연습</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>시간 배분 연습</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Recommended Resources */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">추천 학습 자료</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'TOPIK 공식 기출문제집', type: '교재', price: '₩20,000' },
                  { title: '고려대 한국어 시리즈', type: '교재', price: '₩25,000' },
                  { title: '연세 한국어 시리즈', type: '교재', price: '₩25,000' },
                  { title: 'TOPIK 한국어 능력시험 완벽대비', type: '교재', price: '₩22,000' },
                  { title: 'Talk To Me In Korean', type: '웹사이트', price: '무료' },
                  { title: 'KBS World', type: '앱', price: '무료' }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{resource.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Schedule */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">3개월 학습 플랜</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">1개월차 - 기초 다지기</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 기본 문법 및 어휘 학습 (하루 2시간)</li>
                    <li>• 듣기 연습 시작 (하루 30분)</li>
                    <li>• 읽기 짧은 문장 연습 (하루 30분)</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">2개월차 - 실력 향상</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 중급 문법 학습 (하루 1.5시간)</li>
                    <li>• 듣기 기출문제 풀이 (하루 1시간)</li>
                    <li>• 읽기 긴 문장 연습 (하루 1시간)</li>
                    <li>• 쓰기 연습 시작 (하루 30분)</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">3개월차 - 실전 대비</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 모의고사 풀이 (주 3회)</li>
                    <li>• 약점 보완 집중 학습 (하루 2시간)</li>
                    <li>• 쓰기 모범답안 암기 (하루 1시간)</li>
                    <li>• 실전 시간 배분 연습</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
