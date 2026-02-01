# 🚀 Supabase 마이그레이션 가이드

## 📋 준비 완료 항목
- ✅ SQL 스키마: `/home/user/webapp/supabase/schema.sql`
- ✅ CSV 데이터: `/home/user/webapp/supabase/data/`
  - users.csv (10 rows)
  - transactions.csv (202 rows)
  - mappings.csv (9 rows)
  - settings.csv (3 rows)

---

## 🎯 Step 1: Supabase 프로젝트 생성 (5분)

### 1.1 계정 생성
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인

### 1.2 새 프로젝트 생성
1. "New Project" 클릭
2. 프로젝트 정보 입력:
   ```
   Name: myaccweb
   Database Password: [강력한 비밀번호 - 저장 필수!]
   Region: Northeast Asia (Seoul)
   Plan: Free
   ```
3. "Create new project" 클릭
4. 프로젝트 생성 대기 (1-2분)

---

## 🗄️ Step 2: 데이터베이스 스키마 생성 (5분)

### 2.1 SQL Editor 열기
1. 왼쪽 사이드바 → "SQL Editor" 클릭
2. "+ New query" 버튼 클릭

### 2.2 스키마 실행
1. `/home/user/webapp/supabase/schema.sql` 파일 내용 전체 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭 (Ctrl+Enter)
4. 성공 메시지 확인: "Success. No rows returned"

### 2.3 테이블 확인
1. 왼쪽 사이드바 → "Table Editor" 클릭
2. 테이블 목록 확인:
   - ✅ users
   - ✅ transactions
   - ✅ mappings
   - ✅ settings

---

## 📊 Step 3: 데이터 Import (10분)

### 3.1 Users 테이블 Import
1. Table Editor → "users" 테이블 선택
2. 오른쪽 상단 "Insert" 드롭다운 → "Import data from CSV" 클릭
3. `/home/user/webapp/supabase/data/users.csv` 파일 업로드
4. 매핑 확인:
   ```
   CSV Column → DB Column
   email      → email
   name       → name
   password   → password_hash
   role       → role
   phone      → phone
   fee_rate   → fee_rate
   balance    → balance
   created_at → created_at
   last_login → last_login
   ```
5. "Import" 클릭
6. 성공 확인: "10 rows inserted"

### 3.2 Transactions 테이블 Import
1. Table Editor → "transactions" 테이블 선택
2. "Import data from CSV" 클릭
3. `/home/user/webapp/supabase/data/transactions.csv` 업로드
4. 매핑 확인 (모든 컬럼 자동 매핑)
5. "Import" 클릭
6. 성공 확인: "202 rows inserted"

### 3.3 Mappings 테이블 Import
1. Table Editor → "mappings" 테이블 선택
2. "Import data from CSV" 클릭
3. `/home/user/webapp/supabase/data/mappings.csv` 업로드
4. "Import" 클릭
5. 성공 확인: "9 rows inserted"

### 3.4 Settings 테이블 Import
Settings는 이미 schema.sql에서 초기화되었으므로 **건너뛰기**

---

## 🔑 Step 4: API 키 및 URL 가져오기 (2분)

### 4.1 Project Settings 열기
1. 왼쪽 사이드바 → 톱니바퀴 아이콘 "Settings" 클릭
2. "API" 메뉴 선택

### 4.2 필요한 정보 복사
다음 3가지 정보를 복사하세요:

```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co

# anon (public) key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role (secret) key - 서버 전용!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **주의**: `service_role` 키는 절대 클라이언트에 노출하지 마세요!

---

## 🔐 Step 5: 인증 설정 (5분)

### 5.1 Authentication 설정
1. 왼쪽 사이드바 → "Authentication" 클릭
2. "Providers" 탭 선택
3. "Email" 활성화 확인 (기본값)

### 5.2 Email Templates 설정 (선택)
1. "Email Templates" 탭 선택
2. 필요 시 한국어로 번역

### 5.3 기존 사용자 동기화 (중요!)
**문제**: 기존 사용자 비밀번호는 GAS 해시 방식으로 저장됨
**해결**: 첫 로그인 시 비밀번호 재설정 필요

**옵션 A**: 관리자가 모든 사용자 비밀번호 초기화 (권장)
**옵션 B**: 사용자가 "비밀번호 찾기" 기능 사용

---

## 🎨 Step 6: Row Level Security 확인 (2분)

### 6.1 RLS 정책 확인
1. Table Editor → "users" 테이블 선택
2. 오른쪽 상단 "RLS" 아이콘 클릭
3. 정책 목록 확인:
   - ✅ Admins can view all users
   - ✅ Users can update themselves

### 6.2 다른 테이블도 확인
- transactions: 4개 정책 (SELECT, INSERT, UPDATE, DELETE)
- mappings: 2개 정책
- settings: 2개 정책

---

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] schema.sql 실행 완료
- [ ] users 테이블 데이터 import (10 rows)
- [ ] transactions 테이블 데이터 import (202 rows)
- [ ] mappings 테이블 데이터 import (9 rows)
- [ ] API URL 및 키 복사
- [ ] .env.local 파일에 환경변수 추가
- [ ] RLS 정책 확인

---

## 🔧 다음 단계

Supabase 설정이 완료되면 다음 정보를 제공해주세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

그러면 제가 Next.js 코드를 완성하겠습니다!

---

## 🆘 문제 해결

### Import 실패 시
- **원인**: 컬럼 매핑 오류
- **해결**: CSV 첫 줄 (헤더)와 DB 컬럼명 확인

### RLS 정책 오류 시
- **원인**: auth.jwt() 함수 오류
- **해결**: schema.sql 재실행

### 데이터 조회 안 됨
- **원인**: RLS 정책으로 차단
- **해결**: Table Editor 우측 상단 "RLS" 토글 확인

---

## 📞 지원

문제가 생기면 알려주세요:
1. 오류 메시지 스크린샷
2. 어떤 단계에서 문제 발생했는지
3. Supabase Project URL

즉시 도와드리겠습니다!
