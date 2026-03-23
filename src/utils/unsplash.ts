// Unsplash utility functions
export const unsplash_tool = async ({ query }: { query: string }): Promise<string> => {
  try {
    // 실제 환경에서는 unsplash_tool을 직접 호출
    // 여기서는 시뮬레이션을 위해 더미 이미지를 반환
    const searches = [
      'education study learning',
      'food restaurant chinese',
      'shopping online ecommerce',
      'car vehicle automobile',
      'documents visa papers',
      'business office work',
      'technology computer digital'
    ];
    
    const randomIndex = Math.floor(Math.random() * searches.length);
    const searchQuery = searches[randomIndex];
    
    // Unsplash random image URL with specific dimensions
    return `https://images.unsplash.com/photo-${Date.now()}?w=400&h=200&fit=crop&q=80`;
  } catch (error) {
    console.error('Unsplash search failed:', error);
    // 기본 이미지 반환
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&q=80';
  }
};