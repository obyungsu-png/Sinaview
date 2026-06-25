import React, { useState, useEffect, useMemo } from 'react';
import { Package, MapPin, User, Phone, Clock, MessageCircle, ArrowLeft, Eye, Heart, Share2 } from 'lucide-react@0.487.0';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CommentSection } from './CommentSection';

interface UsedMarketSectionProps {
  category: string;
  onMoreClick?: () => void;
  userRegion?: string;
  currentUser?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

interface MarketItem {
  id: number;
  title: string;
  price: string;
  location: string;
  region: string;
  seller: string;
  sellerPhone: string;
  time: string;
  thumbnail: string;
  delivery: string;
  status: string;
  type: string;
  description: string;
  condition: string;
  views: number;
  likes?: number;
  marketType?: 'used' | 'handmade';
}

export function UsedMarketSection({ category, onMoreClick, userRegion, currentUser, isAdmin }: UsedMarketSectionProps) {
  const [activeRegion, setActiveRegion] = useState('전체');
  const [activeMainTab, setActiveMainTab] = useState<'used' | 'handmade'>('handmade');
  const [activeSubcategory, setActiveSubcategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);

  // 메인 탭 변경 시 서브카테고리 초기화
  useEffect(() => {
    setActiveSubcategory('전체');
  }, [activeMainTab]);

  // userRegion이 변경되면 activeRegion 업데이트
  useEffect(() => {
    if (userRegion) {
      setActiveRegion(userRegion);
    }
  }, [userRegion]);

  const regions = [
    { id: 'all', name: '전체', count: 2450 },
    { id: 'dalian', name: '대련', count: 450 },
    { id: 'beijing', name: '베이징', count: 680 },
    { id: 'shanghai', name: '상하이', count: 520 },
    { id: 'guangzhou', name: '광저우', count: 350 },
    { id: 'shenzhen', name: '심천', count: 450 },
    { id: 'wuhan', name: '우한', count: 280 }
  ];

  // 사용자 지역을 맨 앞으로 정렬 (전체 제외)
  const sortedRegions = useMemo(() => {
    if (!userRegion) return regions;
    
    const userRegionObj = regions.find(r => r.name === userRegion);
    if (!userRegionObj || userRegion === '전체') return regions;
    
    const allRegion = regions.find(r => r.name === '전체');
    const otherRegions = regions.filter(r => r.name !== userRegion && r.name !== '전체');
    return [allRegion!, userRegionObj, ...otherRegions];
  }, [userRegion]);

  const usedSubcategories = [
    { id: 'all', name: '전체' },
    { id: 'electronics', name: '전자제품' },
    { id: 'household', name: '생활용품' },
    { id: 'furniture', name: '가구' },
    { id: 'fashion', name: '의류' },
    { id: 'cosmetics', name: '화장품' },
    { id: 'kids', name: '유아용품' },
    { id: 'etc', name: '기타' },
  ];

  const handmadeSubcategories = [
    { id: 'all', name: '전체' },
    { id: 'food', name: '한국 음식' },
    { id: 'banchan', name: '반찬·김치' },
    { id: 'bakery', name: '베이커리' },
    { id: 'craft', name: '수공예품' },
    { id: 'clothes', name: '의류·소품' },
    { id: 'service', name: '재능 서비스' },
  ];

  const subcategories = activeMainTab === 'used' ? usedSubcategories : handmadeSubcategories;

  const allItems: MarketItem[] = [
    {
      id: 1,
      title: "아이폰 13 Pro 256GB 깨끗한 상태 판매",
      price: "4,500위안",
      location: "베이징 조양구",
      region: "베이징",
      seller: "김서울",
      sellerPhone: "+86-138-1234-5678",
      time: "30분 전",
      thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      type: "전자제품",
      description: `2022년 10월 구매한 아이폰 13 Pro입니다. 

📱 제품 상세 정보:
- 용량: 256GB
- 색상: 그라파이트
- 배터리 상태: 92% (양호)
- 구성품: 본품, 박스, 충전케이블, 이어폰 미사용

✨ 상태:
케이스와 보호필름을 항상 사용해서 스크래치 전혀 없습니다. 
외관 상태 A급이며, 모든 기능 정상 작동합니다.

📦 거래 방법:
- 베이징 직거래 가능
- 택배 거래 가능 (순풍택배, 착불)
- 안전거래 희망하시면 위챗페이 거래 가능

💬 연락처:
위챗 ID: kimseoul2024
전화: +86-138-1234-5678

귀국으로 인해 판매하게 되었습니다. 관심 있으신 분들은 편하게 연락 주세요!`,
      condition: "중고 - 상",
      views: 342,
      likes: 15
    },
    {
      id: 2,
      title: "한국 김치냉장고 디오스 120L (거의 새것)",
      price: "2,800위안",
      location: "상하이 푸동신구",
      region: "상하이",
      seller: "박중국",
      sellerPhone: "+86-139-2345-6789",
      time: "1시간 전",
      thumbnail: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop",
      delivery: "중통택배",
      status: "예약중",
      type: "생활용품",
      description: `작년 한국에서 직접 가져온 LG 디오스 김치냉장고입니다. 

❄️ 제품 정보:
- 브랜드: LG 디오스
- 용량: 120L
- 색상: 화이트
- 구매일: 2023년 3월

✨ 상태:
사용 기간 1년 미만이고 상태 매우 좋습니다. 
김치, 반찬 보관에 최적화된 온도 설정 기능이 있습니다.

📦 거래:
- 상하이 직거래 우선 (푸동신구)
- 택배 가능하나 무게가 있어 택배비 별도

귀국으로 인해 판매합니다. 한국 음식 좋아하시는 분께 좋을 것 같아요!`,
      condition: "중고 - 최상",
      views: 528,
      likes: 23
    },
    {
      id: 3,
      title: "한국 화장품 세트 (설화수, 후) 미개봉",
      price: "800위안",
      location: "광저우 천허구",
      region: "광저우",
      seller: "이차이나",
      sellerPhone: "+86-137-3456-7890",
      time: "2시간 전",
      thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
      delivery: "신다택배",
      status: "판매중",
      type: "화장품",
      description: `한국 출장 시 면세점에서 구매한 설화수, 후 화장품 세트입니다.

💄 포함 제품:
- 설화수 자음생 크림 50ml
- 후 비첩 자생 크림 50ml
- 설화수 윤조 에센스 60ml

✨ 상태:
완전 미개봉 새제품
유통기한: 2026년 12월까지

📦 거래:
- 택배 거래 (신다택배, 선불/착불 협의)
- 광저우 직거래 가능

선물 받았는데 제 피부 타입과 안 맞아서 판매합니다.`,
      condition: "새제품",
      views: 215,
      likes: 8
    },
    {
      id: 4,
      title: "한국 라면 50개 + 김치 2kg 세트",
      price: "350위안",
      location: "선전 난산구",
      region: "심천",
      seller: "최한국",
      sellerPhone: "+86-136-4567-8901",
      time: "3시간 전",
      thumbnail: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop",
      delivery: "원통택배",
      status: "판매중",
      type: "한국식품",
      description: `한국 라면과 김치 세트 판매합니다!

🍜 라면 구성 (총 50개):
- 신라면 20개
- 짜파게티 15개
- 진라면 매운맛 10개
- 육개장 컵라면 5개

🥬 김치:
- 포기김치 2kg (국산 배추)
- 제조일: 2024년 12월 15일

📅 유통기한:
모든 제품 6개월 이상 남음

📦 거래:
택배 거래만 가능 (원통택배, 착불)

한국 음식 그리우신 분들께 추천드립니다!`,
      condition: "새제품",
      views: 456,
      likes: 19
    },
    {
      id: 5,
      title: "삼성 갤럭시 S23 Ultra 512GB",
      price: "5,200위안",
      location: "상하이 징안구",
      region: "상하이",
      seller: "한국인",
      sellerPhone: "+86-138-5678-9012",
      time: "4시간 전",
      thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop",
      delivery: "중통택배",
      status: "판매중",
      type: "전자제품",
      description: `2023년 3월 구매한 갤럭시 S23 Ultra 512GB 모델입니다.

📱 제품 사양:
- 용량: 512GB
- 색상: 팬텀 블랙
- S펜 포함
- 박스, 충전기 모두 포함

✨ 상태:
케이스 사용으로 외관 깨끗
배터리 성능 정상
모든 기능 이상 무

📦 거래:
상하이 직거래 또는 택배 가능

아이폰으로 교체해서 판매합니다.`,
      condition: "중고 - 상",
      views: 678,
      likes: 12
    },
    {
      id: 6,
      title: "대련 현지 수산물 택배 가능",
      price: "협의",
      location: "대련 중산구",
      region: "대련",
      seller: "김대련",
      sellerPhone: "+86-135-6789-0123",
      time: "5시간 전",
      thumbnail: "https://images.unsplash.com/photo-1559737558-2f5a5b0c8b6e?w=400&h=300&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      type: "한국식품",
      description: `대련 현지 신선한 수산물 택배해 드립니다.

🦐 판매 품목:
- 가리비 (신선/냉동)
- 전복 (크기별)
- 게 (대게, 킹크랩)
- 새우 (흰다리새우, 보리새우)
- 조개류 (바지락, 홍합 등)

📦 배송:
- 순풍택배 신선배송
- 전국 배송 가능
- 아이스박스 포장

💰 가격:
품목과 수량에 따라 협의
대량 주문 시 할인 가능

매일 아침 신선한 수산물 입고됩니다. 원하시는 품목 말씀해 주세요!`,
      condition: "새제품",
      views: 892,
      likes: 34
    },
    {
      id: 7,
      title: "한국 고추장, 된장, 간장 세트",
      price: "180위안",
      location: "베이징 하이디안구",
      region: "베이징",
      seller: "김맛있어",
      sellerPhone: "+86-137-7890-1234",
      time: "6시간 전",
      thumbnail: "https://images.unsplash.com/photo-1611171711912-e58eb7fb362c?w=400&h=300&fit=crop",
      delivery: "순풍택배",
      status: "판매중",
      type: "한국식품",
      description: `청정원 장류 세트 판매합니다.

🍯 포함 제품:
- 태양초 고추장 500g
- 순창 된장 500g
- 진간장 500ml

📅 유통기한: 2025년 12월
✅ 개봉하지 않은 새제품

한국 음식 만들 때 필수품이죠. 한꺼번에 구매하시면 저렴합니다!`,
      condition: "새제품",
      views: 234,
      likes: 7
    },
    {
      id: 8,
      title: "대련 한인 이사 짐 일괄 판매",
      price: "3,500위안",
      location: "대련 서강구",
      region: "대련",
      seller: "이귀국",
      sellerPhone: "+86-134-8901-2345",
      time: "7시간 전",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      delivery: "직거래",
      status: "판매중",
      type: "생활용품",
      description: `귀국으로 인해 가구, 가전제품 일괄 판매합니다.

🛋️ 포함 품목:
- 3인용 소파 (회색)
- 퀸사이즈 침대 프레임 + 매트리스
- 55인치 삼성 TV
- 양문형 냉장고 (500L)
- 세탁기 (드럼)
- 식탁 + 의자 4개
- 옷장, 서랍장 등 기타 소품

💰 가격: 3,500위안 (일괄)
개별 판매도 가능 (가격 협의)

⚠️ 직거래만 가능:
대련 서강구 
12월 말까지 처분해야 해서 급매입니다!

사진 더 필요하시면 위챗으로 보내드립니다.`,
      condition: "중고 - 중",
      views: 1234,
      likes: 45
    }
  ];

  // 우리장터 아이템 (한인이 직접 만든 제품)
  const handmadeItems: MarketItem[] = [
    {
      id: 101,
      title: "직접 담근 배추김치 (1kg)",
      price: "60위안",
      location: "베이징 왕징",
      region: "베이징",
      seller: "왕징댁",
      sellerPhone: "+86-138-2200-3344",
      time: "1시간 전",
      thumbnail: "https://images.unsplash.com/photo-1583224964978-2257b8a1d74e?w=400&h=300&fit=crop",
      delivery: "직거래·배달",
      status: "판매중",
      type: "반찬·김치",
      description: "시어머니 레시피로 직접 담근 배추김치예요. 매주 금요일 픽업/배달 가능합니다.",
      condition: "신상",
      views: 234,
      likes: 28,
      marketType: 'handmade',
    },
    {
      id: 102,
      title: "한국 반찬 8가지 정기배달 (주1회)",
      price: "주 150위안",
      location: "베이징 왕징",
      region: "베이징",
      seller: "반찬가게사모님",
      sellerPhone: "+86-139-5577-8899",
      time: "3시간 전",
      thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      delivery: "직접배달",
      status: "판매중",
      type: "한국 음식",
      description: "매주 화요일 왕징 일대 직접 배달드립니다. 나물, 조림, 볶음 등 8종 구성.",
      condition: "신상",
      views: 567,
      likes: 41,
      marketType: 'handmade',
    },
    {
      id: 103,
      title: "수제 소금빵 / 통밀 식빵 주문 받습니다",
      price: "20위안~",
      location: "상하이 푸동",
      region: "상하이",
      seller: "푸동빵집",
      sellerPhone: "+86-137-3344-5566",
      time: "5시간 전",
      thumbnail: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      delivery: "직거래·택배",
      status: "판매중",
      type: "베이커리",
      description: "한국식 재료로 매일 아침 굽습니다. 전날 예약 부탁드려요. 카카오/위챗 가능.",
      condition: "신상",
      views: 423,
      likes: 35,
      marketType: 'handmade',
    },
    {
      id: 104,
      title: "수제 천연 비누·캔들 (선물용 포장 가능)",
      price: "35위안~",
      location: "광저우 톈허",
      region: "광저우",
      seller: "광저우공방",
      sellerPhone: "+86-136-1122-3344",
      time: "어제",
      thumbnail: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=300&fit=crop",
      delivery: "전국 택배",
      status: "판매중",
      type: "수공예품",
      description: "한국 원료로 만든 천연 비누, 향초. 선물용 포장도 가능합니다.",
      condition: "신상",
      views: 189,
      likes: 22,
      marketType: 'handmade',
    },
    {
      id: 105,
      title: "직접 만든 유아 손뜨개 옷 (3-12개월)",
      price: "180위안~",
      location: "심천 푸톈",
      region: "심천",
      seller: "심천이모",
      sellerPhone: "+86-135-9988-7766",
      time: "2일 전",
      thumbnail: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=300&fit=crop",
      delivery: "전국 택배",
      status: "판매중",
      type: "의류·소품",
      description: "한 땀 한 땀 직접 떠서 만든 아기 옷입니다. 색상·사이즈 주문 제작 가능.",
      condition: "신상",
      views: 312,
      likes: 47,
      marketType: 'handmade',
    },
    {
      id: 106,
      title: "한국어 과외 / 한중 통역 출장",
      price: "100위안/시간",
      location: "베이징 전지역",
      region: "베이징",
      seller: "베이징선생님",
      sellerPhone: "+86-138-7788-9900",
      time: "3일 전",
      thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
      delivery: "방문·온라인",
      status: "예약 가능",
      type: "재능 서비스",
      description: "한국어능력시험(TOPIK) 준비반 운영. 1:1 또는 그룹 수업, 출장 통역도 가능.",
      condition: "신상",
      views: 256,
      likes: 31,
      marketType: 'handmade',
    },
  ];

  // 현재 탭에 해당하는 아이템 목록
  const currentItems = activeMainTab === 'used' ? allItems : handmadeItems;

  // 지역과 카테고리로 필터링
  const filteredItems = currentItems.filter(item => {
    const regionMatch = activeRegion === '전체' || item.region === activeRegion;
    const categoryMatch = activeSubcategory === '전체' || item.type === activeSubcategory;
    return regionMatch && categoryMatch;
  });

  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
  };

  // 상세 페이지가 열려 있을 때
  if (selectedItem) {
    return (
      <div style={{ 
        fontFamily: "'Noto Sans KR', sans-serif",
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f6f7',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        <style>{`
          .market-detail-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
          }

          .detail-back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            color: #666;
            font-size: 14px;
            margin: 20px;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .detail-back-btn:hover {
            border-color: #667eea;
            color: #667eea;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
          }

          .detail-image-section {
            width: 100%;
            height: 500px;
            overflow: hidden;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .detail-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-height: 500px;
          }

          .detail-content {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px;
          }

          .detail-header {
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 25px;
            margin-bottom: 30px;
          }

          .detail-badges {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }

          .detail-badge {
            display: inline-block;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 20px;
            background: #f0f2ff;
            color: #667eea;
          }

          .detail-badge.status-reserved {
            background: #fff3e0;
            color: #ff9800;
          }

          .detail-title {
            font-size: 28px;
            font-weight: 700;
            color: #333;
            line-height: 1.4;
            margin-bottom: 20px;
          }

          .detail-price {
            font-size: 38px;
            font-weight: 700;
            color: #2ecc71;
            margin-bottom: 25px;
          }

          .detail-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 25px;
            font-size: 15px;
            color: #666;
          }

          .detail-meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .detail-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            padding: 30px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            margin-bottom: 40px;
          }

          .detail-info-item {
            display: flex;
            align-items: start;
            gap: 15px;
          }

          .detail-info-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }

          .detail-info-content {
            flex: 1;
          }

          .detail-info-label {
            font-size: 13px;
            color: #999;
            margin-bottom: 6px;
          }

          .detail-info-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
          }

          .detail-description {
            margin-bottom: 40px;
          }

          .detail-description h3 {
            font-size: 22px;
            font-weight: 700;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
          }

          .detail-description-text {
            font-size: 16px;
            line-height: 1.9;
            color: #555;
            white-space: pre-wrap;
            background: #f8f9fa;
            padding: 30px;
            border-radius: 12px;
            border: 1px solid #e9ecef;
          }

          .detail-actions {
            display: flex;
            gap: 20px;
            padding-top: 30px;
            border-top: 2px solid #f0f0f0;
            margin-bottom: 25px;
          }

          .action-button {
            flex: 1;
            padding: 18px 24px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .action-button.primary {
            background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
            color: white;
            box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
          }

          .action-button.primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(46, 204, 113, 0.5);
          }

          .action-button.secondary {
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          }

          .action-button.secondary:hover {
            background: #667eea;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
          }

          .detail-footer {
            display: flex;
            gap: 20px;
            padding: 25px 0;
          }

          .footer-button {
            flex: 1;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            background: white;
            color: #666;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .footer-button:hover {
            border-color: #667eea;
            color: #667eea;
            background: #f0f2ff;
            transform: translateY(-2px);
          }

          .stats-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-top: 2px solid #f0f0f0;
            margin-top: 25px;
            font-size: 14px;
            color: #999;
          }
        `}</style>

        <div className="market-detail-container">
          <button className="detail-back-btn" onClick={() => setSelectedItem(null)}>
            <ArrowLeft className="w-5 h-5" />
            목록으로 돌아가기
          </button>

          <div className="detail-image-section">
            <img 
              src={selectedItem.thumbnail} 
              alt={selectedItem.title}
              className="detail-image"
            />
          </div>

          <div className="detail-content">
            <div className="detail-header">
              <div className="detail-badges">
                <span className={`detail-badge ${selectedItem.status === '예약중' ? 'status-reserved' : ''}`}>
                  {selectedItem.status}
                </span>
                <span className="detail-badge">{selectedItem.condition}</span>
                <span className="detail-badge">{selectedItem.region}</span>
              </div>
              
              <h1 className="detail-title">{selectedItem.title}</h1>
              
              <div className="detail-price">{selectedItem.price}</div>
              
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <Clock className="w-5 h-5" />
                  <span>{selectedItem.time}</span>
                </div>
                <div className="detail-meta-item">
                  <Eye className="w-5 h-5" />
                  <span>조회 {selectedItem.views}</span>
                </div>
                <div className="detail-meta-item">
                  <Heart className="w-5 h-5" />
                  <span>찜 {selectedItem.likes || 0}</span>
                </div>
              </div>
            </div>

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-icon">
                  <User className="w-6 h-6" />
                </div>
                <div className="detail-info-content">
                  <div className="detail-info-label">판매자</div>
                  <div className="detail-info-value">{selectedItem.seller}</div>
                </div>
              </div>

              <div className="detail-info-item">
                <div className="detail-info-icon">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="detail-info-content">
                  <div className="detail-info-label">연락처</div>
                  <div className="detail-info-value">{selectedItem.sellerPhone}</div>
                </div>
              </div>

              <div className="detail-info-item">
                <div className="detail-info-icon">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="detail-info-content">
                  <div className="detail-info-label">거래 지역</div>
                  <div className="detail-info-value">{selectedItem.location}</div>
                </div>
              </div>

              <div className="detail-info-item">
                <div className="detail-info-icon">
                  <Package className="w-6 h-6" />
                </div>
                <div className="detail-info-content">
                  <div className="detail-info-label">택배 방법</div>
                  <div className="detail-info-value">{selectedItem.delivery}</div>
                </div>
              </div>
            </div>

            <div className="detail-description">
              <h3>상품 정보</h3>
              <div className="detail-description-text">
                {selectedItem.description}
              </div>
            </div>

            <div className="detail-actions">
              <button className="action-button primary">
                <MessageCircle className="w-6 h-6" />
                판매자에게 연락하기
              </button>
              <button className="action-button secondary">
                <Phone className="w-6 h-6" />
                전화 걸기
              </button>
            </div>

            <div className="detail-footer">
              <button className="footer-button">
                <Heart className="w-5 h-5" />
                찜하기
              </button>
              <button className="footer-button">
                <Share2 className="w-5 h-5" />
                공유하기
              </button>
            </div>

            <div className="stats-bar">
              <span>카테고리: {selectedItem.type}</span>
              <span>상품번호: #{selectedItem.id}</span>
            </div>

            <CommentSection 
              pageType="market"
              itemId={selectedItem.id} 
              currentUser={currentUser} 
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    );
  }

  // 목록 페이지
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{category}</h2>
            <span className="text-xs text-gray-400">
              {activeMainTab === 'used' ? '중국 거주 한인 직거래' : '한인이 직접 만든 제품'}
            </span>
          </div>

          {/* 메인 탭 토글 (우리장터 / 중고거래) */}
          <div className="flex border-b border-gray-200 mb-3">
            <button
              onClick={() => setActiveMainTab('handmade')}
              className={`flex-1 pb-2 text-sm transition-colors ${
                activeMainTab === 'handmade'
                  ? 'border-b-2 border-orange-500 text-orange-600 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🌾 우리장터
            </button>
            <button
              onClick={() => setActiveMainTab('used')}
              className={`flex-1 pb-2 text-sm transition-colors ${
                activeMainTab === 'used'
                  ? 'border-b-2 border-orange-500 text-orange-600 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🛍️ 중고거래
            </button>
          </div>

          {/* 지역 선택 탭 */}
          <div className="mb-3">
            <div className="flex items-center space-x-1 text-sm text-gray-600 flex-wrap">
              {sortedRegions.map((region, index) => (
                <div key={region.id} className="contents">
                  <button
                    onClick={() => setActiveRegion(region.name)}
                    className={`hover:text-orange-600 transition-colors ${
                      activeRegion === region.name
                        ? 'text-orange-600 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {region.name}
                  </button>
                  {index < sortedRegions.length - 1 && (
                    <span className="text-gray-300">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 서브카테고리 탭 */}
          <div className="flex flex-wrap gap-1.5">
            {subcategories.map((subcat) => (
              <button
                key={subcat.id}
                onClick={() => setActiveSubcategory(subcat.name)}
                className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                  activeSubcategory === subcat.name
                    ? 'bg-orange-500 text-white font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {subcat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.slice(0, 6).map((item) => (
            <div 
              key={item.id} 
              className="flex items-start space-x-3 p-2 rounded cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => handleItemClick(item)}
            >
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-16 h-12 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant={item.status === '예약중' ? 'secondary' : 'default'} className="text-xs">
                    {item.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.region}
                  </Badge>
                </div>
                <h3 className="text-sm text-gray-900 line-clamp-1 leading-tight">
                  {item.title}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="font-semibold text-green-600">{item.price}</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{item.seller}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Package className="w-3 h-3" />
                    <span>{item.delivery}</span>
                  </div>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={onMoreClick}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            더보기 ({filteredItems.length}개) &gt;
          </button>
        </div>
      </Card>
    </div>
  );
}