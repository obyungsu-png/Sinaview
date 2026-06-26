import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, FileText, Calendar, Download, ExternalLink, Briefcase, Building, BookOpen, PieChart, LayoutList, Database, MessageCircle, ClipboardList, CalendarDays, Settings2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CommentSection } from '../components/CommentSection';

interface VisaDocumentPageProps {
  onBack: () => void;
  selectedArticle?: any;
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export function VisaDocumentPage({ onBack, selectedArticle, currentUser, isAdmin }: VisaDocumentPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  useEffect(() => {
    if (selectedArticle) {
      // VisaDocumentSection에서 온 기사 데이터를 VisaDocumentPage 형식으로 변환
      const convertedDocument = {
        id: selectedArticle.id,
        title: selectedArticle.title,
        description: selectedArticle.title + "에 대한 상세 정보를 제공합니다. 최신 정책과 절차를 확인하세요.",
        category: selectedArticle.type,
        source: selectedArticle.source,
        time: selectedArticle.time,
        image: selectedArticle.thumbnail.replace('w=100&h=60', 'w=400&h=250'),
        downloads: Math.floor(Math.random() * 3000) + 1000,
        views: Math.floor(Math.random() * 20000) + 5000,
        isUrgent: Math.random() > 0.7,
        tags: [selectedArticle.type, "가이드", "최신정보"]
      };
      setSelectedDocument(convertedDocument);
    }
  }, [selectedArticle]);

  const handleQuickService = (serviceName: string) => {
    // LMS 시스템과 연동
    window.location.href = `/pages/LSMPage.tsx?service=${encodeURIComponent(serviceName)}`;
  };

  const handleViewDetails = (document: any) => {
    setSelectedDocument(document);
  };

  const handleBackToList = () => {
    setSelectedDocument(null);
  };

  const categories = ['전체', '학생비자', '취업비자', '거류증', '공증서류', '회사설립', '혼인신고', '기타'];

  const [showMoreServices, setShowMoreServices] = useState(false);

  // 카테고리별 빠른 서비스
  const quickServicesByCategory: Record<string, { icon: React.ReactNode; label: string; service: string }[]> = {
    '전체_all': [
      { icon: <FileText className="w-5 h-5" />, label: 'X1·X2비자', service: 'X1비자신청' },
      { icon: <Briefcase className="w-5 h-5" />, label: 'Z비자(취업)', service: 'Z비자신청' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '거류증 갱신', service: '거류증갱신' },
      { icon: <Download className="w-5 h-5" />, label: '공증 신청', service: '공증신청' },
      { icon: <Building className="w-5 h-5" />, label: '법인 설립', service: '법인설립' },
      { icon: <Calendar className="w-5 h-5" />, label: '혼인신고', service: '혼인신고' },
    ],
    '전체_more': [
      { icon: <Download className="w-5 h-5" />, label: '서류 다운로드', service: '서류다운로드' },
      { icon: <Calendar className="w-5 h-5" />, label: '예약 서비스', service: '예약서비스' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 상황', service: '진행상황' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '종합 상담', service: '종합상담' },
      { icon: <Database className="w-5 h-5" />, label: '세무 서비스', service: '세무서비스' },
    ],
    '학생비자': [
      { icon: <FileText className="w-5 h-5" />, label: 'X1비자 신청', service: 'X1비자신청' },
      { icon: <FileText className="w-5 h-5" />, label: 'X2비자 신청', service: 'X2비자신청' },
      { icon: <Download className="w-5 h-5" />, label: '서류 다운로드', service: '서류다운로드' },
      { icon: <Calendar className="w-5 h-5" />, label: '예약 서비스', service: '예약서비스' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 상황', service: '진행상황' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '유학 상담', service: '유학상담' },
    ],
    '취업비자': [
      { icon: <FileText className="w-5 h-5" />, label: 'Z비자 신청', service: 'Z비자신청' },
      { icon: <Briefcase className="w-5 h-5" />, label: '취업 허가', service: '취업허가' },
      { icon: <Download className="w-5 h-5" />, label: '서류 다운로드', service: '서류다운로드' },
      { icon: <Calendar className="w-5 h-5" />, label: '영사관 예약', service: '영사관예약' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 상황', service: '진행상황' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '취업 상담', service: '취업상담' },
    ],
    '거류증': [
      { icon: <FileText className="w-5 h-5" />, label: '거류증 신청', service: '거류증신청' },
      { icon: <FileText className="w-5 h-5" />, label: '거류증 갱신', service: '거류증갱신' },
      { icon: <Download className="w-5 h-5" />, label: '양식 다운로드', service: '양식다운로드' },
      { icon: <Calendar className="w-5 h-5" />, label: '출입국 예약', service: '출입국예약' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 상황', service: '진행상황' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '거류 상담', service: '거류상담' },
    ],
    '공증서류': [
      { icon: <FileText className="w-5 h-5" />, label: '공증 신청', service: '공증신청' },
      { icon: <Download className="w-5 h-5" />, label: '서류 목록', service: '서류목록' },
      { icon: <Calendar className="w-5 h-5" />, label: '공증 예약', service: '공증예약' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 확인', service: '진행확인' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '공증 상담', service: '공증상담' },
    ],
    '회사설립': [
      { icon: <Building className="w-5 h-5" />, label: '법인 설립', service: '법인설립' },
      { icon: <FileText className="w-5 h-5" />, label: '사업자 등록', service: '사업자등록' },
      { icon: <Download className="w-5 h-5" />, label: '서류 다운로드', service: '서류다운로드' },
      { icon: <Database className="w-5 h-5" />, label: '세무 서비스', service: '세무서비스' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '창업 상담', service: '창업상담' },
    ],
    '혼인신고': [
      { icon: <FileText className="w-5 h-5" />, label: '혼인신고 안내', service: '혼인신고' },
      { icon: <Download className="w-5 h-5" />, label: '서류 다운로드', service: '서류다운로드' },
      { icon: <Calendar className="w-5 h-5" />, label: '영사관 예약', service: '영사관예약' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 상황', service: '진행상황' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '혼인 상담', service: '혼인상담' },
    ],
    '기타': [
      { icon: <FileText className="w-5 h-5" />, label: '서류 신청', service: '서류신청' },
      { icon: <Download className="w-5 h-5" />, label: '서류 다운로드', service: '서류다운로드' },
      { icon: <Calendar className="w-5 h-5" />, label: '예약 서비스', service: '예약서비스' },
      { icon: <ExternalLink className="w-5 h-5" />, label: '진행 상황', service: '진행상황' },
      { icon: <MessageCircle className="w-5 h-5" />, label: '기타 상담', service: '기타상담' },
    ],
  };

  const isAll = selectedCategory === '전체';
  const currentQuickServices = isAll
    ? (showMoreServices
      ? [...quickServicesByCategory['전체_all'], ...quickServicesByCategory['전체_more']]
      : quickServicesByCategory['전체_all'])
    : (quickServicesByCategory[selectedCategory] || quickServicesByCategory['기타']);

  const documents = [
    {
      id: 1,
      title: "중국 학생비자(X1/X2) 신청 가이드 2024 최신판",
      description: "중국 유학을 위한 학생비자 신청 절차와 필요 서류에 대한 완벽 가이드입니다. 최신 정책 변경사항까지 모두 포함되어 있습니다.",
      category: "학생비자",
      source: "비자센터",
      time: "1시간 전",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop",
      downloads: 2340,
      views: 15670,
      isUrgent: true,
      tags: ["X1비자", "X2비자", "유학", "신청절차"]
    },
    {
      id: 2,
      title: "중국 거류증 갱신 온라인 신청 방법 안내",
      description: "거류증 갱신을 위한 온라인 신청 방법과 필요 서류, 주의사항에 대해 자세히 안내합니다.",
      category: "거류증",
      source: "공안부출입국관리소",
      time: "2시간 전",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
      downloads: 1890,
      views: 12340,
      isUrgent: false,
      tags: ["거류증", "갱신", "온라인신청"]
    },
    {
      id: 3,
      title: "중국 공증서류 아포스티유 인증 절차",
      description: "공증서류의 아포스티유 인증 절차와 필요 서류, 소요 기간에 대한 상세 정보를 제공합니다.",
      category: "공증서류",
      source: "공증센터",
      time: "3시간 전",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
      downloads: 1567,
      views: 9870,
      isUrgent: false,
      tags: ["공증", "아포스티유", "인증"]
    },
    {
      id: 4,
      title: "중국 은행계좌 개설 완벽 가이드 2024",
      description: "중국에서 은행계좌를 개설하기 위한 필수 서류와 절차, 각 은행별 특징을 상세히 안내합니다.",
      category: "은행계좌",
      source: "은행지원센터",
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",
      downloads: 2100,
      views: 18450,
      isUrgent: false,
      tags: ["은행계좌", "개설", "가이드"]
    },
    {
      id: 5,
      title: "중국 취업비자(Z비자) 신청 및 연장 절차",
      description: "중국에서 취업하기 위한 Z비자 신청 방법과 연장 절차에 대한 종합 안내서입니다.",
      category: "취업비자",
      source: "노동부출입국관리소",
      time: "5시간 전",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop",
      downloads: 1456,
      views: 11230,
      isUrgent: true,
      tags: ["Z비자", "취업", "연장"]
    }
  ];

  const filteredDocuments = documents.filter(document => {
    const matchesCategory = selectedCategory === '전체' || document.category === selectedCategory;
    const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 상세 페이지 렌더링
  if (selectedDocument) {
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
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium rounded">
                    {selectedDocument.category}
                  </span>
                  {selectedDocument.isUrgent && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 text-sm font-bold rounded">긴급</span>
                  )}
                </div>
                
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {selectedDocument.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <span>{selectedDocument.source}</span>
                  <span>{selectedDocument.time}</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Filter className="w-4 h-4" />
                    <span>조회수 {selectedDocument.views?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>다운로드 {selectedDocument.downloads?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Article Image */}
              <div className="mb-8">
                <img 
                  src={selectedDocument.image} 
                  alt={selectedDocument.title}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg"
                />
              </div>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p className="text-lg text-gray-800 font-medium mb-6">
                    {selectedDocument.description}
                  </p>
                  
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-blue-900 mb-3">주요 포인트</h3>
                    <ul className="space-y-2 text-blue-800">
                      <li>• 온라인 신청을 통해 시간과 비용을 절약할 수 있습니다</li>
                      <li>• 필요 서류를 미리 준비하여 처리 시간을 단축하세요</li>
                      <li>• 전문 상담사가 전 과정을 도와드립니다</li>
                      <li>• 실시간 진행 상황 확인이 가능합니다</li>
                    </ul>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">신청 절차</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-medium text-gray-900">온라인 신청서 작성</h4>
                        <p className="text-gray-600">필요한 개인정보와 신청 내용을 정확히 입력해주세요.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-medium text-gray-900">서류 제출</h4>
                        <p className="text-gray-600">요구되는 서류를 온라인 또는 방문을 통해 제출합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-gray-900">심사 및 처리</h4>
                        <p className="text-gray-600">담당 기관에서 서류를 검토하고 처리합니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <h4 className="font-medium text-gray-900">결과 통보</h4>
                        <p className="text-gray-600">처리 결과를 문자나 이메일로 안내해드립니다.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg mt-8">
                    <h3 className="font-semibold text-yellow-900 mb-3">주의사항</h3>
                    <ul className="space-y-2 text-yellow-800">
                      <li>• 모든 서류는 최신 버전으로 준비해주세요</li>
                      <li>• 번역 서류의 경우 공증을 받아야 합니다</li>
                      <li>• 처리 기간은 신청 내용에 따라 달라질 수 있습니다</li>
                      <li>• 추가 서류 요청 시 신속히 제출해주세요</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    온라인 신청하기
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    서류 다운로드
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    상담 예약
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags?.map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Related Articles */}
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">관련 문서</h3>
                    <div className="space-y-4">
                      {documents.filter(doc => doc.id !== selectedDocument.id && doc.category === selectedDocument.category).slice(0, 3).map((doc) => (
                        <div key={doc.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => handleViewDetails(doc)}>
                          <div className="flex space-x-3">
                            <img src={doc.image} alt={doc.title} className="w-16 h-12 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{doc.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{doc.time}</p>
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
                    <h3 className="font-semibold mb-4">빠른 서비스</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        진행 상황 확인
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        상담 예약
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        양식 다운로드
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
                        <p className="font-medium">전화 상담</p>
                        <p className="text-gray-600">+86-10-1234-5678</p>
                      </div>
                      <div>
                        <p className="font-medium">이메일</p>
                        <p className="text-gray-600">visa@chinaup.com</p>
                      </div>
                      <div>
                        <p className="font-medium">운영시간</p>
                        <p className="text-gray-600">평일 09:00-18:00</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <CommentSection
            pageType="visa"
            itemId={selectedDocument.id}
            currentUser={currentUser}
            isAdmin={isAdmin}
          />
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
              <h1 className="text-2xl font-bold text-gray-900">비자/서류</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="서류 검색..."
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
        {/* Quick Services — 카테고리 연동 */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-4">빠른 서비스</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>
            {currentQuickServices.map(item => (
              <button
                key={item.service}
                onClick={() => handleQuickService(item.service)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 bg-white group-hover:border-teal-400 group-hover:text-teal-600 group-hover:bg-teal-50 transition-all">
                  {item.icon}
                </div>
                <p className="text-xs text-gray-700 whitespace-nowrap">{item.label}</p>
              </button>
            ))}
            {/* 전체 카테고리일 때만 더보기/접기 버튼 */}
            {isAll && (
              <button
                onClick={() => setShowMoreServices(v => !v)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white group-hover:border-teal-300 group-hover:text-teal-500 transition-all text-lg">
                  {showMoreServices ? '↑' : '···'}
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">{showMoreServices ? '접기' : '더보기'}</p>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">카테고리</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(category); setShowMoreServices(false); }}
                className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            총 {filteredDocuments.length}개 문서
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-2">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex gap-3 p-3">
                <img
                  src={document.image}
                  alt={document.title}
                  className="w-20 h-16 object-cover rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-medium rounded">{document.category}</span>
                    {document.isUrgent && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-bold rounded">긴급</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">{document.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1">{document.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{document.source}</span>
                      <span>·</span>
                      <span>{document.time}</span>
                      <span>· 조회 {document.views.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                        <Download className="w-3 h-3 mr-0.5" />다운
                      </Button>
                      <Button size="sm" className="h-6 text-[10px] px-2 bg-green-600 hover:bg-green-700" onClick={() => handleViewDetails(document)}>
                        상세보기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}