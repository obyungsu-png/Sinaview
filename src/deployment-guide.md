# 차이나 Up 배포 가이드

## 🚀 전체 인프라 신청 및 배포 순서

---

## 1️⃣ Supabase 신청 (데이터베이스 + 인증)

### 신청 방법:
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New project" 클릭

### 프로젝트 설정:
```
Organization: 새로 생성 (예: china-up-org)
Project name: china-up-production
Database Password: 강력한 비밀번호 생성 (저장 필수!)
Region: Northeast Asia (Seoul) 선택
Pricing: Free 또는 Pro ($25/월)
```

### 설정 정보 저장:
```
프로젝트 생성 완료 후:
Settings → API → Project URL 복사
Settings → API → anon public 키 복사
Settings → API → service_role 키 복사 (⚠️ 절대 공개 금지)
```

---

## 2️⃣ AWS 계정 생성 및 S3 설정

### AWS 계정 가입:
1. https://aws.amazon.com/ko 접속
2. "AWS 계정 생성" 클릭
3. 이메일, 비밀번호 입력
4. 신용카드 등록 (무료 티어 사용 가능, 비용 초과 시에만 청구)
5. 전화번호 인증

### S3 버킷 생성:
```
1. AWS Console 로그인
2. 검색창에 "S3" 입력 → S3 서비스 선택
3. "버킷 만들기" 클릭

버킷 설정:
- 버킷 이름: china-up-storage (전 세계 고유한 이름)
- AWS 리전: 아시아 태평양(서울) ap-northeast-2
- 객체 소유권: ACL 비활성화됨
- 퍼블릭 액세스 차단: 모든 퍼블릭 액세스 차단 (체크)
- 버킷 버전 관리: 비활성화
- 태그: 생략 가능
- 기본 암호화: Amazon S3 관리형 키(SSE-S3)
```

### CORS 설정 (중요!):
```
생성된 버킷 클릭 → 권한 → CORS 편집:

[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### IAM 사용자 생성 (보안 키):
```
1. AWS Console → 검색창에 "IAM" 입력
2. 사용자 → 사용자 추가
3. 사용자 이름: china-up-s3-user
4. AWS 자격 증명 유형: 액세스 키 - 프로그래밍 방식 액세스 (체크)
5. 다음: 권한 설정
6. 기존 정책 직접 연결 → "AmazonS3FullAccess" 검색하여 선택
7. 다음: 태그 (생략 가능)
8. 다음: 검토
9. 사용자 만들기

⚠️ 중요: Access Key ID와 Secret Access Key 다운로드 및 안전하게 보관!
   (이 정보는 다시 볼 수 없습니다)
```

---

## 3️⃣ Vercel 신청 (웹 호스팅)

### Vercel 가입:
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. GitHub로 계속하기 (추천)
4. Hobby 플랜 선택 (무료)

### GitHub Repository 준비:
```
1. GitHub에 로그인
2. 새 Repository 생성: china-up
3. 현재 코드를 GitHub에 Push:

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/china-up.git
git push -u origin main
```

### Vercel 프로젝트 생성:
```
1. Vercel Dashboard → "Add New Project"
2. GitHub repository 선택: china-up
3. Framework Preset: Vite 자동 선택됨
4. Root Directory: ./
5. Build Command: npm run build
6. Output Directory: dist
7. Install Command: npm install
```

### 환경 변수 설정:
```
Settings → Environment Variables → 다음 변수 추가:

VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_AWS_S3_BUCKET = china-up-storage
VITE_AWS_REGION = ap-northeast-2

⚠️ 서버 전용 (Supabase Edge Functions용):
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (절대 클라이언트에 노출 금지)
AWS_ACCESS_KEY_ID = AKIA...
AWS_SECRET_ACCESS_KEY = wJalrXUtn...
```

### 배포:
```
"Deploy" 클릭 → 3-5분 대기
완료 후 URL 확인: https://china-up.vercel.app
```

---

## 4️⃣ Cloudflare (선택사항 - CDN 가속)

### Cloudflare 가입:
1. https://cloudflare.com 접속
2. "Sign Up" 클릭
3. 이메일 인증

### 도메인 연결 (도메인 보유 시):
```
1. 도메인 추가: chinaup.com (예시)
2. Cloudflare 네임서버로 변경 (도메인 등록 업체에서 설정)
3. DNS 설정:
   - Type: CNAME
   - Name: @
   - Target: china-up.vercel.app
   - Proxy status: Proxied (주황색 구름)
4. Vercel에서 도메인 추가
```

---

## 📊 비용 예상

### 무료 시작 (프로토타입):
```
✅ Supabase Free: $0
✅ AWS S3 Free Tier (12개월): $0 (5GB까지)
✅ Vercel Hobby: $0
✅ Cloudflare Free: $0

총: $0/월 (초기 12개월)
```

### 실 서비스 운영 (예상 사용자 1만명):
```
💰 Supabase Pro: $25/월
💰 AWS S3 (100GB): $2.5/월
💰 AWS 데이터 전송: $10/월
💰 Vercel Pro (선택): $20/월 또는 Hobby 유지 $0
💰 Cloudflare: $0

총: $37.5 ~ $57.5/월
```

### 대규모 서비스 (10만명 이상):
```
💰 Supabase Pro + 추가 리소스: $100/월
💰 AWS S3 (1TB): $25/월
💰 AWS CloudFront (CDN): $50/월
💰 Vercel Pro: $20/월

총: $195/월
```

---

## 🔧 배포 후 설정

### Supabase 데이터베이스 초기화:
```sql
-- kv_store 테이블은 이미 생성되어 있음

-- 댓글 테이블 (이미 사용 중)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_comments_page_item ON comments(page_type, item_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
```

### 성능 모니터링:
```
1. Vercel Dashboard → Analytics
   - 페이지 로드 시간
   - 방문자 수
   - 트래픽 패턴

2. Supabase Dashboard → Database
   - 쿼리 성능
   - 연결 수
   - 스토리지 사용량

3. AWS CloudWatch
   - S3 요청 수
   - 데이터 전송량
```

---

## 🎯 배포 체크리스트

### 배포 전:
- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 프로젝트 생성 완료
- [ ] AWS S3 버킷 생성 및 CORS 설정 완료
- [ ] GitHub에 코드 Push 완료
- [ ] .env 파일은 .gitignore에 포함되어 있는지 확인

### 배포 중:
- [ ] Vercel에서 자동 빌드 성공 확인
- [ ] 빌드 로그 에러 없는지 확인
- [ ] 환경 변수가 제대로 주입되었는지 확인

### 배포 후:
- [ ] 웹사이트가 정상 작동하는지 확인
- [ ] 로그인/회원가입 테스트
- [ ] 댓글 작성/삭제 테스트
- [ ] 이미지 업로드 테스트 (S3 연동 시)
- [ ] 모바일 반응형 확인
- [ ] 성능 모니터링 설정

---

## 🆘 문제 해결

### Vercel 빌드 실패:
```
1. Build Logs 확인
2. package.json의 scripts 확인:
   "build": "vite build"
3. Node 버전 확인 (18.x 권장)
```

### Supabase 연결 실패:
```
1. 환경 변수 확인 (VITE_ 접두사 필수)
2. CORS 설정 확인
3. API 키가 올바른지 확인
```

### S3 업로드 실패:
```
1. CORS 설정 확인
2. IAM 권한 확인
3. 버킷 이름 및 리전 확인
```

---

## 📞 지원 및 문서

- Vercel 문서: https://vercel.com/docs
- Supabase 문서: https://supabase.com/docs
- AWS S3 문서: https://docs.aws.amazon.com/s3
- Cloudflare 문서: https://developers.cloudflare.com

---

## 🚀 다음 단계

배포 완료 후:
1. 커스텀 도메인 연결 (chinaup.com 등)
2. SEO 최적화 (메타 태그, sitemap.xml)
3. 구글 애널리틱스 연동
4. 에러 모니터링 (Sentry)
5. 백업 자동화 설정

---

**축하합니다! 이제 "차이나 Up"이 전 세계에 공개됩니다! 🎉**
