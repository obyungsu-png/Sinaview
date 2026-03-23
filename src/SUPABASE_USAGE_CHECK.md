# 📊 Supabase 용량 확인 가이드

## 🔍 현재 사용 중인 데이터

### Supabase에 저장되는 데이터 종류

| Key 패턴 | 설명 | 예상 크기 |
|----------|------|-----------|
| `csm:contents` | CSM 콘텐츠 (법적 고지, 정책 등) | ~10-50 KB |
| `comments:*` | 댓글 데이터 (여러 게시글) | ~1-5 KB / 게시글 |
| `chinalife:posts` | 커뮤니티 게시글 | ~5-20 KB |
| 기타 데이터 | 사용자 설정, 캐시 등 | ~1-10 KB |

**예상 총 용량: 약 20-100 KB** (초기 단계)

---

## 📏 정확한 용량 확인 방법

### 방법 1: Supabase Dashboard SQL Editor (가장 정확)

#### 1️⃣ Dashboard 접속
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/sql/new
```

#### 2️⃣ 전체 테이블 크기 확인
```sql
-- 테이블 전체 크기 (인덱스 포함)
SELECT 
  pg_size_pretty(pg_total_relation_size('kv_store_c6687586')) as total_size,
  pg_size_pretty(pg_relation_size('kv_store_c6687586')) as table_size,
  pg_size_pretty(pg_indexes_size('kv_store_c6687586')) as indexes_size;
```

**결과 예시:**
```
total_size   | table_size | indexes_size
-------------|------------|-------------
128 KB       | 64 KB      | 64 KB
```

#### 3️⃣ 저장된 행 개수 확인
```sql
-- 총 몇 개의 Key가 저장되어 있는지
SELECT COUNT(*) as total_keys
FROM kv_store_c6687586;
```

**결과 예시:**
```
total_keys
----------
3
```

#### 4️⃣ Key별 데이터 크기 확인 (상세)
```sql
-- 각 Key별로 얼마나 용량을 차지하는지
SELECT 
  key,
  pg_size_pretty(pg_column_size(key)) as key_size,
  pg_size_pretty(pg_column_size(value)) as value_size,
  pg_size_pretty(pg_column_size(key) + pg_column_size(value)) as total_row_size,
  length(value::text) as value_length
FROM kv_store_c6687586
ORDER BY pg_column_size(value) DESC;
```

**결과 예시:**
```
key              | key_size | value_size | total_row_size | value_length
-----------------|----------|------------|----------------|-------------
csm:contents     | 16 bytes | 45 KB      | 45 KB          | 45234
comments:news_1  | 19 bytes | 2 KB       | 2 KB           | 2048
chinalife:posts  | 19 bytes | 8 KB       | 8 KB           | 8192
```

#### 5️⃣ CSM 데이터만 확인
```sql
-- CSM 데이터 크기
SELECT 
  key,
  pg_size_pretty(pg_column_size(value)) as size,
  jsonb_array_length(value) as content_count,
  length(value::text) as bytes
FROM kv_store_c6687586 
WHERE key = 'csm:contents';
```

**결과 예시:**
```
key          | size   | content_count | bytes
-------------|--------|---------------|-------
csm:contents | 45 KB  | 5             | 45234
```

---

## 📊 방법 2: Supabase Dashboard Table Editor

#### 1️⃣ Table Editor 접속
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/editor
```

#### 2️⃣ 테이블 선택
```
왼쪽 메뉴: Tables → kv_store_c6687586
```

#### 3️⃣ 행 개수 확인
```
하단에 "X rows" 표시됨
```

#### 4️⃣ 각 행의 value 크기 확인
```
각 행을 클릭하면 JSON 데이터 표시
길이로 대략적인 크기 추정 가능
```

---

## 🖥️ 방법 3: 브라우저 Console에서 확인

### CSM 데이터 크기 측정
```javascript
// 브라우저 Console (F12)에서 실행

// 1. CSM 데이터 가져오기
const response = await fetch(
  'https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586/csm/contents',
  {
    headers: {
      'Authorization': 'Bearer [publicAnonKey]'
    }
  }
);
const data = await response.json();

// 2. 용량 계산
const jsonString = JSON.stringify(data.contents);
const bytes = new Blob([jsonString]).size;
const kilobytes = (bytes / 1024).toFixed(2);
const megabytes = (bytes / 1024 / 1024).toFixed(2);

console.log('📊 CSM 데이터 용량:');
console.log(`- Bytes: ${bytes}`);
console.log(`- KB: ${kilobytes}`);
console.log(`- MB: ${megabytes}`);
console.log(`- 콘텐츠 개수: ${data.contents.length}`);
```

**결과 예시:**
```
📊 CSM 데이터 용량:
- Bytes: 45234
- KB: 44.17
- MB: 0.04
- 콘텐츠 개수: 5
```

---

## 📈 전체 Database 용량 확인

### Database 전체 크기
```sql
-- 데이터베이스 전체 사용량
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size;
```

### 모든 테이블 크기 확인
```sql
-- 프로젝트의 모든 테이블 크기
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**결과 예시:**
```
schemaname | tablename           | size
-----------|---------------------|------
public     | kv_store_c6687586   | 128 KB
public     | auth.users          | 256 KB
...
```

---

## 💾 Supabase 무료 플랜 제한

### Storage 제한
```
무료 플랜:
- Database: 500 MB
- Storage (파일): 1 GB
- Bandwidth: 5 GB/월

프로 플랜:
- Database: 8 GB
- Storage: 100 GB
- Bandwidth: 50 GB/월
```

### 현재 사용률 확인
```
Supabase Dashboard → Settings → Usage
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/settings/usage
```

---

## 🎯 예상 사용량 계산

### 현재 상태 (초기)
```
테이블: kv_store_c6687586
예상 데이터:

1. csm:contents (5개 콘텐츠)
   - 평균 1개당 ~9 KB
   - 총 ~45 KB

2. comments:* (게시글 10개 가정, 각 5개 댓글)
   - 1개 댓글 ~200 bytes
   - 10개 게시글 × 5개 댓글 × 200 bytes
   - 총 ~10 KB

3. 기타 데이터
   - ~5 KB

총 예상: 약 60 KB
```

### 6개월 후 예상 (활발한 사용)
```
1. CSM: 100개 콘텐츠
   - ~900 KB

2. 댓글: 1,000개 게시글, 각 10개 댓글
   - 1,000 × 10 × 200 bytes
   - ~2 MB

3. 게시판: 5,000개 게시글
   - 평균 1개당 ~500 bytes
   - ~2.5 MB

총 예상: 약 5-6 MB
```

### 1년 후 예상 (매우 활발한 사용)
```
- CSM: ~2 MB
- 댓글: ~20 MB
- 게시판: ~50 MB
- 기타: ~10 MB

총 예상: 약 80-100 MB
```

**무료 플랜 500 MB 대비: 약 20% 사용**

---

## 🔍 실시간 모니터링

### Dashboard에서 확인
```
https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/settings/usage

확인 가능한 항목:
✅ Database 크기
✅ API 요청 수
✅ Bandwidth 사용량
✅ Storage 사용량
✅ Active connections
```

---

## 🚨 용량 최적화 팁

### 1. 이미지/파일은 S3에 저장
```javascript
// ❌ 나쁜 예: Base64로 DB에 저장
{ imageData: "data:image/png;base64,iVBORw0KG..." }  // 수백 KB

// ✅ 좋은 예: S3 URL만 저장
{ imageUrl: "https://s3.amazonaws.com/image.jpg" }  // 수십 bytes
```

### 2. 오래된 데이터 정리
```sql
-- 6개월 이상 된 댓글 삭제
DELETE FROM kv_store_c6687586 
WHERE key LIKE 'comments:%' 
  AND (value->>'createdAt')::timestamp < NOW() - INTERVAL '6 months';
```

### 3. 데이터 압축
```javascript
// JSONB는 자동 압축되지만, 불필요한 데이터 제거
{
  id: "1",
  title: "제목",
  content: "내용"
  // ✅ 필요한 필드만 저장
  // ❌ 불필요한 필드 제거
}
```

### 4. 정기 백업 및 아카이빙
```
- 활성 데이터: Supabase에 저장
- 아카이브 데이터: S3에 저장
```

---

## 📊 빠른 체크리스트

### 지금 바로 확인하기

```sql
-- ✅ 1. 총 사용량
SELECT pg_size_pretty(pg_total_relation_size('kv_store_c6687586'));

-- ✅ 2. 행 개수
SELECT COUNT(*) FROM kv_store_c6687586;

-- ✅ 3. Key 목록
SELECT key FROM kv_store_c6687586;

-- ✅ 4. 가장 큰 데이터
SELECT 
  key, 
  pg_size_pretty(pg_column_size(value)) 
FROM kv_store_c6687586 
ORDER BY pg_column_size(value) DESC 
LIMIT 5;
```

---

## 💡 요약

### 현재 예상 사용량
```
테이블: kv_store_c6687586
예상 크기: 50-100 KB (초기 단계)
무료 플랜 대비: 0.01% 미만

✅ 매우 여유로운 상태!
```

### 정확한 확인 방법
1. **가장 정확**: SQL Editor에서 위 쿼리 실행
2. **가장 편리**: Dashboard → Settings → Usage
3. **개발자용**: 브라우저 Console에서 API 호출

### Dashboard 링크
```
Usage: https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/settings/usage
SQL: https://supabase.com/dashboard/project/rpxmiyieukfuyhldqdto/sql/new
```

**현재는 거의 용량을 사용하지 않고 있으며, 무료 플랜으로 충분합니다! 🎉**
