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

-- 관리자는 모든 사용자 조회 가능
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR auth.jwt() ->> 'email' = email
  );

-- 사용자는 자신만 수정 가능
CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Transactions 테이블 RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 거래 조회 가능, 일반 사용자는 자신의 거래만
CREATE POLICY "View transactions policy"
  ON transactions FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR manager_email = auth.jwt() ->> 'email'
  );

-- 관리자만 거래 추가 가능
CREATE POLICY "Admin can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 관리자만 거래 수정 가능
CREATE POLICY "Admin can update transactions"
  ON transactions FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 관리자만 거래 삭제 가능
CREATE POLICY "Admin can delete transactions"
  ON transactions FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Mappings 테이블 RLS
ALTER TABLE mappings ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자 조회 가능
CREATE POLICY "Authenticated users can view mappings"
  ON mappings FOR SELECT
  TO authenticated
  USING (true);

-- 관리자만 매핑 관리
CREATE POLICY "Admin can manage mappings"
  ON mappings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Settings 테이블 RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자 조회 가능
CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

-- 관리자만 설정 수정
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
  -- 이전 거래의 마지막 잔액 가져오기
  SELECT COALESCE(balance, 0) INTO last_balance
  FROM transactions
  WHERE manager_email = NEW.manager_email
    AND date < NEW.date
  ORDER BY date DESC, created_at DESC
  LIMIT 1;
  
  -- 잔액 계산
  IF NEW.type = '입금' OR NEW.type = '세금계산서' THEN
    NEW.balance = last_balance + NEW.deposit_amount;
  ELSIF NEW.type = '출금' THEN
    NEW.balance = last_balance - NEW.withdrawal;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 거래 삽입 시 잔액 자동 계산 트리거
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
