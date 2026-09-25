// 중국생활 커뮤니티 - 도시별 위챗방 / 네이버 카페 연결 설정
// 운영자가 이 파일만 수정하면 모든 방문자에게 똑같이 보입니다.
//
// wechatQr   : 위챗 단톡방 QR 이미지 주소 (src/assets 에 넣거나 S3/Supabase 이미지 URL)
//              위챗 그룹 QR은 7일마다 바뀌므로, 방장 개인 QR(초대용)을 넣는 것을 추천합니다.
// naverBoard : 네이버 카페 안의 해당 도시 게시판 주소 (없으면 카페 메인 주소)

export const NAVER_CAFE_URL = ''; // 예: 'https://cafe.naver.com/카페아이디'

export interface CityRoom {
  name: string;
  keywords: string[]; // 게시글 제목에 이 단어가 있으면 해당 도시 글로 분류
  wechatQr: string;
  naverBoard: string;
}

export const CITY_ROOMS: CityRoom[] = [
  { name: '상하이', keywords: ['상하이', '上海'], wechatQr: '', naverBoard: '' },
  { name: '베이징', keywords: ['베이징', '北京'], wechatQr: '', naverBoard: '' },
  { name: '칭다오', keywords: ['칭다오', '青岛'], wechatQr: '', naverBoard: '' },
  { name: '선양/대련', keywords: ['선양', '심양', '대련', '다롄'], wechatQr: '', naverBoard: '' },
  { name: '광저우/선전', keywords: ['광저우', '선전', '심천'], wechatQr: '', naverBoard: '' },
  { name: '기타 지역', keywords: [], wechatQr: '', naverBoard: '' },
];
