# 차이나 Up (China Up) - 중국 거주 한국인을 위한 포털 사이트

중국에 거주하는 한국인들을 위한 종합 포털 사이트입니다. 네이버 스타일의 UI/UX로 뉴스, 교육, 비자/서류, 자동차, 중고시장, 증권 등 다양한 정보를 제공합니다.

![차이나 Up](https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&h=400&fit=crop)

## 🌟 주요 기능

### 📰 뉴스 & 정보
- **실시간 뉴스**: 중국 현지 뉴스 및 한인 커뮤니티 소식
- **교육 정보**: HSK, 유학, 어학연수, 온라인 교육
- **비자/서류**: 비자 신청, 거류증, 각종 서류 안내
- **자동차**: 중국 자동차 시장 동향, 전기차 정보
- **증권**: 중국 증시, 투자 정보

### 🛒 마켓플레이스
- **중고시장**: 중국 거주 한인 간 물품 거래 (택배 연동)
- **쇼핑**: 중국 현지 쇼핑 정보
- **엘로우페이지**: 현지 한인 업체 정보

### 📚 학습 시스템
- **HSK 학습**: Level 1-6 전체 단어 (6,000+)
  - 중국어 발음 (Web Speech API)
  - 음성 인식 연습
  - 4지선다 시험 시스템
- **생활 중국어**: Level 1-6 (900개 문장)
  - 플래시 카드 학습
  - 실생활 회화 연습

### 🚗 운전면허
- 운전면허 시험 정보
- 학원 정보
- 시험 예약 안내
- 커뮤니티

### 💬 커뮤니티
- **게시판**: 중국생활 커뮤니티
- **댓글 시스템**: 모든 콘텐츠에 댓글 작성 가능
- **좋아요 기능**
- **운영자 관리 기능**

### 🎓 학습 관리 시스템 (LSM)
- N Study Hub 통합
- 학습 진도 관리
- 성적 추적

### 👥 고객 관리 시스템 (CSM)
- 사용자 관리
- 댓글 관리
- 콘텐츠 관리

## 🛠 기술 스택

### Frontend
- **React 18** - UI 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS v4** - 스타일링
- **Vite** - 빌드 도구
- **Lucide React** - 아이콘
- **Recharts** - 차트/그래프
- **Motion (Framer Motion)** - 애니메이션

### Backend
- **Supabase** - 데이터베이스 + 인증 + Edge Functions
- **Hono** - Edge Functions 웹 프레임워크
- **PostgreSQL** - 관계형 데이터베이스
- **KV Store** - 키-값 저장소

### 파일 스토리지
- **AWS S3** - 대용량 파일 (이미지, 동영상)
- **Supabase Storage** - 작은 파일

### 배포
- **Vercel** - 프론트엔드 호스팅
- **Cloudflare** - CDN (선택사항)

## 📦 설치 및 실행

### 로컬 개발 환경

1. **저장소 클론**
```bash
git clone https://github.com/your-username/china-up.git
cd china-up
```

2. **패키지 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
```

`.env` 파일 편집:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AWS_S3_BUCKET=china-up-storage
VITE_AWS_REGION=ap-northeast-2
```

4. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 🚀 배포 가이드

자세한 배포 가이드는 [deployment-guide.md](./deployment-guide.md)를 참고하세요.

### 간단 배포 (Vercel)

1. GitHub에 코드 Push
2. Vercel 계정 생성
3. Vercel에서 프로젝트 Import
4. 환경 변수 설정
5. 자동 배포 완료!

### 환경 변수 (Vercel)

Vercel Dashboard → Settings → Environment Variables에 추가:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_AWS_S3_BUCKET
VITE_AWS_REGION
SUPABASE_SERVICE_ROLE_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## 📁 프로젝트 구조

```
china-up/
├── public/              # 정적 파일
├── src/
│   ├── components/      # React 컴포넌트
│   │   ├── ui/         # UI 기본 컴포넌트
│   │   ├── Header.tsx
│   │   ├── NewsSection.tsx
│   │   ├── CommentSection.tsx
│   │   └── ...
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── NewsPage.tsx
│   │   ├── EducationPage.tsx
│   │   ├── AutoPage.tsx
│   │   ├── LSMPage.tsx
│   │   ├── CSMPage.tsx
│   │   └── ...
│   ├── utils/          # 유틸리티 함수
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── info.tsx
│   │   └── s3-upload.ts
│   ├── styles/         # 전역 스타일
│   │   └── globals.css
│   ├── App.tsx         # 메인 앱 컴포넌트
│   └── main.tsx        # 엔트리 포인트
├── supabase/
│   └── functions/
│       └── server/     # Edge Functions
│           ├── index.tsx
│           └── kv_store.tsx
├── .env.example        # 환경 변수 예시
├── vercel.json         # Vercel 설정
├── deployment-guide.md # 배포 가이드
└── README.md           # 이 파일
```

## 🎨 주요 컴포넌트

### Header
- 로고 및 검색바
- 네비게이션 메뉴
- 로그인/회원가입

### NewsSection
- 뉴스 카드 그리드
- 카테고리 필터
- 더보기 기능

### CommentSection
- 댓글 목록
- 댓글 작성
- 좋아요 기능
- 운영자 삭제 기능

### HSKPage
- 6,000+ 단어 데이터
- 음성 발음
- 음성 인식
- 시험 모드

### LSMPage (학습 관리)
- 학습 진도 추적
- 성적 관리
- 과제 제출

### CSMPage (고객 관리)
- 사용자 관리
- 댓글 관리
- 통계 대시보드

## 🔐 보안

- **환경 변수**: 민감한 정보는 환경 변수로 관리
- **HTTPS**: 모든 통신 암호화
- **CORS**: 올바른 CORS 설정
- **API Key**: 서버 측에서만 사용
- **인증**: Supabase Auth 사용

## 🌐 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 📱 모바일 지원

- 반응형 디자인
- 터치 최적화
- 모바일 우선 UI

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License.

## 👨‍💻 개발자

**차이나 Up 개발팀**

## 📞 문의

- Email: contact@chinaup.com
- 웹사이트: https://chinaup.vercel.app

## 🙏 감사의 글

- Unsplash - 무료 이미지 제공
- Lucide - 아이콘 라이브러리
- Supabase - 백엔드 인프라
- Vercel - 호스팅 플랫폼

---

**Made with ❤️ for 중국 거주 한인들**
