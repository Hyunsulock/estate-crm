# Estate CRM PRD (Product Requirements Document)

문서 버전: v1.0  
작성일: 2026-02-21  
대상 제품: `estate-crm` (Electron Desktop CRM)

## 1. 제품 개요

`Estate CRM`은 중개업무 전 과정을 하나의 데스크톱 앱에서 처리하기 위한 부동산 CRM이다.  
현재 구현은 Electron + React 기반이며, 데이터 레이어는 실제 API 대신 `mock-api`를 사용한다.

핵심 가치:
- 매물/구매고객/매칭/거래/계약/일정/업무를 한 화면 체계로 통합 관리
- 중개 실무 흐름(추천 → 상담 → 방문 → 협상 → 계약)을 데이터로 추적
- 프리미엄 기능(예: AI 검색, 네이버 광고 매칭)으로 생산성 강화

## 2. 문제 정의

현장 중개업무는 보통 다음 문제가 발생한다.
- 데이터 분산: 연락처, 매물, 상담기록, 일정, 계약이 각기 다른 도구에 흩어짐
- 진행 추적 어려움: 매칭/협상 상태를 팀 단위로 추적하기 어려움
- 재사용성 부족: 기존 상담/거래 데이터가 다음 의사결정에 충분히 활용되지 않음
- 운영 통제 부족: 담당자별 업무량/성과/마감 리스크를 한눈에 보기 어려움

## 3. 제품 목표

### 3.1 비즈니스 목표
- 중개 사무소 업무 프로세스의 디지털 일원화
- 거래 전환율 향상(매칭 제안 품질/후속 조치 체계화)
- 팀 운영 효율 개선(업무/성과 가시화)

### 3.2 사용자 목표
- “지금 어떤 고객/매물이 어떤 단계인지” 즉시 파악
- “오늘 무엇을 해야 하는지” 자동으로 확인
- 반복 입력 없이 상담/계약/진행 이력을 이어서 활용

### 3.3 MVP 성공 기준
- 핵심 도메인 CRUD가 모두 앱 내에서 동작
- 단계 기반 파이프라인(매칭/거래/계약) 상태 전이가 가능
- 대시보드/업무/일정 화면으로 당일 운영 판단 가능

## 4. 타겟 사용자

- 관리자(`manager`): 팀 운영, 성과 분석, 설정/권한 관리
- 실무자(`user`): 매물/고객/매칭/상담/업무 처리

권한 차별:
- 관리자 전용 메뉴: 거래 실적(`/performance`), 직원 활동(`/staff`)
- 프리미엄 기능 플래그: AI 검색, 광고 매칭 등

## 5. 범위 정의

### 5.1 In Scope (현재 코드 기준)
- 데스크톱 앱 실행/윈도우 관리
- 사이드바 기반 CRM 네비게이션
- 핵심 도메인별 화면 및 로컬 Mock API 기반 조회/수정
- 프리미엄 시나리오 UI(토큰, 자동매칭, 광고 연계 등)
- 기본 E2E 테스트 인프라(Playwright)

### 5.2 Out of Scope (현재 미구현/차후)
- 실제 서버/DB 연동
- 실사용 인증/권한 시스템
- 멀티 오피스 동기화/협업 백엔드
- 결제/구독 실서비스 연동
- 배포 파이프라인 기반 실운영 모니터링

## 6. 정보 구조 및 화면 구조

앱의 1차 정보구조는 좌측 사이드바를 기준으로 구성된다.

주요 라우트:
- `/` 대시보드
- `/ai-search` AI 검색 (프리미엄)
- `/tasks` 업무 관리
- `/properties` 매물 관리
- `/buyers` 구매고객 관리
- `/customers` 잠재고객 관리
- `/matches` 매칭 관리
- `/deals` 거래 관리
- `/contracts` 계약서 관리
- `/calendar` 일정 관리
- `/network` 네트워크 그룹
- `/calculator` 부동산 계산기
- `/map-test` 지도 테스트
- `/settings` 설정
- `/performance` 거래 실적 (관리자)
- `/staff` 직원 활동 관리 (관리자)

보조 라우트:
- `/demo/*` 개발/검증용 데모 페이지

## 7. 핵심 기능 요구사항

### 7.1 대시보드
- 고객/매물/거래/일정 핵심 KPI 요약
- 최근 활동(최근 등록 매물, 최근 구매고객, 최근 상담)
- 월별 거래/유형 분포 차트

### 7.2 매물 관리
- 필터링/정렬/숨김 처리
- 리스트/지도 뷰 전환
- 매물 상세 수정 및 정보 검증
- 네이버 광고 매칭, 제안 수락/거절, 광고 분석(프리미엄)

### 7.3 구매고객/잠재고객/연락처
- 요구조건(예산/지역/면적/유형/입주기한) 관리
- 상담 및 후속 일정 관리
- 고객 유형별 상태 추적

### 7.4 매칭/거래/계약 파이프라인
- 매칭 단계 관리(`suggested` → `dealCreated` 등)
- 거래 단계 관리(`selection`, `deposit`, `contract`, `completed`)
- 계약 상태/체크리스트/수수료 정산 데이터 연결

### 7.5 일정/업무 관리
- 일정 CRUD, 날짜 범위 조회
- 업무 생성/수정/상태전환/필터링
- 칸반/리스트/카테고리 기반 보기
- 마감 임박/지연 식별

### 7.6 AI 검색 (프리미엄)
- 자연어 쿼리 검색
- 네이버 검색 포함 여부 토글
- 월간 토큰 쿼터 조회/차감
- 구매고객 요구사항 기반 자동 매칭 검색

## 8. 데이터 모델(요약)

주요 엔티티:
- 사용자: `User`, 역할 `manager | user`
- 연락처/고객: `Contact`, (하위호환) `Customer`
- 매물: `Property`, 건물/동/호(`Building`, `Dong`, `Unit`)
- 구매요구: `BuyerRequirement`
- 매칭: `Match`, 방문 `Viewing`
- 거래/계약: `Deal`, `Contract`, 커미션 정산
- 운영: `Task`, `CalendarEvent`, `ActivityLog`
- 확장: `NaverAd`, `AISearch*`, `MarketPrice`, `RealTransaction`

특징:
- 실무 엔터티가 타입으로 촘촘히 분리되어 있어 도메인 확장성이 높음
- 현재 저장소는 `mockData` 인메모리 수정 방식으로 동작

## 9. 기술 아키텍처

### 9.1 모노레포 구성
- `packages/main`: Electron Main 프로세스
- `packages/preload`: Preload/ContextBridge 노출
- `packages/renderer`: React UI (TanStack Router/Query)
- `packages/integrate-renderer`, `packages/electron-versions`: 보조 패키지

### 9.2 실행 구조
- 엔트리(`packages/entry-point.mjs`)에서 `@app/main` 초기화
- 개발 모드: `VITE_DEV_SERVER_URL` 로드
- 프로덕션 모드: 빌드된 `@app/renderer` 파일 로드

### 9.3 보안/런타임 정책
- 단일 인스턴스 강제
- 허용된 내부 Origin 외 네비게이션 차단
- 허용된 외부 URL만 OS 브라우저로 오픈
- 자동 업데이트 모듈 포함(`electron-updater`)

주의점(현재 코드 기준):
- `WindowManager`에서 `webSecurity: false`, `sandbox: false` 설정이 존재
- 카카오맵 요청용 Referer 헤더 주입 로직 존재
- 실서비스 전 보안 하드닝 필요

## 10. 품질 요구사항 (NFR)

- 성능: 기본 화면 로딩 2초 내(로컬 데이터 기준)
- 안정성: 앱 크래시 없이 라우트 이동/CRUD 가능
- 보안: 외부 탐색 차단, IPC 최소 노출 원칙 준수
- 확장성: Mock API를 실제 API로 교체 가능한 레이어 구조 유지
- 사용성: 관리자/실무자 흐름을 3클릭 이내로 접근 가능

## 11. 테스트/검증 전략

현재:
- Playwright E2E 스캐폴딩 존재(`tests/e2e.spec.ts`)
- Renderer 단위 테스트 파일 존재

리스크:
- E2E 예시가 기본 템플릿 UI 기준이라 현재 CRM 화면과 불일치 가능성 높음
- 실제 요구사항 회귀를 검증하는 도메인 테스트 보강 필요

권장 테스트 우선순위:
- 라우팅/권한(관리자 메뉴 가시성)
- 매물/업무/거래 상태전이
- AI 토큰 소진/제한 로직
- 일정/마감 경고 계산 로직

## 12. 단계별 실행 계획

### Phase 1: 프로덕트 정합화
- `App.tsx` 템플릿 잔여 코드 정리
- 라우트/네비/화면 타이틀/기능 매핑 문서화
- E2E를 CRM 시나리오로 교체

### Phase 2: 데이터 레이어 전환
- `mock-api` 인터페이스를 서버 API 클라이언트로 교체
- 인증/세션/권한 도입
- 상태관리 및 에러 처리 표준화

### Phase 3: 운영 고도화
- 실사용 성과 대시보드/알림 체계
- 구독/결제/프리미엄 게이트 실연동
- 릴리즈/관측/에러트래킹 자동화



## 13. 오픈 이슈

- `packages/renderer`가 상위 저장소에서 중첩 Git 형태로 관리됨(배포/CI 영향 검토 필요)
- 보안 옵션(`webSecurity`, `sandbox`) 운영 환경 정책 확정 필요
- 도메인 데이터의 실제 원천(사내 ERP/외부 플랫폼) 연동 우선순위 정의 필요

## 14. 부록: 프로젝트 디렉터리 구조

```text
estate-crm/
├─ package.json
├─ electron-builder.mjs
├─ tests/
│  └─ e2e.spec.ts
├─ packages/
│  ├─ entry-point.mjs
│  ├─ dev-mode.js
│  ├─ main/
│  │  └─ src/
│  │     ├─ index.ts
│  │     └─ modules/
│  ├─ preload/
│  │  └─ src/
│  │     ├─ index.ts
│  │     └─ exposed.ts
│  └─ renderer/
│     └─ src/
│        ├─ main.tsx
│        ├─ routes/
│        ├─ components/
│        ├─ api/mock-api.ts
│        ├─ data/mock-data.ts
│        └─ types/index.ts
└─ docs/
   └─ PRD.md
```

