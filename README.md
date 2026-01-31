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
├── app/                    # Next.js App Router
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   ├── admin/             # 관리자 대시보드
│   └── user/              # 일반 사용자 대시보드
├── components/            # 재사용 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── auth/             # 인증 관련
│   ├── transactions/     # 거래내역 관련
│   └── reports/          # 리포트 관련
├── lib/                   # 라이브러리
│   ├── api/              # API 클라이언트
│   ├── store/            # Zustand 상태관리
│   ├── utils/            # 유틸리티 함수
│   └── types/            # TypeScript 타입
└── public/               # 정적 파일
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

### 레이아웃
- `AdminLayout` - 관리자 레이아웃
- `UserLayout` - 사용자 레이아웃

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

## 🎯 로드맵

- [x] 프로젝트 초기 설정
- [x] 인증 시스템
- [x] 관리자 대시보드
- [x] 일반 사용자 대시보드
- [ ] 거래내역 전체 페이지
- [ ] 거래 추가/수정 페이지
- [ ] 매핑 관리 페이지
- [ ] 리포트 페이지
- [ ] 설정 페이지
- [ ] 스와이프 제스처
- [ ] 국세청 메일 파싱

## 👨‍💻 개발자

- **Email**: ssmtransite@gmail.com

## 📄 라이선스

MIT License

---

**My Acc** - 간편한 장부 관리의 시작 💼✨
