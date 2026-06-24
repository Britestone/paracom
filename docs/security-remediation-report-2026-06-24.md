# paracom.co.kr 보안 점검 조치 결과 보고서

- 작성일: 2026-06-24
- 대상 서비스: https://paracom.co.kr (GitHub Pages + Cloudflare)
- 작성 목적: 취약점 점검 결과(CSP, HSTS, HTTPS Redirect, X-Content-Type-Options) 조치 내역 및 검증 결과 제출

## 1. 개요

본 서비스는 GitHub Pages를 원본(origin)으로 사용하고 있으며, 응답 보안 헤더의 정밀 제어를 위해 Cloudflare를 앞단(Reverse Proxy/CDN)으로 구성하였다.

조치 목표는 아래 4개 점검 항목의 개선이다.

1. CSP(콘텐츠 보안 정책) 누락
2. HSTS 모범 사례 미구현(하위 도메인 포함)
3. 안전하지 않은 HTTPS 리디렉션 패턴
4. X-Content-Type-Options 미구현

## 2. 아키텍처/운영 구성

1. Origin: GitHub Pages
2. Edge: Cloudflare (DNS Proxy 활성화)
3. 도메인 정책
   - Canonical Host: paracom.co.kr
   - www 도메인은 canonical로 301 리디렉션
   - HTTP는 HTTPS로 강제 전환

## 3. 항목별 조치 내역

### 3.1 CSP(콘텐츠 보안 정책) 누락

Cloudflare Transform Rules(Modify Response Header)에서 `Content-Security-Policy` 헤더를 응답에 주입하였다.

적용 값:

`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self' https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests`

추가로 정적 페이지 진입점에 meta CSP도 보강 적용했다.

### 3.2 HSTS 모범 사례 미구현

Cloudflare에서 `Strict-Transport-Security`를 아래 값으로 적용하였다.

`max-age=31536000; includeSubDomains; preload`

적용 결과:

1. 최종 200 응답(https://paracom.co.kr)에 HSTS 존재
2. 301 응답에서도 HSTS 노출 확인(일부 스캐너의 엄격 기준 대응)

### 3.3 안전하지 않은 HTTPS 리디렉션 패턴

Cloudflare Redirect Rules를 재정렬하여 리디렉션 체인을 단순화했다.

변경 후 정책:

1. `http://www.paracom.co.kr/*` -> `https://paracom.co.kr/*` (301)
2. `https://www.paracom.co.kr/*` -> `https://paracom.co.kr/*` (301)
3. `http://paracom.co.kr/*` -> `https://paracom.co.kr/*` (301)

결과적으로 canonical HTTPS로 일관되게 수렴하도록 구성하였다.

### 3.4 X-Content-Type-Options 미구현

Cloudflare Transform Rules에서 `X-Content-Type-Options: nosniff`를 응답 헤더에 추가하였다.

## 4. 검증 결과(명령 기반 증적)

아래 명령으로 적용 상태를 확인하였다.

```powershell
curl -I https://paracom.co.kr/ | Select-String -Pattern "Content-Security-Policy|X-Content-Type-Options|Strict-Transport-Security" -CaseSensitive:$false
curl -I http://www.paracom.co.kr/ | Select-String -Pattern "Location|Strict-Transport-Security" -CaseSensitive:$false
```

확인 결과:

1. `https://paracom.co.kr/` 응답 헤더에 아래 항목 존재
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `Content-Security-Policy: ...`
   - `X-Content-Type-Options: nosniff`
2. `http://www.paracom.co.kr/` 요청 시
   - `Location: https://paracom.co.kr/`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

## 5. 조치 결과 요약

점검 항목 기준 상태:

1. CSP 누락: 조치 완료
2. HSTS 모범 사례(하위 도메인 포함): 조치 완료
3. HTTPS 리디렉션 패턴: 조치 완료(캐노니컬 HTTPS 단일 수렴)
4. X-Content-Type-Options: 조치 완료

## 6. 운영 시 유의사항

1. 본 서비스는 GitHub Pages 특성상 Origin 자체에서 커스텀 헤더 제어가 제한되므로, 보안 헤더 정책은 Cloudflare에서 지속 관리한다.
2. Cloudflare 규칙 변경 시 재검증 명령(curl -I)으로 즉시 확인한다.
3. CSP 정책 변경 시 외부 리소스(예: 지도, 폰트, 스크립트) 허용 목록을 사전 검토한다.

## 7. 첨부/참고

1. 보안 헤더 적용 정책: Cloudflare Transform Rules
2. 리디렉션 정책: Cloudflare Redirect Rules
3. 저장소 참고 파일
   - [README.md](../README.md)
   - [web.config](../web.config)
