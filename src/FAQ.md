# 자주 묻는 질문 (FAQ)

## 📌 일반 질문

### Q1: 정말 무료로 시작할 수 있나요?
**A:** 네! 12개월 동안 완전 무료입니다.

```
무료 서비스:
✅ Supabase Free (500MB DB)
✅ AWS Free Tier (5GB S3, 12개월)
✅ Vercel Hobby (무제한 배포)
✅ Cloudflare Free (무제한 CDN)

조건: 신용카드 등록은 필요하지만, 
     무료 한도 내에서는 청구 안됨
```

### Q2: 신용카드가 없으면 안되나요?
**A:** 대부분의 클라우드 서비스는 신용카드가 필요합니다.

```
신용카드 필요:
- AWS (필수)
- Supabase (필수)
- Vercel (선택 - GitHub 계정만으로도 가능)

대안:
- 체크카드 가능
- Paypal 가능 (Vercel)
```

### Q3: 영어를 잘 못하는데 괜찮을까요?
**A:** 네! 이 가이드만 따라하시면 됩니다.

```
팁:
1. Chrome 자동 번역 사용
2. 스크린샷과 함께 단계별 진행
3. 복사-붙여넣기로 대부분 해결
```

---

## 💰 비용 관련

### Q4: 언제부터 비용이 발생하나요?
**A:** 무료 한도를 초과할 때부터입니다.

```
Supabase Free 한도:
- DB: 500MB
- Storage: 1GB
- API 요청: 월 5만건

→ 초과 시: Pro 플랜으로 자동 업그레이드 ($25/월)

AWS S3 Free Tier (12개월):
- Storage: 5GB
- 요청: 월 2만건

→ 12개월 후 또는 초과 시: 
   5GB 기준 약 $0.50/월 (매우 저렴)
```

### Q5: 갑자기 큰 비용이 청구될 수 있나요?
**A:** 아니요! 알림을 설정하면 안전합니다.

```
AWS 비용 알림 설정:
1. AWS Console → Billing
2. "Budgets" 클릭
3. "Create budget"
4. 월 $5 초과 시 이메일 알림 설정

Supabase:
- Free 플랜에서 자동 업그레이드 안됨
- Pro 플랜 선택 시에만 청구
```

### Q6: 1TB 저장하면 얼마나 드나요?
**A:** 스토리지 종류에 따라 다릅니다.

```
AWS S3 (1TB):
- 스토리지: $23/월
- 데이터 전송: $50/월 (10TB 전송 시)
- 총: 약 $73/월 (약 95,000원)

Supabase Enterprise (1TB):
- 협상 필요
- 예상: $500-1000/월

💡 팁: 
실제로 1TB가 필요한 경우는 드뭅니다.
대부분 100GB 이하로 운영 가능
```

---

## 🔧 기술 관련

### Q7: 프로그래밍을 전혀 모르는데 가능한가요?
**A:** 배포는 가능하지만, 수정은 어렵습니다.

```
할 수 있는 것:
✅ GitHub에 코드 올리기 (복사-붙여넣기)
✅ Vercel 배포 (클릭 몇 번)
✅ 환경 변수 설정 (복사-붙여넣기)

어려운 것:
❌ 디자인 수정
❌ 기능 추가
❌ 버그 수정

권장: 개발자 친구에게 도움 요청
```

### Q8: Node.js가 뭔가요? 설치해야 하나요?
**A:** 로컬 개발 시에만 필요합니다.

```
Vercel 배포만 할 경우:
→ Node.js 설치 불필요 ✅

로컬에서 테스트하려면:
→ Node.js 18.x 이상 설치 필요
→ https://nodejs.org 에서 다운로드
```

### Q9: GitHub이 뭔가요?
**A:** 코드 저장소입니다 (구글 드라이브 같은 것).

```
GitHub 역할:
1. 코드를 저장하는 곳
2. 버전 관리 (변경 이력)
3. Vercel이 여기서 코드를 가져감

만드는 법:
1. https://github.com 가입
2. "New repository" 클릭
3. 이름 입력하고 생성
```

### Q10: Git이랑 GitHub이랑 다른 건가요?
**A:** 네, 다릅니다.

```
Git:
- 프로그램 (도구)
- 컴퓨터에 설치
- 버전 관리 기능

GitHub:
- 웹사이트 (서비스)
- 계정 생성
- Git으로 관리한 코드를 저장

비유: 
Git = 사진 찍는 카메라
GitHub = 사진 올리는 인스타그램
```

---

## 🚀 배포 관련

### Q11: 배포 후 수정하려면 어떻게 하나요?
**A:** 코드를 수정하고 GitHub에 Push하면 자동 배포됩니다.

```
방법 1: GitHub 웹에서 직접 수정
1. GitHub 저장소 접속
2. 파일 클릭
3. 연필 아이콘 클릭 (Edit)
4. 수정 후 "Commit changes"
5. 2-3분 후 Vercel이 자동 배포

방법 2: 로컬에서 수정
1. 코드 수정
2. git add .
3. git commit -m "수정 내용"
4. git push
5. 2-3분 후 자동 배포
```

### Q12: 배포가 실패했어요!
**A:** 로그를 확인하세요.

```
Vercel 에러 확인:
1. Vercel Dashboard → 프로젝트
2. 실패한 배포 클릭
3. "View Logs" 클릭
4. 빨간색 에러 메시지 확인

자주 발생하는 에러:
❌ "Module not found"
   → package.json 확인

❌ "Environment variable not found"
   → 환경 변수 설정 확인 (VITE_ 접두사!)

❌ "Build failed"
   → 로그에서 구체적인 에러 확인
```

### Q13: 도메인을 연결하고 싶어요!
**A:** Vercel에서 쉽게 연결할 수 있습니다.

```
이미 도메인이 있는 경우:
1. Vercel → Settings → Domains
2. "Add" 클릭
3. 도메인 입력 (예: chinaup.com)
4. DNS 설정 안내 따라하기

도메인 구매:
1. Namecheap (추천): ~$10/년
2. GoDaddy: ~$15/년
3. Cloudflare: ~$9/년

무료 도메인:
- Vercel 기본 제공: *.vercel.app
- Freenom (무료): *.tk, *.ml 등
```

---

## 🔐 보안 관련

### Q14: API 키가 노출되면 어떻게 되나요?
**A:** 즉시 재발급하세요!

```
노출 시 위험:
❌ 무단 사용
❌ 비용 청구
❌ 데이터 삭제

재발급 방법:
Supabase:
1. Settings → API
2. "Reset API key" 클릭
3. 새 키 복사
4. Vercel 환경 변수 업데이트

AWS:
1. IAM → Users
2. 해당 사용자 선택
3. Security credentials
4. "Make inactive" → 새 키 생성
```

### Q15: 해킹 당할 수 있나요?
**A:** 기본 보안은 충분하지만, 추가 조치를 권장합니다.

```
기본 보안 (이미 적용됨):
✅ HTTPS 암호화
✅ Private S3 버킷
✅ CORS 설정
✅ 환경 변수 분리

추가 보안:
✅ Supabase RLS (Row Level Security) 설정
✅ Rate Limiting 설정
✅ 2FA 활성화 (GitHub, AWS, Vercel)
✅ 정기적인 비밀번호 변경
```

---

## 📱 기능 관련

### Q16: 모바일 앱도 만들 수 있나요?
**A:** 현재 코드는 웹 전용이지만, PWA로 만들 수 있습니다.

```
PWA (Progressive Web App):
- 모바일 홈 화면에 추가 가능
- 오프라인 지원
- 푸시 알림 가능

별도 앱 개발:
- React Native (iOS, Android)
- Flutter
→ 추가 개발 필요
```

### Q17: 댓글 기능이 안 돼요!
**A:** 환경 변수와 서버 상태를 확인하세요.

```
확인 사항:
1. 환경 변수 (Vercel)
   - VITE_SUPABASE_URL ✓
   - VITE_SUPABASE_ANON_KEY ✓

2. Supabase Edge Functions 배포 확인
   https://xxxxx.supabase.co/functions/v1/make-server-c6687586/health
   → {"status": "ok"} 응답 확인

3. 브라우저 Console (F12)
   → 에러 메시지 확인
```

### Q18: 이미지 업로드가 안 돼요!
**A:** S3 설정을 확인하세요.

```
확인 사항:
1. AWS 환경 변수
   - AWS_ACCESS_KEY_ID ✓
   - AWS_SECRET_ACCESS_KEY ✓
   - VITE_AWS_S3_BUCKET ✓

2. S3 CORS 설정
   - 버킷 → 권한 → CORS
   - AllowedOrigins: "*"
   - AllowedMethods: ["GET", "PUT", "POST"]

3. IAM 권한
   - AmazonS3FullAccess 정책 확인
```

---

## 🛠 문제 해결

### Q19: "환경 변수를 찾을 수 없습니다" 에러
**A:** VITE_ 접두사를 확인하세요.

```
❌ 잘못된 예:
SUPABASE_URL=...

✅ 올바른 예:
VITE_SUPABASE_URL=...

⚠️ 주의:
- 클라이언트에서 사용하는 변수는 VITE_ 필수!
- 서버 전용 변수는 VITE_ 없이 사용
```

### Q20: "Cannot read property of undefined" 에러
**A:** 데이터가 로드되기 전에 렌더링되는 문제입니다.

```
해결 방법:
1. Loading 상태 확인
2. Optional chaining 사용
   예: data?.value 대신 data.value
3. 기본값 설정
   예: data || []
```

### Q21: 사이트가 느려요!
**A:** 여러 원인이 있을 수 있습니다.

```
체크리스트:
1. 이미지 최적화
   - 크기 줄이기 (1920px 이하)
   - WebP 포맷 사용
   - Lazy loading

2. Cloudflare CDN 사용
   - 무료로 속도 향상

3. Vercel Analytics 확인
   - 어느 페이지가 느린지 파악

4. Supabase 쿼리 최적화
   - 불필요한 데이터 로드 제거
```

---

## 📞 지원

### Q22: 더 도움이 필요해요!
**A:** 여러 채널로 도움을 받으실 수 있습니다.

```
공식 문서:
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- AWS: https://docs.aws.amazon.com

커뮤니티:
- Stack Overflow
- GitHub Issues
- Discord (Supabase, Vercel)

한국어 커뮤니티:
- 개발자 카페
- 슬랙 채널
- 페이스북 그룹
```

### Q23: 전문가 도움이 필요해요!
**A:** 프리랜서 개발자를 고용하실 수 있습니다.

```
플랫폼:
- 크몽: 한국 프리랜서
- Fiverr: 글로벌 프리랜서
- Upwork: 글로벌 전문가

예상 비용:
- 간단한 수정: 5-10만원
- 기능 추가: 20-50만원
- 전체 커스터마이징: 100만원+
```

---

## 🎓 학습 자료

### Q24: 더 배우고 싶어요!
**A:** 추천 학습 자료입니다.

```
React:
- 공식 문서: https://react.dev
- 인프런 강의 (한국어)

TypeScript:
- 공식 문서: https://www.typescriptlang.org
- 드림코딩 (유튜브)

Supabase:
- 공식 튜토리얼
- YouTube: Fireship

AWS:
- AWS Skill Builder (무료)
- 생활코딩 (유튜브, 한국어)
```

---

**더 궁금한 점이 있으신가요? GitHub Issues에 질문해주세요! 💬**
