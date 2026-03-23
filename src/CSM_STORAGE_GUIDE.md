# 🗄️ CSM - Supabase 저장소 연결 가이드

## ✅ Supabase 연결 상태

### CSM 시스템이 Supabase와 연결되었습니다! 🎉

모든 CSM 데이터는 **Supabase KV Store**에 자동으로 저장됩니다.

---

## 📍 저장 위치

### Supabase KV Store
```
키(Key): csm:contents
값(Value): ContentItem[] (전체 콘텐츠 배열)
```

### 데이터 구조
```typescript
{
  "csm:contents": [
    {
      id: "1735201234567",
      title: "개인정보 처리방침",
      content: "차이나 Up은 이용자의 개인정보를...",
      category: "개인정보",
      type: "legal",
      status: "active",
      createdAt: "2024-12-26",
      updatedAt: "2024-12-26",
      lastModifiedBy: "관리자",
      changeHistory: [...],
      tags: ["개인정보", "법적", "필수"]
    },
    // ... 더 많은 콘텐츠
  ]
}
```

---

## 🔄 자동 저장 시점

### 1. 페이지 로드 시
```typescript
useEffect(() => {
  loadContents(); // Supabase에서 자동 로드
}, []);
```

### 2. 새 콘텐츠 생성 시
```typescript
const handleCreateContent = (formData) => {
  // ... 콘텐츠 생성
  saveToSupabase([newContent, ...prev]); // ✅ 자동 저장
};
```

### 3. 콘텐츠 수정 시
```typescript
const handleUpdateContent = (id, updates) => {
  // ... 콘텐츠 수정
  saveToSupabase(updatedContents); // ✅ 자동 저장
};
```

### 4. 콘텐츠 삭제 시
```typescript
const handleDeleteContent = (id) => {
  // ... 콘텐츠 삭제
  saveToSupabase(filteredContents); // ✅ 자동 저장
};
```

---

## 🔌 API 엔드포인트

### 1. 콘텐츠 조회
```bash
GET https://[프로젝트ID].supabase.co/functions/v1/make-server-c6687586/csm/contents

헤더:
Authorization: Bearer [publicAnonKey]

응답:
{
  "success": true,
  "contents": [...],
  "count": 5
}
```

### 2. 콘텐츠 저장
```bash
POST https://[프로젝트ID].supabase.co/functions/v1/make-server-c6687586/csm/contents

헤더:
Authorization: Bearer [publicAnonKey]
Content-Type: application/json

바디:
{
  "contents": [...]
}

응답:
{
  "success": true,
  "message": "컨텐츠가 저장되었습니다.",
  "count": 5
}
```

---

## 🧪 연결 테스트 방법

### 방법 1: 브라우저 Console에서 테스트

1. **CSM 페이지 열기**
   - 로고 클릭 → CSM 페이지로 이동

2. **브라우저 Console 열기** (F12)

3. **저장된 데이터 확인**
```javascript
// Supabase에서 데이터 가져오기
fetch('https://[프로젝트ID].supabase.co/functions/v1/make-server-c6687586/csm/contents', {
  headers: {
    'Authorization': 'Bearer [publicAnonKey]'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Supabase 연결 성공!');
  console.log('저장된 콘텐츠 개수:', data.count);
  console.log('콘텐츠 목록:', data.contents);
});
```

### 방법 2: 네트워크 탭에서 확인

1. **F12 → Network 탭 열기**

2. **CSM 페이지 새로고침**

3. **요청 확인**
```
요청 URL: /csm/contents
메소드: GET
상태: 200 OK

응답:
{
  "success": true,
  "contents": [...]
}
```

4. **콘텐츠 생성 후 확인**
```
요청 URL: /csm/contents
메소드: POST
상태: 200 OK

요청 데이터:
{
  "contents": [새로운 콘텐츠 포함]
}
```

---

## 📊 저장된 데이터 확인

### Supabase Dashboard에서 확인

1. **Supabase Dashboard 로그인**
   ```
   https://app.supabase.com
   ```

2. **프로젝트 선택**
   ```
   Your Project → Database → Tables
   ```

3. **kv_store_c6687586 테이블 확인**
   ```sql
   SELECT * FROM kv_store_c6687586 
   WHERE key = 'csm:contents';
   ```

4. **데이터 확인**
   ```
   key: csm:contents
   value: [전체 JSON 데이터]
   ```

---

## 🔍 데이터 흐름

```
┌─────────────────┐
│  CSM 페이지     │
│  (프론트엔드)   │
└────────┬────────┘
         │
         │ 1. 페이지 로드
         ▼
┌─────────────────┐
│  loadContents() │
│  GET /csm/...   │
└────────┬────────┘
         │
         │ 2. API 요청
         ▼
┌─────────────────────────┐
│  Supabase Edge Function │
│  /make-server-c6687586  │
└────────┬────────────────┘
         │
         │ 3. KV Store 조회
         ▼
┌─────────────────────────┐
│  kv_store_c6687586      │
│  key: "csm:contents"    │
│  value: [...]           │
└────────┬────────────────┘
         │
         │ 4. 데이터 반환
         ▼
┌─────────────────┐
│  CSM 페이지     │
│  데이터 표시    │
└─────────────────┘

───────────────────────────

┌─────────────────┐
│  콘텐츠 생성/   │
│  수정/삭제      │
└────────┬────────┘
         │
         │ 1. 사용자 액션
         ▼
┌─────────────────────┐
│  saveToSupabase()   │
│  POST /csm/...      │
└────────┬────────────┘
         │
         │ 2. API 요청
         ▼
┌─────────────────────────┐
│  Supabase Edge Function │
│  kv.set()               │
└────────┬────────────────┘
         │
         │ 3. 저장 완료
         ▼
┌─────────────────────────┐
│  ✅ 데이터 저장됨       │
│  자동으로 동기화됨      │
└─────────────────────────┘
```

---

## ⚡ 실시간 동기화

### 자동 저장
- ✅ 콘텐츠 생성 → 즉시 Supabase에 저장
- ✅ 콘텐츠 수정 → 즉시 Supabase에 저장
- ✅ 콘텐츠 삭제 → 즉시 Supabase에 저장
- ✅ 상태 변경 → 즉시 Supabase에 저장

### 자동 로드
- ✅ 페이지 로드 시 Supabase에서 자동으로 데이터 가져오기
- ✅ 빈 데이터인 경우 기본 데이터 자동 생성 및 저장

---

## 🎯 저장되는 데이터

### 1. 법적 고지 & 정책 문서
```
- 개인정보 처리방침
- 이용약관
- 저작권 정책
- 운영정책
- 보안 정책
```

### 2. 일반 콘텐츠
```
- 비자/서류 가이드
- 교육 정보
- 쇼핑 정보
- 기타 콘텐츠
```

### 3. 메타데이터
```
- 제목, 내용, 카테고리
- 작성일, 수정일, 작성자
- 상태 (활성/초안/보관)
- 변경 이력
- 태그
- 이미지/파일 URL
```

---

## 💾 백업 및 복원

### 데이터 백업 (수동)

1. **Supabase Dashboard에서 백업**
```sql
SELECT value FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

2. **결과를 JSON 파일로 저장**
```
csm_backup_2024-12-26.json
```

### 데이터 복원

1. **백업 파일 준비**
```json
[
  {
    "id": "1",
    "title": "...",
    ...
  }
]
```

2. **API를 통해 복원**
```javascript
fetch('https://[프로젝트ID].supabase.co/functions/v1/make-server-c6687586/csm/contents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [publicAnonKey]'
  },
  body: JSON.stringify({
    contents: [백업 데이터]
  })
});
```

---

## 📈 용량 관리

### Supabase KV Store 제한
```
무료 플랜: 500 MB
프로 플랜: 8 GB
```

### 현재 사용량 확인
```sql
SELECT 
  key,
  pg_size_pretty(pg_column_size(value)) as size
FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

### 최적화 팁
- ✅ 이미지는 AWS S3에 업로드하고 URL만 저장
- ✅ 대용량 파일도 S3에 업로드
- ✅ 오래된 콘텐츠는 '보관' 상태로 변경
- ✅ 불필요한 변경 이력 정리

---

## 🔒 보안

### 인증
```
Authorization: Bearer [publicAnonKey]
```

### 권한
- ✅ 읽기: 누구나 가능 (publicAnonKey)
- ✅ 쓰기: 인증된 사용자만 (향후 개선 가능)

### 데이터 암호화
- ✅ HTTPS 통신
- ✅ Supabase 내장 암호화

---

## 🐛 문제 해결

### 1. "데이터가 로드되지 않아요"
```
확인 사항:
✅ Supabase Edge Functions 실행 중인지 확인
✅ 브라우저 Console에서 에러 확인
✅ Network 탭에서 API 요청 상태 확인
✅ projectId와 publicAnonKey 환경 변수 확인
```

### 2. "저장이 안 돼요"
```
확인 사항:
✅ Console에서 "저장 실패" 메시지 확인
✅ Network 탭에서 POST 요청 확인
✅ Supabase Dashboard에서 직접 확인
```

### 3. "데이터가 사라졌어요"
```
해결 방법:
✅ 브라우저 새로고침 (F5)
✅ CSM 페이지 다시 열기
✅ Supabase Dashboard에서 직접 확인
✅ 백업 파일로 복원
```

---

## 📞 추가 정보

### 관련 문서
- `/COMMENT_SYSTEM_GUIDE.md` - 댓글 시스템 (같은 방식으로 저장)
- `/deployment-guide.md` - Supabase 설정
- `/INFRASTRUCTURE.md` - 전체 아키텍처

### 코드 파일
- `/pages/CSMPage.tsx` - CSM 프론트엔드
- `/supabase/functions/server/index.tsx` - API 엔드포인트

---

## ✅ 확인 체크리스트

- [x] Supabase 연결 완료
- [x] CSM API 엔드포인트 추가
- [x] 자동 로드 기능 구현
- [x] 자동 저장 기능 구현
- [x] 생성/수정/삭제 시 저장
- [x] 에러 처리 구현
- [x] 초기 데이터 자동 생성

**모든 CSM 데이터가 안전하게 Supabase에 저장됩니다! 🎉**
