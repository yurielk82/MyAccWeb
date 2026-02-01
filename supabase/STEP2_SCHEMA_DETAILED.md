# 🗄️ Step 2: 데이터베이스 스키마 생성 - 상세 가이드

## 2.1 SQL Editor 열기

### 방법 1: 사이드바에서
1. Supabase 대시보드 왼쪽 사이드바 확인
2. 🔧 아이콘 또는 "SQL Editor" 메뉴 찾기
3. 클릭하여 SQL Editor 열기

### 방법 2: 상단 메뉴에서
1. 상단 메뉴바에서 "SQL" 또는 "Database" 확인
2. 드롭다운에서 "SQL Editor" 선택

### SQL Editor 화면 구성
```
┌─────────────────────────────────────────────────────────┐
│ SQL Editor                                    [+ New query] │
├─────────────────────────────────────────────────────────┤
│                                                            │
│  [쿼리 입력 영역]                                          │
│                                                            │
│                                                            │
├─────────────────────────────────────────────────────────┤
│  [▶ Run] [Ctrl+Enter]                      [Results: 0 rows]│
└─────────────────────────────────────────────────────────┘
```

---

## 2.2 스키마 SQL 코드 준비

### 옵션 A: 파일에서 복사 (권장)

**Windows/Mac/Linux 공통:**

1. **파일 열기**:
   ```bash
   # GitHub에서 직접 보기
   https://github.com/yurielk82/MyAccWeb/blob/main/supabase/schema.sql
   ```

2. **로컬에서 열기** (이미 clone한 경우):
   ```bash
   # VS Code
   code /home/user/webapp/supabase/schema.sql
   
   # 또는 텍스트 에디터
   notepad supabase/schema.sql  # Windows
   open supabase/schema.sql     # Mac
   nano supabase/schema.sql     # Linux
   ```

3. **전체 선택 후 복사**:
   - Windows: `Ctrl + A` → `Ctrl + C`
   - Mac: `Cmd + A` → `Cmd + C`
   - Linux: `Ctrl + A` → `Ctrl + C`

### 옵션 B: 아래 코드 직접 복사

<details>
<summary>📋 schema.sql 전체 코드 보기 (클릭하여 펼치기)</summary>

```sql
-- ============================================================
-- SSM 장부 앱 - Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  phone TEXT,
  fee_rate DECIMAL(5,4) DEFAULT 0.2,
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Users 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- Transactions 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  manager_name TEXT NOT NULL,
  manager_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('세금계산서', '입금', '출금')),
  description TEXT NOT NULL,
  vendor_name TEXT,
  supply_amount DECIMAL(15,2) DEFAULT 0,
  vat DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  fee_rate DECIMAL(5,4) DEFAULT 0.2,
  fee_amount DECIMAL(15,2) DEFAULT 0,
  deposit_amount DECIMAL(15,2) DEFAULT 0,
  withdrawal DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) DEFAULT 0,
  memo TEXT,
  is_issued_by_me BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions 인덱스
CREATE INDEX idx_transactions_manager_email ON transactions(manager_email);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================
-- Mappings 테이블 (거래처 → 담당자)
-- ============================================================
CREATE TABLE IF NOT EXISTS mappings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  manager_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_name, manager_email)
);

-- Mappings 인덱스
CREATE INDEX idx_mappings_vendor ON mappings(vendor_name);
CREATE INDEX idx_mappings_manager ON mappings(manager_email);

-- ============================================================
-- Settings 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 자동 updated_at 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS) 설정
-- ============================================================

-- Users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'email' = email
  );

CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Transactions 테이블 RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View transactions policy"
  ON transactions FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR manager_email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admin can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update transactions"
  ON transactions FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete transactions"
  ON transactions FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Mappings 테이블 RLS
ALTER TABLE mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mappings"
  ON mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage mappings"
  ON mappings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Settings 테이블 RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage settings"
  ON settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- 초기 데이터 (Settings)
-- ============================================================
INSERT INTO settings (key, value, description, updated_at)
VALUES 
  ('default_fee_rate', '0.2', '기본 수수료율 (20%)', NOW()),
  ('admin_email', 'ssmtransite@gmail.com', '관리자 이메일', NOW()),
  ('app_version', '2.0.0', '앱 버전', NOW())
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 유용한 뷰 (Views)
-- ============================================================

-- 담당자별 잔액 요약
CREATE OR REPLACE VIEW manager_balances AS
SELECT 
  u.email,
  u.name,
  u.balance as user_balance,
  COALESCE(
    (SELECT balance 
     FROM transactions 
     WHERE manager_email = u.email 
     ORDER BY date DESC, created_at DESC 
     LIMIT 1),
    0
  ) as latest_transaction_balance,
  COALESCE(
    (SELECT COUNT(*) 
     FROM transactions 
     WHERE manager_email = u.email),
    0
  ) as transaction_count
FROM users u
WHERE u.role = 'user'
ORDER BY latest_transaction_balance DESC;

-- 월별 수수료 요약
CREATE OR REPLACE VIEW monthly_fee_summary AS
SELECT 
  DATE_TRUNC('month', date) as month,
  manager_email,
  manager_name,
  SUM(fee_amount) as total_fee,
  COUNT(*) as transaction_count
FROM transactions
WHERE fee_amount > 0
GROUP BY DATE_TRUNC('month', date), manager_email, manager_name
ORDER BY month DESC, total_fee DESC;

-- ============================================================
-- 함수: 거래 추가 시 잔액 자동 계산
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_balance()
RETURNS TRIGGER AS $$
DECLARE
  last_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(balance, 0) INTO last_balance
  FROM transactions
  WHERE manager_email = NEW.manager_email
    AND date < NEW.date
  ORDER BY date DESC, created_at DESC
  LIMIT 1;
  
  IF NEW.type = '입금' OR NEW.type = '세금계산서' THEN
    NEW.balance = last_balance + NEW.deposit_amount;
  ELSIF NEW.type = '출금' THEN
    NEW.balance = last_balance - NEW.withdrawal;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_balance
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_balance();

-- ============================================================
-- 완료
-- ============================================================
COMMENT ON TABLE users IS '사용자 및 고객 정보';
COMMENT ON TABLE transactions IS '거래 내역';
COMMENT ON TABLE mappings IS '거래처-담당자 매핑 (1:N)';
COMMENT ON TABLE settings IS '앱 설정';
```

</details>

---

## 2.3 SQL Editor에 붙여넣기

### 단계별 실행

1. **SQL Editor 화면에서**:
   - "+ New query" 버튼 클릭
   - 또는 기존 쿼리 영역 클릭

2. **코드 붙여넣기**:
   - Windows: `Ctrl + V`
   - Mac: `Cmd + V`
   - Linux: `Ctrl + V`

3. **코드 확인**:
   ```
   ✅ 첫 줄이 "-- ============" 주석으로 시작하는지 확인
   ✅ 마지막이 "COMMENT ON TABLE settings" 로 끝나는지 확인
   ✅ 총 라인 수: 약 250줄
   ```

---

## 2.4 SQL 실행

### 방법 1: Run 버튼 클릭
1. 화면 하단 또는 우측 하단의 **"Run"** 버튼 찾기
2. 초록색 재생 아이콘 (▶) 클릭

### 방법 2: 키보드 단축키
- Windows/Linux: `Ctrl + Enter`
- Mac: `Cmd + Enter`

### 실행 중 화면
```
┌─────────────────────────────────────────┐
│ Executing query...                       │
│ [=========>                  ] 45%       │
└─────────────────────────────────────────┘
```

---

## 2.5 성공 확인

### ✅ 성공 메시지 예시
```
Success. No rows returned
Execution time: 1.234s
```

또는

```
✓ Query executed successfully
⚡ 0 rows affected
⏱️ 1234 ms
```

### 생성된 객체 확인

**예상 결과**:
- ✅ Tables: 4개 (users, transactions, mappings, settings)
- ✅ Indexes: 8개
- ✅ Views: 2개 (manager_balances, monthly_fee_summary)
- ✅ Functions: 2개 (update_updated_at_column, calculate_balance)
- ✅ Triggers: 3개
- ✅ RLS Policies: 10개

---

## 2.6 테이블 확인

### Table Editor에서 확인

1. **왼쪽 사이드바** → "Table Editor" 클릭

2. **테이블 목록 확인**:
   ```
   📊 Tables (4)
   ├── users
   ├── transactions
   ├── mappings
   └── settings
   ```

3. **각 테이블 클릭하여 구조 확인**:

   **users 테이블**:
   ```
   Columns (10):
   - id (uuid, PK)
   - email (text, unique)
   - name (text)
   - password_hash (text)
   - role (text)
   - phone (text, nullable)
   - fee_rate (numeric)
   - balance (numeric)
   - created_at (timestamptz)
   - last_login (timestamptz, nullable)
   ```

   **transactions 테이블**:
   ```
   Columns (18):
   - id (uuid, PK)
   - date (timestamptz)
   - manager_name (text)
   - manager_email (text, FK → users.email)
   - type (text)
   - description (text)
   - vendor_name (text, nullable)
   - supply_amount (numeric)
   - vat (numeric)
   - total_amount (numeric)
   - fee_rate (numeric)
   - fee_amount (numeric)
   - deposit_amount (numeric)
   - withdrawal (numeric)
   - balance (numeric)
   - memo (text, nullable)
   - is_issued_by_me (boolean)
   - created_at (timestamptz)
   - updated_at (timestamptz)
   ```

   **mappings 테이블**:
   ```
   Columns (5):
   - id (uuid, PK)
   - vendor_name (text)
   - manager_name (text)
   - manager_email (text, FK → users.email)
   - created_at (timestamptz)
   ```

   **settings 테이블**:
   ```
   Columns (4):
   - key (text, PK)
   - value (text)
   - description (text, nullable)
   - updated_at (timestamptz)
   ```

---

## 2.7 RLS 정책 확인

### 정책 확인 방법

1. **Table Editor** → "users" 테이블 선택

2. **우측 상단** → 🛡️ "RLS" 버튼 클릭

3. **정책 목록 확인**:
   ```
   🛡️ Row Level Security: Enabled
   
   Policies (2):
   ✓ Admins can view all users (SELECT)
   ✓ Users can update themselves (UPDATE)
   ```

4. **다른 테이블도 확인**:
   - **transactions**: 4개 정책
   - **mappings**: 2개 정책
   - **settings**: 2개 정책

---

## 🐛 문제 해결

### ❌ 오류 1: "permission denied"
```
ERROR: permission denied for schema public
```

**원인**: 데이터베이스 권한 문제

**해결**:
1. SQL Editor에서 다음 실행:
   ```sql
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO anon;
   GRANT ALL ON SCHEMA public TO authenticated;
   ```
2. 다시 schema.sql 실행

---

### ❌ 오류 2: "extension uuid-ossp does not exist"
```
ERROR: extension "uuid-ossp" does not exist
```

**원인**: UUID 확장 기능 미설치

**해결**:
1. SQL Editor에서 다음 실행:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
2. 다시 schema.sql 실행

---

### ❌ 오류 3: "relation already exists"
```
ERROR: relation "users" already exists
```

**원인**: 테이블이 이미 생성됨

**해결 옵션 A** (기존 테이블 삭제 후 재생성):
```sql
-- ⚠️ 주의: 모든 데이터가 삭제됩니다!
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS mappings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 그 다음 schema.sql 재실행
```

**해결 옵션 B** (그냥 넘어가기):
- 이미 테이블이 있으면 에러 무시하고 계속 진행
- `CREATE TABLE IF NOT EXISTS` 덕분에 안전함

---

### ❌ 오류 4: Syntax Error
```
ERROR: syntax error at or near "..."
LINE 42: ...
```

**원인**: SQL 복사가 불완전함

**해결**:
1. 코드를 다시 복사 (전체 선택 후 복사)
2. SQL Editor 내용을 모두 삭제 (Ctrl+A → Delete)
3. 다시 붙여넣기
4. 실행

---

### ✅ 성공 체크리스트

스키마 생성이 완료되면 다음을 확인하세요:

- [ ] Table Editor에서 4개 테이블 확인
  - [ ] users
  - [ ] transactions
  - [ ] mappings
  - [ ] settings

- [ ] users 테이블에 10개 컬럼 존재

- [ ] transactions 테이블에 18개 컬럼 존재

- [ ] RLS가 모든 테이블에 활성화됨 (🛡️ 표시)

- [ ] settings 테이블에 초기 데이터 3건 존재:
  - [ ] default_fee_rate: 0.2
  - [ ] admin_email: ssmtransite@gmail.com
  - [ ] app_version: 2.0.0

---

## 🎯 다음 단계

스키마 생성이 완료되었으면 **Step 3: CSV 데이터 Import**로 이동하세요!

---

## 💡 팁

### 쿼리 저장하기
1. SQL Editor 우측 상단 → "Save" 버튼
2. 이름: "Schema Setup"
3. 나중에 재사용 가능

### SQL 히스토리 확인
1. SQL Editor 좌측 패널 → "History" 탭
2. 이전 실행 기록 확인 가능

### 테이블 구조 빠르게 보기
```sql
-- SQL Editor에서 실행
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

---

## 📞 도움이 필요하신가요?

오류가 계속되면 다음 정보와 함께 알려주세요:
1. 오류 메시지 전체 (스크린샷)
2. SQL Editor 화면 (스크린샷)
3. 어떤 단계에서 문제가 발생했는지

즉시 도와드리겠습니다! 🚀
