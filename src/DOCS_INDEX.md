# 📚 차이나 Up - 문서 인덱스

모든 가이드 문서를 한눈에! 필요한 문서를 빠르게 찾으세요.

---

## 🚀 시작하기

### 처음 시작하는 분들

1. **[QUICK_START.md](./QUICK_START.md)** ⭐ 추천!
   ```
   5분 만에 배포하기
   - 체크리스트 형식
   - 초보자 친화적
   - 빠른 시작
   ```

2. **[deployment-guide.md](./deployment-guide.md)**
   ```
   전체 배포 가이드 (상세판)
   - Supabase 신청 방법
   - AWS S3 설정
   - Vercel 배포
   - 환경 변수 설정
   ```

3. **[README.md](./README.md)**
   ```
   프로젝트 소개
   - 주요 기능
   - 기술 스택
   - 설치 방법
   - 프로젝트 구조
   ```

---

## 🌐 도메인 & 주소

### 주소를 변경하고 싶다면

1. **[DOMAIN_QUICK_GUIDE.md](./DOMAIN_QUICK_GUIDE.md)** ⭐ 3분 가이드
   ```
   빠른 가이드
   - Vercel 주소 변경 (무료)
   - 커스텀 도메인 (유료)
   - 간단 설명
   ```

2. **[CUSTOM_DOMAIN_GUIDE.md](./CUSTOM_DOMAIN_GUIDE.md)**
   ```
   커스텀 도메인 완벽 가이드
   - 도메인 구매 방법
   - DNS 설정
   - 문제 해결
   - 서브도메인 설정
   ```

---

## 🏗 인프라 & 아키텍처

### 시스템 구조를 이해하고 싶다면

1. **[INFRASTRUCTURE.md](./INFRASTRUCTURE.md)**
   ```
   인프라 구성도
   - 전체 아키텍처
   - 서비스별 역할
   - 데이터 흐름
   - 비용 계산기
   ```

---

## 💬 댓글 시스템

### 댓글 기능을 이해하고 싶다면

1. **[COMMENT_SYSTEM_GUIDE.md](./COMMENT_SYSTEM_GUIDE.md)** ⭐ 신규!
   ```
   댓글 시스템 완벽 가이드
   - 등록회원 전용 댓글
   - 작성자 삭제 기능
   - 대댓글 (답글) 기능
   - API 문서
   - 사용 예시
   ```

2. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**
   ```
   댓글 시스템 업그레이드 가이드
   - 변경 사항
   - 마이그레이션 방법
   - 호환성
   - 테스트
   - 롤백 방법
   ```

---

## ❓ 문제 해결

### 문제가 발생했을 때

1. **[FAQ.md](./FAQ.md)** ⭐ 필독!
   ```
   자주 묻는 질문 24개
   - 일반 질문
   - 비용 관련
   - 기술 관련
   - 문제 해결
   ```

---

## 📖 참고 자료

### 개발 & 설정 파일

```
/.env.example          - 환경 변수 예시
/.gitignore           - Git 제외 파일
/vercel.json          - Vercel 배포 설정
/package.json         - NPM 패키지 설정
```

### 코드 파일

```
/utils/s3-upload.ts                      - S3 업로드 유틸리티
/supabase/functions/server/index.tsx     - 서버 API
```

---

## 🎯 상황별 가이드

### 상황 1: "지금 당장 배포하고 싶어요!"
```
1. QUICK_START.md 읽기 (5분)
2. 단계별로 따라하기 (30분)
3. 완료!
```

### 상황 2: "도메인 주소를 바꾸고 싶어요!"
```
무료 변경:
→ DOMAIN_QUICK_GUIDE.md의 "방법 1"

커스텀 도메인:
→ DOMAIN_QUICK_GUIDE.md의 "방법 2"
→ 자세한 설명: CUSTOM_DOMAIN_GUIDE.md
```

### 상황 3: "비용이 얼마나 드나요?"
```
→ FAQ.md의 Q4, Q5, Q6
→ INFRASTRUCTURE.md의 "비용 계산기"
```

### 상황 4: "에러가 발생했어요!"
```
1. FAQ.md에서 검색 (Ctrl+F)
2. deployment-guide.md의 "문제 해결" 섹션
3. GitHub Issues에 질문
```

### 상황 5: "S3랑 Supabase가 뭔가요?"
```
→ INFRASTRUCTURE.md
→ "서비스별 역할" 섹션 참고
```

### 상황 6: "환경 변수 설정이 헷갈려요!"
```
→ deployment-guide.md
→ "환경 변수 설정" 섹션
→ .env.example 파일 참고
```

---

## 📊 문서 난이도

### ⭐ 초급 (비개발자도 가능)
- QUICK_START.md
- DOMAIN_QUICK_GUIDE.md
- FAQ.md

### ⭐⭐ 중급 (기본 지식 필요)
- deployment-guide.md
- CUSTOM_DOMAIN_GUIDE.md
- README.md

### ⭐⭐⭐ 고급 (개발자용)
- INFRASTRUCTURE.md
- 코드 파일들

---

## 🔍 키워드로 찾기

### 배포
- QUICK_START.md
- deployment-guide.md

### 비용
- FAQ.md (Q4-Q6)
- INFRASTRUCTURE.md (비용 계산기)

### 도메인
- DOMAIN_QUICK_GUIDE.md
- CUSTOM_DOMAIN_GUIDE.md

### Supabase
- deployment-guide.md (STEP 1)
- INFRASTRUCTURE.md (서비스별 역할)

### AWS S3
- deployment-guide.md (STEP 2)
- INFRASTRUCTURE.md (파일 스토리지)

### Vercel
- deployment-guide.md (STEP 4)
- DOMAIN_QUICK_GUIDE.md

### 환경 변수
- deployment-guide.md
- .env.example

### 에러 / 문제
- FAQ.md (Q12, Q14-Q21)
- deployment-guide.md (문제 해결)

### 댓글 시스템
- COMMENT_SYSTEM_GUIDE.md (신규!)
- MIGRATION_GUIDE.md

---

## 📎 학습 경로

### 완전 초보자 (프로그래밍 경험 없음)

```
1주차: 기본 이해
└─ README.md 읽기
└─ INFRASTRUCTURE.md 그림 보기

2주차: 배포 시도
└─ QUICK_START.md 따라하기
└─ FAQ.md 읽기

3주차: 도메인 설정
└─ DOMAIN_QUICK_GUIDE.md
└─ 무료 Vercel 주소 변경

4주차: 커스텀 도메인
└─ CUSTOM_DOMAIN_GUIDE.md
└─ 도메인 구매 및 연결
```

### 개발 경험자

```
1일차:
└─ README.md (기술 스택 확인)
└─ deployment-guide.md (빠르게 훑기)
└─ 배포 완료

2일차:
└─ INFRASTRUCTURE.md (아키텍처 이해)
└─ 코드 파일 분석
└─ 커스터마이징
```

---

## 📞 지원 받기

### 문서로 해결 안 될 때

1. **GitHub Issues**
   ```
   - 버그 리포트
   - 기능 요청
   - 질문
   ```

2. **이메일**
   ```
   contact@chinaup.com
   (응답 시간: 1-2일)
   ```

3. **커뮤니티**
   ```
   - Discord (예정)
   - 카카오톡 오픈채팅 (예정)
   ```

---

## 📝 문서 업데이트 로그

### v1.0 (2024-12-25)
```
✅ 초기 문서 세트 완성
- 배포 가이드
- 도메인 가이드
- FAQ
- 인프라 문서
```

---

## 🙏 기여하기

문서 개선 제안이 있으시면:
1. GitHub Issues로 제안
2. Pull Request 제출
3. 이메일로 피드백

---

## 🎉 빠른 링크

| 하고 싶은 것 | 가이드 문서 | 소요 시간 |
|------------|-----------|----------|
| 지금 배포 | [QUICK_START.md](./QUICK_START.md) | 30분 |
| 주소 변경 | [DOMAIN_QUICK_GUIDE.md](./DOMAIN_QUICK_GUIDE.md) | 1분-30분 |
| 비용 확인 | [FAQ.md](./FAQ.md) Q4-Q6 | 5분 |
| 에러 해결 | [FAQ.md](./FAQ.md) Q12-Q21 | 10분 |
| 구조 이해 | [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | 15분 |

---

**필요한 문서를 찾으셨나요? 즐거운 개발 되세요! 🚀**

질문이 있으시면 [FAQ.md](./FAQ.md)를 먼저 확인해주세요!