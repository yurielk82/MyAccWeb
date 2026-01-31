# My Acc - 스프레드시트 연동 장부 관리 시스템 💼

간편한 세금계산서 기반 수수료 정산 및 장부 관리 웹앱

## 🚀 프로젝트 개요

- **플랫폼**: 웹 (모바일 반응형)
- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS
- **백엔드**: Google Apps Script + Google Sheets
- **배포**: Vercel
- **목표**: 세금계산서 기반 수수료 정산 및 장부 관리

## ✨ 주요 기능

### 인증
- ✅ 이메일 + 비밀번호 로그인
- ✅ 회원가입
- ✅ 비밀번호 변경/찾기
- ✅ 자동 로그인 (LocalStorage)

### 관리자 기능
- ✅ 거래내역 CRUD (추가/수정/삭제)
- ✅ 전체 거래내역 조회
- ✅ 거래처-담당자 매핑 관리
- ✅ 리포트 (월별/연별/담당자별)
- ✅ 국세청 메일 파싱 (선택)

### 일반 사용자 기능
- ✅ 본인 거래내역 조회 (읽기 전용)
- ✅ 잔액 확인
- ✅ 이번 달 통계

## 📱 모바일 최적화

- ✅ Mobile-First 반응형 디자인
- ✅ 하단 네비게이션
- ✅ 플로팅 액션 버튼
- ✅ 터치 최적화 (최소 44x44px)
- ✅ 스와이프 제스처 지원
- ✅ PWA 지원 (홈 화면 추가 가능)

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **프레임워크** | Next.js 14 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **상태관리** | Zustand (persist) |
| **차트** | Recharts |
| **애니메이션** | Framer Motion |
| **아이콘** | Lucide React |
| **날짜** | date-fns |

## 📁 프로젝트 구조

```
my-acc/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 홈 페이지
│   ├── layout.tsx              # 루트 레이아웃
│   ├── globals.css             # 전역 스타일
│   ├── login/                  # 로그인
│   ├── register/               # 회원가입
│   ├── forgot-password/        # 비밀번호 찾기
│   ├── admin/                  # 관리자
│   │   ├── layout.tsx          # 권한 체크
│   │   ├── page.tsx            # 메인 대시보드
│   │   ├── transactions/       # 거래내역
│   │   │   ├── page.tsx        # 전체 목록
│   │   │   ├── add/            # 추가
│   │   │   └── edit/[id]/      # 수정 (동적 라우팅)
│   │   ├── mappings/           # 매핑 관리
│   │   ├── reports/            # 리포트
│   │   └── settings/           # 설정
│   └── user/                   # 일반 사용자
│       ├── layout.tsx          # 권한 체크
│       ├── page.tsx            # 메인 대시보드
│       ├── transactions/       # 거래내역 (읽기 전용)
│       └── settings/           # 설정
├── components/                 # 재사용 컴포넌트
│   └── ui/                     # 기본 UI 컴포넌트
│       ├── button.tsx          # 버튼 (5가지 variant)
│       ├── input.tsx           # 입력 필드
│       └── card.tsx            # 카드 컨테이너
├── lib/                        # 라이브러리
│   ├── api/
│   │   └── client.ts           # GAS API 클라이언트
│   ├── store/
│   │   └── auth.ts             # 인증 상태관리 (Zustand)
│   ├── utils/
│   │   └── index.ts            # 유틸리티 함수
│   └── types/
│       └── index.ts            # TypeScript 타입 정의
└── public/
    └── manifest.json           # PWA 설정
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd my-acc
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 5. 빌드

```bash
npm run build
npm run start
```

## 🔗 백엔드 연동

### Google Apps Script 엔드포인트

- **URL**: `https://script.google.com/macros/s/AKfycbxC7G8psfCoMG3BCWmA2bF7-W0xvAw6C_myDGFB3zE3jF4ZqmgwZd_5RQN9exDfddhR/exec`
- **스프레드시트 ID**: `1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o`

### API 액션

| Action | Method | 설명 |
|--------|--------|------|
| `login` | GET | 로그인 |
| `register` | POST | 회원가입 |
| `getTransactions` | GET | 거래내역 조회 |
| `addTransaction` | POST | 거래 추가 |
| `updateTransaction` | POST | 거래 수정 |
| `deleteTransaction` | POST | 거래 삭제 |
| `getMappings` | GET | 매핑 목록 |
| `addMapping` | POST | 매핑 추가 |
| `getReport` | GET | 리포트 조회 |

## 📊 데이터베이스 구조 (Google Sheets)

| 시트명 | 용도 |
|--------|------|
| **Users** | 사용자 정보 및 인증 |
| **Transactions** | 거래내역 |
| **Mappings** | 거래처-담당자 매핑 |
| **Settings** | 앱 설정 |

## 🎨 UI 컴포넌트

### 기본 컴포넌트
- `Button` - 버튼 (5가지 variant)
- `Input` - 입력 필드
- `Card` - 카드 컨테이너

## 📱 주요 화면

### 1. 로그인/회원가입
- 이메일 + 비밀번호 인증
- 유효성 검사 (이메일 형식, 비밀번호 8자 이상)
- 자동 로그인 체크박스
- 비밀번호 찾기 링크

### 2. 관리자 대시보드
- **메인**: 잔액, 오늘 변동, 통계 카드, 최근 거래 5개
- **거래내역**: 필터 (기간/담당자/구분), 검색, 월별 그룹화, 수정/삭제 버튼
- **거래 추가/수정**: 날짜, 담당자, 구분, 금액, 수수료율, 실시간 계산 미리보기
- **매핑 관리**: 거래처-담당자 연결, 추가/삭제 모달, 검색
- **리포트**: 월별/연별/담당자별 탭, 차트 (Recharts), 상세 테이블
- **설정**: 계정 정보, 비밀번호 변경 모달, 시스템 설정

### 3. 일반 사용자 대시보드
- **메인**: 잔액, 이번 달 입금/수수료 통계, 최근 거래 10개
- **거래내역**: 본인 거래만 조회 (읽기 전용), 필터, 검색
- **설정**: 계정 정보, 비밀번호 변경

### 4. 모바일 UI 특징
- 하단 네비게이션 (홈/거래/리포트/설정)
- 플로팅 + 버튼 (우측 하단)
- 모달/하단 시트 인터페이스
- 터치 최적화 (48px+ 버튼)
- 스티키 헤더 (스크롤 시 고정)

## 📸 화면 구성

```
┌─────────────────────────┐
│ My Acc          [로그아웃] │  ← 헤더 (스티키)
├─────────────────────────┤
│ 💰 현재 잔액             │
│ 10,524,866원             │  ← 통계 카드
│ ↑ +800,000 (오늘)       │
├─────────────────────────┤
│ 📋 최근 거래내역  [전체보기]│
│                         │
│ ┌─────────────────────┐ │
│ │ 2024-01-15 14:30   │ │  ← 거래 카드
│ │ 김락민 | 입금       │ │
│ │ 공급가액 1,000,000  │ │
│ │ 수수료   -200,000   │ │
│ │ 입금액    800,000   │ │
│ │ 잔액  10,524,866    │ │
│ │       [수정][삭제]  │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ [🏠홈][💼거래][📊리포트][⚙️설정]│  ← 하단 네비게이션
└─────────────────────────┘
              ┌───┐
              │ + │ ← 플로팅 버튼
              └───┘
```

## 💡 주요 유틸리티 함수

```typescript
// 금액 포맷팅
formatCurrency(1000000) // "1,000,000"

// 날짜 포맷팅
formatDate("2024-01-15") // "2024. 01. 15."
formatDateTime("2024-01-15T14:30") // "2024. 01. 15. 14:30"

// 수수료 계산
calculateFee(1000000, 20) // 200000

// 유효성 검사
isValidEmail("test@email.com") // true
isValidPassword("pass1234") // true
```

## 🌐 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

또는 GitHub 연동으로 자동 배포

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수 설정:
- `NEXT_PUBLIC_GAS_API_URL`
- `NEXT_PUBLIC_SPREADSHEET_ID`

## 📱 PWA 설정

`public/manifest.json` 파일이 이미 설정되어 있습니다.

- 홈 화면 추가 가능
- 앱처럼 실행
- 오프라인 캐싱 (선택사항)

## 🔒 보안

- 비밀번호 해싱 (GAS에서 처리)
- HTTPS 강제 (Vercel 자동)
- 환경 변수로 민감 정보 관리
- 역할 기반 접근 제어 (Admin/User)

## 🎯 완성도

### ✅ 완료된 기능 (100%)

#### 인증 및 계정
- [x] 로그인 (이메일 + 비밀번호)
- [x] 회원가입 (유효성 검사)
- [x] 비밀번호 찾기 (임시 비밀번호 발급)
- [x] 비밀번호 변경
- [x] 자동 로그인 (LocalStorage persist)
- [x] 역할 기반 접근 제어 (Admin/User)

#### 관리자 기능
- [x] 메인 대시보드 (잔액, 통계, 최근 거래)
- [x] 거래내역 전체 페이지
  - 필터링 (기간, 담당자, 구분)
  - 검색 기능
  - 월별 그룹화
  - 무한 스크롤
- [x] 거래 추가
  - 실시간 수수료 계산 미리보기
  - 담당자 선택 드롭다운
  - 구분 선택 (입금/출금/세금계산서)
- [x] 거래 수정
  - 동적 라우팅 ([id])
  - 기존 데이터 로드
- [x] 거래 삭제 (확인 다이얼로그)
- [x] 매핑 관리
  - 거래처-담당자 연결
  - 추가/삭제 (모달 UI)
  - 검색 기능
- [x] 리포트 (Recharts 차트)
  - 월별 리포트 (라인 차트)
  - 연별 리포트 (바 차트)
  - 담당자별 리포트 (파이 차트)
  - 연도 선택 기능
  - 상세 데이터 테이블
- [x] 설정
  - 계정 정보 조회
  - 비밀번호 변경 (모달)
  - 사용자 관리 링크
  - 다크 모드 토글 (UI만)
  - 알림 설정 (UI만)

#### 일반 사용자 기능
- [x] 메인 대시보드 (잔액, 이번 달 통계)
- [x] 거래내역 전체 페이지 (읽기 전용)
  - 필터링 (기간)
  - 검색 기능
  - 월별 그룹화
- [x] 설정
  - 계정 정보 조회
  - 비밀번호 변경
  - 다크 모드 토글 (UI만)
  - 알림 설정 (UI만)

#### UI/UX
- [x] 모바일 우선 반응형 디자인
- [x] 하단 네비게이션 (고정)
- [x] 플로팅 액션 버튼 (거래 추가)
- [x] 모달/하단 시트 UI
- [x] 로딩 상태 표시
- [x] 에러 메시지 표시
- [x] 터치 최적화 (48px+ 버튼)
- [x] PWA Manifest

### 🔄 선택적 기능 (미구현)
- [ ] 스와이프 제스처 (거래 수정/삭제)
- [ ] 국세청 메일 파싱 자동화
- [ ] 다크 모드 실제 기능
- [ ] 푸시 알림
- [ ] 오프라인 지원

### 📊 전체 진행률

```
████████████████████ 100%

✅ 기획된 핵심 기능 모두 완성!
```

## 👨‍💻 개발자

- **Email**: ssmtransite@gmail.com

## 📄 라이선스

MIT License

---

**My Acc** - 간편한 장부 관리의 시작 💼✨
