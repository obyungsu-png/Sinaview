import { MessageCircle, Eye, Heart } from 'lucide-react';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogSectionProps {
  onViewHomeClick?: () => void;
}

export function BlogSection({ onViewHomeClick }: BlogSectionProps) {
  const blogPosts = [
    {
      id: 1,
      title: "베이징 왕징 가을 단풍 산책 — 주말 나들이 후기",
      author: "왕징댁",
      date: "6월 20일",
      image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150&h=100&fit=crop",
      comments: 31,
      views: 1842,
      likes: 114,
      type: "일상"
    },
    {
      id: 2,
      title: "상하이 → 계림 기차 여행 3박 4일 완전 정복",
      author: "푸동여행자",
      date: "6월 19일",
      image: "https://images.unsplash.com/photo-1537495329792-41ae41ad3bf0?w=150&h=100&fit=crop",
      comments: 47,
      views: 3241,
      likes: 228,
      type: "여행"
    },
    {
      id: 3,
      title: "중국에서 아이 학교 보내기 — 한국학교 vs 현지학교 솔직 후기",
      author: "베이징학부모",
      date: "6월 18일",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150&h=100&fit=crop",
      comments: 63,
      views: 4512,
      likes: 301,
      type: "생활"
    },
    {
      id: 4,
      title: "윈난성 리장 고성 — 한인 부부 자유여행 사진 일기",
      author: "리장커플",
      date: "6월 17일",
      image: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=150&h=100&fit=crop",
      comments: 28,
      views: 2187,
      likes: 193,
      type: "여행"
    }
  ];

  const popularCafes = [
    { name: "재중한인일상", members: "4.2만명", category: "일상·생활" },
    { name: "중국여행정보", members: "6.8만명", category: "여행·명소" },
    { name: "재중한인맘카페", members: "3.1만명", category: "육아·교육" },
    { name: "중국생활꿀팁", members: "5.4만명", category: "생활정보" }
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">뷰(VIEW)</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>블로그</span>
            <span>|</span>
            <span>카페</span>
            <span>|</span>
            <span>포스트</span>
            <button 
              onClick={onViewHomeClick}
              className="text-green-600 hover:text-green-700"
            >
              뷰 홈 &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {blogPosts.map((post) => (
            <div key={post.id} className="group cursor-pointer border rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex space-x-3">
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  className="w-16 sm:w-20 h-12 sm:h-16 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium mb-1 ${
                    post.type === '여행' ? 'text-blue-500' :
                    post.type === '생활' ? 'text-orange-500' :
                    'text-green-600'
                  }`}>{post.type}</div>
                  <h3 className="text-sm text-gray-900 line-clamp-2 group-hover:text-green-600">
                    {post.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-2">
                    <span>{post.author}</span>
                    <span className="mx-1">·</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">한인 기업</h3>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            더보기 &gt;
          </button>
        </div>
        
        <div className="space-y-3">
          {popularCafes.map((cafe, index) => (
            <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer">
              <div>
                <div className="text-sm font-medium">{cafe.name}</div>
                <div className="text-xs text-gray-500">{cafe.category}</div>
              </div>
              <div className="text-xs text-gray-500">
                멤버 {cafe.members}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}