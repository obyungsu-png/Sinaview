import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface EducationSectionProps {
  category: string;
  onMoreClick?: () => void;
  onArticleClick?: (article: any) => void;
  userRegion?: string;
}

export function EducationSection({ category, onMoreClick, onArticleClick, userRegion }: EducationSectionProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('전체');

  const subcategories = [
    { id: 'all', name: '전체', count: 32, isHighlight: false },
    { id: 'daechi', name: '대치동학원', count: 12, isHighlight: false },
    { id: 'special', name: '특례', count: 8, isHighlight: false },
    { id: 'korean-school', name: '한국학교', count: 10, isHighlight: true },
    { id: 'international', name: '국제학교', count: 7, isHighlight: true },
    { id: 'china-univ', name: '중국대학', count: 5, isHighlight: false }
  ];
  const contentBySubcategory = {
    '전체': [
      {
        id: 1,
        title: "2026학년도 HSK 시험 일정 전면 개편, iBT(인터넷) 시험 대폭 확대",
        source: "HSK한국사무국",
        time: "1시간 전",
        type: "시험정보",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "베이징대/칭화대 2026 신입생 모집요강 발표 - 이공계 장학금 신설",
        source: "중국교육부",
        time: "2시간 전",
        type: "중국대학",
        thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "강남 대치동 중국어 특기자 전형 대비반 2026 커리큘럼 공개",
        source: "하나아카데미",
        time: "3시간 전",
        type: "대치동학원",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "상하이/베이징 국제학교 2026학년도 조기 입학 설명회 일정",
        source: "글로벌에듀",
        time: "4시간 전",
        type: "국제학교",
        thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=100&h=60&fit=crop"
      }
    ],
    '대치동학원': [
      {
        id: 1,
        title: "강남 대치동 중국어 특기자 전형 대비반 2026 커리큘럼 공개",
        source: "하나아카데미",
        time: "1시간 전",
        type: "대치동학원",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "2026 대입 수시 중국어 면접 대비 실전 모의고사반 개강",
        source: "메가스터디",
        time: "2시간 전",
        type: "대치동학원",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=60&fit=crop"
      }
    ],
    '특례': [
      {
        id: 1,
        title: "2026학년도 재외국민 3년/12년 특례 입학 전형 주요 변경사항 총정리",
        source: "특례교육센터",
        time: "1시간 전",
        type: "특례",
        thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "중국 고교 졸업자 한국 대학 특례 입학 서류 디지털 연동 확대",
        source: "교육부",
        time: "3시간 전",
        type: "특례",
        thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=100&h=60&fit=crop"
      }
    ],
    '한국학교': [
      {
        id: 1,
        title: "베이징한국국제학교 2026학년도 신입생 우선 선발 전형 안내",
        source: "베이징한국국제학교",
        time: "1시간 전",
        type: "한국학교",
        thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "상하이한국학교 고교학점제 2026년 전면 시행 준비 완료",
        source: "상하이한국학교",
        time: "2시간 전",
        type: "한국학교",
        thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "칭다오한국학교 2026 글로벌 인재 양성 프로그램 신설",
        source: "칭다오한국학교",
        time: "3시간 전",
        type: "한국학교",
        thumbnail: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "대련한국국제학교 신축 교사 이전 및 2026학년도 입학 설명회",
        source: "대련한국국제학교",
        time: "5시간 전",
        type: "한국학교",
        thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=60&fit=crop"
      }
    ],
    '국제학교': [
      {
        id: 1,
        title: "상하이 미국학교(SAS) 2026년 IB/AP 과정 선택제 개편",
        source: "상하이미국학교",
        time: "1시간 전",
        type: "국제학교",
        thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "베이징국제학교(ISB) 2026 STEM 교육 센터 확장 오픈",
        source: "베이징국제학교",
        time: "2시간 전",
        type: "국제학교",
        thumbnail: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=100&h=60&fit=crop"
      },
      {
        id: 3,
        title: "2026 중국 내 영국계 국제학교 학비 동결 및 장학금 확대 추세",
        source: "국제학교협회",
        time: "4시간 전",
        type: "국제학교",
        thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&h=60&fit=crop"
      },
      {
        id: 4,
        title: "대련/칭다오 지역 국제학교 2026 입학 박람회 개최 (서울 코엑스)",
        source: "유학박람회",
        time: "6시간 전",
        type: "국제학교",
        thumbnail: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=100&h=60&fit=crop"
      }
    ],
    '중국대학': [
      {
        id: 1,
        title: "베이징대/칭화대 2026 신입생 모집요강 발표 - 이공계 장학금 신설",
        source: "중국교육부",
        time: "1시간 전",
        type: "중국대학",
        thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=100&h=60&fit=crop"
      },
      {
        id: 2,
        title: "복단대학교 2026학년도 외국인 유학생 전용 AI 융합 전공 신설",
        source: "복단대학교",
        time: "2시간 전",
        type: "중국대학",
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=60&fit=crop"
      }
    ]
  };

  const currentItems = contentBySubcategory[activeSubcategory] || contentBySubcategory['전체'];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{category}</h2>
        </div>
        
        {/* 서브카테고리 탭 */}
        <div className="flex items-center space-x-1 text-sm text-gray-600 flex-wrap gap-y-2">
          {subcategories.map((subcat, index) => (
            <div key={subcat.id} className="contents">
              {subcat.isHighlight ? (
                <button
                  onClick={() => setActiveSubcategory(subcat.name)}
                  className={`px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full hover:opacity-90 transition-opacity font-medium ${
                    activeSubcategory === subcat.name ? 'ring-2 ring-red-300' : ''
                  }`}
                >
                  🔥 {subcat.name}
                </button>
              ) : (
                <button
                  onClick={() => setActiveSubcategory(subcat.name)}
                  className={`hover:text-blue-600 transition-colors ${
                    activeSubcategory === subcat.name
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {subcat.name}
                </button>
              )}
              {index < subcategories.length - 1 && !subcat.isHighlight && !subcategories[index + 1]?.isHighlight && (
                <span className="text-gray-400">|</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {currentItems.slice(0, 4).map((item) => (
          <div 
            key={item.id} 
            className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer"
            onClick={() => onArticleClick?.(item)}
          >
            <img 
              src={item.thumbnail} 
              alt={item.title}
              className="w-12 sm:w-16 h-8 sm:h-10 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span>{item.source}</span>
                <span className="mx-1">·</span>
                <span>{item.time}</span>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 mt-1" />
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button 
          onClick={onMoreClick}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {activeSubcategory} 카테고리에서 더보기 &gt;
        </button>
      </div>
    </Card>
  );
}