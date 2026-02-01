-- Supabase Auth와 users 테이블 자동 동기화 트리거

-- 1. 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.users에 새 사용자가 생성되면 public.users에도 추가
  INSERT INTO public.users (
    id,
    email,
    name,
    password_hash,
    role,
    phone,
    fee_rate,
    balance,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    '',
    'user',
    NEW.raw_user_meta_data->>'phone',
    0.2,
    0,
    NOW()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    name = COALESCE(EXCLUDED.name, users.name),
    phone = COALESCE(EXCLUDED.phone, users.phone);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 기존 관리자 계정 생성 (옵션)
-- Supabase Dashboard > Authentication > Users에서 수동으로 생성하거나
-- 회원가입 페이지에서 생성 후 아래 SQL로 role 변경:

-- UPDATE users SET role = 'admin' WHERE email = 'ssmtransite@gmail.com';

SELECT '✅ Auth sync trigger created successfully' as message;
