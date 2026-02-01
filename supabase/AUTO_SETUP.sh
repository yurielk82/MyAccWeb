#!/bin/bash
set -e

echo "🚀 Supabase 자동 설정 시작..."

# 1. Supabase CLI 설치 확인
if ! command -v supabase &> /dev/null; then
    echo "📦 Supabase CLI 설치 중..."
    npm install -g supabase
fi

# 2. 로컬 Supabase 초기화
echo "🔧 로컬 Supabase 초기화..."
supabase init --force

# 3. 스키마 파일 복사
echo "📋 스키마 파일 복사..."
cp supabase/schema.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_initial_schema.sql

# 4. 로컬 Supabase 시작
echo "🐳 Docker 컨테이너 시작 (30초 소요)..."
supabase start

# 5. 데이터베이스 리셋 (스키마 적용)
echo "💾 데이터베이스 스키마 적용..."
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres

# 6. CSV 데이터 임포트
echo "📂 데이터 임포트 중..."
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres << SQL
\copy users(email, name, password_hash, role, phone, fee_rate, balance, created_at, last_login) FROM 'supabase/data/users.csv' WITH (FORMAT csv, HEADER true);
\copy settings(key, value, description, updated_at) FROM 'supabase/data/settings.csv' WITH (FORMAT csv, HEADER true);
\copy mappings(id, vendor_name, manager_name, manager_email, created_at) FROM 'supabase/data/mappings.csv' WITH (FORMAT csv, HEADER true);
\copy transactions(id, date, manager_name, manager_email, type, description, vendor_name, supply_amount, vat, total_amount, fee_rate, fee_amount, deposit_amount, withdrawal, balance, memo, is_issued_by_me, created_at, updated_at) FROM 'supabase/data/transactions.csv' WITH (FORMAT csv, HEADER true);
SQL

# 7. 데이터 검증
echo "✅ 데이터 검증 중..."
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -c "
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'mappings', COUNT(*) FROM mappings
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;
"

# 8. API URL 출력
echo ""
echo "✅ 로컬 Supabase 설정 완료!"
echo ""
echo "📌 로컬 API 정보:"
supabase status | grep -E "API URL|anon key"
echo ""
echo "🌐 Studio URL: http://localhost:54323"
echo ""
echo "⚙️  .env.local 파일에 추가:"
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$(supabase status -o json | jq -r '.anon_key')"
