# 📝 댓글 시스템 가이드

## 🎯 주요 기능

### 1. 등록회원 전용
- ✅ 로그인한 사용자만 댓글 작성 가능
- ✅ 비회원은 읽기만 가능
- ✅ 로그인 필요 안내 메시지 표시

### 2. 작성자 권한
- ✅ 본인이 작성한 댓글 삭제 가능
- ✅ 작성자 배지 표시
- ✅ 관리자는 모든 댓글 삭제 가능

### 3. 등록된 사용자 정보 사용
- ✅ 사용자 ID (userId) 자동 저장
- ✅ 사용자 이름 (name) 자동 저장
- ✅ 아바타 자동 생성 (이름 첫 글자)

### 4. 대댓글 (답글) 기능
- ✅ 댓글에 답글 작성
- ✅ 답글 목록 표시
- ✅ 답글 개수 카운트
- ✅ 답글도 좋아요 가능
- ✅ 답글도 작성자 삭제 가능

---

## 🔐 권한 체계

### 비회원 (로그인 안 함)
```
✅ 댓글 읽기
❌ 댓글 작성
❌ 댓글 수정
❌ 댓글 삭제
❌ 좋아요
```

### 일반 회원 (로그인)
```
✅ 댓글 읽기
✅ 댓글 작성
✅ 본인 댓글 삭제
✅ 답글 작성
✅ 본인 답글 삭제
✅ 좋아요
```

### 관리자 (isAdmin: true)
```
✅ 댓글 읽기
✅ 댓글 작성
✅ 모든 댓글 삭제
✅ 답글 작성
✅ 모든 답글 삭제
✅ 좋아요
```

---

## 💾 데이터 구조

### 댓글 데이터
```typescript
interface Comment {
  id: string;              // 댓글 고유 ID
  author: string;          // 작성자 이름 (등록된 이름)
  userId: string;          // 작성자 사용자 ID
  content: string;         // 댓글 내용
  date: string;            // 작성 날짜 (ISO 형식)
  likes: number;           // 좋아요 수
  replies?: Reply[];       // 답글 목록
}
```

### 답글 데이터
```typescript
interface Reply {
  id: string;              // 답글 고유 ID
  author: string;          // 작성자 이름
  userId: string;          // 작성자 사용자 ID
  content: string;         // 답글 내용
  date: string;            // 작성 날짜
  likes: number;           // 좋아요 수
}
```

---

## 🔌 API 엔드포인트

### 1. 댓글 목록 조회
```
GET /make-server-c6687586/comments/{pageType}/{itemId}

응답:
{
  "success": true,
  "comments": [...],
  "count": 10
}
```

### 2. 댓글 작성 (로그인 필수)
```
POST /make-server-c6687586/comments/{pageType}/{itemId}

Body:
{
  "content": "댓글 내용",
  "author": "홍길동",
  "userId": "user123"
}

응답:
{
  "success": true,
  "comment": {...}
}
```

### 3. 답글 작성 (로그인 필수)
```
POST /make-server-c6687586/comments/{pageType}/{itemId}/{commentId}/reply

Body:
{
  "content": "답글 내용",
  "author": "김철수",
  "userId": "user456"
}

응답:
{
  "success": true,
  "reply": {...}
}
```

### 4. 댓글 삭제 (작성자 또는 관리자)
```
DELETE /make-server-c6687586/comments/{pageType}/{itemId}/{commentId}

응답:
{
  "success": true,
  "message": "댓글이 삭제되었습니다."
}
```

### 5. 답글 삭제 (작성자 또는 관리자)
```
DELETE /make-server-c6687586/comments/{pageType}/{itemId}/{commentId}/reply/{replyId}

응답:
{
  "success": true,
  "message": "답글이 삭제되었습니다."
}
```

### 6. 댓글 좋아요
```
POST /make-server-c6687586/comments/{pageType}/{itemId}/{commentId}/like

응답:
{
  "success": true,
  "message": "좋아요가 반영되었습니다."
}
```

### 7. 답글 좋아요
```
POST /make-server-c6687586/comments/{pageType}/{itemId}/{commentId}/reply/{replyId}/like

응답:
{
  "success": true,
  "message": "좋아요가 반영되었습니다."
}
```

---

## 🎨 사용 예시

### 기본 사용법

```tsx
import { CommentSection } from './components/CommentSection';

function MyPage() {
  // 현재 로그인한 사용자 정보
  const currentUser = {
    id: 'user123',
    name: '홍길동'
  };
  
  // 관리자 여부
  const isAdmin = false;
  
  return (
    <CommentSection
      pageType="education"     // 페이지 타입
      itemId="hsk-1"           // 아이템 ID
      currentUser={currentUser} // 현재 사용자
      isAdmin={isAdmin}        // 관리자 여부
    />
  );
}
```

### 로그인 안 한 경우

```tsx
function MyPage() {
  return (
    <CommentSection
      pageType="visa"
      itemId="tourist-visa"
      currentUser={null}  // 로그인 안 함
      isAdmin={false}
    />
  );
}
```

결과:
```
⚠️ 댓글을 작성하려면 로그인이 필요합니다.
```

---

## 🛡️ 보안 기능

### 1. 사용자 인증
```typescript
// 서버에서 자동 확인
if (!userId || !author) {
  return {
    success: false,
    error: "로그인이 필요합니다."
  };
}
```

### 2. 삭제 권한 확인
```typescript
// 클라이언트에서 확인
const canDelete = currentUser?.id === authorUserId || isAdmin;

if (!canDelete) {
  alert('본인이 작성한 댓글만 삭제할 수 있습니다.');
  return;
}
```

### 3. 입력 검증
```typescript
// 빈 댓글 방지
if (!newComment.trim()) {
  setError('댓글 내용을 입력해주세요.');
  return;
}
```

---

## 🎯 UI/UX 특징

### 1. 작성자 표시
```
┌─────────────────────────────────┐
│ 👤 홍길동 [작성자]              │  ← 본인 댓글에만 표시
│ 2024.12.26 14:30                │
│                                  │
│ 유익한 정보 감사합니다!        │
│                                  │
│ ❤️ 좋아요 5    💬 답글 2       │
└─────────────────────────────────┘
```

### 2. 답글 구조
```
┌─ 댓글 ──────────────────────────┐
│ 👤 홍길동                        │
│ 좋은 정보네요!                  │
│                                  │
│ ├─ 답글 ────────────────────┐  │
│ │ 👤 김철수                   │  │
│ │ 저도 동감입니다!            │  │
│ │                             │  │
│ │ 👤 이영희                   │  │
│ │ 감사합니다!                 │  │
│ └─────────────────────────────┘  │
│                                  │
│ 💬 답글 쓰기                    │
└─────────────────────────────────┘
```

### 3. 답글 작성 UI
```
┌─ 답글 작성 ──────────────────┐
│ 답글을 입력하세요...          │ ← 텍스트 영역
│                                │
│                                │
│                                │
└────────────────────────[등록]─┘
```

---

## 📊 통계 정보

### 댓글 헤더
```
댓글 15  ← 전체 댓글 수 (대댓글 제외)
```

### 답글 카운트
```
💬 답글 3  ← 해당 댓글의 답글 수
```

---

## 🔄 실시간 업데이트

### 댓글 작성 후
```javascript
// 자동으로 목록에 추가
setComments([...comments, newComment]);
```

### 답글 작성 후
```javascript
// 해당 댓글의 replies 배열에 추가
setComments(comments.map(c => 
  c.id === commentId 
    ? { ...c, replies: [...(c.replies || []), newReply] }
    : c
));
```

### 좋아요 클릭 후
```javascript
// 즉시 카운트 업데이트
setComments(comments.map(c => 
  c.id === commentId 
    ? { ...c, likes: c.likes + 1 } 
    : c
));
```

---

## 🎨 스타일 커스터마이징

### 색상 변경
```css
/* 메인 그라데이션 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 변경 예시 */
background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
```

### 아바타 색상
```css
.comment-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### 작성자 배지
```css
.author-badge {
  background: #667eea;
  color: white;
}
```

---

## 🐛 문제 해결

### 1. 댓글이 표시되지 않아요
```
확인 사항:
✅ Supabase 서버 실행 중인지 확인
✅ API_BASE URL이 올바른지 확인
✅ 브라우저 Console에서 에러 확인
```

### 2. 로그인했는데 작성이 안 돼요
```
확인 사항:
✅ currentUser props가 제대로 전달되었는지 확인
✅ userId와 name이 모두 있는지 확인
✅ 네트워크 탭에서 API 요청 확인
```

### 3. 삭제 버튼이 안 보여요
```
확인 사항:
✅ currentUser.id와 comment.userId가 일치하는지
✅ isAdmin이 true인지 (관리자의 경우)
✅ Console에서 userId 값 확인
```

### 4. 답글이 저장되지 않아요
```
확인 사항:
✅ 서버에 대댓글 API가 추가되었는지
✅ 네트워크 탭에서 API 응답 확인
✅ 에러 메시지 확인
```

---

## 📈 성능 최적화

### 1. 댓글 페이지네이션 (향후 추가)
```typescript
// 10개씩 로드
const COMMENTS_PER_PAGE = 10;
```

### 2. 무한 스크롤 (향후 추가)
```typescript
// 스크롤 시 자동 로드
useEffect(() => {
  const handleScroll = () => {
    // 구현
  };
}, []);
```

### 3. 낙관적 업데이트
```typescript
// 서버 응답 전 즉시 UI 업데이트
// 현재 구현됨 ✅
```

---

## 🔮 향후 계획

### Phase 1 (현재)
- ✅ 등록회원 전용 댓글
- ✅ 작성자 삭제
- ✅ 대댓글 기능
- ✅ 좋아요 기능

### Phase 2 (예정)
- 📝 댓글 수정 기능
- 📝 댓글 신고 기능
- 📝 이미지 첨부
- 📝 멘션 기능 (@사용자)

### Phase 3 (예정)
- 📝 댓글 정렬 (최신순, 인기순)
- 📝 댓글 검색
- 📝 이메일 알림
- 📝 푸시 알림

---

## 📞 지원

문제가 있으시면:
1. `/FAQ.md` 확인
2. GitHub Issues 등록
3. 개발팀 문의

---

**댓글 시스템으로 커뮤니티를 활성화하세요! 💬**
