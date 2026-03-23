# 🗄️ Supabase 테이블 정보

## 📊 CSM 데이터가 저장된 테이블

---

## 테이블 이름

```
kv_store_c6687586
```

---

## 테이블 구조

### Schema (DDL)
```sql
CREATE TABLE kv_store_c6687586 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### 컬럼 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `key` | TEXT | PRIMARY KEY, NOT NULL | 데이터를 구분하는 고유 키 |
| `value` | JSONB | NOT NULL | JSON 형태로 저장되는 실제 데이터 |

---

## 💾 CSM 데이터 저장 방식

### 저장된 행(Row)

```sql
-- CSM 데이터는 다음과 같이 저장됩니다:
key   = 'csm:contents'
value = [
  {
    "id": "1735201234567",
    "title": "개인정보 처리방침",
    "content": "차이나 Up은 이용자의...",
    "category": "개인정보",
    "type": "legal",
    "status": "active",
    "createdAt": "2024-12-26",
    "updatedAt": "2024-12-26",
    "lastModifiedBy": "관리자",
    "changeHistory": [...],
    "tags": ["개인정보", "법적", "필수"]
  },
  ... (더 많은 콘텐츠)
]
```

---

## 🔍 Supabase Dashboard에서 확인하기

### 1. Dashboard 접속
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/database/tables
```

### 2. 테이블 찾기
```
왼쪽 메뉴: Database → Tables
테이블 목록에서: kv_store_c6687586
```

### 3. 데이터 확인
```sql
-- Table Editor에서 직접 확인
-- 또는 SQL Editor에서:

SELECT * FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

---

## 📝 저장된 데이터 예시

### 테이블 뷰

| key | value |
|-----|-------|
| `csm:contents` | `[{"id":"1","title":"개인정보 처리방침",...}, {...}]` |
| `comments:news_1` | `[{"id":"c1","content":"좋은 정보네요",...}]` |
| `chinalife:posts` | `[{"id":"p1","title":"상해 생활 팁",...}]` |

### CSM 데이터 상세

```json
{
  "key": "csm:contents",
  "value": [
    {
      "id": "1",
      "title": "개인정보 처리방침",
      "content": "차이나 Up은 이용자의 개인정보를 중요시하며...",
      "category": "개인정보",
      "type": "legal",
      "status": "active",
      "createdAt": "2024-12-26",
      "updatedAt": "2024-12-26",
      "lastModifiedBy": "관리자",
      "changeHistory": [
        {
          "timestamp": "2024-12-26 14:30",
          "editor": "관리자",
          "action": "created",
          "changes": "최초 작성"
        }
      ],
      "tags": ["개인정보", "법적", "필수"]
    },
    {
      "id": "2",
      "title": "이용약관",
      "content": "차이나 Up 서비스 이용약관에...",
      "category": "약관",
      "type": "legal",
      "status": "active",
      ...
    }
  ]
}
```

---

## 🔎 SQL 쿼리로 확인하기

### 1. CSM 데이터 조회
```sql
SELECT 
  key,
  value,
  jsonb_array_length(value) as content_count
FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

**결과:**
```
key: csm:contents
value: [전체 JSON 배열]
content_count: 5 (콘텐츠 개수)
```

### 2. 모든 키 확인
```sql
SELECT key FROM kv_store_c6687586 
ORDER BY key;
```

**결과:**
```
csm:contents
comments:news_1
comments:news_2
chinalife:posts
...
```

### 3. 데이터 크기 확인
```sql
SELECT 
  key,
  pg_size_pretty(pg_column_size(value)) as size,
  jsonb_array_length(value) as items
FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

**결과:**
```
key: csm:contents
size: 15 KB
items: 5
```

### 4. CSM 특정 콘텐츠 검색
```sql
SELECT 
  key,
  jsonb_array_elements(value) ->> 'title' as title,
  jsonb_array_elements(value) ->> 'category' as category,
  jsonb_array_elements(value) ->> 'status' as status
FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

**결과:**
```
key            | title              | category    | status
---------------|--------------------|-----------  |--------
csm:contents   | 개인정보 처리방침   | 개인정보     | active
csm:contents   | 이용약관           | 약관         | active
csm:contents   | 저작권 정책        | 저작권       | active
...
```

---

## 🛠️ 데이터 조작 (SQL)

### 1. 전체 데이터 보기
```sql
SELECT 
  key,
  jsonb_pretty(value) as formatted_data
FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

### 2. 데이터 백업
```sql
-- JSON 파일로 내보내기
COPY (
  SELECT value 
  FROM kv_store_c6687586 
  WHERE key = 'csm:contents'
) TO '/tmp/csm_backup.json';
```

### 3. 수동 데이터 추가 (긴급 시)
```sql
-- 주의: 일반적으로 API를 통해 저장하는 것을 권장
INSERT INTO kv_store_c6687586 (key, value)
VALUES (
  'csm:contents',
  '[
    {
      "id": "1",
      "title": "테스트",
      ...
    }
  ]'::jsonb
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;
```

### 4. 데이터 삭제 (주의!)
```sql
-- CSM 데이터만 삭제
DELETE FROM kv_store_c6687586 
WHERE key = 'csm:contents';

-- 모든 CSM 관련 키 삭제
DELETE FROM kv_store_c6687586 
WHERE key LIKE 'csm:%';
```

---

## 📊 다른 시스템도 같은 테이블 사용

### 같은 테이블에 저장되는 다른 데이터

| Key 패턴 | 설명 | 사용처 |
|----------|------|--------|
| `csm:contents` | CSM 콘텐츠 | CSM 페이지 |
| `comments:*` | 댓글 데이터 | 모든 게시판 댓글 |
| `chinalife:posts` | 게시판 글 | 차이나 Life 커뮤니티 |
| `users:*` | 사용자 정보 | 회원 시스템 |

### 장점
✅ 하나의 테이블로 여러 시스템 관리
✅ 간단한 구조
✅ 빠른 조회 (Key-Value)
✅ JSONB로 유연한 데이터 구조

---

## 🔐 접근 권한

### API를 통한 접근 (권장)
```javascript
// GET - 데이터 조회
fetch('https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586/csm/contents', {
  headers: {
    'Authorization': 'Bearer [publicAnonKey]'
  }
});

// POST - 데이터 저장
fetch('https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586/csm/contents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [publicAnonKey]'
  },
  body: JSON.stringify({ contents: [...] })
});
```

### 직접 SQL 접근 (관리자만)
```
Supabase Dashboard → SQL Editor
SERVICE_ROLE_KEY 필요
```

---

## 📈 용량 관리

### 현재 테이블 전체 크기
```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('kv_store_c6687586')) as total_size;
```

### Key별 크기
```sql
SELECT 
  key,
  pg_size_pretty(pg_column_size(value)) as size
FROM kv_store_c6687586
ORDER BY pg_column_size(value) DESC;
```

---

## 🎯 요약

### 테이블 정보
```
테이블 이름: kv_store_c6687586
컬럼 구조: 
  - key (TEXT, PRIMARY KEY)
  - value (JSONB)
  
CSM 데이터 위치:
  - key: 'csm:contents'
  - value: [전체 콘텐츠 JSON 배열]
```

### Dashboard 링크
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/database/tables
```

### 확인 방법
1. ✅ Dashboard → Tables → `kv_store_c6687586`
2. ✅ SQL Editor: `SELECT * FROM kv_store_c6687586 WHERE key = 'csm:contents'`
3. ✅ Table Editor에서 직접 보기

---

**CSM 데이터는 `kv_store_c6687586` 테이블의 `csm:contents` 키에 JSONB 형태로 저장됩니다!** 🎉
