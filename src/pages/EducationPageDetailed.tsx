import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, GraduationCap, BookOpen, Award, Users, FileText, Calendar, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CommentSection } from '../components/CommentSection';

interface EducationPageProps {
  onBack: () => void;
  selectedArticle?: any;
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export function EducationPage({ onBack, selectedArticle, currentUser, isAdmin }: EducationPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

  const categories = ['전체', '대학정보', '어학연수', '장학금', '취업정보', '온라인교육', 'HSK시험', '기타'];

  const educationItems = [
    {
      id: 1,
      title: "2024년 HSK 시험 일정 발표, 온라인 시험 확대",
      description: "중국어능력시험 HSK의 2024년 시험 일정이 발표되었으며, 온라인 시험 응시 지역이 대폭 확대되었습니다. 새로운 시험 형태와 준비 방법을 안내드립니다.",
      category: "HSK시험",
      source: "중국어교육협회",
      time: "1시간 전",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      likes: 234,
      views: 3450,
      isPopular: true,
      tags: ["HSK", "중국어시험", "온라인시험", "자격증"]
    },
    {
      id: 2,
      title: "중국 명문대 입학 가이드 2024년 최신판",
      description: "베이징대, 칭화대를 비롯한 중국 명문 대학교 입학 절차와 준비 사항을 상세히 안내합니다.",
      category: "대학정보",
      source: "중국교육부",
      time: "3시간 전",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop",
      likes: 456,
      views: 7820,
      isPopular: true,
      tags: ["명문대", "입학", "베이징대", "칭화대"]
    },
    {
      id: 3,
      title: "중국 정부 장학금 신청 방법 및 선발 기준",
      description: "중국 정부에서 제공하는 각종 장학금 프로그램의 신청 방법과 선발 기준을 자세히 소개합니다.",
      category: "장학금",
      source: "장학재단",
      time: "5시간 전",
      image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&h=250&fit=crop",
      likes: 189,
      views: 4560,
      isPopular: false,
      tags: ["장학금", "정부지원", "유학지원"]
    }
  ];

  const filteredItems = educationItems.filter(item => {
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 상세 페이지 렌더링
  if (selectedItem) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                onClick={handleBackToList}
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로</span>
              </Button>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <BookOpen className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded">
                    {selectedItem.category}
                  </span>
                  {selectedItem.isPopular && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 text-sm font-bold rounded">인기</span>
                  )}
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {selectedItem.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <span>{selectedItem.source}</span>
                  <span>{selectedItem.time}</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Filter className="w-4 h-4" />
                    <span>조회수 {selectedItem.views?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>좋아요 {selectedItem.likes?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Article Image */}
              <div className="mb-8">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg"
                />
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className="text-lg text-gray-800 font-medium mb-6">
                    {selectedItem.description}
                  </p>
                  
                  <div className="bg-green-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-green-900 mb-3">핵심 정보</h3>
                    <ul className="space-y-2 text-green-800">
                      <li>• 최신 교육 정책과 변화 사항을 반영한 정보입니다</li>
                      <li>• 실제 경험자들의 후기와 조언을 포함하고 있습니다</li>
                      <li>• 단계별 준비 방법과 일정을 제공합니다</li>
                      <li>• 관련 기관의 공식 정보를 바탕으로 작성되었습니다</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">준비 과정</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-gray-900">정보 수집 및 계획 수립</h4>
                        <p className="text-gray-600">목표에 맞는 정보를 수집하고 구체적인 계획을 세웁니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-gray-900">필요 조건 확인</h4>
                        <p className="text-gray-600">지원 자격과 필요한 서류를 확인하고 준비합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-gray-900">신청 및 접수</h4>
                        <p className="text-gray-600">온라인 또는 방문을 통해 신청서를 제출합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium text-gray-900">결과 확인 및 후속 조치</h4>
                        <p className="text-gray-600">결과를 확인하고 필요한 후속 절차를 진행합니다.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg mt-8">
                    <h3 className="font-semibold text-blue-900 mb-3">추가 정보</h3>
                    <ul className="space-y-2 text-blue-800">
                      <li>• 관련 기관의 공식 웹사이트를 정기적으로 확인하세요</li>
                      <li>• 경험자들의 커뮤니티나 포럼을 활용해보세요</li>
                      <li>• 정책 변화에 따른 업데이트 정보를 놓치지 마세요</li>
                      <li>• 전문 상담사의 도움을 받는 것도 좋은 방법입니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags?.map((tag: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-700 px-3 py-1 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment Section */}
              <div className="mt-8">
                <CommentSection
                  pageType="education"
                  itemId={selectedItem.id}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Related Articles */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">관련 교육 정보</h3>
                    <div className="space-y-4">
                      {educationItems.filter(item => item.id !== selectedItem.id && item.category === selectedItem.category).slice(0, 3).map((item) => (
                        <div key={item.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => handleViewDetails(item)}>
                          <div className="flex space-x-3">
                            <img src={item.image} alt={item.title} className="w-16 h-12 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">교육 서비스</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        대학 검색
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        온라인 강의
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Award className="w-4 h-4 mr-2" />
                        장학금 정보
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Contact Info */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">문의하기</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">교육 상담</p>
                        <p className="text-gray-600">+86-10-1234-5678</p>
                      </div>
                      <div>
                        <p className="font-medium">이메일</p>
                        <p className="text-gray-600">edu@chinaup.com</p>
                      </div>
                      <div>
                        <p className="font-medium">상담시간</p>
                        <p className="text-gray-600">평일 09:00-18:00</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">교육</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="교육 정보 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Access — 원형 아이콘 */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-4">빠른 서비스</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>
            {[
              { icon: <GraduationCap className="w-5 h-5" />, label: '대학 검색', service: '대학검색' },
              { icon: <BookOpen className="w-5 h-5" />, label: '온라인 강의', service: '온라인강의' },
              { icon: <Award className="w-5 h-5" />, label: '장학금 정보', service: '장학금' },
              { icon: <Users className="w-5 h-5" />, label: '취업 정보', service: '취업정보' },
              { icon: <FileText className="w-5 h-5" />, label: '입학 서류', service: '입학서류' },
              { icon: <Calendar className="w-5 h-5" />, label: '입시 일정', service: '입시일정' },
              { icon: <MessageCircle className="w-5 h-5" />, label: '교육 상담', service: '교육상담' },
            ].map(item => (
              <button key={item.service} className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 bg-white group-hover:border-teal-400 group-hover:text-teal-600 group-hover:bg-teal-50 transition-all">
                  {item.icon}
                </div>
                <p className="text-xs text-gray-700 whitespace-nowrap">{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">카테고리</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
              >{category}</Button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-500">총 {filteredItems.length}개 항목</div>
        </div>

        {/* Education Items List — compact */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-3 p-3">
                <img src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 text-[10px] font-medium rounded">{item.category}</span>
                    {item.isPopular && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 text-[10px] font-bold rounded">인기</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">{item.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{item.source}</span><span>·</span><span>{item.time}</span><span>· 조회 {item.views.toLocaleString()}</span>
                    </div>
                    <Button size="sm" className="h-6 text-[10px] px-2 bg-green-600 hover:bg-green-700" onClick={() => handleViewDetails(item)}>자세히 보기</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredItems.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">검색 결과가 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}