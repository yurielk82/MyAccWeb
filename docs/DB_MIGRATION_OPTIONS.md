# 📊 Google Sheets → 실제 DB 이전 옵션

## 🎯 목표
모든 데이터(Users, Transactions, Mappings, Settings)를 Google Sheets에서 실제 DB로 완전 이전

---

## 🔥 옵션 1: Supabase (PostgreSQL) - **추천** ⭐

### 특징
- **무료 플랜**: 500MB DB, 50,000 월간 활성 사용자
- **PostgreSQL 기반**: 관계형 DB, SQL 지원
- **내장 인증**: Row Level Security (RLS), JWT
- **실시간 기능**: WebSocket 지원
- **자동 API**: RESTful API 자동 생성
- **Dashboard**: 웹 기반 DB 관리

### 장점 ✅
1. **무료로 시작**: 프로토타입에 완벽
2. **빠른 설정**: 5분 안에 DB 생성
3. **Next.js 최적화**: `@supabase/ssr` 공식 지원
4. **인증 내장**: Google, Email, Magic Link
5. **백업 자동**: Point-in-time recovery
6. **확장성**: 유료 전환 시 무제한 확장

### 단점 ❌
1. PostgreSQL 학습 필요 (기본 SQL만)
2. 무료 플랜은 일시정지 있음 (7일 미사용)

### 구현 난이도
- **설정**: ⭐ (매우 쉬움)
- **마이그레이션**: ⭐⭐ (중간)
- **유지보수**: ⭐ (쉬움)

### 예상 작업 시간
- **초기 설정**: 10분
- **스키마 생성**: 20분
- **데이터 마이그레이션**: 30분
- **API 통합**: 1시간
- **테스트**: 30분
- **총**: **2-3시간**

### 비용
| 플랜 | 가격 | DB 크기 | 포함 사항 |
|------|------|---------|----------|
| Free | $0/월 | 500MB | 50K MAU, 무제한 API |
| Pro | $25/월 | 8GB | 100K MAU, 일일 백업 |
| Team | $599/월 | 무제한 | 무제한 MAU, 1시간 지원 |

---

## 🔥 옵션 2: Firebase Firestore - **간편함** 🚀

### 특징
- **NoSQL**: 문서 기반, JSON 구조
- **Google 통합**: Google Cloud 생태계
- **무료 플랜**: 1GB 저장, 50K 읽기/일
- **실시간 동기화**: 자동 데이터 동기화
- **오프라인 지원**: 로컬 캐시 자동

### 장점 ✅
1. **가장 쉬움**: SQL 없이 JSON만
2. **Google Auth**: 이미 Google 계정 사용 중
3. **확장성**: 구글 인프라
4. **SDK 풍부**: JavaScript SDK 완벽
5. **호스팅 무료**: Firebase Hosting

### 단점 ❌
1. **NoSQL 제약**: 복잡한 쿼리 어려움
2. **비용 증가**: 읽기/쓰기 비용 누적
3. **마이그레이션 어려움**: SQL → NoSQL 구조 변경

### 구현 난이도
- **설정**: ⭐ (매우 쉬움)
- **마이그레이션**: ⭐⭐⭐ (어려움, 구조 변경)
- **유지보수**: ⭐⭐ (중간)

### 예상 작업 시간
- **초기 설정**: 15분
- **스키마 재설계**: 1시간 (NoSQL용)
- **데이터 마이그레이션**: 1시간
- **API 통합**: 1.5시간
- **테스트**: 30분
- **총**: **4-5시간**

### 비용
| 플랜 | 가격 | 저장 | 읽기/쓰기 |
|------|------|------|----------|
| Spark | $0/월 | 1GB | 50K/일 |
| Blaze | 종량제 | $0.18/GB | $0.06/100K 읽기 |

---

## 🔥 옵션 3: Vercel Postgres - **Next.js 최적화** ⚡

### 특징
- **Vercel 통합**: 같은 플랫폼
- **PostgreSQL**: Neon 기반
- **Edge 최적화**: 글로벌 분산
- **Zero Config**: 환경변수 자동 설정

### 장점 ✅
1. **Vercel 통합**: 배포와 동일 플랫폼
2. **빠른 설정**: 클릭 몇 번
3. **Edge Functions**: 저지연
4. **무료 플랜**: 256MB (Hobby)

### 단점 ❌
1. **무료 제약**: 256MB만 (Sheets보다 작음)
2. **비용 비쌈**: Pro $20/월부터
3. **락인**: Vercel 종속

### 구현 난이도
- **설정**: ⭐ (즉시)
- **마이그레이션**: ⭐⭐ (중간)
- **유지보수**: ⭐ (쉬움)

### 예상 작업 시간
- **초기 설정**: 5분
- **스키마 생성**: 20분
- **데이터 마이그레이션**: 30분
- **API 통합**: 1시간
- **테스트**: 30분
- **총**: **2시간**

### 비용
| 플랜 | 가격 | DB 크기 | 포함 사항 |
|------|------|---------|----------|
| Hobby | $0/월 | 256MB | 60시간 compute/월 |
| Pro | $20/월 | 무제한 | 100시간 compute/월 |

---

## 🔥 옵션 4: PlanetScale (MySQL) - **확장성** 📈

### 특징
- **MySQL 호환**: Vitess 기반
- **무손실 스키마**: 브랜치 기반 변경
- **무료 플랜**: 5GB, 10억 행 읽기/월
- **글로벌 DB**: 자동 샤딩

### 장점 ✅
1. **너그러운 무료**: 5GB (Sheets 수백만 행)
2. **스키마 안전**: 브랜치로 테스트
3. **확장성**: 수평 확장 자동
4. **CLI 강력**: 로컬 개발 편함

### 단점 ❌
1. **MySQL만**: PostgreSQL 아님
2. **Foreign Key 없음**: Vitess 제약
3. **복잡성**: 고급 기능 많음

### 구현 난이도
- **설정**: ⭐⭐ (중간)
- **마이그레이션**: ⭐⭐ (중간)
- **유지보수**: ⭐⭐ (중간)

### 예상 작업 시간
- **초기 설정**: 20분
- **스키마 생성**: 30분
- **데이터 마이그레이션**: 40분
- **API 통합**: 1.5시간
- **테스트**: 30분
- **총**: **3-4시간**

### 비용
| 플랜 | 가격 | DB 크기 | 포함 사항 |
|------|------|---------|----------|
| Hobby | $0/월 | 5GB | 10억 행 읽기/월 |
| Scaler | $29/월 | 25GB | 1000억 행 읽기/월 |

---

## 📊 종합 비교표

| 옵션 | 설정 난이도 | 무료 크기 | 작업 시간 | 학습 곡선 | 확장성 | 추천도 |
|------|------------|----------|----------|----------|--------|--------|
| **Supabase** | ⭐ | 500MB | 2-3시간 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🥇 **최고** |
| Firebase | ⭐ | 1GB | 4-5시간 | ⭐ | ⭐⭐⭐⭐ | 🥈 |
| Vercel PG | ⭐ | 256MB | 2시간 | ⭐⭐ | ⭐⭐⭐ | 🥉 |
| PlanetScale | ⭐⭐ | 5GB | 3-4시간 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |

---

## 🎯 추천 결정 트리

```
Q1: Next.js + SQL 경험 있음?
├─ YES → Supabase ⭐⭐⭐⭐⭐
└─ NO  → Q2

Q2: NoSQL 선호? (JSON 구조)
├─ YES → Firebase ⭐⭐⭐⭐
└─ NO  → Q3

Q3: Vercel만 사용?
├─ YES → Vercel Postgres ⭐⭐⭐
└─ NO  → Supabase ⭐⭐⭐⭐⭐

Q4: 대규모 확장 필요? (미래)
└─ YES → PlanetScale ⭐⭐⭐⭐
```

---

## 🏆 최종 추천

### **1순위: Supabase** 🥇

**이유**:
1. ✅ **무료 플랜 넉넉**: 500MB (현재 Sheets보다 큼)
2. ✅ **SQL 기반**: 기존 GAS 로직 재사용 가능
3. ✅ **인증 내장**: Row Level Security 자동
4. ✅ **Next.js 최적화**: 공식 SSR 지원
5. ✅ **커뮤니티**: 활발한 한국어 커뮤니티
6. ✅ **확장성**: 프로토타입 → 프로덕션 매끄럽게

**현재 프로젝트 적합성**: ⭐⭐⭐⭐⭐ (완벽)

---

## 🚀 Supabase 마이그레이션 계획

### Phase 1: 준비 (30분)
1. Supabase 계정 생성
2. 프로젝트 생성
3. 데이터베이스 스키마 설계
4. .env.local 설정

### Phase 2: 스키마 생성 (20분)
```sql
-- Users 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  phone TEXT,
  fee_rate NUMERIC DEFAULT 0.2,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Transactions 테이블
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  manager_email TEXT REFERENCES users(email),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  memo TEXT,
  vendor_name TEXT,
  supply_amount NUMERIC DEFAULT 0,
  vat NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  fee_rate NUMERIC DEFAULT 0.2,
  fee_amount NUMERIC DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  withdrawal NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mappings 테이블
CREATE TABLE mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  manager_email TEXT REFERENCES users(email),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings 테이블
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index 생성
CREATE INDEX idx_transactions_manager ON transactions(manager_email);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_mappings_vendor ON mappings(vendor_name);
```

### Phase 3: 데이터 마이그레이션 (30분)
1. Sheets 데이터 CSV 다운로드
2. Supabase Studio에서 Import
3. 데이터 검증

### Phase 4: API 통합 (1시간)
```typescript
// lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 거래 추가 예시
export async function addTransaction(data: TransactionData) {
  const { data: result, error } = await supabase
    .from('transactions')
    .insert([{
      date: data.date,
      manager_email: data.managerEmail,
      type: data.type,
      description: data.description,
      supply_amount: data.supplyAmount,
      // ...
    }])
    .select()
  
  if (error) throw error
  return result
}
```

### Phase 5: 인증 전환 (30분)
```typescript
// lib/auth/supabase-auth.ts
import { supabase } from '@/lib/db/supabase'

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}
```

### Phase 6: 테스트 & 배포 (30분)
1. 로컬 테스트
2. Vercel 환경변수 추가
3. 배포
4. 프로덕션 테스트

---

## 💰 예상 비용 (1년)

| 옵션 | 월 비용 | 연 비용 | 노트 |
|------|---------|---------|------|
| **Supabase Free** | $0 | $0 | 현재 규모 충분 |
| Supabase Pro | $25 | $300 | 확장 시 |
| Firebase (예상) | $5-20 | $60-240 | 사용량 기반 |
| Vercel PG | $20 | $240 | Hobby 초과 시 |
| PlanetScale Free | $0 | $0 | 5GB까지 |

---

## 🔧 필요한 패키지

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Firebase (대안)
npm install firebase

# Vercel Postgres (대안)
npm install @vercel/postgres

# PlanetScale (대안)
npm install @planetscale/database
```

---

## 📝 체크리스트

### 마이그레이션 전
- [ ] 현재 Sheets 데이터 백업
- [ ] Supabase 계정 생성
- [ ] 스키마 설계 검토
- [ ] 테스트 계획 수립

### 마이그레이션 중
- [ ] DB 스키마 생성
- [ ] 데이터 Import
- [ ] API 코드 전환
- [ ] 인증 시스템 전환
- [ ] 로컬 테스트

### 마이그레이션 후
- [ ] 프로덕션 배포
- [ ] 전체 기능 테스트
- [ ] 성능 모니터링
- [ ] Sheets 읽기 전용 전환
- [ ] 문서 업데이트

---

## ⚠️ 주의사항

1. **백업 필수**: Sheets 데이터 CSV 다운로드
2. **단계별 진행**: 한 번에 전환하지 말고 기능별로
3. **병렬 운영**: 초기에는 Sheets와 병행
4. **롤백 계획**: 문제 시 Sheets로 복귀 가능하게
5. **환경변수**: .env.local에 DB 설정 분리

---

## 🎬 다음 단계

**Supabase 선택 시**:
1. 지금 Supabase 계정 생성하세요
2. 프로젝트 생성 (한국 리전 선택)
3. Database URL과 API Key 복사
4. 제가 전체 마이그레이션 코드 작성해드릴게요

**준비되셨나요?** 🚀
