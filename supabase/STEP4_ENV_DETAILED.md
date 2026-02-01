# 🔑 Step 4: API 키 및 환경변수 설정 - 상세 가이드

## 개요

Supabase 프로젝트와 Next.js 앱을 연결하기 위해 필요한 키와 설정을 진행합니다.

---

## 4.1 Supabase Project Settings 열기

### 방법 1: 사이드바에서
1. 왼쪽 사이드바 하단 **⚙️ 톱니바퀴 아이콘** 클릭
2. "Settings" 또는 "Project Settings" 메뉴

### 방법 2: 프로젝트 정보에서
1. 대시보드 상단 프로젝트 이름 옆 **...** (점 3개) 클릭
2. "Settings" 선택

---

## 4.2 API 정보 찾기

### API 메뉴 선택
1. Settings 페이지 왼쪽 메뉴
2. **"API"** 탭 클릭

### 화면 구성
```
┌─────────────────────────────────────────────────────────┐
│ Project Settings > API                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📍 Project URL                                          │
│ https://abcdefghijk.supabase.co                        │
│ [📋 Copy]                                               │
│                                                          │
│ 🔑 Project API keys                                     │
│ ┌─────────────────────────────────────────────────────┐│
│ │ anon public                                         ││
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...             ││
│ │ [👁️ Reveal] [📋 Copy]                              ││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ service_role secret                                 ││
│ │ ●●●●●●●●●●●●●●●●●●●●●●●●                         ││
│ │ [👁️ Reveal] [📋 Copy]                              ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 4.3 필요한 정보 복사

### ✅ 복사할 것 3가지

#### 1. Project URL
**용도**: Supabase API 엔드포인트
**위치**: "Project URL" 섹션
**형식**: `https://[project-id].supabase.co`

**복사 방법**:
1. URL 옆 **"Copy"** 버튼 클릭
2. 메모장에 붙여넣기:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   ```

#### 2. anon public Key
**용도**: 클라이언트 측 API 호출 (브라우저에서 사용 안전)
**위치**: "Project API keys" → "anon public"
**형식**: `eyJhbGci...` (매우 긴 문자열)

**복사 방법**:
1. "anon public" 박스에서 **"Copy"** 버튼 클릭
2. 메모장에 붙여넣기:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### 3. service_role secret Key (선택)
**용도**: 서버 측 관리자 작업 (RLS 우회)
**위치**: "Project API keys" → "service_role secret"
**⚠️ 주의**: 절대 클라이언트에 노출하면 안 됨!

**복사 방법**:
1. "service_role secret" 박스에서 **"Reveal"** 클릭
2. 키가 표시되면 **"Copy"** 클릭
3. 메모장에 붙여넣기:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 4.4 .env.local 파일 생성

### Windows

#### 방법 1: VS Code에서
1. VS Code에서 프로젝트 열기
2. 루트 디렉토리에서 **새 파일** 생성
3. 파일 이름: `.env.local`
4. 저장

#### 방법 2: 명령 프롬프트에서
```cmd
cd C:\path\to\MyAccWeb
echo. > .env.local
```

### Mac/Linux

#### 방법 1: Terminal에서
```bash
cd /home/user/webapp
touch .env.local
```

#### 방법 2: VS Code에서
1. VS Code에서 프로젝트 열기
2. 새 파일 생성 → `.env.local`

---

## 4.5 환경변수 입력

### .env.local 파일 내용

```env
# ============================================================
# Supabase Configuration
# ============================================================

# Project URL (클라이언트/서버 양쪽에서 사용)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co

# anon key (클라이언트에서 안전하게 사용 가능)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTk4NTU3NjAwMH0.ABC123...

# service_role key (서버 전용 - 선택사항)
# ⚠️ 주의: 절대 클라이언트에 노출하지 마세요!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoxOTg1NTc2MDAwfQ.XYZ789...


# ============================================================
# 기존 환경변수 (GAS 관련 - 나중에 제거)
# ============================================================

# Google Apps Script API (이제 사용 안 함)
# NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/...
# NEXT_PUBLIC_SPREADSHEET_ID=...
# NEXT_PUBLIC_ADMIN_EMAIL=...


# ============================================================
# 기타 설정
# ============================================================

# Next.js 환경
NODE_ENV=development

# 앱 버전
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### ⚠️ 중요 사항

1. **NEXT_PUBLIC_** 접두사:
   - `NEXT_PUBLIC_`로 시작: 브라우저에 노출됨 (안전)
   - 없는 경우: 서버에서만 접근 가능 (비밀 정보)

2. **실제 값으로 교체**:
   - `https://abcdefghijk.supabase.co` → 실제 Project URL
   - `eyJ...` → 실제 API 키

3. **줄바꿈 없음**:
   - 키 값이 매우 길어도 한 줄로 작성
   - 줄바꿈하면 오류 발생

---

## 4.6 환경변수 확인

### 로컬 테스트

```bash
# 터미널에서 실행
cd /home/user/webapp
npm run dev
```

### 확인 방법

```typescript
// lib/supabase/client.ts에서 확인
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

**예상 출력**:
```
Supabase URL: https://abcdefghijk.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsI...
```

### 오류 확인

```typescript
// lib/supabase/client.ts
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
}
```

---

## 4.7 Vercel 환경변수 설정

### Vercel 대시보드에서

1. **Vercel 접속**: https://vercel.com
2. **프로젝트 선택**: MyAccWeb
3. **Settings 탭** 클릭
4. **Environment Variables** 메뉴

### 환경변수 추가

각 변수를 하나씩 추가:

#### 1. NEXT_PUBLIC_SUPABASE_URL
```
Key:   NEXT_PUBLIC_SUPABASE_URL
Value: https://abcdefghijk.supabase.co
Environment: Production, Preview, Development (모두 체크)
```

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key:   NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development (모두 체크)
```

#### 3. SUPABASE_SERVICE_ROLE_KEY (선택)
```
Key:   SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development (모두 체크)
⚠️ Sensitive: 체크 (마스킹 처리)
```

### 재배포
1. Vercel에서 **Deployments** 탭
2. 최신 배포 → **Redeploy** 클릭
3. 환경변수가 적용됨

---

## 🐛 문제 해결

### ❌ 오류 1: "Supabase 환경변수가 설정되지 않았습니다"

**원인**: .env.local 파일이 없거나 형식 오류

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 내용 확인 (빈 줄, 주석 제외 최소 2줄)
3. Next.js 서버 재시작:
   ```bash
   # Ctrl+C로 중지 후
   npm run dev
   ```

---

### ❌ 오류 2: "Invalid API key"

**원인**: 복사한 키가 불완전함

**해결**:
1. Supabase 대시보드에서 다시 복사
2. 전체를 복사했는지 확인 (앞뒤 공백 없이)
3. 줄바꿈이 없는지 확인

---

### ❌ 오류 3: "Project not found"

**원인**: Project URL이 잘못됨

**해결**:
1. Supabase 대시보드 → Settings → API
2. Project URL 다시 복사
3. `https://` 포함 여부 확인

---

### ❌ 오류 4: Vercel에서 환경변수가 안 먹힘

**원인**: 배포 후 환경변수 추가함

**해결**:
1. 환경변수 추가 후 **반드시 재배포**
2. Vercel → Deployments → Redeploy
3. 또는 새 커밋 push

---

## ✅ 확인 체크리스트

환경변수 설정이 완료되면:

### 로컬 환경
- [ ] `.env.local` 파일 존재
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정됨
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨
- [ ] `npm run dev` 실행 시 오류 없음
- [ ] 브라우저 콘솔에 Supabase 오류 없음

### Vercel 환경
- [ ] Environment Variables에 2개 변수 추가
- [ ] Production, Preview, Development 모두 체크
- [ ] 재배포 완료
- [ ] 배포된 사이트에서 오류 없음

---

## 💡 보안 팁

### ✅ 안전한 키
- `NEXT_PUBLIC_SUPABASE_URL`: 공개 가능 ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 공개 가능 ✅ (RLS로 보호됨)

### ⚠️ 주의할 키
- `SUPABASE_SERVICE_ROLE_KEY`: **절대 노출 금지** ⛔
  - GitHub에 커밋하지 마세요
  - 클라이언트 코드에서 사용하지 마세요
  - 환경변수로만 관리

### .gitignore 확인
`.env.local`이 .gitignore에 포함되어 있는지 확인:
```gitignore
# .gitignore
.env*.local
.env.local
.env
```

---

## 🎯 다음 단계

환경변수 설정이 완료되었으면:

1. **Step 5: 인증 시스템 전환** (Supabase Auth 적용)
2. **Step 6: API 코드 통합** (기존 GAS → Supabase)
3. **Step 7: 테스트 및 배포**

준비되셨나요? 🚀

---

## 📋 환경변수 템플릿

프로젝트에 `.env.example` 파일을 만들어 팀원과 공유:

```env
# .env.example
# 실제 값은 .env.local에 입력하세요

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_VERSION=2.0.0
```

---

## 📞 도움이 필요하신가요?

환경변수 설정 중 문제가 발생하면:
1. 오류 메시지 전체
2. .env.local 파일 내용 (키는 앞 20자만)
3. 어떤 단계에서 문제 발생

즉시 도와드리겠습니다! 🚀
