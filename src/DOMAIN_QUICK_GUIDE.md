# 🌐 도메인 주소 변경 - 3분 가이드

## 방법 1️⃣: Vercel 기본 주소 변경 (무료, 1분)

### 현재: `china-up.vercel.app`
### 변경 가능: `내가원하는이름.vercel.app`

```
1. https://vercel.com/dashboard 로그인
2. 프로젝트(china-up) 클릭
3. Settings → General
4. Project Name 변경
   예: korea-up
       beijing-life
       china-portal
5. Save 클릭
6. 완료! 새 주소: korea-up.vercel.app
```

**비용:** 무료 ✅  
**소요 시간:** 1분 ⚡  
**단점:** `.vercel.app`은 그대로 유지

---

## 방법 2️⃣: 나만의 도메인 (유료, 30분)

### 완전 커스텀: `chinaup.com` 같은 주소!

### STEP 1: 도메인 구매 (10분)

**추천 업체:**

| 업체 | 비용 | 장점 | 구매 링크 |
|------|------|------|----------|
| **Namecheap** ⭐ | $8-12/년 | 저렴, 쉬움 | https://www.namecheap.com |
| **가비아** | 15,000원/년 | 한국어, .kr 가능 | https://www.gabia.com |
| **Cloudflare** | $9/년 | 가장 저렴 | https://www.cloudflare.com |

**구매 과정:**
```
1. 위 사이트 접속
2. 원하는 도메인 검색: "chinaup"
3. .com, .net 등 선택
4. 장바구니 → 결제 (신용카드)
5. 이메일 인증
6. 완료!
```

### STEP 2: Vercel 연결 (5분)

```
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Domains
3. "Add" 클릭
4. 구매한 도메인 입력: chinaup.com
5. "Add" 클릭
```

### STEP 3: DNS 설정 (15분)

**Vercel에 표시된 정보 확인:**
```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

**도메인 업체에서 설정:**

**Namecheap:**
```
1. Dashboard → Domain List
2. 도메인 선택 → "Manage"
3. Nameservers → "Custom DNS"
4. 입력:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
5. ✓ 저장
```

**가비아:**
```
1. My가비아 → 도메인 → 관리
2. "네임서버 설정"
3. "다른 네임서버 사용"
4. 입력:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
5. 저장
```

### STEP 4: 대기 및 확인 (1-2시간)

```
DNS 전파 확인:
https://dnschecker.org
→ 도메인 입력
→ 초록불이 뜨면 완료!

Vercel 확인:
→ Settings → Domains
→ "Valid Configuration" 표시되면 성공!

테스트:
→ https://chinaup.com 접속
→ 사이트 확인!
```

---

## 💰 비용 비교

| 방법 | 비용 | 주소 예시 |
|------|------|-----------|
| Vercel 기본 | 무료 | `korea-up.vercel.app` |
| 커스텀 도메인 | $8-20/년 | `chinaup.com` |

---

## 🎯 추천

### 테스트/개인용
→ **방법 1** (무료 Vercel 주소)

### 정식 서비스/비즈니스
→ **방법 2** (커스텀 도메인)
- 더 전문적
- SEO에 유리
- 브랜딩 효과

---

## 🆘 문제 해결

### Q: 도메인 이름이 이미 사용 중?
```
대안:
chinaup.com (이미 사용중)
→ china-up.com
→ chinaup.net
→ koreaup.com
→ beijing-life.com
```

### Q: DNS가 안 되요!
```
1. 1-2시간 대기 (최대 48시간)
2. dnschecker.org에서 확인
3. 브라우저 캐시 삭제
4. Vercel 에러 메시지 확인
```

### Q: https가 안 되요!
```
Vercel이 자동으로 SSL 인증서 발급
→ DNS 전파 후 10분 대기
→ 자동으로 해결됨
```

---

## 📞 자세한 가이드

더 자세한 설명이 필요하면:
→ [CUSTOM_DOMAIN_GUIDE.md](./CUSTOM_DOMAIN_GUIDE.md) 참고

---

**선택하세요:**

- 🆓 **무료로 시작** → Vercel 프로젝트 이름만 변경
- 💎 **전문적으로** → 커스텀 도메인 구매 ($8/년)

**둘 다 가능하고, 언제든 변경 가능합니다!** 🚀
