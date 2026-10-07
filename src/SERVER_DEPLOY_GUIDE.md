# 서버 함수 배포 안내 (make-server-c6687586)

서버 코드: `src/supabase/functions/server/index.tsx` (+ `kv_store.tsx`, 변경 없음)
데이터 저장: `kv_store_c6687586` 테이블

## 배포 방법
**방법 A — Supabase 대시보드**
1. Supabase → Edge Functions → `make-server-c6687586` → Code
2. `index.tsx` 내용을 이 저장소의 파일 내용으로 교체 → Deploy

**방법 B — Supabase CLI**
```bash
mkdir -p supabase/functions/make-server-c6687586
cp src/supabase/functions/server/* supabase/functions/make-server-c6687586/
mv supabase/functions/make-server-c6687586/index.tsx supabase/functions/make-server-c6687586/index.ts
supabase functions deploy make-server-c6687586 --project-ref rpxmiyieukfuyhldqdto
```

필요한 비밀값: `GLM_API_KEY`(AI 채팅에서 이미 사용 중), `SUPABASE_URL`·`SUPABASE_ANON_KEY`·`SUPABASE_SERVICE_ROLE_KEY`(Supabase가 자동 제공)

## 1. 증권 시세·뉴스 자동 갱신
- `GET /market/quotes`: 텐센트 증권 공개 시세 → 5분 캐시 (`market:quotes`)
  - 중국·홍콩만: 지수 6개(상하이종합·선전성분·CSI300·창업판·항셍·항셍테크) + 종목 10개(텐센트·알리바바·BYD·샤오미·메이퇀·징둥·바이두·마오타이·CATL·핑안)
- `GET /market/news`: 시나 재경 뉴스 → 원문 본문을 읽어 GLM(`glm-z1-flash`)이 **한국어 기사**(제목·요약·본문 4~6문단·분류)를 작성 + **AI 시장 브리핑**(3~5줄, 매수·매도 권유 없음) → 1시간마다 (`market:news`)
  - 1시간에 새 기사 최대 8건 검토, 최근 40건 보관. 중국·홍콩 증시와 무관하거나 한자·일본어가 남은 기사는 버림
  - 사이트에서는 링크 대신 기사 창으로 열림
- 방문자가 들어왔을 때 오래됐으면 서버가 새로 가져옵니다. 별도 cron 불필요.
- 실패하면 마지막 저장값을, 저장값도 없으면 화면은 예시 데이터를 보여 줍니다.
- 종목 변경: `QUOTE_SYMBOLS`, 뉴스 소스: `NEWS_SOURCES`, 주기: `QUOTES_TTL_MS`·`NEWS_TTL_MS`

## 2. 회원 로그인 (Supabase Auth)
- `POST /auth/signup`: 아이디(영문·숫자·_ 4~20자)·비밀번호(6자 이상)·지역
- `POST /auth/login`: 로그인 → 브라우저가 세션을 `supabase.auth.setSession()`으로 보관·자동 갱신
- 내부적으로 `아이디@users.example.com` 이메일로 Supabase Auth 계정을 만듭니다(메일은 보내지 않음).
  다른 도메인을 쓰려면 비밀값 `LOGIN_EMAIL_DOMAIN`을 설정하세요. **회원이 생긴 뒤에는 바꾸지 마세요.**
- 예전 방식(브라우저에만 저장)으로 가입한 계정은 사용할 수 없어 다시 가입해야 합니다.
- 가입한 회원은 Supabase → Authentication → Users 에서 볼 수 있습니다.

## 3. 커뮤니티 게시판 (글·댓글·좋아요·조회수)
- `GET /community/posts`: 회원 글 + 모든 글의 조회수·좋아요·댓글 수
- `POST /community/posts`: 글쓰기 (로그인 필요, 분류 필수, 제목 100자·내용 5000자, 30초 연속 등록 제한)
- `DELETE /community/posts/:id`: 본인 글 삭제
- `POST /community/posts/:id/view`: 조회수 +1 (브라우저 세션당 글마다 1회)
- `GET /community/posts/:id/detail`: 댓글 목록 + 내 좋아요 여부
- `POST /community/posts/:id/like`: 좋아요 누르기/취소 (회원당 1번)
- `POST /community/posts/:id/comments`, `DELETE .../comments/:commentId`: 댓글 쓰기·본인 댓글 삭제
- 작성자·본인 확인은 모두 서버가 로그인 토큰으로 합니다.

## 배포 후 확인
- `https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586/market/quotes`
- `.../community/posts` → `{"success":true,"posts":[],"stats":{}}`
- 사이트에서 회원가입 → 글쓰기 → 좋아요·댓글

## 4. 매일 오전 9:30(중국 시간) 자동 업데이트 (Supabase Cron)
- `POST /market/refresh`: 시세 갱신 → 새 AI 기사 작성 → **개장 브리핑** 작성 (평소 1시간 갱신은 기사만 쓰고 브리핑은 안 바꿈)
- 비밀값 `CRON_SECRET`과 같은 값을 `x-cron-secret` 헤더로 보내야 실행됩니다.

### 설정 (한 번만)
1. Edge Functions → Secrets 에 `CRON_SECRET` 추가 (아무도 모를 긴 문자열)
2. Database → Extensions 에서 `pg_cron`, `pg_net` 켜기
3. SQL Editor 에서 실행 (`<CRON_SECRET 값>`만 바꿔 넣기). 중국 9:30 = UTC 1:30, 월~금(증시 개장일)
```sql
select cron.schedule(
  'sinaview-market-0930',
  '30 1 * * 1-5',
  $$
  select net.http_post(
    url := 'https://rpxmiyieukfuyhldqdto.supabase.co/functions/v1/make-server-c6687586/market/refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweG1peWlldWtmdXlobGRxZHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzkxMTksImV4cCI6MjA3MjYxNTExOX0.H3lyRcpK6d3z24Y_ZgOOCoZ5n6U3WiZF1qZY3LNlYjA',
      'x-cron-secret', '<CRON_SECRET 값>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```
- 확인: `select * from cron.job;` / 실행 기록: `select * from cron.job_run_details order by start_time desc limit 5;`
- 주말에도 하려면 `'30 1 * * *'`, 끄려면 `select cron.unschedule('sinaview-market-0930');`
