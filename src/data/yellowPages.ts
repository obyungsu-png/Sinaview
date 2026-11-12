// 옐로우 페이지 업체 (예시 데이터) — 홈 섹션과 옐로우 페이지 화면이 같이 씀. 실제 업체 정보로 바꿀 때 여기만 고치면 됨
export interface Business {
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

// 지역별 업체 데이터 (상세 정보 포함)
export const BUSINESSES_BY_REGION: Record<string, Record<string, Business[]>> = {
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
        chineseAddress: "辽宁省大连市经济技术开发区", 
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
        chineseAddress: "辽宁省大连市西岗区", 
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
        name: "대련 국제의료센터", 
        category: "병원", 
        address: "대련 중산구", 
        chineseAddress: "辽宁省大连市中山区", 
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
        name: "대련 김치찌개", 
        category: "음식점", 
        address: "대련 개발구", 
        chineseAddress: "辽宁省大连市经济技术开发区", 
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
        chineseAddress: "辽宁省大连市经济技术开发区", 
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
        chineseAddress: "辽宁省大连市沙河口区", 
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
        chineseAddress: "辽宁省大连市西岗区", 
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
        chineseAddress: "辽宁省大连市中山区", 
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
        chineseAddress: "山东省威海市经济技术开发区", 
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
        chineseAddress: "山东省威海市环翠区", 
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
        chineseAddress: "山东省威海市经济技术开发区", 
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

/** 지역 하나의 업체 (분류별 목록에 겹쳐 있는 업체는 한 번만) */
export function regionBusinesses(region: string): Business[] {
  const byCat = BUSINESSES_BY_REGION[region];
  if (!byCat) return [];
  const seen = new Set<string>();
  return Object.values(byCat).flat().filter((b) => (seen.has(b.name) ? false : (seen.add(b.name), true)));
}

/** 업체가 등록된 지역 */
export const REGIONS_WITH_BUSINESSES = Object.keys(BUSINESSES_BY_REGION);
