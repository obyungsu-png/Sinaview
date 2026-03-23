# 🚀 차이나 Up 빠른 시작 가이드

## 5분 안에 배포하기!

### 📝 체크리스트

배포 전에 다음 항목들을 준비하세요:

- [ ] GitHub 계정
- [ ] 신용카드 (무료 티어도 등록 필요)
- [ ] 이메일 주소
- [ ] 30분의 시간

---

## STEP 1: Supabase 가입 (5분)

### 1.1 계정 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub로 로그인
4. 이메일 인증

### 1.2 프로젝트 생성
```
New project 클릭
├─ Organization: china-up (새로 생성)
├─ Name: china-up-production
├─ Database Password: ******** (복잡하게! 저장 필수!)
├─ Region: Northeast Asia (Seoul)
└─ Pricing Plan: Free (시작은 무료로!)
```

### 1.3 API 키 복사
```
Settings → API 클릭

복사할 정보 3가지:
✅ Project URL: https://xxxxx.supabase.co
✅ anon public: eyJhbGc...
✅ service_role: eyJhbGc... (⚠️ 절대 공개 금지!)
```

**⚠️ 중요: 이 정보를 메모장에 저장하세요!**

---

## STEP 2: AWS S3 설정 (10분)

### 2.1 AWS 계정 생성
1. https://aws.amazon.com 접속
2. "AWS 계정 생성" 클릭
3. 이메일, 비밀번호, 계정 이름 입력
4. 신용카드 등록 (무료 티어, 초과 시만 청구)
5. 전화 인증

### 2.2 S3 버킷 만들기
```
AWS Console 로그인
└─ 검색창에 "S3" 입력 → S3 선택
   └─ "버킷 만들기" 클릭
      ├─ 버킷 이름: china-up-storage
      ├─ 리전: 아시아 태평양(서울)
      ├─ 퍼블릭 액세스: 모두 차단 ✓
      └─ "버킷 만들기" 클릭
```

### 2.3 CORS 설정
```
생성한 버킷 클릭
└─ 권한 탭
   └─ CORS 편집 클릭
      └─ 아래 내용 붙여넣기:
```

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 2.4 IAM 사용자 생성
```
검색창에 "IAM" 입력 → IAM 선택
└─ 사용자 → "사용자 추가"
   ├─ 사용자 이름: china-up-s3
   ├─ 액세스 유형: 액세스 키 체크 ✓
   ├─ 권한: AmazonS3FullAccess 선택
   └─ 사용자 만들기

완료 후 다운로드:
✅ Access key ID: AKIA...
✅ Secret access key: wJalr...

⚠️ Secret key는 다시 볼 수 없으니 반드시 저장!
```

---

## STEP 3: GitHub에 코드 올리기 (5분)

### 3.1 GitHub Repository 생성
1. https://github.com 로그인
2. "+" 버튼 → "New repository"
3. Repository name: `china-up`
4. Public or Private 선택
5. "Create repository"

### 3.2 로컬 코드 Push
```bash
# 현재 프로젝트 폴더에서
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/당신의아이디/china-up.git
git push -u origin main
```

---

## STEP 4: Vercel 배포 (3분)

### 4.1 Vercel 가입
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭
4. Hobby (무료) 선택

### 4.2 프로젝트 Import
```
"Add New Project" 클릭
└─ GitHub 연결 허용
   └─ china-up 저장소 선택
      └─ "Import" 클릭
```

### 4.3 환경 변수 설정 ⭐ 가장 중요!
```
Configure Project 화면에서
└─ Environment Variables 섹션에 추가:

클라이언트용 (앞에 VITE_ 필수!):
├─ VITE_SUPABASE_URL = https://xxxxx.supabase.co
├─ VITE_SUPABASE_ANON_KEY = eyJhbGc...
├─ VITE_AWS_S3_BUCKET = china-up-storage
└─ VITE_AWS_REGION = ap-northeast-2

서버용 (Supabase Edge Functions):
├─ SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (service_role 키)
├─ AWS_ACCESS_KEY_ID = AKIA...
└─ AWS_SECRET_ACCESS_KEY = wJalr...
```

### 4.4 배포!
```
"Deploy" 버튼 클릭
└─ 3-5분 대기 (커피 한 잔 ☕)
   └─ "Congratulations!" 화면
      └─ "Visit" 클릭하여 사이트 확인!
```

---

## ✅ 배포 확인 체크리스트

### 사이트가 잘 떴나요?
- [ ] 메인 페이지가 보이나요?
- [ ] 로고와 검색바가 있나요?
- [ ] 뉴스 섹션이 표시되나요?
- [ ] 모바일에서도 잘 보이나요?

### 기능이 잘 작동하나요?
- [ ] 교육 섹션 클릭 → 상세 페이지로 이동
- [ ] 댓글 작성 가능한가요?
- [ ] 좋아요 버튼이 작동하나요?
- [ ] HSK 학습 페이지가 열리나요?

---

## 🎉 축하합니다!

당신의 사이트 주소:
```
https://china-up.vercel.app
(또는 Vercel이 자동 생성한 주소)
```

이제 친구들에게 공유하세요! 🚀

---

## 🔧 다음 단계

### 커스텀 도메인 연결 (선택사항)
```
Vercel Dashboard → 프로젝트 선택
└─ Settings → Domains
   └─ "Add" 클릭
      └─ chinaup.com 입력 (본인 도메인)
         └─ DNS 설정 안내 따라하기
```

### 성능 모니터링
```
Vercel Dashboard → Analytics
├─ 방문자 수 확인
├─ 페이지 로드 시간
└─ 트래픽 패턴
```

### 업데이트 방법
```bash
# 코드 수정 후
git add .
git commit -m "업데이트 내용"
git push

# Vercel이 자동으로 재배포! (2-3분)
```

---

## 🆘 문제 해결

### 빌드 실패?
```
Vercel → Deployment → "View Logs"
└─ 에러 메시지 확인
   └─ 환경 변수 확인 (VITE_ 접두사!)
```

### 페이지가 안 보여요?
```
브라우저 개발자 도구 (F12)
└─ Console 탭
   └─ 에러 메시지 확인
      └─ Supabase URL 확인
```

### 댓글이 안 달려요?
```
1. 환경 변수 확인
   └─ VITE_SUPABASE_URL
   └─ VITE_SUPABASE_ANON_KEY
2. Supabase Dashboard
   └─ Edge Functions 활성화 확인
```

---

## 💰 비용 안내

### 무료로 시작 (12개월)
```
✅ Supabase Free: $0/월
   └─ 500MB DB + 1GB 스토리지
✅ Vercel Hobby: $0/월
   └─ 무제한 배포
✅ AWS Free Tier: $0/월 (12개월)
   └─ 5GB S3 스토리지
✅ Cloudflare Free: $0/월
   └─ 무제한 CDN

총: $0/월
```

### 실 서비스 (월 1만명 기준)
```
💰 Supabase Pro: $25/월
💰 AWS S3: $3/월
💰 Vercel: $0/월 (Hobby 유지 가능)

총: $28/월 (약 36,000원)
```

---

## 📞 도움이 필요하신가요?

- 📧 Email: support@chinaup.com
- 💬 GitHub Issues: https://github.com/your-repo/issues
- 📚 전체 가이드: [deployment-guide.md](./deployment-guide.md)

---

**Happy Deploying! 🚀**
