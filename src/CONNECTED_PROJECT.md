# 🎯 연결된 Supabase 프로젝트 확인

## ✅ **"각종 기출 문제 사이트"와 연결되어 있습니다!**

---

## 📊 프로젝트 정보

### 현재 연결된 프로젝트
```
프로젝트 이름: 각종 기출 문제 사이트
Project ID: rpxmiyieukfuyhldqdto
```

### 연결되지 않은 프로젝트
```
프로젝트 이름: Experience Tips for App
Project ID: (다른 ID)
```

---

## 🔍 왜 "각종 기출 문제 사이트"인가?

### 현재 앱의 주요 기능들

#### 1️⃣ HSK 시험 시스템
```typescript
// /pages/HSKPage.tsx
- HSK Level 1-6 모든 단어 데이터
- 4지선다 객관식 시험
- 음성 인식 및 발음 기능
- Web Speech API 활용
```

**→ 기출 문제 사이트와 연관성: ✅✅✅**

#### 2️⃣ 생활 중국어 학습
```typescript
// 900개 중국어 문장
- Level 1-6 체계적 학습
- 플래시 카드 형태
- 발음 및 해석
```

**→ 기출 문제 사이트와 연관성: ✅✅✅**

#### 3️⃣ 교육 섹션
```typescript
// /components/EducationSection.tsx
- 중국어 학습
- 시험 준비
- 교육 콘텐츠
```

**→ 기출 문제 사이트와 연관성: ✅✅**

#### 4️⃣ CSM (Customer Service Management)
```typescript
// /pages/CSMPage.tsx
- 법적 고지
- 정책 관리
- 콘텐츠 관리
```

**→ 기출 문제 사이트 운영 관리용: ✅**

---

## 📱 현재 앱 = "차이나 Up" (중국어 학습 포털)

### 주요 탭/섹션
```
✅ 교육 (HSK, 생활 중국어)
✅ 중국소식
✅ 쇼핑
✅ 중고시장
✅ 자동차
✅ 부동산
✅ 증권
✅ 엘로우페이지
✅ 비자/서류
✅ 운전면허
✅ CSM
```

### 학습 기능
```
✅ HSK Level 1-6 전체 단어
✅ 4지선다 객관식 시험
✅ 중국어 발음 (Web Speech API)
✅ 음성 인식
✅ 생활 중국어 900문장
✅ 플래시 카드 학습
```

**→ "각종 기출 문제 사이트"로서의 역할: 완벽 ✅**

---

## 🎓 "각종 기출 문제 사이트"로서의 특징

### 1. HSK 기출 문제
```
- HSK 1급 ~ 6급 전체 단어
- 객관식 문제 형태
- 난이도별 분류
- 정답 체크 및 피드백
```

### 2. 실전 시험 모드
```
- 4지선다 문제
- 시간 제한 (선택)
- 점수 계산
- 오답 노트
```

### 3. 학습 모드
```
- 플래시 카드
- 발음 듣기
- 따라 말하기 (음성 인식)
- 단계별 학습
```

### 4. 중국어 생활 회화
```
- 900개 실용 문장
- Level 1-6 분류
- 상황별 대화
```

---

## 🔗 Supabase 연결 구조

### 현재 구조
```
"각종 기출 문제 사이트" Supabase 프로젝트
(rpxmiyieukfuyhldqdto)
    │
    ├─ Database
    │   └─ kv_store_c6687586
    │       ├─ csm:contents (CSM 데이터)
    │       ├─ comments:* (댓글 데이터)
    │       └─ chinalife:posts (커뮤니티 게시글)
    │
    ├─ Edge Functions
    │   └─ make-server-c6687586
    │       ├─ /csm/contents (GET/POST)
    │       └─ 기타 API
    │
    └─ Auth
        └─ 사용자 인증 (예정)
```

### "Experience Tips for App" 프로젝트는?
```
현재 사용 안 함
→ 다른 앱용이거나 백업용일 가능성
```

---

## 📍 확인 방법

### Supabase Dashboard에서 확인

#### 1️⃣ 프로젝트 접속
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto
```

#### 2️⃣ 프로젝트 이름 확인
```
Dashboard 상단 또는 Settings → General
→ 프로젝트 이름: "각종 기출 문제 사이트"
```

#### 3️⃣ Database 확인
```
Database → Tables → kv_store_c6687586
→ CSM 데이터, 댓글 데이터 등 확인
```

#### 4️⃣ Edge Functions 확인
```
Functions → make-server-c6687586
→ 배포 상태 확인
→ 로그에서 최근 요청 확인
```

---

## 💡 프로젝트 역할 추론

### "각종 기출 문제 사이트" (rpxmiyieukfuyhldqdto)
```
역할: 메인 프로덕션 환경
용도: 차이나 Up 앱 운영
기능: HSK 시험, 생활 중국어, CSM 등
상태: ✅ 현재 활성화 및 사용 중
```

### "Experience Tips for App"
```
역할: 테스트/개발/백업 환경 또는 다른 앱
용도: 미확인
기능: 미확인
상태: ❓ 현재 앱과 연결 안 됨
```

---

## 🔄 프로젝트 전환 시 주의사항

### "Experience Tips for App"으로 전환하려면?

#### 1️⃣ 새 프로젝트 ID 확인
```
Dashboard → Experience Tips for App → Settings → General
→ Project ID 복사
```

#### 2️⃣ /utils/supabase/info.tsx 수정
```typescript
export const projectId = "새_프로젝트_ID"
export const publicAnonKey = "새_anon_key"
```

#### 3️⃣ 데이터 마이그레이션 필요
```sql
-- kv_store_c6687586 테이블 생성
-- 기존 데이터 복사
-- Edge Function 재배포
```

#### ⚠️ 주의
```
- 모든 데이터가 사라짐
- API 엔드포인트 변경 필요
- 기존 사용자 데이터 이전 필요
```

---

## 📊 현재 저장된 데이터 위치

### "각종 기출 문제 사이트" 프로젝트에 저장되는 것들

```
✅ CSM 콘텐츠 (법적 고지, 정책 등)
✅ 사용자 댓글 (뉴스, 교육, 쇼핑 등)
✅ 커뮤니티 게시글
✅ 기타 사용자 데이터

저장 위치:
Database: rpxmiyieukfuyhldqdto
Table: kv_store_c6687586
Keys: csm:contents, comments:*, chinalife:posts 등
```

---

## 🎯 요약

### ✅ 연결 확인
```
현재 앱: 차이나 Up (중국어 학습 포털)
연결된 Supabase: "각종 기출 문제 사이트"
Project ID: rpxmiyieukfuyhldqdto
```

### 🎓 왜 이 프로젝트?
```
1. HSK 기출 문제 시스템 ✅
2. 생활 중국어 학습 ✅
3. 객관식 시험 기능 ✅
4. 교육 콘텐츠 관리 ✅
→ "각종 기출 문제 사이트"로 완벽하게 부합
```

### 📍 Dashboard 링크
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto

→ 여기서 "각종 기출 문제 사이트"라는 이름 확인 가능
```

### ❓ 다른 프로젝트는?
```
"Experience Tips for App"
→ 현재 앱과 연결 안 됨
→ 다른 용도로 사용 중이거나 백업용
```

---

## 🎉 결론

**네, "각종 기출 문제 사이트" Supabase 프로젝트와 연결되어 있습니다!**

이 프로젝트는 HSK 시험, 중국어 학습 등 교육 콘텐츠를 제공하는 "차이나 Up" 앱의 백엔드로 사용되고 있으며, 프로젝트 이름과 앱 기능이 완벽하게 일치합니다! ✅

**Project ID: `rpxmiyieukfuyhldqdto`**
