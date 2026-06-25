import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, Eye, FileText, Image as ImageIcon, File, X, Check, History, Download, Scale, ShieldCheck, Camera, Paperclip, RefreshCw, MessageSquare } from 'lucide-react@0.487.0';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CSMPageProps {
  onBack: () => void;
}

interface ChangeHistoryItem {
  timestamp: string;
  editor: string;
  action: 'created' | 'modified' | 'deleted' | 'restored' | 'image_uploaded' | 'file_attached';
  changes: string;
}

interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'legal' | 'article' | 'policy' | 'guide';
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  changeHistory: ChangeHistoryItem[];
  imageUrl?: string;
  imageFile?: File;
  fileUrl?: string;
  fileName?: string;
  attachedFile?: File;
  tags?: string[];
}

export function CSMPage({ onBack }: CSMPageProps) {
  const [selectedTab, setSelectedTab] = useState('legal');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c6687586`;

  // Supabase에서 데이터 로드
  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/csm/contents`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();
      if (data.success && data.contents) {
        setContents(data.contents);
      } else {
        // 초기 데이터가 없으면 기본 데이터 설정
        const defaultContents: ContentItem[] = [
          // 법적 고지
          {
            id: '1',
            title: '개인정보 처리방침',
            content: `Sina View은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다. 본 개인정보 처리방침은 Sina View이 제공하는 서비스(이하 "서비스")를 이용하는 과정에서 이용자로부터 수집하는 개인정보의 항목, 수집 및 이용 목적, 보유 및 이용 기간, 파기 절차 및 방법 등에 관한 사항을 안내합니다.

1. 개인정보의 수집 항목 및 수집 방법
- 필수 항목: 이름, 이메일, 전화번호
- 선택 항목: 주소, 생년월일

2. 개인정보의 수집 및 이용 목적
- 서비스 제공 및 계약의 이행
- 회원 관리 및 본인 확인
- 마케팅 및 광고 활용

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지
- 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관`,
            category: '개인정보',
            type: 'legal',
            status: 'active',
            createdAt: '2024-01-01',
            updatedAt: '2024-12-18',
            lastModifiedBy: '관리자',
            changeHistory: [
              {
                timestamp: '2024-12-18 14:30',
                editor: '관리자',
                action: 'modified',
                changes: '개인정보 수집 항목 추가'
              },
              {
                timestamp: '2024-01-01 10:00',
                editor: '관리자',
                action: 'created',
                changes: '최초 작성'
              }
            ],
            tags: ['개인정보', '법적', '필수']
          }
        ];
        setContents(defaultContents);
        // 초기 데이터 저장
        saveToSupabase(defaultContents);
      }
    } catch (error) {
      console.error('컨텐츠 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase에 저장
  const saveToSupabase = async (contentsToSave: ContentItem[]) => {
    try {
      const response = await fetch(`${API_BASE}/csm/contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ contents: contentsToSave })
      });
      const data = await response.json();
      if (!data.success) {
        console.error('저장 실패:', data.error);
      }
    } catch (error) {
      console.error('Supabase 저장 에러:', error);
    }
  };

  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: '전체' },
    { value: '개인정보', label: '개인정보' },
    { value: '약관', label: '약관' },
    { value: '저작권', label: '저작권' },
    { value: '운영정책', label: '운영정책' },
    { value: '보안', label: '보안' },
    { value: '비자/서류', label: '비자/서류' },
    { value: '교육', label: '교육' },
    { value: '쇼핑', label: '쇼핑' },
    { value: '기타', label: '기타' }
  ];

  const handleCreateContent = (formData: Partial<ContentItem>) => {
    const newContent: ContentItem = {
      id: Date.now().toString(),
      title: formData.title || '',
      content: formData.content || '',
      category: formData.category || '기타',
      type: formData.type || 'article',
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      lastModifiedBy: '관리자',
      changeHistory: [
        {
          timestamp: new Date().toLocaleString('ko-KR'),
          editor: '관리자',
          action: 'created',
          changes: '최초 작성'
        }
      ],
      imageUrl: formData.imageUrl,
      imageFile: formData.imageFile,
      fileUrl: formData.fileUrl,
      fileName: formData.fileName,
      attachedFile: formData.attachedFile,
      tags: formData.tags
    };
    setContents(prev => [newContent, ...prev]);
    setIsCreateModalOpen(false);
    saveToSupabase([newContent, ...prev]);
  };

  const handleUpdateContent = (id: string, updates: Partial<ContentItem>) => {
    setContents(prev => {
      const updatedContents = prev.map(content => {
        if (content.id === id) {
          const changes: string[] = [];
          if (updates.title && updates.title !== content.title) changes.push('제목 수정');
          if (updates.content && updates.content !== content.content) changes.push('내용 수정');
          if (updates.imageUrl || updates.imageFile) changes.push('이미지 업데이트');
          if (updates.fileUrl || updates.attachedFile) changes.push('파일 업데이트');
          
          const newHistory: ChangeHistoryItem = {
            timestamp: new Date().toLocaleString('ko-KR'),
            editor: '관리자',
            action: updates.imageFile || updates.imageUrl ? 'image_uploaded' : 
                    updates.attachedFile || updates.fileUrl ? 'file_attached' : 'modified',
            changes: changes.join(', ') || '내용 수정됨'
          };
          return {
            ...content,
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0],
            lastModifiedBy: '관리자',
            changeHistory: [newHistory, ...content.changeHistory]
          };
        }
        return content;
      });
      
      // Supabase에 저장
      saveToSupabase(updatedContents);
      
      return updatedContents;
    });
    setIsEditModalOpen(false);
    setSelectedContent(null);
  };

  const handleDeleteContent = (id: string) => {
    if (confirm('이 콘텐츠를 삭제하시겠습니까?')) {
      setContents(prev => {
        const filteredContents = prev.filter(content => content.id !== id);
        
        // Supabase에 저장
        saveToSupabase(filteredContents);
        
        return filteredContents;
      });
    }
  };

  const handleStatusChange = (id: string, status: 'active' | 'archived' | 'draft') => {
    handleUpdateContent(id, { status });
  };

  const filteredContents = contents.filter(content => {
    const matchesTab = selectedTab === 'legal' 
      ? content.type === 'legal' || content.type === 'policy'
      : content.type === 'article' || content.type === 'guide';
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={onBack}
                variant="ghost" 
                size="sm"
                className="flex items-center space-x-2 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>메인으로</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-8 h-8" />
                  <span>CSM - 콘텐츠 시스템 관리</span>
                </h1>
                <div className="text-sm text-white/90 mt-1">
                  Content System Management - Sina View 통합 콘텐츠 관리 시스템
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                총 {contents.length}개 콘텐츠
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                {contents.filter(c => c.status === 'active').length}개 활성
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="legal" className="flex items-center space-x-2">
              <Scale className="w-4 h-4" />
              <span>법적 고지 & 정책</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>일반 콘텐츠</span>
            </TabsTrigger>
          </TabsList>

          {/* 법적 고지 & 정책 탭 */}
          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    <span>법적 고지 & 정책 문서 관리</span>
                  </CardTitle>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 문서 작성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="제목 또는 내용으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.filter(c => ['all', '개인정보', '약관', '저작권', '운영정책', '보안'].includes(c.value)).map(cat => (
                      <Button
                        key={cat.value}
                        variant={filterCategory === cat.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCategory(cat.value)}
                        className={filterCategory === cat.value ? 'bg-blue-600' : ''}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content List */}
                <ContentList 
                  contents={filteredContents}
                  onEdit={(content) => {
                    setSelectedContent(content);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={handleDeleteContent}
                  onStatusChange={handleStatusChange}
                  onViewHistory={(content) => {
                    setSelectedContent(content);
                    setIsHistoryModalOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 일반 콘텐츠 탭 */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span>일반 콘텐츠 관리</span>
                  </CardTitle>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 콘텐츠 작성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="제목 또는 내용으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                      <Button
                        key={cat.value}
                        variant={filterCategory === cat.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCategory(cat.value)}
                        className={filterCategory === cat.value ? 'bg-green-600' : ''}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content List */}
                <ContentList 
                  contents={filteredContents}
                  onEdit={(content) => {
                    setSelectedContent(content);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={handleDeleteContent}
                  onStatusChange={handleStatusChange}
                  onViewHistory={(content) => {
                    setSelectedContent(content);
                    setIsHistoryModalOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 콘텐츠 작성</DialogTitle>
            <DialogDescription>
              새로운 콘텐츠를 작성합니다.
            </DialogDescription>
          </DialogHeader>
          <ContentForm 
            onSubmit={handleCreateContent} 
            categories={categories}
            isLegal={selectedTab === 'legal'}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {selectedContent && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>콘텐츠 수정</DialogTitle>
              <DialogDescription>
                콘텐츠를 수정합니다. 사진과 파일을 다시 업로드할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            <ContentForm 
              onSubmit={(data) => handleUpdateContent(selectedContent.id, data)} 
              categories={categories}
              initialData={selectedContent}
              isLegal={selectedContent.type === 'legal' || selectedContent.type === 'policy'}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* History Modal */}
      {selectedContent && (
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>변경 이력</DialogTitle>
              <DialogDescription>
                {selectedContent.title}의 변경 이력입니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedContent.changeHistory.map((history, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{history.editor}</span>
                    <Badge className={
                      history.action === 'created' ? 'bg-green-100 text-green-800' :
                      history.action === 'modified' ? 'bg-blue-100 text-blue-800' :
                      history.action === 'image_uploaded' ? 'bg-purple-100 text-purple-800' :
                      history.action === 'file_attached' ? 'bg-orange-100 text-orange-800' :
                      history.action === 'deleted' ? 'bg-red-100 text-red-800' :
                      'bg-indigo-100 text-indigo-800'
                    }>
                      {history.action === 'created' ? '생성' :
                       history.action === 'modified' ? '수정' :
                       history.action === 'image_uploaded' ? '이미지 업로드' :
                       history.action === 'file_attached' ? '파일 첨부' :
                       history.action === 'deleted' ? '삭제' : '복원'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{history.timestamp}</p>
                  <p className="text-sm text-gray-700 mt-1">{history.changes}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ContentList({ 
  contents, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onViewHistory 
}: {
  contents: ContentItem[];
  onEdit: (content: ContentItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'active' | 'archived' | 'draft') => void;
  onViewHistory: (content: ContentItem) => void;
}) {
  return (
    <div className="space-y-4">
      {contents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          콘텐츠가 없습니다. 새 콘텐츠를 작성해보세요.
        </div>
      ) : (
        contents.map((content) => (
          <Card key={content.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                    <Badge className={
                      content.status === 'active' ? 'bg-green-100 text-green-800' :
                      content.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {content.status === 'active' ? '활성' : content.status === 'draft' ? '초안' : '보관됨'}
                    </Badge>
                    <Badge variant="outline">{content.category}</Badge>
                    {content.type === 'legal' && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Scale className="w-3 h-3 mr-1" />
                        법적문서
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>작성일: {content.createdAt}</span>
                    <span>최종 수정: {content.updatedAt}</span>
                    <span>수정자: {content.lastModifiedBy}</span>
                    {content.changeHistory.length > 0 && (
                      <button
                        onClick={() => onViewHistory(content)}
                        className="flex items-center space-x-1 text-blue-600 hover:underline"
                      >
                        <History className="w-3 h-3" />
                        <span>변경 이력 ({content.changeHistory.length})</span>
                      </button>
                    )}
                  </div>
                  {(content.imageUrl || content.fileUrl || content.tags) && (
                    <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                      {content.imageUrl && (
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          이미지
                        </Badge>
                      )}
                      {content.fileUrl && (
                        <Badge variant="outline" className="text-xs">
                          <File className="w-3 h-3 mr-1" />
                          {content.fileName || '파일'}
                        </Badge>
                      )}
                      {content.tags && content.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-purple-50">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(content)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(content.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                  <select
                    value={content.status}
                    onChange={(e) => onStatusChange(content.id, e.target.value as any)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="draft">초안</option>
                    <option value="active">활성</option>
                    <option value="archived">보관</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function ContentForm({ 
  onSubmit, 
  categories,
  initialData,
  isLegal,
  onCancel
}: { 
  onSubmit: (data: any) => void;
  categories: Array<{value: string; label: string}>;
  initialData?: ContentItem;
  isLegal: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || (isLegal ? '개인정보' : '기타'),
    type: initialData?.type || (isLegal ? 'legal' : 'article'),
    imageUrl: initialData?.imageUrl || '',
    imageFile: undefined as File | undefined,
    fileUrl: initialData?.fileUrl || '',
    fileName: initialData?.fileName || '',
    attachedFile: undefined as File | undefined,
    tags: initialData?.tags || []
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        attachedFile: file,
        fileName: file.name
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '', imageFile: undefined }));
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, fileUrl: '', fileName: '', attachedFile: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If image file is uploaded, create a blob URL for preview
    let finalImageUrl = formData.imageUrl;
    if (formData.imageFile) {
      finalImageUrl = URL.createObjectURL(formData.imageFile);
    }

    // If file is uploaded, create a blob URL
    let finalFileUrl = formData.fileUrl;
    if (formData.attachedFile) {
      finalFileUrl = URL.createObjectURL(formData.attachedFile);
    }

    onSubmit({
      ...formData,
      imageUrl: finalImageUrl,
      fileUrl: finalFileUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>제목 *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="예: 개인정보 처리방침"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>카테고리 *</Label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            required
          >
            {categories.filter(c => c.value !== 'all').map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>유형 *</Label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full border rounded px-3 py-2"
            required
          >
            {isLegal ? (
              <>
                <option value="legal">법적 문서</option>
                <option value="policy">정책</option>
              </>
            ) : (
              <>
                <option value="article">기사</option>
                <option value="guide">가이드</option>
              </>
            )}
          </select>
        </div>
      </div>
      
      <div>
        <Label>내용 *</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="콘텐츠 내용을 입력하세요..."
          rows={15}
          required
          className="font-mono text-sm"
        />
      </div>
      
      <div>
        <Label>태그 (쉼표로 구분)</Label>
        <Input
          value={formData.tags.join(', ')}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
          }))}
          placeholder="예: 비자, 신청, 가이드"
        />
      </div>

      {/* Image Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <Label className="flex items-center space-x-2 mb-2">
          <Camera className="w-4 h-4" />
          <span>이미지 업로드</span>
        </Label>
        
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded" />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-white"
                onClick={() => imageInputRef.current?.click()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                재업로드
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-white"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">또는</p>
            <Input
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                setImagePreview(e.target.value);
              }}
              placeholder="이미지 URL 입력 (https://...)"
              className="mt-2"
            />
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <Label className="flex items-center space-x-2 mb-2">
          <Paperclip className="w-4 h-4" />
          <span>파일 첨부</span>
        </Label>
        
        {formData.fileName || formData.fileUrl ? (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <div className="flex items-center space-x-2">
              <File className="w-5 h-5 text-blue-600" />
              <span className="text-sm">{formData.fileName || '첨부된 파일'}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                재업로드
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">또는</p>
            <Input
              value={formData.fileUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
              placeholder="파일 URL 입력 (https://...)"
              className="mt-2"
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {initialData ? '수정 완료' : '생성'}
        </Button>
      </div>
    </form>
  );
}