# 커스텀 도메인 연결 완벽 가이드

## 🌐 나만의 도메인 사용하기

### 방법 1: Vercel 기본 주소 변경 (무료)

**현재 주소:** `china-up.vercel.app`  
**변경 가능:** `원하는이름.vercel.app`

#### 단계:
1. Vercel Dashboard → 프로젝트 선택
2. Settings → General
3. Project Name 변경
4. Save

**소요 시간:** 1분  
**비용:** 무료  
**제한:** `.vercel.app`은 그대로

---

### 방법 2: 커스텀 도메인 연결

**완전 나만의 도메인!**
- `chinaup.com`
- `koreaup.kr`
- `beijing-life.net`
- 등등 원하는 대로!

---

## 🛒 STEP 1: 도메인 구매

### 추천 업체:

#### 1. **Namecheap** (추천 ⭐)
```
웹사이트: https://www.namecheap.com
비용: $8-12/년
장점: 
  - 저렴
  - 무료 WHOIS 보호
  - 한국 카드 결제 가능
  - 쉬운 인터페이스

단점:
  - 영어
```

#### 2. **가비아** (한국 업체)
```
웹사이트: https://www.gabia.com
비용: 15,000-20,000원/년
장점:
  - 한국어 지원
  - 한국 도메인 (.kr) 가능
  - 원화 결제
  - 전화 고객센터

단점:
  - 해외 업체보다 비쌈
```

#### 3. **Cloudflare Registrar**
```
웹사이트: https://www.cloudflare.com
비용: $9-11/년 (원가, 마진 없음)
장점:
  - 가장 저렴
  - 무료 CDN 포함
  - 자동 HTTPS

단점:
  - 신용카드 필수
  - 일부 도메인만 지원
```

#### 4. **GoDaddy**
```
웹사이트: https://www.godaddy.com
비용: $15-20/년
장점:
  - 유명함
  - 다양한 도메인

단점:
  - 비쌈
  - 갱신 비용 높음
```

### 도메인 이름 선택 팁:

```
✅ 좋은 도메인:
- chinaup.com (짧고 명확)
- koreaup.net (기억하기 쉬움)
- beijing-life.com (의미 명확)

❌ 피해야 할 도메인:
- china-up-korean-portal-2024.com (너무 김)
- ch1n4up.com (숫자 포함, 헷갈림)
- china_up.com (언더스코어 사용 불가)
```

### 구매 과정 (Namecheap 예시):

1. **도메인 검색**
   ```
   1. https://www.namecheap.com 접속
   2. 검색창에 원하는 이름 입력: "chinaup"
   3. 검색 버튼 클릭
   4. .com, .net, .org 등 선택
   ```

2. **장바구니에 추가**
   ```
   - "Add to Cart" 클릭
   - WHOIS Guard (개인정보 보호) 무료 확인
   - 1년 선택 (자동 갱신 설정)
   ```

3. **결제**
   ```
   - 계정 생성 (이메일 인증)
   - 신용카드 정보 입력
   - Checkout
   ```

4. **소유 확인**
   ```
   - 이메일로 인증 링크 받음
   - 클릭하여 소유권 확인
   ```

---

## 🔧 STEP 2: Vercel에 도메인 연결

### 2.1 Vercel에 도메인 추가

1. **Vercel Dashboard 접속**
   ```
   https://vercel.com/dashboard
   → 프로젝트 선택 (china-up)
   ```

2. **Settings → Domains**
   ```
   - "Add" 버튼 클릭
   - 도메인 입력: chinaup.com
   - "Add" 클릭
   ```

3. **DNS 설정 안내 확인**
   ```
   Vercel이 보여주는 정보:
   
   Option 1: Nameservers (권장)
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com
   
   Option 2: A Record
   - Type: A
   - Value: 76.76.21.21
   
   Option 3: CNAME
   - Type: CNAME
   - Value: cname.vercel-dns.com
   ```

### 2.2 DNS 설정 (Nameserver 방법 - 가장 쉬움)

**Namecheap에서:**

1. **도메인 관리 페이지**
   ```
   Dashboard → Domain List → 도메인 선택 → "Manage"
   ```

2. **Nameservers 변경**
   ```
   - "Nameservers" 섹션 찾기
   - "Custom DNS" 선택
   - 입력:
     Nameserver 1: ns1.vercel-dns.com
     Nameserver 2: ns2.vercel-dns.com
   - "✓" 저장 버튼 클릭
   ```

3. **전파 대기**
   ```
   소요 시간: 5분 ~ 48시간 (보통 1-2시간)
   상태 확인: https://dnschecker.org
   ```

**가비아에서:**

1. **도메인 관리**
   ```
   My가비아 → 서비스 관리 → 도메인 → 관리
   ```

2. **네임서버 설정**
   ```
   - "네임서버 설정" 클릭
   - "다른 네임서버 사용" 선택
   - 입력:
     1차: ns1.vercel-dns.com
     2차: ns2.vercel-dns.com
   - 저장
   ```

### 2.3 DNS 설정 (A Record 방법 - 대안)

Nameserver를 변경하고 싶지 않다면:

1. **DNS 관리 페이지 접속**

2. **A Record 추가**
   ```
   Type: A
   Host: @
   Value: 76.76.21.21
   TTL: Automatic 또는 300
   ```

3. **www 서브도메인 추가 (선택)**
   ```
   Type: CNAME
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

---

## ✅ STEP 3: 확인 및 테스트

### 3.1 DNS 전파 확인

```
https://dnschecker.org 접속
→ 도메인 입력: chinaup.com
→ Type: A 선택
→ 전 세계 서버에서 확인

✅ 초록불: 설정 완료
⏳ 빨간불: 아직 전파 중 (기다리기)
```

### 3.2 Vercel에서 확인

```
Vercel Dashboard → Domains
→ 도메인 상태 확인

✅ "Valid Configuration" - 성공!
⚠️ "Pending" - 전파 대기 중
❌ "Invalid Configuration" - 설정 확인 필요
```

### 3.3 브라우저 테스트

```
1. https://chinaup.com 접속 (https 필수!)
2. 사이트가 잘 보이는지 확인
3. 모든 기능이 작동하는지 테스트
```

---

## 🎯 STEP 4: 추가 설정 (선택사항)

### 4.1 www 리디렉션

```
Vercel은 자동으로 처리:
www.chinaup.com → chinaup.com (리디렉션)
또는 그 반대
```

**설정 방법:**
```
Vercel → Settings → Domains
→ 원하는 도메인 옆 "..." 클릭
→ "Set as Primary Domain" (메인 도메인 지정)
```

### 4.2 서브도메인 추가

```
예시:
- blog.chinaup.com (블로그)
- api.chinaup.com (API)
- admin.chinaup.com (관리자)
```

**방법:**
```
1. Vercel → Domains → "Add"
2. 서브도메인 입력: blog.chinaup.com
3. DNS에 CNAME 추가:
   Type: CNAME
   Host: blog
   Value: cname.vercel-dns.com
```

### 4.3 이메일 설정 (선택)

```
도메인으로 이메일 받기:
contact@chinaup.com

방법 1: Google Workspace (유료)
- $6/월 per user
- Gmail 인터페이스
- 전문적

방법 2: Zoho Mail (무료)
- 무료로 5개 계정
- 제한적 기능
- 충분함

방법 3: 포워딩 (무료)
- 도메인 업체에서 설정
- contact@chinaup.com → 내 Gmail로 전달
```

---

## 💰 비용 요약

### 도메인 구매 + 연결

```
초기 비용:
- 도메인 구매: $8-20 (1년)
- Vercel 도메인 연결: 무료
───────────────────────────
총: $8-20 (첫 해)

매년 갱신:
- 도메인 갱신: $8-20/년
- Vercel: 무료 (Hobby 플랜)
───────────────────────────
총: $8-20/년
```

### 추가 옵션 비용

```
WHOIS 보호: $0-3/년 (Namecheap은 무료)
이메일 (Google Workspace): $72/년
이메일 (Zoho Mail): $0 (무료)
```

---

## 🔍 비교표

| 항목 | Vercel 기본 | 커스텀 도메인 |
|------|------------|--------------|
| 주소 | `*.vercel.app` | `원하는대로.com` |
| 비용 | 무료 | $8-20/년 |
| 전문성 | 보통 | 높음 |
| SEO | 보통 | 좋음 |
| 신뢰도 | 보통 | 높음 |
| 브랜딩 | 어려움 | 쉬움 |
| 설정 난이도 | 쉬움 | 중간 |

---

## 🆘 문제 해결

### Q: DNS가 48시간이 지나도 안 돼요!

```
확인 사항:
1. Nameserver 입력 오타 확인
2. dnschecker.org에서 일부 지역이라도 초록불인지 확인
3. Vercel Dashboard에서 에러 메시지 확인
4. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)

해결책:
- DNS Flush: 
  Windows: cmd에서 ipconfig /flushdns
  Mac: Terminal에서 sudo dscacheutil -flushcache
```

### Q: "Invalid Configuration" 에러

```
원인:
- DNS 설정이 잘못됨

해결:
1. Vercel에서 표시된 값과 DNS 설정 비교
2. Type, Host, Value가 정확한지 확인
3. TTL이 너무 높지 않은지 확인 (300 권장)
```

### Q: https가 안 돼요!

```
Vercel은 자동으로 SSL 인증서 발급 (Let's Encrypt)

시간 필요:
- DNS 전파 후 5-10분

확인:
- Vercel → Settings → Domains → SSL 상태 확인
- "Certificate issued" - 완료
- "Certificate pending" - 대기 중
```

### Q: www가 안 돼요!

```
www.chinaup.com이 안 되는 경우:

DNS에 추가:
Type: CNAME
Host: www
Value: cname.vercel-dns.com

또는 Nameserver를 Vercel로 했다면:
Vercel이 자동으로 처리 (시간 필요)
```

---

## 🎉 완료!

### 성공 체크리스트:

- [ ] 도메인 구매 완료
- [ ] Vercel에 도메인 추가
- [ ] DNS 설정 완료 (Nameserver 또는 A Record)
- [ ] DNS 전파 확인 (dnschecker.org)
- [ ] HTTPS 작동 확인
- [ ] 모든 기능 테스트

### 다음 단계:

1. **Google Search Console 등록**
   - SEO 최적화
   - 검색 노출

2. **Google Analytics 연동**
   - 방문자 추적
   - 행동 분석

3. **소셜 미디어 공유**
   - Facebook
   - 위챗
   - 카카오톡

---

## 📞 추가 지원

- Vercel 도메인 문서: https://vercel.com/docs/concepts/projects/domains
- Namecheap 가이드: https://www.namecheap.com/support/knowledgebase/
- 가비아 고객센터: 1544-4755

---

**축하합니다! 이제 나만의 도메인으로 서비스를 운영하세요! 🚀**
