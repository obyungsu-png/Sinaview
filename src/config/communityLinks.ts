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

// 지역 소식 위젯과 같은 지역 목록
export const CITY_ROOMS: CityRoom[] = [
  { name: '대련', keywords: ['대련', '다롄', '大连'], wechatQr: '', naverBoard: '' },
  { name: '북경', keywords: ['북경', '베이징', '北京'], wechatQr: '', naverBoard: '' },
  { name: '상해', keywords: ['상해', '상하이', '上海'], wechatQr: '', naverBoard: '' },
  { name: '소주', keywords: ['쑤저우', '苏州'], wechatQr: '', naverBoard: '' },
  { name: '무석', keywords: ['무석', '우시', '无锡'], wechatQr: '', naverBoard: '' },
  { name: '난징', keywords: ['난징', '남경', '南京'], wechatQr: '', naverBoard: '' },
  { name: '항저우', keywords: ['항저우', '항주', '杭州'], wechatQr: '', naverBoard: '' },
  { name: '천진', keywords: ['천진', '톈진', '天津'], wechatQr: '', naverBoard: '' },
  { name: '심천', keywords: ['심천', '선전', '深圳'], wechatQr: '', naverBoard: '' },
  { name: '심양', keywords: ['심양', '선양', '沈阳'], wechatQr: '', naverBoard: '' },
  { name: '연길', keywords: ['연길', '옌지', '延吉'], wechatQr: '', naverBoard: '' },
  { name: '시안', keywords: ['시안', '서안', '西安'], wechatQr: '', naverBoard: '' },
  { name: '우한', keywords: ['우한', '武汉'], wechatQr: '', naverBoard: '' },
  { name: '청두', keywords: ['청두', '成都'], wechatQr: '', naverBoard: '' },
  { name: '광저우', keywords: ['광저우', '广州'], wechatQr: '', naverBoard: '' },
  { name: '연태', keywords: ['연태', '옌타이', '烟台'], wechatQr: '', naverBoard: '' },
  { name: '위해', keywords: ['웨이하이', '威海'], wechatQr: '', naverBoard: '' },
  { name: '청도', keywords: ['청도', '칭다오', '青岛'], wechatQr: '', naverBoard: '' },
];
