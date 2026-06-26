import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, Eye, FileText, Image as ImageIcon, File, X, Check, History, Download, Scale, ShieldCheck, Camera, Paperclip, RefreshCw, MessageSquare, Pin, Bell, Users, Crown, Star } from 'lucide-react@0.487.0';
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

interface CommunityPost {
  id: string;
  badge: '필독' | '공지';
  badgeType: 'important' | 'notice';
  title: string;
  content: string;
  author: string;
  authorBadge: 'S' | 'M';
  status: 'active' | 'draft';
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  tier: 'free' | 'paid' | 'vip';
  businessName?: string;       // 업체명 (유료/VIP)
  businessCategory?: string;   // 카테고리
  businessImage?: string;      // 사진 URL
  businessDescription?: string;// 소개글
  businessFeatures?: string[]; // 주요 서비스
  businessAddress?: string;
  businessPhone?: string;
  businessHours?: string;
  startDate: string;           // 가입일
  expireDate?: string;         // 유료/VIP 만료일
  status: 'active' | 'expired' | 'suspended';
}

export function CSMPage({ onBack }: CSMPageProps) {
  const [selectedTab, setSelectedTab] = useState('legal');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 커뮤니티 게시물 (필독/공지) 관리 상태

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('csm_community_posts');
      return saved ? JSON.parse(saved) : [
        { id: 'cp1', badge: '필독', badgeType: 'important', title: '🚨 2025년 중국 생활 필수 앱 총정리 (최신판)', content: '안녕하세요, 중국생활 커뮤니티입니다. 2025년 필수 앱을 정리했습니다.', author: '중국생활관리자', authorBadge: 'S', status: 'active', order: 1, createdAt: '2025.12.24', updatedAt: '2025.12.24' },
        { id: 'cp2', badge: '필독', badgeType: 'important', title: '📅 2025년 중국 공휴일 & 연휴 일정 정리', content: '2025년 중국 법정 공휴일 및 연휴 일정을 안내드립니다.', author: '중국생활관리자', authorBadge: 'S', status: 'active', order: 2, createdAt: '2025.12.23', updatedAt: '2025.12.23' },
        { id: 'cp3', badge: '공지', badgeType: 'notice', title: '중국 택배 수령 방법 총정리 (스마트함, 집앞배달)', content: '중국 택배 수령 방법을 안내드립니다.', author: '매니저', authorBadge: 'M', status: 'active', order: 3, createdAt: '2025.12.20', updatedAt: '2025.12.20' },
        { id: 'cp4', badge: '공지', badgeType: 'notice', title: '중국 병원 이용 방법 & 한국어 가능 병원 리스트', content: '중국에서 병원 이용하는 방법을 안내드립니다.', author: '매니저', authorBadge: 'M', status: 'active', order: 4, createdAt: '2025.12.18', updatedAt: '2025.12.18' },
      ];
    } catch { return []; }
  });
  const [isCpCreateOpen, setIsCpCreateOpen] = useState(false);
  const [editingCp, setEditingCp] = useState<CommunityPost | null>(null);
  const [cpForm, setCpForm] = useState({
    badge: '공지' as '필독' | '공지',
    title: '',
    content: '',
    author: '매니저',
    authorBadge: 'M' as 'S' | 'M',
    status: 'active' as 'active' | 'draft',
  });

  const saveCommunityPosts = (posts: CommunityPost[]) => {
    localStorage.setItem('csm_community_posts', JSON.stringify(posts));
    setCommunityPosts(posts);
  };

  const handleCpCreate = () => {
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      badge: cpForm.badge,
      badgeType: cpForm.badge === '필독' ? 'important' : 'notice',
      title: cpForm.title,
      content: cpForm.content,
      author: cpForm.author,
      authorBadge: cpForm.authorBadge,
      status: cpForm.status,
      order: communityPosts.length + 1,
      createdAt: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
      updatedAt: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
    };
    saveCommunityPosts([...communityPosts, newPost]);
    setIsCpCreateOpen(false);
    setCpForm({ badge: '공지', title: '', content: '', author: '매니저', authorBadge: 'M', status: 'active' });
  };

  const handleCpUpdate = () => {
    if (!editingCp) return;
    const updated = communityPosts.map(p => p.id === editingCp.id ? {
      ...editingCp,
      badge: cpForm.badge,
      badgeType: cpForm.badge === '필독' ? 'important' as const : 'notice' as const,
      title: cpForm.title,
      content: cpForm.content,
      author: cpForm.author,
      authorBadge: cpForm.authorBadge,
      status: cpForm.status,
      updatedAt: new Date().toLocaleDateString('ko-KR'),
    } : p);
    saveCommunityPosts(updated);
    setEditingCp(null);
  };

  const handleCpDelete = (id: string) => {
    if (confirm('이 게시물을 삭제하시겠습니까?')) {
      saveCommunityPosts(communityPosts.filter(p => p.id !== id));
    }
  };

  const handleCpMoveUp = (id: string) => {
    const idx = communityPosts.findIndex(p => p.id === id);
    if (idx <= 0) return;
    const newPosts = [...communityPosts];
    [newPosts[idx - 1], newPosts[idx]] = [newPosts[idx], newPosts[idx - 1]];
    saveCommunityPosts(newPosts.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const handleCpMoveDown = (id: string) => {
    const idx = communityPosts.findIndex(p => p.id === id);
    if (idx >= communityPosts.length - 1) return;
    const newPosts = [...communityPosts];
    [newPosts[idx], newPosts[idx + 1]] = [newPosts[idx + 1], newPosts[idx]];
    saveCommunityPosts(newPosts.map((p, i) => ({ ...p, order: i + 1 })));
  };

  // ===== 회원 관리 =====
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('csm_members');
      return saved ? JSON.parse(saved) : [
        {
          id: 'm1', username: 'kimchaina', name: '김차이나', phone: '+86-138-1234-5678',
          email: 'kim@example.com', region: '베이징', tier: 'vip',
          businessName: '베이징 한인병원', businessCategory: '병원',
          businessImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop',
          businessDescription: '한국어 진료 가능한 종합병원입니다.',
          businessFeatures: ['한국어 진료', '24시간 응급실', '종합검진'],
          businessAddress: '베이징 차오양구',
          businessPhone: '+86-10-1234-5678',
          businessHours: '월-토 09:00-18:00',
          startDate: '2024.01.15', expireDate: '2025.01.15', status: 'active',
        },
        {
          id: 'm2', username: 'shparkkim', name: '박상해', phone: '+86-138-2222-3333',
          email: 'park@example.com', region: '상하이', tier: 'paid',
          businessName: '상해 한국학교 인근 학원', businessCategory: '교육',
          businessImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
          businessDescription: 'TOPIK 준비반 운영, 1:1 한국어 수업',
          businessFeatures: ['1:1 수업', 'TOPIK 대비', '온라인 가능'],
          businessAddress: '상하이 푸동신구',
          businessPhone: '+86-21-9876-5432',
          businessHours: '평일 14:00-21:00',
          startDate: '2024.06.20', expireDate: '2025.06.20', status: 'active',
        },
        {
          id: 'm3', username: 'leefree', name: '이일반', phone: '+86-138-9999-0000',
          email: 'lee@example.com', region: '대련', tier: 'free',
          startDate: '2024.11.01', status: 'active',
        },
      ];
    } catch { return []; }
  });

  const saveMembers = (m: Member[]) => {
    localStorage.setItem('csm_members', JSON.stringify(m));
    setMembers(m);
  };

  const [memberFilter, setMemberFilter] = useState<'all' | 'free' | 'paid' | 'vip'>('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [memberFeaturesText, setMemberFeaturesText] = useState('');

  const filteredMembers = members.filter(m => {
    const matchTier = memberFilter === 'all' || m.tier === memberFilter;
    const search = memberSearch.toLowerCase();
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search) ||
      m.username.toLowerCase().includes(search) ||
      (m.businessName || '').toLowerCase().includes(search) ||
      m.phone.includes(search);
    return matchTier && matchSearch;
  });

  const memberStats = {
    total: members.length,
    free: members.filter(m => m.tier === 'free').length,
    paid: members.filter(m => m.tier === 'paid').length,
    vip: members.filter(m => m.tier === 'vip').length,
  };

  const handleMemberSave = () => {
    if (!editingMember) return;
    const features = memberFeaturesText.split(',').map(s => s.trim()).filter(Boolean);
    const updated: Member = { ...editingMember, businessFeatures: features };
    if (members.find(m => m.id === editingMember.id)) {
      saveMembers(members.map(m => m.id === editingMember.id ? updated : m));
    } else {
      saveMembers([...members, updated]);
    }
    setIsMemberDialogOpen(false);
    setEditingMember(null);
  };

  const handleMemberTierChange = (id: string, tier: 'free' | 'paid' | 'vip') => {
    saveMembers(members.map(m => m.id === id ? { ...m, tier } : m));
  };

  const handleMemberDelete = (id: string) => {
    if (confirm('이 회원을 삭제하시겠습니까?')) {
      saveMembers(members.filter(m => m.id !== id));
    }
  };

  // ===== 뷰·기업 관리 =====
  interface ViewPost {
    id: string;
    type: '일상' | '여행' | '생활';
    title: string;
    author: string;
    date: string;
    image: string;
    comments: number;
    views: number;
    likes: number;
    status: 'active' | 'draft';
  }

  interface BizItem {
    id: string;
    name: string;
    slogan: string;
    category: string;
    region: string;
    description: string;
    image: string;
    wechat?: string;
    tiktok?: string;
    xiaohongshu?: string;
    website?: string;
    videoUrl?: string;
    tags: string;
    status: 'active' | 'draft';
  }

  const [viewPosts, setViewPosts] = useState<ViewPost[]>(() => {
    try {
      const saved = localStorage.getItem('csm_view_posts');
      return saved ? JSON.parse(saved) : [
        { id: 'v1', type: '일상', title: '베이징 왕징 가을 단풍 산책 — 주말 나들이 후기', author: '왕징댁', date: '6월 20일', image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&h=300&fit=crop', comments: 31, views: 1842, likes: 114, status: 'active' },
        { id: 'v2', type: '여행', title: '상하이 → 계림 기차 여행 3박 4일 완전 정복', author: '푸동여행자', date: '6월 19일', image: 'https://images.unsplash.com/photo-1537495329792-41ae41ad3bf0?w=400&h=300&fit=crop', comments: 47, views: 3241, likes: 228, status: 'active' },
        { id: 'v3', type: '생활', title: '중국에서 아이 학교 보내기 — 한국학교 vs 현지학교', author: '베이징학부모', date: '6월 18일', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop', comments: 63, views: 4512, likes: 301, status: 'active' },
        { id: 'v4', type: '여행', title: '윈난성 리장 고성 — 한인 부부 자유여행 사진 일기', author: '리장커플', date: '6월 17일', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=400&h=300&fit=crop', comments: 28, views: 2187, likes: 193, status: 'active' },
      ];
    } catch { return []; }
  });

  const [bizItems, setBizItems] = useState<BizItem[]>(() => {
    try {
      const saved = localStorage.getItem('csm_biz_items');
      return saved ? JSON.parse(saved) : [
        { id: 'b1', name: 'BRIDGE CO.', slogan: '중국과 한국을 잇는 다리', category: '무역·컨설팅', region: '베이징', description: '한중 무역 및 현지 비즈니스 컨설팅 전문.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', wechat: 'bridgecokr', tiktok: '@bridgeco_china', xiaohongshu: 'bridgeco', website: '', videoUrl: '', tags: '무역,법인설립,컨설팅', status: 'active' },
        { id: 'b2', name: 'SEOUL KITCHEN', slogan: '베이징 한가운데 서울의 맛', category: '요식업', region: '베이징 왕징', description: '왕징 한인타운 정통 한식당.', image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&h=400&fit=crop', wechat: 'seoulkitchen_bj', tiktok: '', xiaohongshu: 'seoulkitchen', website: '', videoUrl: '', tags: '한식당,왕징,배달가능', status: 'active' },
      ];
    } catch { return []; }
  });

  const [mediaTab, setMediaTab] = useState<'view' | 'biz'>('view');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBizDialogOpen, setIsBizDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<ViewPost | null>(null);
  const [editingBiz, setEditingBiz] = useState<BizItem | null>(null);

  const saveViewPosts = (posts: ViewPost[]) => { localStorage.setItem('csm_view_posts', JSON.stringify(posts)); setViewPosts(posts); };
  const saveBizItems = (items: BizItem[]) => { localStorage.setItem('csm_biz_items', JSON.stringify(items)); setBizItems(items); };

  const handleViewDelete = (id: string) => { if (confirm('삭제하시겠습니까?')) saveViewPosts(viewPosts.filter(p => p.id !== id)); };
  const handleBizDelete = (id: string) => { if (confirm('삭제하시겠습니까?')) saveBizItems(bizItems.filter(b => b.id !== id)); };

  const handleViewSave = () => {
    if (!editingView) return;
    if (viewPosts.find(p => p.id === editingView.id)) {
      saveViewPosts(viewPosts.map(p => p.id === editingView.id ? editingView : p));
    } else {
      saveViewPosts([...viewPosts, editingView]);
    }
    setIsViewDialogOpen(false);
    setEditingView(null);
  };

  const handleBizSave = () => {
    if (!editingBiz) return;
    if (bizItems.find(b => b.id === editingBiz.id)) {
      saveBizItems(bizItems.map(b => b.id === editingBiz.id ? editingBiz : b));
    } else {
      saveBizItems([...bizItems, editingBiz]);
    }
    setIsBizDialogOpen(false);
    setEditingBiz(null);
  };

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
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="legal" className="flex items-center space-x-2">
              <Scale className="w-4 h-4" />
              <span>법적 고지</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>콘텐츠</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Pin className="w-4 h-4" />
              <span>필독·공지</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>회원 관리</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>뷰·기업</span>
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

          {/* 필독 & 공지 관리 탭 */}
          <TabsContent value="community" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Pin className="w-5 h-5 text-purple-600" />
                    <span>필독 & 공지 게시물 관리</span>
                  </CardTitle>
                  <Button
                    onClick={() => {
                      setCpForm({ badge: '공지', title: '', content: '', author: '매니저', authorBadge: 'M', status: 'active' });
                      setIsCpCreateOpen(true);
                      setEditingCp(null);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 게시물 작성
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  커뮤니티 게시판 상단에 고정 표시되는 필독/공지 게시물을 관리합니다. 순서를 변경할 수 있습니다.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communityPosts.map((post, idx) => (
                    <div
                      key={post.id}
                      className={`border rounded-lg p-4 flex items-start gap-3 ${post.status === 'draft' ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
                    >
                      {/* 순서 조절 */}
                      <div className="flex flex-col gap-1 mt-1">
                        <button
                          onClick={() => handleCpMoveUp(post.id)}
                          disabled={idx === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                          title="위로"
                        >▲</button>
                        <span className="text-xs text-gray-400 text-center">{idx + 1}</span>
                        <button
                          onClick={() => handleCpMoveDown(post.id)}
                          disabled={idx === communityPosts.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                          title="아래로"
                        >▼</button>
                      </div>

                      {/* 뱃지 */}
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          post.badgeType === 'important'
                            ? 'bg-red-50 text-red-500 border border-red-200'
                            : 'bg-blue-50 text-blue-500 border border-blue-200'
                        }`}>
                          {post.badge}
                        </span>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{post.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{post.content}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>작성자: <strong>{post.author}</strong> [{post.authorBadge}]</span>
                          <span>작성일: {post.createdAt}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {post.status === 'active' ? '활성' : '초안'}
                          </span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCp(post);
                            setCpForm({
                              badge: post.badge,
                              title: post.title,
                              content: post.content,
                              author: post.author,
                              authorBadge: post.authorBadge,
                              status: post.status,
                            });
                            setIsCpCreateOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const updated = communityPosts.map(p =>
                              p.id === post.id
                                ? { ...p, status: (p.status === 'active' ? 'draft' : 'active') as 'active' | 'draft' }
                                : p
                            );
                            saveCommunityPosts(updated);
                          }}
                          className={post.status === 'active' ? 'text-orange-600 border-orange-300' : 'text-green-600 border-green-300'}
                        >
                          {post.status === 'active' ? '숨김' : '공개'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => handleCpDelete(post.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {communityPosts.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Pin className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>등록된 필독/공지 게시물이 없습니다.</p>
                      <p className="text-sm mt-1">새 게시물을 작성해 주세요.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 회원 등급 관리 탭 */}
          <TabsContent value="members" className="space-y-6">
            {/* 통계 */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="text-xs text-gray-500">전체 회원</div>
                <div className="text-xl font-bold text-gray-900 mt-1">{memberStats.total}</div>
              </Card>
              <Card className="p-3 bg-gray-50">
                <div className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> 일반</div>
                <div className="text-xl font-bold text-gray-700 mt-1">{memberStats.free}</div>
              </Card>
              <Card className="p-3 bg-blue-50">
                <div className="text-xs text-blue-600 flex items-center gap-1"><Star className="w-3 h-3" /> 유료</div>
                <div className="text-xl font-bold text-blue-700 mt-1">{memberStats.paid}</div>
              </Card>
              <Card className="p-3 bg-yellow-50">
                <div className="text-xs text-yellow-700 flex items-center gap-1"><Crown className="w-3 h-3" /> VIP</div>
                <div className="text-xl font-bold text-yellow-800 mt-1">{memberStats.vip}</div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>회원 등급 관리</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="이름·아이디·업체명 검색"
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      className="w-56 text-sm"
                    />
                    <Button
                      onClick={() => {
                        setEditingMember({
                          id: Date.now().toString(),
                          username: '', name: '', phone: '', email: '', region: '베이징',
                          tier: 'free', startDate: new Date().toLocaleDateString('ko-KR'),
                          status: 'active',
                        });
                        setMemberFeaturesText('');
                        setIsMemberDialogOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      회원 추가
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {([
                    { value: 'all', label: '전체' },
                    { value: 'free', label: '일반' },
                    { value: 'paid', label: '유료' },
                    { value: 'vip', label: 'VIP' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMemberFilter(opt.value)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        memberFilter === opt.value
                          ? 'bg-purple-600 text-white font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredMembers.map(m => (
                    <div
                      key={m.id}
                      className={`border rounded-lg p-3 flex items-center gap-3 ${
                        m.tier === 'vip' ? 'bg-yellow-50 border-yellow-200' :
                        m.tier === 'paid' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      {/* 등급 뱃지 */}
                      <div className="shrink-0">
                        {m.tier === 'vip' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded"><Crown className="w-3 h-3" />VIP</span>}
                        {m.tier === 'paid' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold rounded"><Star className="w-3 h-3" />유료</span>}
                        {m.tier === 'free' && <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">일반</span>}
                      </div>

                      {/* 회원 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{m.name}</span>
                          <span className="text-xs text-gray-400">@{m.username}</span>
                          {m.businessName && (
                            <span className="text-xs text-purple-600 font-medium">· {m.businessName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>📍 {m.region}</span>
                          <span>📞 {m.phone}</span>
                          {m.expireDate && <span>만료: {m.expireDate}</span>}
                        </div>
                      </div>

                      {/* 액션 */}
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={m.tier}
                          onChange={e => handleMemberTierChange(m.id, e.target.value as any)}
                          className="text-xs border rounded px-2 py-1 bg-white"
                        >
                          <option value="free">일반</option>
                          <option value="paid">유료</option>
                          <option value="vip">VIP</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMember(m);
                            setMemberFeaturesText((m.businessFeatures || []).join(', '));
                            setIsMemberDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleMemberDelete(m.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredMembers.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>회원이 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* 뷰·기업 관리 탭 */}
          <TabsContent value="media" className="space-y-6">

            {/* 내부 탭 토글 */}
            <div className="flex gap-2">
              <button onClick={() => setMediaTab('view')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mediaTab === 'view' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                📸 뷰(VIEW) 게시물
              </button>
              <button onClick={() => setMediaTab('biz')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mediaTab === 'biz' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                🏢 재중 한인 기업
              </button>
            </div>

            {/* 뷰 게시물 관리 */}
            {mediaTab === 'view' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">뷰(VIEW) 게시물 관리</CardTitle>
                    <Button size="sm" onClick={() => { setEditingView({ id: Date.now().toString(), type: '일상', title: '', author: '', date: new Date().toLocaleDateString('ko-KR', {month:'long', day:'numeric'}), image: '', comments: 0, views: 0, likes: 0, status: 'active' }); setIsViewDialogOpen(true); }} className="bg-gray-900 hover:bg-gray-700">
                      <Plus className="w-4 h-4 mr-1" /> 새 게시물
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {viewPosts.map(post => (
                      <div key={post.id} className={`flex items-center gap-3 border rounded-lg p-3 ${post.status === 'draft' ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                        <img src={post.image} alt={post.title} className="w-16 h-12 object-cover rounded shrink-0" onError={e => (e.currentTarget.style.display='none')} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${post.type === '여행' ? 'bg-blue-100 text-blue-600' : post.type === '생활' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{post.type}</span>
                            <span className="text-sm font-medium text-gray-900 truncate">{post.title}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{post.author} · {post.date}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => { setEditingView(post); setIsViewDialogOpen(true); }}><Edit className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => saveViewPosts(viewPosts.map(p => p.id === post.id ? { ...p, status: p.status === 'active' ? 'draft' : 'active' } : p))} className={post.status === 'active' ? 'text-orange-500' : 'text-green-500'}>{post.status === 'active' ? '숨김' : '공개'}</Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => handleViewDelete(post.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
                    {viewPosts.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">게시물이 없습니다.</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 기업 관리 */}
            {mediaTab === 'biz' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">재중 한인 기업 관리</CardTitle>
                    <Button size="sm" onClick={() => { setEditingBiz({ id: Date.now().toString(), name: '', slogan: '', category: '기타', region: '베이징', description: '', image: '', wechat: '', tiktok: '', xiaohongshu: '', website: '', videoUrl: '', tags: '', status: 'active' }); setIsBizDialogOpen(true); }} className="bg-gray-900 hover:bg-gray-700">
                      <Plus className="w-4 h-4 mr-1" /> 기업 등록
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bizItems.map(biz => (
                      <div key={biz.id} className={`flex items-center gap-3 border rounded-lg p-3 ${biz.status === 'draft' ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                        <img src={biz.image} alt={biz.name} className="w-16 h-12 object-cover rounded shrink-0" onError={e => (e.currentTarget.style.display='none')} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{biz.category}</span>
                            <span className="text-sm font-bold text-gray-900 truncate">{biz.name}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{biz.slogan} · {biz.region}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => { setEditingBiz(biz); setIsBizDialogOpen(true); }}><Edit className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => saveBizItems(bizItems.map(b => b.id === biz.id ? { ...b, status: b.status === 'active' ? 'draft' : 'active' } : b))} className={biz.status === 'active' ? 'text-orange-500' : 'text-green-500'}>{biz.status === 'active' ? '숨김' : '공개'}</Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => handleBizDelete(biz.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
                    {bizItems.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">등록된 기업이 없습니다.</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 뷰 게시물 편집 다이얼로그 */}
        <Dialog open={isViewDialogOpen} onOpenChange={open => { setIsViewDialogOpen(open); if (!open) setEditingView(null); }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>뷰(VIEW) 게시물 {viewPosts.find(p => p.id === editingView?.id) ? '수정' : '추가'}</DialogTitle>
            </DialogHeader>
            {editingView && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>유형</Label>
                    <select value={editingView.type} onChange={e => setEditingView({...editingView, type: e.target.value as any})} className="w-full border rounded px-3 py-2 mt-1 text-sm">
                      <option value="일상">일상</option>
                      <option value="여행">여행</option>
                      <option value="생활">생활</option>
                    </select>
                  </div>
                  <div>
                    <Label>상태</Label>
                    <select value={editingView.status} onChange={e => setEditingView({...editingView, status: e.target.value as any})} className="w-full border rounded px-3 py-2 mt-1 text-sm">
                      <option value="active">공개</option>
                      <option value="draft">숨김</option>
                    </select>
                  </div>
                </div>
                <div><Label>제목</Label><Input value={editingView.title} onChange={e => setEditingView({...editingView, title: e.target.value})} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>작성자</Label><Input value={editingView.author} onChange={e => setEditingView({...editingView, author: e.target.value})} className="mt-1" /></div>
                  <div><Label>날짜</Label><Input value={editingView.date} onChange={e => setEditingView({...editingView, date: e.target.value})} placeholder="6월 20일" className="mt-1" /></div>
                </div>
                <div>
                  <Label>이미지 URL</Label>
                  <Input value={editingView.image} onChange={e => setEditingView({...editingView, image: e.target.value})} placeholder="https://..." className="mt-1" />
                  {editingView.image && <img src={editingView.image} className="mt-2 w-full h-28 object-cover rounded border" />}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { setIsViewDialogOpen(false); setEditingView(null); }}>취소</Button>
                  <Button onClick={handleViewSave} className="bg-gray-900 hover:bg-gray-700" disabled={!editingView.title}><Save className="w-4 h-4 mr-1" />저장</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 기업 편집 다이얼로그 */}
        <Dialog open={isBizDialogOpen} onOpenChange={open => { setIsBizDialogOpen(open); if (!open) setEditingBiz(null); }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>기업 {bizItems.find(b => b.id === editingBiz?.id) ? '수정' : '등록'}</DialogTitle>
            </DialogHeader>
            {editingBiz && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>기업명</Label><Input value={editingBiz.name} onChange={e => setEditingBiz({...editingBiz, name: e.target.value})} className="mt-1" /></div>
                  <div>
                    <Label>카테고리</Label>
                    <select value={editingBiz.category} onChange={e => setEditingBiz({...editingBiz, category: e.target.value})} className="w-full border rounded px-3 py-2 mt-1 text-sm">
                      {['무역·컨설팅','요식업','교육','의료·뷰티','IT','부동산','기타'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>슬로건</Label><Input value={editingBiz.slogan} onChange={e => setEditingBiz({...editingBiz, slogan: e.target.value})} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>지역</Label><Input value={editingBiz.region} onChange={e => setEditingBiz({...editingBiz, region: e.target.value})} className="mt-1" /></div>
                  <div>
                    <Label>상태</Label>
                    <select value={editingBiz.status} onChange={e => setEditingBiz({...editingBiz, status: e.target.value as any})} className="w-full border rounded px-3 py-2 mt-1 text-sm">
                      <option value="active">공개</option><option value="draft">숨김</option>
                    </select>
                  </div>
                </div>
                <div><Label>소개글</Label><textarea value={editingBiz.description} onChange={e => setEditingBiz({...editingBiz, description: e.target.value})} rows={3} className="w-full border rounded px-3 py-2 mt-1 text-sm resize-none" /></div>
                <div>
                  <Label>대표 이미지 URL</Label>
                  <Input value={editingBiz.image} onChange={e => setEditingBiz({...editingBiz, image: e.target.value})} placeholder="https://..." className="mt-1" />
                  {editingBiz.image && <img src={editingBiz.image} className="mt-2 w-full h-28 object-cover rounded border" />}
                </div>
                <div><Label>소개 동영상 URL (YouTube embed 등)</Label><Input value={editingBiz.videoUrl || ''} onChange={e => setEditingBiz({...editingBiz, videoUrl: e.target.value})} placeholder="https://youtube.com/embed/..." className="mt-1" /></div>
                <div>
                  <Label>SNS</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input value={editingBiz.wechat || ''} onChange={e => setEditingBiz({...editingBiz, wechat: e.target.value})} placeholder="WeChat ID" />
                    <Input value={editingBiz.tiktok || ''} onChange={e => setEditingBiz({...editingBiz, tiktok: e.target.value})} placeholder="TikTok @계정" />
                    <Input value={editingBiz.xiaohongshu || ''} onChange={e => setEditingBiz({...editingBiz, xiaohongshu: e.target.value})} placeholder="小红书 ID" />
                    <Input value={editingBiz.website || ''} onChange={e => setEditingBiz({...editingBiz, website: e.target.value})} placeholder="웹사이트 URL" />
                  </div>
                </div>
                <div><Label>태그 (쉼표로 구분)</Label><Input value={editingBiz.tags} onChange={e => setEditingBiz({...editingBiz, tags: e.target.value})} placeholder="무역,컨설팅,법인설립" className="mt-1" /></div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { setIsBizDialogOpen(false); setEditingBiz(null); }}>취소</Button>
                  <Button onClick={handleBizSave} className="bg-gray-900 hover:bg-gray-700" disabled={!editingBiz.name}><Save className="w-4 h-4 mr-1" />저장</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={isMemberDialogOpen} onOpenChange={(open) => { setIsMemberDialogOpen(open); if (!open) setEditingMember(null); }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingMember?.tier === 'vip' && <Crown className="w-5 h-5 text-yellow-500" />}
                {editingMember?.tier === 'paid' && <Star className="w-5 h-5 text-blue-500" />}
                {editingMember?.tier === 'free' && <Users className="w-5 h-5 text-gray-500" />}
                회원 정보 {members.find(m => m.id === editingMember?.id) ? '수정' : '추가'}
              </DialogTitle>
              <DialogDescription>
                유료/VIP 회원은 엘로우페이지 등에서 사진과 함께 상세 정보가 노출됩니다.
              </DialogDescription>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4 pt-2">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>아이디 *</Label>
                      <Input value={editingMember.username} onChange={e => setEditingMember({ ...editingMember, username: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>이름 *</Label>
                      <Input value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>전화번호</Label>
                      <Input value={editingMember.phone} onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>이메일</Label>
                      <Input value={editingMember.email} onChange={e => setEditingMember({ ...editingMember, email: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>지역</Label>
                      <select
                        value={editingMember.region}
                        onChange={e => setEditingMember({ ...editingMember, region: e.target.value })}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                      >
                        {['베이징', '상하이', '광저우', '심천', '대련', '톈진', '청두', '우한'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>등급 *</Label>
                      <select
                        value={editingMember.tier}
                        onChange={e => setEditingMember({ ...editingMember, tier: e.target.value as any })}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                      >
                        <option value="free">일반 회원</option>
                        <option value="paid">유료 회원</option>
                        <option value="vip">VIP 회원</option>
                      </select>
                    </div>
                    {(editingMember.tier === 'paid' || editingMember.tier === 'vip') && (
                      <div>
                        <Label>만료일</Label>
                        <Input
                          type="text"
                          placeholder="예: 2025.12.31"
                          value={editingMember.expireDate || ''}
                          onChange={e => setEditingMember({ ...editingMember, expireDate: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 업체 정보 (유료/VIP만) */}
                {(editingMember.tier === 'paid' || editingMember.tier === 'vip') && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 pb-1 border-b flex items-center gap-2">
                      🏢 업체 정보
                      <span className="text-xs text-purple-600 font-normal">(엘로우페이지에 노출됩니다)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>업체명</Label>
                        <Input value={editingMember.businessName || ''} onChange={e => setEditingMember({ ...editingMember, businessName: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label>카테고리</Label>
                        <select
                          value={editingMember.businessCategory || ''}
                          onChange={e => setEditingMember({ ...editingMember, businessCategory: e.target.value })}
                          className="w-full border rounded px-3 py-2 mt-1 text-sm"
                        >
                          <option value="">선택</option>
                          {['병원', '교육', '음식점', '서비스', '쇼핑', '부동산', '여행', '기타'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Label>업체 사진 URL</Label>
                        <Input
                          placeholder="https://..."
                          value={editingMember.businessImage || ''}
                          onChange={e => setEditingMember({ ...editingMember, businessImage: e.target.value })}
                          className="mt-1"
                        />
                        {editingMember.businessImage && (
                          <img src={editingMember.businessImage} alt="미리보기" className="mt-2 w-full h-32 object-cover rounded border" />
                        )}
                      </div>
                      <div className="col-span-2">
                        <Label>업체 소개</Label>
                        <textarea
                          value={editingMember.businessDescription || ''}
                          onChange={e => setEditingMember({ ...editingMember, businessDescription: e.target.value })}
                          rows={3}
                          className="w-full border rounded px-3 py-2 mt-1 text-sm resize-y"
                          placeholder="업체 소개 한두 문장"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>주요 서비스 (쉼표로 구분, 최대 4개)</Label>
                        <Input
                          placeholder="예: 한국어 진료, 24시간 응급실, 종합검진"
                          value={memberFeaturesText}
                          onChange={e => setMemberFeaturesText(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>업체 주소</Label>
                        <Input value={editingMember.businessAddress || ''} onChange={e => setEditingMember({ ...editingMember, businessAddress: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label>업체 전화</Label>
                        <Input value={editingMember.businessPhone || ''} onChange={e => setEditingMember({ ...editingMember, businessPhone: e.target.value })} className="mt-1" />
                      </div>
                      <div className="col-span-2">
                        <Label>운영 시간</Label>
                        <Input
                          placeholder="예: 월-금 09:00-18:00"
                          value={editingMember.businessHours || ''}
                          onChange={e => setEditingMember({ ...editingMember, businessHours: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { setIsMemberDialogOpen(false); setEditingMember(null); }}>
                    취소
                  </Button>
                  <Button
                    onClick={handleMemberSave}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!editingMember.username || !editingMember.name}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 커뮤니티 게시물 작성/수정 다이얼로그 */}
        <Dialog open={isCpCreateOpen} onOpenChange={(open) => { setIsCpCreateOpen(open); if (!open) setEditingCp(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-purple-600" />
                {editingCp ? '게시물 수정' : '새 필독/공지 게시물 작성'}
              </DialogTitle>
              <DialogDescription>
                커뮤니티 게시판 상단에 고정 표시될 필독 또는 공지 게시물을 {editingCp ? '수정' : '작성'}합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>게시물 유형 *</Label>
                  <select
                    value={cpForm.badge}
                    onChange={e => setCpForm(p => ({ ...p, badge: e.target.value as '필독' | '공지' }))}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="필독">🚨 필독</option>
                    <option value="공지">📢 공지</option>
                  </select>
                </div>
                <div>
                  <Label>상태</Label>
                  <select
                    value={cpForm.status}
                    onChange={e => setCpForm(p => ({ ...p, status: e.target.value as 'active' | 'draft' }))}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="active">활성 (공개)</option>
                    <option value="draft">초안 (숨김)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>제목 *</Label>
                <Input
                  value={cpForm.title}
                  onChange={e => setCpForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="게시물 제목을 입력하세요"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>내용 *</Label>
                <textarea
                  value={cpForm.content}
                  onChange={e => setCpForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="게시물 내용을 입력하세요..."
                  rows={10}
                  className="w-full border rounded px-3 py-2 mt-1 text-sm font-mono resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>작성자 이름</Label>
                  <Input
                    value={cpForm.author}
                    onChange={e => setCpForm(p => ({ ...p, author: e.target.value }))}
                    placeholder="작성자 이름"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>작성자 등급</Label>
                  <select
                    value={cpForm.authorBadge}
                    onChange={e => setCpForm(p => ({ ...p, authorBadge: e.target.value as 'S' | 'M' }))}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="S">S (스태프/운영자)</option>
                    <option value="M">M (매니저)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => { setIsCpCreateOpen(false); setEditingCp(null); }}>
                  취소
                </Button>
                <Button
                  onClick={editingCp ? handleCpUpdate : handleCpCreate}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!cpForm.title.trim() || !cpForm.content.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCp ? '수정 완료' : '게시물 생성'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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