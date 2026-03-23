# 🔌 Supabase 프로젝트 연결 정보

## 📍 현재 연결된 프로젝트

### ✅ **Project ID: `rpxmiyieukfuyhldqdto`**

---

## 🔍 연결 정보 상세

### Project ID
```
rpxmiyieukfuyhldqdto
```

### Dashboard URL
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto
```

### API URL
```
https://rpxmiyieukfuyhldqdto.supabase.co
```

### Edge Functions URL
```
https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586
```

### Public Anon Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweG1peWlldWtmdXlobGRxZHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzkxMTksImV4cCI6MjA3MjYxNTExOX0.H3lyRcpK6d3z24Y_ZgOOCoZ5n6U3WiZF1qZY3LNlYjA
```

---

## 🗂️ 프로젝트 식별 방법

### Supabase Dashboard에서 확인
1. **Supabase 로그인**
   ```
   https://supabase.com/dashboard
   ```

2. **프로젝트 목록 확인**
   ```
   왼쪽 상단 드롭다운 → 프로젝트 목록
   ```

3. **현재 연결된 프로젝트 찾기**
   ```
   Project ID: rpxmiyieukfuyhldqdto
   ```
   - URL에서 확인: `dashboard/project/rpxmiyieukfuyhldqdto`
   - 프로젝트 설정에서 확인: Settings → General

---

## 📊 두 프로젝트 비교

### 프로젝트 확인 방법

#### Project 1 확인
```
Dashboard → 첫 번째 프로젝트 클릭 → Settings → General

Project ID: _______________
API URL: https://_______________.supabase.co
```

#### Project 2 확인
```
Dashboard → 두 번째 프로젝트 클릭 → Settings → General

Project ID: _______________
API URL: https://_______________.supabase.co
```

#### 현재 연결 확인
```
✅ rpxmiyieukfuyhldqdto = 현재 이 앱과 연결된 프로젝트
❌ 다른 ID = 연결되지 않은 프로젝트
```

---

## 🔍 프로젝트별 특징 확인

### 현재 프로젝트 (`rpxmiyieukfuyhldqdto`)에서 확인할 것들

#### 1️⃣ Database Tables
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/database/tables

확인 사항:
✅ kv_store_c6687586 테이블이 있는가?
✅ 데이터가 들어있는가?
```

#### 2️⃣ Edge Functions
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/functions

확인 사항:
✅ make-server-c6687586 함수가 배포되어 있는가?
✅ 최근 요청 로그가 있는가?
```

#### 3️⃣ API Settings
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/settings/api

확인 사항:
✅ Project URL: https://rpxmiyieukfuyhldqdto.supabase.co
✅ anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4️⃣ 사용량 확인
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/settings/usage

확인 사항:
✅ API 요청 수
✅ Database 크기
✅ 최근 활동
```

---

## 🔄 다른 프로젝트로 변경하려면?

### 1️⃣ 새 프로젝트 정보 확인

```
Dashboard → 새 프로젝트 → Settings → API

새 Project ID: _______________ 
새 anon key: _______________
```

### 2️⃣ info.tsx 파일 수정

```typescript
// /utils/supabase/info.tsx

export const projectId = "새_프로젝트_ID"
export const publicAnonKey = "새_anon_key"
```

### 3️⃣ 서버 함수 재배포 필요

```bash
# 새 프로젝트에 Edge Function 배포
supabase functions deploy make-server-c6687586 --project-ref 새_프로젝트_ID
```

### 4️⃣ 테이블 생성 필요

```sql
-- 새 프로젝트 SQL Editor에서 실행
CREATE TABLE kv_store_c6687586 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 프로젝트 역할 구분 (예상)

### 가능한 시나리오

#### 시나리오 1: 개발/운영 분리
```
Project 1 (rpxmiyieukfuyhldqdto): 개발 환경 ← 현재 연결
Project 2: 운영 환경
```

#### 시나리오 2: 테스트/프로덕션 분리
```
Project 1 (rpxmiyieukfuyhldqdto): 테스트 ← 현재 연결
Project 2: 프로덕션
```

#### 시나리오 3: 백업/메인 분리
```
Project 1 (rpxmiyieukfuyhldqdto): 메인 ← 현재 연결
Project 2: 백업
```

#### 시나리오 4: 다른 앱용
```
Project 1 (rpxmiyieukfuyhldqdto): 차이나 Up ← 현재 연결
Project 2: 다른 프로젝트
```

---

## ✅ 빠른 확인 체크리스트

### Dashboard에서 확인하기

```
□ 1. Supabase Dashboard 접속
     https://supabase.com/dashboard

□ 2. 프로젝트 목록에서 두 프로젝트 이름 확인
     - 프로젝트 1: _______________
     - 프로젝트 2: _______________

□ 3. 각 프로젝트 ID 확인
     - 프로젝트 1: _______________
     - 프로젝트 2: _______________

□ 4. rpxmiyieukfuyhldqdto가 어느 프로젝트인지 확인
     □ 프로젝트 1
     □ 프로젝트 2

□ 5. 해당 프로젝트에 kv_store_c6687586 테이블 있는지 확인
     https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/database/tables

□ 6. Edge Function 배포 여부 확인
     https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/functions
```

---

## 🔍 현재 연결 테스트

### 브라우저 Console에서 확인

```javascript
// F12 → Console

// 1. 현재 연결된 프로젝트 ID 확인
console.log('Project ID:', 'rpxmiyieukfuyhldqdto');

// 2. API 엔드포인트 확인
const endpoint = 'https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586/csm/contents';
console.log('API Endpoint:', endpoint);

// 3. 연결 테스트
fetch(endpoint, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweG1peWlldWtmdXlobGRxZHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzkxMTksImV4cCI6MjA3MjYxNTExOX0.H3lyRcpK6d3z24Y_ZgOOCoZ5n6U3WiZF1qZY3LNlYjA'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ 연결 성공!');
  console.log('데이터:', data);
})
.catch(error => {
  console.log('❌ 연결 실패:', error);
});
```

---

## 📱 프로젝트 정보 찾는 방법

### Dashboard 스크린샷 위치

#### 1. 프로젝트 리스트
```
https://supabase.com/dashboard
→ 왼쪽 상단 "Select a project" 드롭다운
→ 모든 프로젝트 목록 표시
```

#### 2. 프로젝트 이름
```
각 프로젝트 카드에 표시:
- 프로젝트 이름
- Organization
- Region
```

#### 3. 프로젝트 URL
```
프로젝트 클릭 시 URL:
https://supabase.com/dashboard/project/[PROJECT_ID]

rpxmiyieukfuyhldqdto = 현재 연결된 프로젝트
```

---

## 💡 요약

### 현재 연결된 프로젝트

```
Project ID: rpxmiyieukfuyhldqdto
Dashboard: https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto
API URL: https://rpxmiyieukfuyhldqdto.supabase.co
```

### 확인 방법

1. **Dashboard에서 확인**
   - 두 프로젝트의 이름과 ID 확인
   - rpxmiyieukfuyhldqdto가 어느 것인지 확인

2. **Database에서 확인**
   - kv_store_c6687586 테이블이 있는지 확인
   - 데이터가 저장되어 있는지 확인

3. **활동 로그에서 확인**
   - API 요청이 들어오는지 확인
   - 최근 사용 기록 확인

### 다음 단계

**알려주세요:**
- 두 프로젝트의 이름이 무엇인가요?
- rpxmiyieukfuyhldqdto는 어떤 프로젝트인가요?
- 다른 프로젝트로 변경하고 싶으신가요?

그러면 더 정확한 안내를 드리겠습니다! 😊
