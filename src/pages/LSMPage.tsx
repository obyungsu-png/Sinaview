import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, Eye, Settings, Users, BookOpen, Image, FileText, Video, Link, Calendar, Tag, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';

interface LSMPageProps {
  onBack: () => void;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'article' | 'image' | 'video' | 'link';
  category: string;
  subcategory?: string;
  content: string;
  richContent?: string;
  imageUrl?: string;
  url?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  views: number;
  author: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  itemCount: number;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  parentCategory: string;
}

interface ServiceItem {
  id: string;
  title: string;
  items: string[];
}

interface ContactInfo {
  phone: string;
  email: string;
  kakao: string;
  weekdayHours: string;
  saturdayHours: string;
  holidayHours: string;
}

interface SystemSettings {
  autoPublish: boolean;
  emailNotification: boolean;
  autoBackup: boolean;
}

export function LSMPage({ onBack }: LSMPageProps) {
  const [selectedTab, setSelectedTab] = useState('content');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '+86-10-1234-5678',
    email: 'visa@chinaup.com',
    kakao: 'ChinaUpVisa',
    weekdayHours: '09:00 - 18:00',
    saturdayHours: '09:00 - 15:00',
    holidayHours: '휴무'
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoPublish: false,
    emailNotification: false,
    autoBackup: true
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [quickServiceRequest, setQuickServiceRequest] = useState<string | null>(null);

  // 편집 모드 상태
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  // URL 파라미터에서 빠른 서비스 요청 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    if (service) {
      setQuickServiceRequest(service);
      setSelectedTab('service');
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // 초기 서비스 항목
    const initialServices: ServiceItem[] = [
      {
        id: 's1',
        title: '비자 관련 서비스',
        items: ['학생비자 신청 안내', '취업비자 연장 절차', '관광비자 온라인 신청', '가족초청비자 준비']
      },
      {
        id: 's2',
        title: '거류증 관련 서비스',
        items: ['거류증 갱신 신청', '거류증 분실 재발급', '거류증 정보 변경', '온라인 예약 서비스']
      },
      {
        id: 's3',
        title: '공증 서비스',
        items: ['학력 공증 및 인증', '혼인 관계 공증', '출생 증명서 공증', '아포스티유 인증']
      },
      {
        id: 's4',
        title: '기타 서비스',
        items: ['은행 계좌 개설 도움', '세무 신고 대행', '회사 설립 절차', '부동산 계약 지원']
      }
    ];

    // 초기 카테고리 데이터
    const initialCategories: Category[] = [
      { 
        id: '1', 
        name: '비자/서류', 
        description: '비자 및 서류 안내', 
        color: 'bg-yellow-100 text-yellow-800', 
        itemCount: 4,
        subcategories: [
          { id: 'visa-1', name: '비자', description: '각종 비자 신청 및 연장', parentCategory: '비자/서류' },
          { id: 'visa-2', name: '거류증', description: '거류증 신청 및 갱신', parentCategory: '비자/서류' },
          { id: 'visa-3', name: '공증서류', description: '공증 및 번역 서류', parentCategory: '비자/서류' },
          { id: 'visa-4', name: '은행계좌', description: '은행 계좌 개설 및 관리', parentCategory: '비자/서류' }
        ]
      },
      { 
        id: '2', 
        name: '교육', 
        description: '교육 자료 및 강의', 
        color: 'bg-blue-100 text-blue-800', 
        itemCount: 8,
        subcategories: [
          { id: 'edu-1', name: '대학교', description: '대학교 입학 및 정보', parentCategory: '교육' },
          { id: 'edu-2', name: '어학원', description: '중국어 및 기타 어학 교육', parentCategory: '교육' },
          { id: 'edu-3', name: '유학준비', description: '유학 준비 및 상담', parentCategory: '교육' },
          { id: 'edu-4', name: '온라인강의', description: '온라인 교육 플랫폼', parentCategory: '교육' }
        ]
      },
      { 
        id: '3', 
        name: '쇼핑', 
        description: '상품 정보 및 리뷰', 
        color: 'bg-green-100 text-green-800', 
        itemCount: 15,
        subcategories: [
          { id: 'shop-1', name: '온라인쇼핑', description: '타오바오, 티몰 등', parentCategory: '쇼핑' },
          { id: 'shop-2', name: '한국상품', description: '한국 상품 구매 정보', parentCategory: '쇼핑' },
          { id: 'shop-3', name: '직구', description: '해외 직접 구매', parentCategory: '쇼핑' },
          { id: 'shop-4', name: '리뷰', description: '상품 리뷰 및 후기', parentCategory: '쇼핑' }
        ]
      },
      { 
        id: '4', 
        name: '엘로우페이지', 
        description: '업체 정보', 
        color: 'bg-indigo-100 text-indigo-800', 
        itemCount: 11,
        subcategories: [
          { id: 'yp-1', name: '한인업체', description: '한인 운영 업체', parentCategory: '엘로우페이지' },
          { id: 'yp-2', name: '병원', description: '병원 및 의료기관', parentCategory: '엘로우페이지' },
          { id: 'yp-3', name: '식당', description: '한식당 및 음식점', parentCategory: '엘로우페이지' },
          { id: 'yp-4', name: '서비스', description: '각종 생활 서비스', parentCategory: '엘로우페이지' }
        ]
      },
      { 
        id: '5', 
        name: '자동차', 
        description: '자동차 관련 정보', 
        color: 'bg-purple-100 text-purple-800', 
        itemCount: 6,
        subcategories: [
          { id: 'auto-1', name: '신차', description: '신차 정보 및 구매', parentCategory: '자동차' },
          { id: 'auto-2', name: '중고차', description: '중고차 거래', parentCategory: '자동차' },
          { id: 'auto-3', name: '면허', description: '운전면허 취득', parentCategory: '자동차' },
          { id: 'auto-4', name: '정비', description: '자동차 정비 및 수리', parentCategory: '자동차' }
        ]
      },
      { 
        id: '6', 
        name: '증권', 
        description: '주식 및 투자 정보', 
        color: 'bg-teal-100 text-teal-800', 
        itemCount: 7,
        subcategories: [
          { id: 'sec-1', name: '중국주식', description: 'A주, H주 정보', parentCategory: '증권' },
          { id: 'sec-2', name: '미국주식', description: '미국 주식 투자', parentCategory: '증권' },
          { id: 'sec-3', name: '한국주식', description: '한국 주식 정보', parentCategory: '증권' },
          { id: 'sec-4', name: '투자정보', description: '투자 분석 및 전략', parentCategory: '증권' }
        ]
      },
      { 
        id: '7', 
        name: '중고시장', 
        description: '중고 거래 정보', 
        color: 'bg-orange-100 text-orange-800', 
        itemCount: 9,
        subcategories: [
          { id: 'used-1', name: '전자제품', description: '핸드폰, 노트북 등', parentCategory: '중고시장' },
          { id: 'used-2', name: '가구', description: '생활 가구 및 가전', parentCategory: '중고시장' },
          { id: 'used-3', name: '의류', description: '의류 및 액세서리', parentCategory: '중고시장' },
          { id: 'used-4', name: '기타', description: '기타 중고 물품', parentCategory: '중고시장' }
        ]
      },
      { 
        id: '8', 
        name: '뉴스', 
        description: '최신 뉴스 및 시사', 
        color: 'bg-red-100 text-red-800', 
        itemCount: 12,
        subcategories: [
          { id: 'news-1', name: '한중관계', description: '한국-중국 관계 뉴스', parentCategory: '뉴스' },
          { id: 'news-2', name: '경제', description: '경제 뉴스 및 분석', parentCategory: '뉴스' },
          { id: 'news-3', name: '정치', description: '정치 관련 소식', parentCategory: '뉴스' },
          { id: 'news-4', name: '사회', description: '사회 이슈 및 문화', parentCategory: '뉴스' }
        ]
      }
    ];

    // 초기 콘텐츠 데이터
    const initialContent: ContentItem[] = [
      {
        id: '1',
        title: '중국 비자 신청 완벽 가이드',
        type: 'article',
        category: '비자/서류',
        content: '중국 각종 비자 신청 절차와 필요 서류를 안내합니다...',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
        tags: ['비자', '신청', '서류', '가이드'],
        status: 'published',
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16',
        views: 1850,
        author: '관리자'
      },
      {
        id: '2',
        title: '중국 대학교 입학 준비 가이드',
        type: 'article',
        category: '교육',
        content: '중국 대학교 입학을 위한 완벽한 준비 가이드입니다...',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop',
        tags: ['교육', '대학교', '입학', '가이드'],
        status: 'published',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        views: 1250,
        author: '관리자'
      },
      {
        id: '3',
        title: '중국 온라인 쇼핑 가이드',
        type: 'video',
        category: '쇼핑',
        content: '타오바오, 티몰 등 중국 쇼핑몰 이용법을 알려드립니다.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
        url: 'https://youtube.com/watch?v=example',
        tags: ['쇼핑', '온라인', '타오바오', '가이드'],
        status: 'published',
        createdAt: '2024-01-13',
        updatedAt: '2024-01-13',
        views: 2150,
        author: '관리자'
      },
      {
        id: '4',
        title: '베이징 맛집 추천 리스트',
        type: 'article',
        category: '뉴스',
        content: '베이징에서 꼭 가봐야 할 맛집들을 소개합니다...',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop',
        tags: ['맛집', '베이징', '음식', '추천'],
        status: 'published',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
        views: 890,
        author: '관리자'
      }
    ];

    setServiceItems(initialServices);
    setCategories(initialCategories);
    setContentItems(initialContent);
  };

  // 빠른 서비스 관리
  const handleAddServiceItem = (serviceId: string, newItem: string) => {
    setServiceItems(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, items: [...service.items, newItem] }
        : service
    ));
  };

  const handleDeleteServiceItem = (serviceId: string, itemIndex: number) => {
    setServiceItems(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, items: service.items.filter((_, idx) => idx !== itemIndex) }
        : service
    ));
  };

  const handleUpdateServiceItem = (serviceId: string, itemIndex: number, newValue: string) => {
    setServiceItems(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, items: service.items.map((item, idx) => idx === itemIndex ? newValue : item) }
        : service
    ));
  };

  const handleUpdateServiceTitle = (serviceId: string, newTitle: string) => {
    setServiceItems(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, title: newTitle }
        : service
    ));
  };

  // 콘텐츠 관리
  const handleCreateContent = async (formData: any) => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: formData.title,
      type: formData.type,
      category: formData.category,
      content: formData.content,
      imageUrl: formData.imageUrl,
      url: formData.url,
      tags: formData.tags.split(',').map((tag: string) => tag.trim()),
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      author: '관리자'
    };

    setContentItems(prev => [newItem, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteContent = (id: string) => {
    setContentItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    setContentItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      )
    );
  };

  // 카테고리 관리
  const handleCreateCategory = (newCategory: Partial<Category>) => {
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name || '',
      description: newCategory.description || '',
      color: newCategory.color || 'bg-gray-100 text-gray-800',
      itemCount: 0,
      subcategories: []
    };
    setCategories(prev => [...prev, category]);
    setIsCreateCategoryOpen(false);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={onBack}
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>메인으로</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LSM - 학습 시스템 관리</h1>
                <div className="text-sm text-gray-500">
                  콘텐츠 및 학습 자료 통합 관리 시스템
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                총 {contentItems.length}개 콘텐츠
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {categories.length}개 카테고리
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="service" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>빠른 서비스</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>콘텐츠 관리</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>카테고리 관리</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>분석</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>설정</span>
            </TabsTrigger>
          </TabsList>

          {/* 빠른 서비스 탭 */}
          <TabsContent value="service" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>비자/서류 빠른 서비스</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    모든 항목 편집 가능
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceItems.map((service) => (
                    <EditableServiceCard
                      key={service.id}
                      service={service}
                      onAddItem={(item) => handleAddServiceItem(service.id, item)}
                      onDeleteItem={(idx) => handleDeleteServiceItem(service.id, idx)}
                      onUpdateItem={(idx, val) => handleUpdateServiceItem(service.id, idx, val)}
                      onUpdateTitle={(title) => handleUpdateServiceTitle(service.id, title)}
                    />
                  ))}
                </div>
                
                <Card className="mt-6 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-900">연락처 및 운영시간</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingContact(!editingContact)}
                      >
                        {editingContact ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      </Button>
                    </div>
                    {editingContact ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>전화</Label>
                          <Input
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                          />
                          <Label>이메일</Label>
                          <Input
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                          />
                          <Label>카카오톡</Label>
                          <Input
                            value={contactInfo.kakao}
                            onChange={(e) => setContactInfo(prev => ({ ...prev, kakao: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>평일 운영시간</Label>
                          <Input
                            value={contactInfo.weekdayHours}
                            onChange={(e) => setContactInfo(prev => ({ ...prev, weekdayHours: e.target.value }))}
                          />
                          <Label>토요일 운영시간</Label>
                          <Input
                            value={contactInfo.saturdayHours}
                            onChange={(e) => setContactInfo(prev => ({ ...prev, saturdayHours: e.target.value }))}
                          />
                          <Label>일요일/공휴일</Label>
                          <Input
                            value={contactInfo.holidayHours}
                            onChange={(e) => setContactInfo(prev => ({ ...prev, holidayHours: e.target.value }))}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>전화:</strong> {contactInfo.phone}</p>
                          <p><strong>이메일:</strong> {contactInfo.email}</p>
                          <p><strong>카카오톡:</strong> {contactInfo.kakao}</p>
                        </div>
                        <div>
                          <p><strong>평일:</strong> {contactInfo.weekdayHours}</p>
                          <p><strong>토요일:</strong> {contactInfo.saturdayHours}</p>
                          <p><strong>일요일/공휴일:</strong> {contactInfo.holidayHours}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 콘텐츠 관리 탭 */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>콘텐츠 관리</CardTitle>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        새 콘텐츠
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>새 콘텐츠 만들기</DialogTitle>
                        <DialogDescription>
                          새로운 콘텐츠를 생성하여 LSM 시스템에 추가합니다.
                        </DialogDescription>
                      </DialogHeader>
                      <CreateContentForm onSubmit={handleCreateContent} categories={categories} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="제목, 내용, 태그로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 카테고리</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="draft">초안</SelectItem>
                      <SelectItem value="published">게시됨</SelectItem>
                      <SelectItem value="archived">보관됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 콘텐츠 목록 */}
                <div className="space-y-4">
                  {filteredContent.map((item) => (
                    <ContentCard
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteContent}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 카테고리 관리 탭 */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>카테고리 관리</CardTitle>
                  <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        새 카테고리
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>새 카테고리 만들기</DialogTitle>
                      </DialogHeader>
                      <CreateCategoryForm onSubmit={handleCreateCategory} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <EditableCategoryCard
                      key={category.id}
                      category={category}
                      isEditing={editingCategory === category.id}
                      onStartEdit={() => setEditingCategory(category.id)}
                      onSave={(updates) => handleUpdateCategory(category.id, updates)}
                      onDelete={() => handleDeleteCategory(category.id)}
                      onCancel={() => setEditingCategory(null)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 분석 탭 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">총 콘텐츠</p>
                      <p className="text-2xl font-bold">{contentItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">총 조회수</p>
                      <p className="text-2xl font-bold">{contentItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">게시된 콘텐츠</p>
                      <p className="text-2xl font-bold">{contentItems.filter(item => item.status === 'published').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Tag className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">카테고리</p>
                      <p className="text-2xl font-bold">{categories.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>카테고리별 콘텐츠 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const count = contentItems.filter(item => item.category === category.name).length;
                    const percentage = contentItems.length > 0 ? (count / contentItems.length * 100).toFixed(1) : 0;
                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-gray-500">{count}개 ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설정 탭 */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>시스템 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">자동 게시</Label>
                    <p className="text-sm text-gray-500">새 콘텐츠를 자동으로 게시합니다</p>
                  </div>
                  <Switch 
                    checked={systemSettings.autoPublish}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoPublish: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">이메일 알림</Label>
                    <p className="text-sm text-gray-500">새 콘텐츠 등록 시 알림을 받습니다</p>
                  </div>
                  <Switch 
                    checked={systemSettings.emailNotification}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailNotification: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">자동 백업</Label>
                    <p className="text-sm text-gray-500">매일 자동으로 데이터를 백업합니다</p>
                  </div>
                  <Switch 
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>설정 상태 미리보기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">자동 게시</span>
                    <Badge variant={systemSettings.autoPublish ? "default" : "secondary"}>
                      {systemSettings.autoPublish ? '활성화' : '비활성화'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">이메일 알림</span>
                    <Badge variant={systemSettings.emailNotification ? "default" : "secondary"}>
                      {systemSettings.emailNotification ? '활성화' : '비활성화'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">자동 백업</span>
                    <Badge variant={systemSettings.autoBackup ? "default" : "secondary"}>
                      {systemSettings.autoBackup ? '활성화' : '비활성화'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 편집 가능한 서비스 카드 컴포넌트
function EditableServiceCard({ 
  service, 
  onAddItem, 
  onDeleteItem, 
  onUpdateItem,
  onUpdateTitle 
}: { 
  service: ServiceItem;
  onAddItem: (item: string) => void;
  onDeleteItem: (index: number) => void;
  onUpdateItem: (index: number, value: string) => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newItem, setNewItem] = useState('');
  const [titleEdit, setTitleEdit] = useState(service.title);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <Input
            value={titleEdit}
            onChange={(e) => setTitleEdit(e.target.value)}
            onBlur={() => {
              onUpdateTitle(titleEdit);
              setIsEditing(false);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onUpdateTitle(titleEdit);
                setIsEditing(false);
              }
            }}
            className="font-semibold"
            autoFocus
          />
        ) : (
          <h3 className="font-semibold">{service.title}</h3>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        {service.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {editingIndex === index ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => {
                    onUpdateItem(index, editValue);
                    setEditingIndex(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateItem(index, editValue);
                      setEditingIndex(null);
                    }
                  }}
                  className="flex-1 h-8"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUpdateItem(index, editValue);
                    setEditingIndex(null);
                  }}
                >
                  <Check className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <p className="flex-1">• {item}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingIndex(index);
                    setEditValue(item);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteItem(index)}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </>
            )}
          </div>
        ))}
        <div className="flex items-center space-x-2 mt-3">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="새 항목 추가..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newItem.trim()) {
                onAddItem(newItem);
                setNewItem('');
              }
            }}
            className="h-8"
          />
          <Button
            size="sm"
            onClick={() => {
              if (newItem.trim()) {
                onAddItem(newItem);
                setNewItem('');
              }
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// 편집 가능한 카테고리 카드
function EditableCategoryCard({ 
  category, 
  isEditing, 
  onStartEdit, 
  onSave, 
  onDelete, 
  onCancel 
}: { 
  category: Category;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (updates: Partial<Category>) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [editData, setEditData] = useState({
    name: category.name,
    description: category.description,
    color: category.color
  });

  useEffect(() => {
    if (isEditing) {
      setEditData({
        name: category.name,
        description: category.description,
        color: category.color
      });
    }
  }, [isEditing, category]);

  return (
    <Card>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">카테고리 이름</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">설명</Label>
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs">색상</Label>
              <Select 
                value={editData.color} 
                onValueChange={(value) => setEditData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-yellow-100 text-yellow-800">노랑</SelectItem>
                  <SelectItem value="bg-blue-100 text-blue-800">파랑</SelectItem>
                  <SelectItem value="bg-green-100 text-green-800">초록</SelectItem>
                  <SelectItem value="bg-red-100 text-red-800">빨강</SelectItem>
                  <SelectItem value="bg-purple-100 text-purple-800">보라</SelectItem>
                  <SelectItem value="bg-orange-100 text-orange-800">주황</SelectItem>
                  <SelectItem value="bg-teal-100 text-teal-800">청록</SelectItem>
                  <SelectItem value="bg-indigo-100 text-indigo-800">남색</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  onSave(editData);
                }}
              >
                <Check className="w-3 h-3 mr-1" />
                저장
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onCancel}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <Badge className={category.color}>{category.name}</Badge>
              <span className="text-sm text-gray-500">{category.itemCount}개</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{category.description}</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onStartEdit}>
                <Edit className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// 카테고리 생성 폼
function CreateCategoryForm({ onSubmit }: { onSubmit: (data: Partial<Category>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-gray-100 text-gray-800'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.description) {
      onSubmit(formData);
      setFormData({ name: '', description: '', color: 'bg-gray-100 text-gray-800' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>카테고리 이름</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="카테고리 이름을 입력하세요"
          required
        />
      </div>
      <div>
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="카테고리 설명을 입력하세요"
          required
        />
      </div>
      <div>
        <Label>색상</Label>
        <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bg-yellow-100 text-yellow-800">노랑</SelectItem>
            <SelectItem value="bg-blue-100 text-blue-800">파랑</SelectItem>
            <SelectItem value="bg-green-100 text-green-800">초록</SelectItem>
            <SelectItem value="bg-red-100 text-red-800">빨강</SelectItem>
            <SelectItem value="bg-purple-100 text-purple-800">보라</SelectItem>
            <SelectItem value="bg-orange-100 text-orange-800">주황</SelectItem>
            <SelectItem value="bg-teal-100 text-teal-800">청록</SelectItem>
            <SelectItem value="bg-indigo-100 text-indigo-800">남색</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        카테고리 생성
      </Button>
    </form>
  );
}

// 콘텐츠 카드 컴포넌트
function ContentCard({ 
  item, 
  onDelete, 
  onStatusChange 
}: { 
  item: ContentItem; 
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'draft' | 'published' | 'archived') => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">게시됨</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">초안</Badge>;
      case 'archived':
        return <Badge className="bg-red-100 text-red-800">보관됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'link':
        return <Link className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              {getTypeIcon(item.type)}
              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
              {getStatusBadge(item.status)}
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>조회수: {item.views.toLocaleString()}</span>
              <span>작성자: {item.author}</span>
              <span>수정일: {item.updatedAt}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <Select value={item.status} onValueChange={(value: 'draft' | 'published' | 'archived') => onStatusChange(item.id, value)}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">초안</SelectItem>
                <SelectItem value="published">게시</SelectItem>
                <SelectItem value="archived">보관</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm">
                <Edit className="w-3 h-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 리치 텍스트 에디터 컴포넌트
function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "내용을 입력하세요..." 
}: { 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [fontSize, setFontSize] = useState('14');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const editorRef = useRef<HTMLDivElement>(null);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  return (
    <div className="border rounded-lg">
      {/* 툴바 */}
      <div className="border-b p-2 bg-gray-50 flex flex-wrap items-center gap-2">
        {/* 글자 크기 */}
        <div className="flex items-center space-x-1">
          <Type className="w-4 h-4" />
          <select 
            value={fontSize} 
            onChange={(e) => {
              setFontSize(e.target.value);
              formatText('fontSize', e.target.value);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="1">10px</option>
            <option value="2">12px</option>
            <option value="3">14px</option>
            <option value="4">16px</option>
            <option value="5">18px</option>
            <option value="6">20px</option>
            <option value="7">24px</option>
          </select>
        </div>

        {/* 글자 색상 */}
        <div className="flex items-center space-x-1">
          <Palette className="w-4 h-4" />
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              formatText('foreColor', e.target.value);
            }}
            className="w-8 h-8 border rounded cursor-pointer"
            title="글자 색상"
          />
        </div>

        {/* 배경 색상 */}
        <div className="flex items-center space-x-1">
          <span className="text-xs">배경</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => {
              setBackgroundColor(e.target.value);
              formatText('backColor', e.target.value);
            }}
            className="w-8 h-8 border rounded cursor-pointer"
            title="배경 색상"
          />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        {/* 텍스트 포맷 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('bold')}
          className="p-2"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('italic')}
          className="p-2"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('underline')}
          className="p-2"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* 정렬 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('justifyLeft')}
          className="p-2"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('justifyCenter')}
          className="p-2"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => formatText('justifyRight')}
          className="p-2"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* 이미지 삽입 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertImage}
          className="p-2"
        >
          <Image className="w-4 h-4" />
        </Button>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleContentChange}
        className="min-h-[200px] p-4 focus:outline-none"
        style={{ lineHeight: '1.6' }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

// 이미지 업로드 컴포넌트
function ImageUpload({ 
  onImageSelect,
  currentImage 
}: { 
  onImageSelect: (url: string) => void;
  currentImage?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUnsplashSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsUploading(true);
    try {
      const imageMap: { [key: string]: string } = {
        '비자': 'https://images.unsplash.com/photo-1743193143977-bc57e2c100ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXNhJTIwZG9jdW1lbnQlMjBwYXNzcG9ydHxlbnwxfHx8fDE3NTkyMzA4MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        '교육': 'https://images.unsplash.com/photo-1700477791114-716668e7ebe2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB1bml2ZXJzaXR5JTIwY2hpbmF8ZW58MXx8fHwxNzU5MjMwODA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        '자동차': 'https://images.unsplash.com/photo-1758862262333-460e3c03b6be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBhdXRvbW90aXZlJTIwY2hpbmF8ZW58MXx8fHwxNzU5MjMwODA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        '증권': 'https://images.unsplash.com/photo-1611967556157-d5c8830b5161?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMHNlY3VyaXRpZXN8ZW58MXx8fHwxNzU5MjMwODEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        'default': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'
      };
      
      const foundImage = Object.keys(imageMap).find(key => 
        searchQuery.toLowerCase().includes(key.toLowerCase())
      );
      
      const selectedImage = foundImage ? imageMap[foundImage] : imageMap['default'];
      onImageSelect(selectedImage);
    } catch (error) {
      console.error('이미지 검색 실패:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="이미지 검색어 입력 (예: 비자, 교육, 자동차)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUnsplashSearch()}
        />
        <Button 
          type="button"
          onClick={handleUnsplashSearch}
          disabled={isUploading || !searchQuery.trim()}
        >
          {isUploading ? '검색중...' : '검색'}
        </Button>
      </div>
      
      {currentImage && (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="선택된 이미지" 
            className="w-full h-32 object-cover rounded border"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onImageSelect('')}
            className="absolute top-2 right-2"
          >
            제거
          </Button>
        </div>
      )}
    </div>
  );
}

// 콘텐츠 생성 폼 컴포넌트
function CreateContentForm({ 
  onSubmit, 
  categories 
}: { 
  onSubmit: (data: any) => void;
  categories: Category[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'article',
    category: '',
    subcategory: '',
    content: '',
    richContent: '',
    imageUrl: '',
    url: '',
    tags: ''
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategoryChange = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    setSelectedCategory(category || null);
    setFormData(prev => ({ 
      ...prev, 
      category: categoryName,
      subcategory: '' // 카테고리 변경시 서브카테고리 초기화
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.category && (formData.content || formData.richContent)) {
      const submitData = {
        ...formData,
        content: formData.richContent || formData.content, // 리치 텍스트 우선
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      onSubmit(submitData);
      setFormData({
        title: '',
        type: 'article',
        category: '',
        subcategory: '',
        content: '',
        richContent: '',
        imageUrl: '',
        url: '',
        tags: ''
      });
      setSelectedCategory(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="콘텐츠 제목을 입력하세요"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="type">콘텐츠 유형</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">기사</SelectItem>
              <SelectItem value="image">이미지</SelectItem>
              <SelectItem value="video">비디오</SelectItem>
              <SelectItem value="link">링크</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">카테고리</Label>
          <Select value={formData.category} onValueChange={handleCategoryChange} required>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subcategory">세부 카테고리</Label>
          <Select 
            value={formData.subcategory} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
            disabled={!selectedCategory?.subcategories}
          >
            <SelectTrigger>
              <SelectValue placeholder="세부 카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {selectedCategory?.subcategories?.map(subcat => (
                <SelectItem key={subcat.id} value={subcat.name}>{subcat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>이미지</Label>
        <ImageUpload
          onImageSelect={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
          currentImage={formData.imageUrl}
        />
      </div>

      <div>
        <Label>내용 (리치 텍스트 에디터)</Label>
        <RichTextEditor
          value={formData.richContent}
          onChange={(value) => setFormData(prev => ({ ...prev, richContent: value }))}
          placeholder="내용을 입력하세요. 텍스트 포맷팅, 색상, 크기 등을 자유롭게 설정할 수 있습니다."
        />
      </div>

      <div>
        <Label htmlFor="content">간단한 설명 (검색 및 미리보기용)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="콘텐츠의 간단한 설명을 입력하세요 (검색 및 미리보기에 사용됩니다)"
          rows={3}
          required
        />
      </div>

      {formData.type === 'video' || formData.type === 'link' ? (
        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="비디오 또는 링크 URL"
            type="url"
          />
        </div>
      ) : null}

      <div>
        <Label htmlFor="tags">태그</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="태그를 쉼표로 구분하여 입력 (예: 비자,서류,신청)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          콘텐츠 저장
        </Button>
      </div>
    </form>
  );
}
