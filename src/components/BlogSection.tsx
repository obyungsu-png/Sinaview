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
      title: "가을 여행지 추천 - 단풍명소 BEST 10",
      author: "여행블로거",
      date: "9월 28일",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop",
      comments: 24,
      views: 1234,
      likes: 89,
      type: "블로그"
    },
    {
      id: 2,
      title: "집에서 만드는 간단한 한식 레시피",
      author: "요리연구가",
      date: "9월 28일",
      image: "https://images.unsplash.com/photo-1641735883611-e2bbcde5b903?w=150&h=100&fit=crop",
      comments: 18,
      views: 892,
      likes: 156,
      type: "블로그"
    },
    {
      id: 3,
      title: "2024 K-뷰티 트렌드 분석",
      author: "뷰티인플루언서",
      date: "9월 27일",
      image: "https://images.unsplash.com/photo-1741896135490-4062a3b21abf?w=150&h=100&fit=crop",
      comments: 45,
      views: 2156,
      likes: 234,
      type: "카페"
    },
    {
      id: 4,
      title: "효율적인 재택근무를 위한 홈오피스 꾸미기",
      author: "인테리어디자이너",
      date: "9월 27일",
      image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=150&h=100&fit=crop",
      comments: 32,
      views: 1567,
      likes: 187,
      type: "블로그"
    }
  ];

  const popularCafes = [
    { name: "요리조리카페", members: "32만명", category: "요리·레시피" },
    { name: "인테리어소품", members: "28만명", category: "인테리어" },
    { name: "뷰티토크", members: "45만명", category: "화장품·미용" },
    { name: "재중 기업 소식", members: "54만명", category: "비즈니스·취업" }
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
                  <div className="text-xs text-green-600 font-medium mb-1">{post.type}</div>
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