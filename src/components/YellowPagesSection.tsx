import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Search, MapPin, Phone, Clock, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface YellowPagesSectionProps {
  category: string;
  onMoreClick?: () => void;
}

interface Business {
  name: string;
  category: string;
  address: string;
  chineseAddress: string;  // 중국어 상세 주소
  phone: string;
  rating: number;
  isOpen: boolean;
  description: string;
  features: string[];
  hours: string;
  imageUrl: string;
  videoUrl: string;
  reviews: number;
  tier?: 'free' | 'paid' | 'vip';  // 회원 등급 (CMS 연동)
  isMemberBusiness?: boolean;       // 회원 등록 업체 여부
}

export function YellowPagesSection({ category, onMoreClick }: YellowPagesSectionProps) {
  const [activeRegion, setActiveRegion] = useState('대련');
  const [activeSubcategory, setActiveSubcategory] = useState('전체');
  const [userRegion, setUserRegion] = useState('');
  const [hoveredBusiness, setHoveredBusiness] = useState<number | null>(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBusinessForDetail, setSelectedBusinessForDetail] = useState<Business | null>(null);

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
    { id: 'shenzhen', name: '심천', count: 680 },
    { id: 'shenyang', name: '심양', count: 340 },
    { id: 'yanji', name: '연길', count: 290 },
    { id: 'xian', name: '시안', count: 280 },
    { id: 'wuhan', name: '우한', count: 310 },
    { id: 'chengdu', name: '청두', count: 380 },
    { id: 'guangzhou', name: '광저우', count: 720 },
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

  const [showAllRegions, setShowAllRegions] = React.useState(false);

  const subcategories = [
    { id: 'all', name: '전체', count: 2450 },
    { id: 'hospital', name: '병원', count: 380 },
    { id: 'restaurant', name: '음식점', count: 650 },
    { id: 'education', name: '교육', count: 420 },
    { id: 'service', name: '서비스', count: 1000 }
  ];

  // 지역별 업체 데이터 (상세 정보 포함)
  const businessesByRegion: Record<string, Record<string, Business[]>> = {
    '대련': {
      '전체': [
        { 
          name: "대련 한인병원", 
          category: "병원", 
          address: "대련 사하구", 
          chineseAddress: "辽宁省大连市沙河口区", 
          phone: "+86-411-8432-1234", 
          rating: 4.7, 
          isOpen: true,
          description: "대련 지역 최대 규모의 한인 전문 종합병원입니다. 한국어 가능한 의료진이 상주하며, 내과, 외과, 치과 등 전문 진료 서비스를 제공합니다.",
          features: ["24시간 응급실", "한국어 진료", "종합건강검진", "예약 우선 진료"],
          hours: "월-토 09:00-18:00",
          imageUrl: "https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2xpbmljJTIwbW9kZXJufGVufDF8fHx8MTc2NTg2ODQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 234
        },
        { 
          name: "대련 한식당", 
          category: "음식점", 
          address: "대련 중산구", 
          chineseAddress: "辽宁省大连市中山区", 
          phone: "+86-411-8234-5678", 
          rating: 4.5, 
          isOpen: true,
          description: "정통 한국 가정식을 맛볼 수 있는 한식당입니다. 김치찌개, 불고기, 비빔밥 등 다양한 메뉴를 합리적인 가격에 제공합니다.",
          features: ["단체석 완비", "배달 가능", "주차 가능", "런치 세트 메뉴"],
          hours: "매일 11:00-22:00",
          imageUrl: "https://images.unsplash.com/photo-1598468178163-9fdd2536b175?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1ODM0MTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          videoUrl: "https://player.bilibili.com/player.html?bvid=BV1xx411c7XD&page=1",
          reviews: 156
        },
        { 
          name: "대련 한국학교", 
          category: "교육", 
          address: "대련 개발구", 
          chineseAddress: "辽宁省大连시경제개발구", 
          phone: "+86-411-8765-4321", 
          rating: 4.6, 
          isOpen: true,
          description: "유치부부터 고등부까지 운영되는 정규 한국학교입니다. 한국 교육과정을 기반으로 중국어 교육도 병행합니다.",
          features: ["정규 한국 교육과정", "중국어 특화 교육", "방과 후 프로그램", "스쿨버스 운영"],
          hours: "월-금 08:00-16:00",
          imageUrl: "https://images.unsplash.com/photo-1655800466797-8ab2598b4274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb218ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 89
        },
        { 
          name: "대련 번역센터", 
          category: "서비스", 
          address: "대련 서강구", 
          chineseAddress: "辽宁省大连시서강구", 
          phone: "+86-411-8567-8901", 
          rating: 4.4, 
          isOpen: true,
          description: "한중 전문 번역 및 통역 서비스를 제공합니다. 비자, 공증, 각종 서류 번역을 신속하게 처리합니다.",
          features: ["공증 번역", "비자 서류 대행", "통역 서비스", "급행 처리 가능"],
          hours: "월-금 09:00-18:00",
          imageUrl: "https://images.unsplash.com/photo-1712159018726-4564d92f3ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlcnZpY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 178
        }
      ],
      '병원': [
        { 
          name: "대련 한인병원", 
          category: "병원", 
          address: "대련 사하구", 
          chineseAddress: "辽宁省大连시사하구", 
          phone: "+86-411-8432-1234", 
          rating: 4.7, 
          isOpen: true,
          description: "대련 지역 최대 규모의 한인 전문 종합병원입니다. 한국어 가능한 의료진이 상주하며, 내과, 외과, 치과 등 전문 진료 서비스를 제공합니다.",
          features: ["24시간 응급실", "한국어 진료", "종합건강검진", "예약 우선 진료"],
          hours: "월-토 09:00-18:00",
          imageUrl: "https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2xpbmljJTIwbW9kZXJufGVufDF8fHx8MTc2NTg2ODQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 234
        },
        { 
          name: "대련 국제의료센터", 
          category: "병원", 
          address: "대련 중산구", 
          chineseAddress: "辽宁省大连시중산구", 
          phone: "+86-411-8234-9876", 
          rating: 4.6, 
          isOpen: true,
          description: "외국인 전문 의료센터로 영어, 한국어, 일본어 진료가 가능합니다. 최신 의료 장비를 갖추고 있습니다.",
          features: ["다국어 진료", "최신 의료 장비", "보험 청구 대행", "VIP 진료실"],
          hours: "월-일 08:00-20:00",
          imageUrl: "https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2xpbmljJTIwbW9kZXJufGVufDF8fHx8MTc2NTg2ODQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 198
        }
      ],
      '음식점': [
        { 
          name: "대련 한식당", 
          category: "음식점", 
          address: "대련 중산구", 
          chineseAddress: "辽宁省大连시중산구", 
          phone: "+86-411-8234-5678", 
          rating: 4.5, 
          isOpen: true,
          description: "정통 한국 가정식을 맛볼 수 있는 한식당입니다. 김치찌개, 불고기, 비빔밥 등 다양한 메뉴를 합리적인 가격에 제공합니다.",
          features: ["단체석 완비", "배달 가능", "주차 가능", "런치 세트 메뉴"],
          hours: "매일 11:00-22:00",
          imageUrl: "https://images.unsplash.com/photo-1598468178163-9fdd2536b175?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1ODM0MTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          videoUrl: "https://player.bilibili.com/player.html?bvid=BV1xx411c7XD&page=1",
          reviews: 156
        },
        { 
          name: "대련 김치찌개", 
          category: "음식점", 
          address: "대련 개발구", 
          chineseAddress: "辽宁省大连시경제개발구", 
          phone: "+86-411-8345-6789", 
          rating: 4.3, 
          isOpen: true,
          description: "얼큰하고 진한 김치찌개가 일품인 맛집입니다. 묵은지로 끓인 김치찌개와 수제 두부가 특징입니다.",
          features: ["무료 반찬", "포장 가능", "단체 예약", "주차 가능"],
          hours: "매일 10:00-21:00",
          imageUrl: "https://images.unsplash.com/photo-1598468178163-9fdd2536b175?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1ODM0MTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 112
        }
      ],
      '교육': [
        { 
          name: "대련 한국학교", 
          category: "교육", 
          address: "대련 개발구", 
          chineseAddress: "辽宁省大连시경제개발구", 
          phone: "+86-411-8765-4321", 
          rating: 4.6, 
          isOpen: true,
          description: "유치부부터 고등부까지 운영되는 정규 한국학교입니다. 한국 교육과정을 기반으로 중국어 교육도 병행합니다.",
          features: ["정규 한국 교육과정", "중국어 특화 교육", "방과 후 프로그램", "스쿨버스 운영"],
          hours: "월-금 08:00-16:00",
          imageUrl: "https://images.unsplash.com/photo-1655800466797-8ab2598b4274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb218ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 89
        },
        { 
          name: "대련 한글학원", 
          category: "교육", 
          address: "대련 사하구", 
          chineseAddress: "辽宁省大连시사하구", 
          phone: "+86-411-8456-7890", 
          rating: 4.4, 
          isOpen: true,
          description: "한국어와 한국 문화를 배울 수 있는 학원입니다. 초급부터 고급까지 체계적인 커리큘럼을 제공합니다.",
          features: ["레벨별 수업", "소그룹 수업", "한국 문화 체험", "온라인 수업"],
          hours: "화-일 14:00-21:00",
          imageUrl: "https://images.unsplash.com/photo-1655800466797-8ab2598b4274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb218ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 67
        }
      ],
      '서비스': [
        { 
          name: "대련 번역센터", 
          category: "서비스", 
          address: "대련 서강구", 
          chineseAddress: "辽宁省大连시서강구", 
          phone: "+86-411-8567-8901", 
          rating: 4.4, 
          isOpen: true,
          description: "한중 전문 번역 및 통역 서비스를 제공합니다. 비자, 공증, 각종 서류 번역을 신속하게 처리합니다.",
          features: ["공증 번역", "비자 서류 대행", "통역 서비스", "급행 처리 가능"],
          hours: "월-금 09:00-18:00",
          imageUrl: "https://images.unsplash.com/photo-1712159018726-4564d92f3ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlcnZpY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 178
        },
        { 
          name: "대련 법무사무소", 
          category: "서비스", 
          address: "대련 중산구", 
          chineseAddress: "辽宁省大连시중산구", 
          phone: "+86-411-8678-9012", 
          rating: 4.5, 
          isOpen: true,
          description: "중국 법률 상담 및 법무 대행 서비스를 제공하는 전문 법무사무소입니다. 한국어 상담이 가능합니다.",
          features: ["법률 상담", "계약서 작성", "소송 대리", "무료 초기 상담"],
          hours: "월-금 09:00-17:30",
          imageUrl: "https://images.unsplash.com/photo-1712159018726-4564d92f3ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlcnZpY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 145
        }
      ]
    },
    '위해': {
      '전체': [
        { 
          name: "위해 한국학교", 
          category: "교육", 
          address: "위해 환취구", 
          chineseAddress: "山东省威海市环翠区江苏东路42号", 
          phone: "+86-631-5287-777", 
          rating: 4.8, 
          isOpen: true,
          description: "위해 지역 한인 자녀 교육을 위한 정규 한국학교입니다. 우수한 교육 환경과 체계적인 교육 프로그램을 제공합니다.",
          features: ["정규 한국 교육과정", "소규모 학급 운영", "방과 후 특기 교육", "스쿨버스 운영"],
          hours: "월-금 08:00-16:00",
          imageUrl: "https://images.unsplash.com/photo-1655800466797-8ab2598b4274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBjbGFzc3Jvb218ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 125
        },
        { 
          name: "위해 한인병원", 
          category: "병원", 
          address: "위해 경제개발구", 
          chineseAddress: "山东省威海시경제개발구", 
          phone: "+86-631-5988-000", 
          rating: 4.6, 
          isOpen: true,
          description: "위해 지역 한인을 위한 전문 의료기관입니다. 한국어 가능한 의료진이 친절하게 진료합니다.",
          features: ["한국어 진료", "종합검진", "응급실 운영", "보험 청구 대행"],
          hours: "월-토 09:00-18:00",
          imageUrl: "https://images.unsplash.com/photo-1758202292826-c40e172eed1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2xpbmljJTIwbW9kZXJufGVufDF8fHx8MTc2NTg2ODQ2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 98
        },
        { 
          name: "위해 한식당", 
          category: "음식점", 
          address: "위해 환취구", 
          chineseAddress: "山东省威海시환취구", 
          phone: "+86-631-5234-567", 
          rating: 4.5, 
          isOpen: true,
          description: "신선한 해산물과 정통 한식을 맛볼 수 있는 맛집입니다.",
          features: ["해산물 전문", "단체석 완비", "주차 가능", "배달 서비스"],
          hours: "매일 11:00-22:00",
          imageUrl: "https://images.unsplash.com/photo-1598468178163-9fdd2536b175?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1ODM0MTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 87
        },
        { 
          name: "위해 번역센터", 
          category: "서비스", 
          address: "위해 경제개발구", 
          chineseAddress: "山东省威海시경제개발구", 
          phone: "+86-631-5678-901", 
          rating: 4.4, 
          isOpen: true,
          description: "비자, 공증, 각종 문서 번역을 전문으로 하는 서비스 센터입니다.",
          features: ["공증 번역", "비자 대행", "급행 처리", "통역 서비스"],
          hours: "월-금 09:00-18:00",
          imageUrl: "https://images.unsplash.com/photo-1712159018726-4564d92f3ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlcnZpY2UlMjBvZmZpY2V8ZW58MXx8fHwxNzY1ODY4NDYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          reviews: 76
        }
      ]
    }
  };

  const currentRegionData = businessesByRegion[activeRegion] || businessesByRegion['대련'];
  const baseBusinesses = currentRegionData[activeSubcategory] || currentRegionData['전체'];

  // CMS 회원 데이터에서 유료/VIP 회원의 업체 정보를 끌어옴
  const memberBusinesses = useMemo<Business[]>(() => {
    try {
      const saved = localStorage.getItem('csm_members');
      if (!saved) return [];
      const members = JSON.parse(saved) as any[];
      return members
        .filter(m =>
          (m.tier === 'paid' || m.tier === 'vip') &&
          m.status === 'active' &&
          m.businessName &&
          (activeRegion === '전체' || m.region === activeRegion) &&
          (activeSubcategory === '전체' || m.businessCategory === activeSubcategory)
        )
        .map(m => ({
          name: m.businessName,
          category: m.businessCategory || '기타',
          address: m.businessAddress || '',
          chineseAddress: m.businessAddress || '',
          phone: m.businessPhone || m.phone || '',
          rating: 5.0,
          isOpen: true,
          description: m.businessDescription || '',
          features: m.businessFeatures || [],
          hours: m.businessHours || '',
          imageUrl: m.businessImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
          videoUrl: '',
          reviews: 0,
          tier: m.tier,
          isMemberBusiness: true,
        }));
    } catch {
      return [];
    }
  }, [activeRegion, activeSubcategory]);

  // VIP → 유료 → 일반(기존 데이터) 순으로 정렬
  const currentBusinesses = useMemo(() => {
    const vipFirst = memberBusinesses.filter(b => b.tier === 'vip');
    const paidNext = memberBusinesses.filter(b => b.tier === 'paid');
    return [...vipFirst, ...paidNext, ...baseBusinesses];
  }, [memberBusinesses, baseBusinesses]);

  // 선택된 업체 상세 정보
  const selectedBusiness = hoveredBusiness !== null ? currentBusinesses[hoveredBusiness] : currentBusinesses[0];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
        </div>
        
        {/* 지역 선택 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* 내 지역 + 상위 4개 항상 표시 */}
            {(showAllRegions ? sortedRegions : sortedRegions.slice(0, 5)).map((region) => (
              <button
                key={region.id}
                onClick={() => {
                  setActiveRegion(region.name);
                  setActiveSubcategory('전체');
                  setHoveredBusiness(0);
                }}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  activeRegion === region.name
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {region.name}
              </button>
            ))}
            {/* 더보기 / 접기 버튼 */}
            {!showAllRegions ? (
              <button
                onClick={() => setShowAllRegions(true)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                더보기 ›
              </button>
            ) : (
              <button
                onClick={() => setShowAllRegions(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                접기 ↑
              </button>
            )}
          </div>
        </div>
        
        {/* 서브카테고리 탭 */}
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4 pt-3 border-t border-gray-100">
          {subcategories.map((subcat, index) => (
            <div key={subcat.id} className="contents">
              <button
                onClick={() => {
                  setActiveSubcategory(subcat.name);
                  setHoveredBusiness(0);
                }}
                className={`hover:text-blue-600 transition-colors ${
                  activeSubcategory === subcat.name
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {subcat.name}
              </button>
              {index < subcategories.length - 1 && (
                <span className="text-gray-400">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={`${activeRegion} 지역 업체명, 서비스 검색...`}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 좌우 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 왼쪽: 업체 리스트 */}
        <div className="space-y-2">
          {currentBusinesses.slice(0, 4).map((business, index) => (
            <div 
              key={index} 
              onMouseEnter={() => setHoveredBusiness(index)}
              onClick={() => setHoveredBusiness(index)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                hoveredBusiness === index 
                  ? business.tier === 'vip'
                    ? 'border-yellow-400 bg-yellow-50 shadow-md'
                    : business.tier === 'paid'
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-green-500 bg-white shadow-md'
                  : business.tier === 'vip'
                  ? 'border-yellow-200 bg-yellow-50/40 hover:border-yellow-400'
                  : business.tier === 'paid'
                  ? 'border-blue-200 bg-blue-50/30 hover:border-blue-400'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {business.tier === 'vip' && (
                      <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded">👑 VIP</span>
                    )}
                    {business.tier === 'paid' && (
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">⭐ 유료</span>
                    )}
                    <h3 className="text-sm font-medium text-gray-900">{business.name}</h3>
                    {business.isOpen && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">영업중</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{business.address}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{business.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 오른쪽: 상세 정보 */}
        <div className={`border rounded-lg p-2.5 h-fit ${
          selectedBusiness?.tier === 'vip'
            ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-white shadow-sm'
            : selectedBusiness?.tier === 'paid'
            ? 'border-blue-200 bg-blue-50/30'
            : 'border-gray-200 bg-white'
        }`}>
          {selectedBusiness && (
            <div>
              {/* VIP/유료 등록 업체만 이미지 표시 */}
              {selectedBusiness.isMemberBusiness && (selectedBusiness.tier === 'vip' || selectedBusiness.tier === 'paid') && (
                <div className="mb-2 rounded-md overflow-hidden relative">
                  <ImageWithFallback 
                    src={selectedBusiness.imageUrl}
                    alt={selectedBusiness.name}
                    className="w-full h-20 object-cover"
                  />
                  {selectedBusiness.tier === 'vip' && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded shadow">
                      👑 VIP
                    </span>
                  )}
                  {selectedBusiness.tier === 'paid' && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded shadow">
                      ⭐ 유료
                    </span>
                  )}
                </div>
              )}

              {/* 업체 기본 정보 */}
              <div className="mb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{selectedBusiness.name}</h3>
                  <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded shrink-0">
                    {selectedBusiness.category}
                  </span>
                </div>

                {selectedBusiness.description && (
                  <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                    {selectedBusiness.description}
                  </p>
                )}
              </div>

              {/* 주요 특징 - 인라인으로 압축 (유료/VIP만) */}
              {(selectedBusiness.tier === 'vip' || selectedBusiness.tier === 'paid') && selectedBusiness.features && selectedBusiness.features.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedBusiness.features.slice(0, 3).map((feature: string, idx: number) => (
                    <span key={idx} className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              {/* 연락처 및 운영시간 */}
              <div className="space-y-1 pt-2 border-t border-gray-100">
                {selectedBusiness.address && (
                  <div className="flex items-center text-[11px] text-gray-600">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{selectedBusiness.address}</span>
                  </div>
                )}
                {selectedBusiness.phone && (
                  <div className="flex items-center text-[11px] text-gray-600">
                    <Phone className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                    <span>{selectedBusiness.phone}</span>
                  </div>
                )}
                {selectedBusiness.hours && (
                  <div className="flex items-center text-[11px] text-gray-600">
                    <Clock className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                    <span>{selectedBusiness.hours}</span>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Button 
                  onClick={() => {
                    alert(`WeChat으로 ${selectedBusiness.name}에 연락하세요.\\n전화번호: ${selectedBusiness.phone}`);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-[11px] py-1 h-7"
                >
                  WeChat
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedBusinessForDetail(selectedBusiness);
                    setDetailModalOpen(true);
                  }}
                  variant="outline" 
                  className="text-[11px] py-1 h-7"
                >
                  상세보기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button 
          onClick={onMoreClick}
          className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
        >
          더 많은 업체 보기 &gt;
        </button>
      </div>

      {/* 상세보기 모달 */}
      {detailModalOpen && selectedBusinessForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setDetailModalOpen(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedBusinessForDetail.name}</h2>
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              {/* 업체 이미지 또는 동영상 */}
              <div className="mb-6 rounded-lg overflow-hidden">
                {selectedBusinessForDetail.videoUrl ? (
                  <iframe
                    src={selectedBusinessForDetail.videoUrl}
                    className="w-full h-64 md:h-96"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedBusinessForDetail.name}
                  />
                ) : (
                  <ImageWithFallback 
                    src={selectedBusinessForDetail.imageUrl}
                    alt={selectedBusinessForDetail.name}
                    className="w-full h-64 object-cover"
                  />
                )}
              </div>

              {/* 카테고리 */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {selectedBusinessForDetail.category}
                </span>
              </div>

              {/* 상세 설명 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">업체 소개</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedBusinessForDetail.description}
                </p>
              </div>

              {/* 주요 서비스 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">주요 서비스</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBusinessForDetail.features?.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* 주소 및 찾아가기 */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">위치 정보</h3>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{selectedBusinessForDetail.address}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedBusinessForDetail.chineseAddress}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const baiduMapUrl = `https://map.baidu.com/search/${encodeURIComponent(selectedBusinessForDetail.chineseAddress)}`;
                      window.open(baiduMapUrl, '_blank');
                    }}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    바이두 지도에서 찾아가기
                  </Button>
                </div>
              </div>

              {/* 연락처 */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">연락처</h3>
                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{selectedBusinessForDetail.phone}</span>
                </div>
              </div>

              {/* 운영시간 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">운영시간</h3>
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{selectedBusinessForDetail.hours}</span>
                  {selectedBusinessForDetail.isOpen && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      영업중
                    </span>
                  )}
                </div>
              </div>

              {/* WeChat 버튼 */}
              <Button 
                onClick={() => {
                  alert(`WeChat으로 ${selectedBusinessForDetail.name}에 연락하세요.\\n전화번호: ${selectedBusinessForDetail.phone}`);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                WeChat으로 연락하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}