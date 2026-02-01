#!/bin/bash
set -e

echo "🚀 Supabase 스키마 업로드 시작..."

DATABASE_URL="postgresql://postgres.inoqxubheyrenwhjrgzx:sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# PostgreSQL 클라이언트 설치 확인
if ! command -v psql &> /dev/null; then
    echo "📦 PostgreSQL 클라이언트 설치 중..."
    apt-get update -qq && apt-get install -y -qq postgresql-client > /dev/null 2>&1
fi

# 스키마 업로드
echo "📋 스키마 적용 중..."
PGPASSWORD="sb_secret_Ee0F_Smxe-Qz_l7kka9KuQ_WPiaOdG8" psql -h aws-0-ap-northeast-2.pooler.supabase.com -p 6543 -U postgres.inoqxubheyrenwhjrgzx -d postgres -f supabase/schema.sql

echo "✅ 스키마 업로드 완료!"
