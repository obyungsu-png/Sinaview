# 차이나 Up 인프라 구성도

## 🏗 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자                               │
│                    (웹 브라우저)                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare CDN                             │
│              (선택사항 - 성능 가속)                          │
│                  전 세계 엣지 서버                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel                                  │
│              (프론트엔드 호스팅)                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  React 앱 (정적 파일)                              │     │
│  │  - HTML, CSS, JavaScript                           │     │
│  │  - 자동 빌드 & 배포                                │     │
│  │  - 글로벌 CDN                                      │     │
│  │  - HTTPS 자동 설정                                 │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Supabase   │ │   AWS S3    │ │ Cloudflare  │
│  (백엔드)   │ │ (스토리지)  │ │    (DNS)    │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 📦 서비스별 역할

### 1. **Vercel** - 프론트엔드 호스팅
```
역할: React 앱 배포 및 제공
비용: 무료 (Hobby 플랜)
주소: https://china-up.vercel.app
```

**제공 기능:**
- ✅ 자동 빌드 & 배포 (Git Push 시)
- ✅ 글로벌 CDN (빠른 로딩)
- ✅ HTTPS 자동 설정
- ✅ 무제한 배포
- ✅ Preview 배포 (PR마다)

---

### 2. **Supabase** - 백엔드 서비스
```
역할: 데이터베이스 + 인증 + API
비용: $0 (Free) → $25 (Pro)
주소: https://xxxxx.supabase.co
```

**제공 기능:**
- 🗄 **PostgreSQL 데이터베이스**
  - 댓글 저장
  - 사용자 정보
  - 게시글 데이터
  
- 🔐 **인증 (Auth)**
  - 이메일/비밀번호 로그인
  - 소셜 로그인 (Google, GitHub 등)
  - 세션 관리
  
- ⚡ **Edge Functions**
  - Hono 웹 서버
  - REST API 엔드포인트
  - S3 연동 로직
  
- 💾 **KV Store**
  - 키-값 저장소
  - 빠른 데이터 조회

**API 엔드포인트:**
```
/make-server-c6687586/health           - 서버 상태 확인
/make-server-c6687586/comments/...     - 댓글 CRUD
/make-server-c6687586/s3/presigned-url - S3 업로드 URL
/make-server-c6687586/s3/delete        - S3 파일 삭제
```

---

### 3. **AWS S3** - 파일 스토리지
```
역할: 대용량 파일 (이미지, 동영상) 저장
비용: $0 (Free Tier 12개월) → ~$3/월
버킷: china-up-storage
리전: ap-northeast-2 (서울)
```

**저장 파일:**
- 📸 프로필 사진
- 🖼 게시글 이미지
- 🎬 동영상
- 📄 첨부 파일

**보안:**
- Private 버킷 (비공개)
- Presigned URL로 접근
- CORS 설정 완료

---

### 4. **Cloudflare** - CDN & DNS (선택사항)
```
역할: 도메인 관리 + 성능 가속
비용: $0 (Free)
```

**제공 기능:**
- 🌐 DNS 관리
- ⚡ CDN 캐싱
- 🛡 DDoS 방어
- 📊 트래픽 분석

---

## 🔄 데이터 흐름

### 1. 페이지 로드
```
사용자 브라우저
    ↓
Cloudflare CDN (캐시 확인)
    ↓
Vercel (React 앱 제공)
    ↓
브라우저에서 렌더링
```

### 2. 댓글 작성
```
사용자가 댓글 입력
    ↓
React 컴포넌트 (클라이언트)
    ↓
Supabase Edge Function (서버)
    ↓
PostgreSQL DB (KV Store)
    ↓
응답 → 화면 업데이트
```

### 3. 이미지 업로드
```
사용자가 이미지 선택
    ↓
React 컴포넌트 (압축)
    ↓
Supabase Edge Function (Presigned URL 요청)
    ↓
AWS S3 (직접 업로드)
    ↓
업로드 완료 → URL 저장
```

---

## 💾 데이터 저장 전략

### 작은 데이터 → Supabase KV Store
```
- 사용자 정보 (이름, 이메일)
- 댓글 (텍스트)
- 게시글 메타데이터
- 설정 값

예시:
{
  key: "comments:visa:1",
  value: [
    { id: "1", author: "김차이나", content: "유익한 정보 감사합니다!" },
    { id: "2", author: "이베이징", content: "저도 궁금했던 내용이네요." }
  ]
}
```

### 큰 데이터 → AWS S3
```
- 프로필 사진 (100KB ~ 5MB)
- 게시글 이미지 (500KB ~ 10MB)
- 동영상 (10MB ~ 1GB)
- PDF 문서

예시:
uploads/profile/2024/user-123.jpg
uploads/posts/2024/01/image-456.jpg
uploads/videos/2024/01/video-789.mp4
```

---

## 🔐 보안 설정

### 환경 변수 (절대 코드에 포함 금지!)

**클라이언트용 (공개 가능):**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (공개 키)
VITE_AWS_S3_BUCKET=china-up-storage
VITE_AWS_REGION=ap-northeast-2
```

**서버용 (절대 비밀!):**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (운영자 키)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
```

---

## 📊 비용 계산기

### 시나리오 1: 초기 런칭 (월 1,000명)
```
Vercel:        $0    (Hobby 플랜)
Supabase:      $0    (Free - 500MB)
AWS S3:        $0    (Free Tier - 5GB)
Cloudflare:    $0    (Free)
─────────────────────
총:            $0/월
```

### 시나리오 2: 성장 단계 (월 10,000명)
```
Vercel:        $0    (여전히 Hobby 가능)
Supabase:      $25   (Pro - 8GB)
AWS S3:        $3    (100GB 사용 시)
Cloudflare:    $0    (Free)
─────────────────────
총:            $28/월 (약 36,000원)
```

### 시나리오 3: 대규모 서비스 (월 100,000명)
```
Vercel:        $20   (Pro 플랜)
Supabase:      $100  (Pro + 추가 리소스)
AWS S3:        $25   (1TB 사용 시)
AWS CloudFront: $50  (CDN)
Cloudflare:    $0    (Free)
─────────────────────
총:            $195/월 (약 250,000원)
```

---

## 🚀 확장 계획

### 단계 1: 무료 시작 (현재)
```
✅ Supabase Free
✅ Vercel Hobby
✅ AWS Free Tier
```

### 단계 2: 유료 전환 (사용자 증가 시)
```
📈 Supabase Pro ($25/월)
   - 8GB 데이터베이스
   - 더 많은 API 요청
   - 자동 백업
```

### 단계 3: 스케일 업 (대규모)
```
🚀 Supabase Enterprise
🚀 AWS CloudFront (CDN)
🚀 Multi-region 배포
🚀 전용 서버
```

---

## 📞 각 서비스 대시보드

### Vercel
```
https://vercel.com/dashboard
- 배포 로그 확인
- 환경 변수 관리
- 도메인 설정
- Analytics
```

### Supabase
```
https://supabase.com/dashboard
- Database 관리
- Edge Functions 모니터링
- 사용량 확인
- API 문서
```

### AWS Console
```
https://console.aws.amazon.com
- S3 버킷 관리
- IAM 사용자 관리
- 비용 확인
```

### Cloudflare
```
https://dash.cloudflare.com
- DNS 설정
- 트래픽 통계
- 캐시 관리
```

---

## 🛠 모니터링

### 성능 모니터링
```
✅ Vercel Analytics - 페이지 로드 시간
✅ Supabase Logs - API 응답 시간
✅ AWS CloudWatch - S3 사용량
```

### 에러 모니터링
```
✅ 브라우저 Console - 클라이언트 에러
✅ Supabase Logs - 서버 에러
✅ Vercel Logs - 빌드 에러
```

### 비용 모니터링
```
✅ AWS Cost Explorer - S3 비용
✅ Supabase Dashboard - 사용량
✅ Vercel Dashboard - 대역폭
```

---

## ✅ 인프라 체크리스트

### 배포 전
- [ ] Supabase 프로젝트 생성
- [ ] AWS S3 버킷 생성
- [ ] IAM 사용자 생성 (S3 권한)
- [ ] GitHub 저장소 생성
- [ ] 환경 변수 준비

### 배포 중
- [ ] Vercel에 프로젝트 연결
- [ ] 환경 변수 설정
- [ ] 빌드 성공 확인
- [ ] 도메인 설정 (선택)

### 배포 후
- [ ] 사이트 접속 테스트
- [ ] 댓글 기능 테스트
- [ ] 이미지 업로드 테스트
- [ ] 모니터링 설정
- [ ] 백업 설정

---

**인프라 구축 완료! 이제 서비스를 시작하세요! 🎉**
