-- RLS 정책 수정: auth.jwt() 대신 users 테이블 조회
-- 이유: Supabase Auth JWT에는 custom role이 포함되지 않음

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;
DROP POLICY IF EXISTS "View transactions policy" ON transactions;
DROP POLICY IF EXISTS "Admin can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can update transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can delete transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can view mappings" ON mappings;
DROP POLICY IF EXISTS "Admin can manage mappings" ON mappings;
DROP POLICY IF EXISTS "Authenticated users can view settings" ON settings;
DROP POLICY IF EXISTS "Admin can manage settings" ON settings;

-- Users 테이블 RLS (수정됨)
CREATE POLICY "Users can view themselves or admins can view all"
  ON users FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (email = auth.jwt() ->> 'email');

-- Transactions 테이블 RLS (수정됨)
CREATE POLICY "View transactions based on role"
  ON transactions FOR SELECT
  USING (
    -- 관리자는 모든 거래 조회
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
    -- 일반 유저는 자신의 거래만 조회
    OR manager_email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admin can insert any transaction"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update any transaction"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete any transaction"
  ON transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Mappings 테이블 RLS (수정됨)
CREATE POLICY "Authenticated users can view mappings"
  ON mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage mappings"
  ON mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- Settings 테이블 RLS (수정됨)
CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'admin'
    )
  );

-- 성공 메시지
SELECT 'RLS policies updated successfully' as message;
