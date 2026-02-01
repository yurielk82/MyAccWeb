# 📊 Step 3: CSV 데이터 Import - 상세 가이드

## 개요

Excel에서 변환한 CSV 파일 4개를 Supabase 테이블에 업로드합니다.

**Import 순서** (중요!):
1. ✅ users (먼저)
2. ✅ transactions (users 다음)
3. ✅ mappings (users 다음)
4. ❌ settings (건너뛰기 - 이미 schema.sql에서 생성됨)

---

## 3.1 Users 테이블 Import

### 📁 파일 준비
- **파일 위치**: `/home/user/webapp/supabase/data/users.csv`
- **행 수**: 10명
- **컬럼**: email, name, password, role, phone, fee_rate, balance, created_at, last_login

### Import 단계

#### Step 1: Table Editor 열기
1. 왼쪽 사이드바 → "Table Editor" 클릭
2. 테이블 목록에서 **"users"** 선택

#### Step 2: Import 메뉴 열기
1. 우측 상단 **"Insert"** 버튼 (또는 "+" 버튼) 찾기
2. 드롭다운 메뉴 열기
3. **"Import data from CSV"** 선택

```
┌──────────────────────────────────┐
│ Insert                     [▼]   │
├──────────────────────────────────┤
│ Insert row                       │
│ ✓ Import data from CSV           │  ← 이것 선택
│ Import data from spreadsheet    │
└──────────────────────────────────┘
```

#### Step 3: CSV 파일 업로드

**방법 A: 드래그 앤 드롭**
1. `users.csv` 파일을 파일 탐색기에서 찾기
2. 브라우저 업로드 영역으로 드래그
3. "Drop file here" 표시되면 놓기

**방법 B: 파일 선택**
1. "Choose file" 또는 "Browse" 버튼 클릭
2. `/home/user/webapp/supabase/data/users.csv` 선택
3. "Open" 클릭

#### Step 4: 컬럼 매핑 확인

**자동 매핑 확인**:
```
CSV Column        →  Database Column     Status
────────────────────────────────────────────────
email             →  email               ✓ Matched
name              →  name                ✓ Matched
password          →  password_hash       ✓ Mapped
role              →  role                ✓ Matched
phone             →  phone               ✓ Matched
fee_rate          →  fee_rate            ✓ Matched
balance           →  balance             ✓ Matched
created_at        →  created_at          ✓ Matched
last_login        →  last_login          ✓ Matched
```

⚠️ **중요**: `password` → `password_hash` 매핑 확인!

**수동 매핑이 필요한 경우**:
1. 매핑 안 된 컬럼 찾기
2. 드롭다운에서 올바른 DB 컬럼 선택

#### Step 5: Import 옵션 설정

**기본 설정**:
- ✅ First row is header: **ON** (체크)
- ✅ Skip duplicates: **OFF** (체크 해제)
- ❌ Ignore empty values: **OFF** (체크 해제)

#### Step 6: Import 실행
1. 화면 하단 **"Import"** 버튼 클릭
2. 진행 상황 확인:
   ```
   Importing... [=====>     ] 5/10 rows
   ```

#### Step 7: 성공 확인
```
✓ Successfully imported 10 rows
```

#### Step 8: 데이터 확인
1. Table Editor에서 users 테이블 새로고침
2. 10개 행이 표시되는지 확인
3. 첫 번째 행 클릭하여 데이터 확인:
   ```
   email: ssmtransite@gmail.com
   name: 관리자
   role: admin
   ```

---

## 3.2 Transactions 테이블 Import

### 📁 파일 준비
- **파일 위치**: `/home/user/webapp/supabase/data/transactions.csv`
- **행 수**: 202건
- **주의**: users 테이블이 먼저 import되어야 함 (FK 제약)

### Import 단계

#### Step 1-2: Table Editor에서 transactions 선택
1. Table Editor → **"transactions"** 테이블
2. "Insert" → "Import data from CSV"

#### Step 3: CSV 파일 업로드
- `transactions.csv` 파일 선택

#### Step 4: 컬럼 매핑 확인
```
CSV Column           →  Database Column        Status
──────────────────────────────────────────────────────
id                   →  id                     ✓
date                 →  date                   ✓
manager_name         →  manager_name           ✓
manager_email        →  manager_email          ✓
type                 →  type                   ✓
description          →  description            ✓
vendor_name          →  vendor_name            ✓
supply_amount        →  supply_amount          ✓
vat                  →  vat                    ✓
total_amount         →  total_amount           ✓
fee_rate             →  fee_rate               ✓
fee_amount           →  fee_amount             ✓
deposit_amount       →  deposit_amount         ✓
withdrawal           →  withdrawal             ✓
balance              →  balance                ✓
memo                 →  memo                   ✓
is_issued_by_me      →  is_issued_by_me        ✓
created_at           →  created_at             ✓
updated_at           →  updated_at             ✓
```

모든 컬럼이 자동으로 매핑됩니다.

#### Step 5-6: Import 실행
1. "Import" 클릭
2. 진행 상황 확인 (202 rows)

#### Step 7: 성공 확인
```
✓ Successfully imported 202 rows
```

#### Step 8: 데이터 검증
```sql
-- SQL Editor에서 실행
SELECT 
  COUNT(*) as total,
  COUNT(DISTINCT manager_email) as managers,
  SUM(fee_amount) as total_fee
FROM transactions;
```

**예상 결과**:
```
total: 202
managers: 10명 정도
total_fee: 수백만 원
```

---

## 3.3 Mappings 테이블 Import

### 📁 파일 준비
- **파일 위치**: `/home/user/webapp/supabase/data/mappings.csv`
- **행 수**: 9건

### Import 단계

#### Step 1-2: Table Editor에서 mappings 선택
1. Table Editor → **"mappings"** 테이블
2. "Insert" → "Import data from CSV"

#### Step 3: CSV 파일 업로드
- `mappings.csv` 파일 선택

#### Step 4: 컬럼 매핑 확인
```
CSV Column        →  Database Column     Status
────────────────────────────────────────────────
id                →  id                  ✓
vendor_name       →  vendor_name         ✓
manager_name      →  manager_name        ✓
manager_email     →  manager_email       ✓
created_at        →  created_at          ✓
```

#### Step 5-6: Import 실행
1. "Import" 클릭
2. 진행 상황 확인

#### Step 7: 성공 확인
```
✓ Successfully imported 9 rows
```

#### Step 8: 데이터 확인
```sql
-- SQL Editor에서 실행
SELECT 
  vendor_name,
  manager_name,
  manager_email
FROM mappings
ORDER BY vendor_name;
```

**예상 결과**:
```
한국자동차연구원 | 김락민 | rmkim@katech.re.kr
영남이공대학교   | 류경진 | angelus999@naver.com
...
```

---

## 3.4 Settings 테이블 (건너뛰기)

### ❌ Import 하지 않음

**이유**: `schema.sql`에서 이미 초기 데이터를 INSERT했습니다.

```sql
-- schema.sql에 이미 포함됨
INSERT INTO settings (key, value, description, updated_at)
VALUES 
  ('default_fee_rate', '0.2', '기본 수수료율 (20%)', NOW()),
  ('admin_email', 'ssmtransite@gmail.com', '관리자 이메일', NOW()),
  ('app_version', '2.0.0', '앱 버전', NOW())
ON CONFLICT (key) DO NOTHING;
```

### 확인만 하기
1. Table Editor → "settings" 테이블 선택
2. 3개 행이 있는지 확인:
   - default_fee_rate: 0.2
   - admin_email: ssmtransite@gmail.com
   - app_version: 2.0.0

---

## 🐛 문제 해결

### ❌ 오류 1: "violates foreign key constraint"
```
ERROR: insert or update on table "transactions" violates foreign key constraint
DETAIL: Key (manager_email)=(xxx@example.com) is not present in table "users"
```

**원인**: users 테이블이 먼저 import되지 않음

**해결**:
1. users 테이블 먼저 import
2. 그 다음 transactions import

---

### ❌ 오류 2: "duplicate key value violates unique constraint"
```
ERROR: duplicate key value violates unique constraint "users_email_key"
DETAIL: Key (email)=(xxx@example.com) already exists
```

**원인**: 같은 데이터를 두 번 import함

**해결 옵션 A** (기존 데이터 삭제):
```sql
-- SQL Editor에서 실행
DELETE FROM transactions;
DELETE FROM mappings;
DELETE FROM users;
```

**해결 옵션 B** (중복 건너뛰기):
- Import 옵션에서 "Skip duplicates" 체크

---

### ❌ 오류 3: "invalid input syntax for type"
```
ERROR: invalid input syntax for type numeric: "NaN"
```

**원인**: CSV에 잘못된 숫자 형식

**해결**:
1. CSV 파일 열기
2. "NaN" 또는 빈 값을 "0" 또는 "NULL"로 변경
3. 저장 후 재시도

---

### ❌ 오류 4: "column does not exist"
```
ERROR: column "password" of relation "users" does not exist
HINT: Perhaps you meant to reference column "password_hash"
```

**원인**: 컬럼 매핑이 잘못됨

**해결**:
1. Import 화면에서 매핑 확인
2. `password` → `password_hash` 수동 매핑
3. 다시 시도

---

### ❌ 오류 5: CSV 파일 인코딩 문제
```
ERROR: invalid byte sequence for encoding "UTF8"
```

**원인**: CSV 파일이 UTF-8이 아님

**해결**:
```bash
# 로컬에서 인코딩 변환
iconv -f EUC-KR -t UTF-8 users.csv > users_utf8.csv

# 또는 Python으로
python3 << EOF
import pandas as pd
df = pd.read_csv('users.csv', encoding='cp949')
df.to_csv('users_utf8.csv', encoding='utf-8', index=False)
EOF
```

---

## ✅ Import 완료 체크리스트

모든 데이터 import가 완료되면 다음을 확인하세요:

### 데이터 건수 확인
```sql
-- SQL Editor에서 실행
SELECT 
  'users' as table_name, 
  COUNT(*) as row_count 
FROM users
UNION ALL
SELECT 
  'transactions', 
  COUNT(*) 
FROM transactions
UNION ALL
SELECT 
  'mappings', 
  COUNT(*) 
FROM mappings
UNION ALL
SELECT 
  'settings', 
  COUNT(*) 
FROM settings;
```

**예상 결과**:
```
users        | 10
transactions | 202
mappings     | 9
settings     | 3
```

### Foreign Key 확인
```sql
-- 모든 transactions의 manager_email이 users에 존재하는지 확인
SELECT COUNT(*) as orphan_transactions
FROM transactions t
WHERE NOT EXISTS (
  SELECT 1 FROM users u 
  WHERE u.email = t.manager_email
);
```

**예상 결과**: `orphan_transactions: 0`

### 데이터 샘플 확인
```sql
-- 거래 상위 5건
SELECT 
  date,
  manager_name,
  type,
  supply_amount,
  balance
FROM transactions
ORDER BY date DESC
LIMIT 5;
```

---

## 💡 Import 팁

### 대용량 데이터 Import
CSV가 1000행 이상인 경우:
1. 파일을 여러 개로 분할
2. 각각 import
3. 또는 SQL로 직접 COPY:
   ```sql
   COPY users FROM '/path/to/users.csv' 
   WITH (FORMAT csv, HEADER true);
   ```

### 날짜 형식 문제
Excel 날짜가 깨지는 경우:
1. CSV에서 날짜를 `YYYY-MM-DD HH:MM:SS` 형식으로 변경
2. 또는 Import 후 SQL로 변환:
   ```sql
   UPDATE transactions
   SET date = TO_TIMESTAMP(date::text, 'MM/DD/YYYY HH24:MI:SS');
   ```

### 빠른 데이터 확인
```sql
-- 각 테이블의 첫 3행 보기
SELECT * FROM users LIMIT 3;
SELECT * FROM transactions LIMIT 3;
SELECT * FROM mappings LIMIT 3;
SELECT * FROM settings LIMIT 3;
```

---

## 🎯 다음 단계

데이터 import가 완료되었으면 **Step 4: API 키 및 환경변수 설정**으로 이동하세요!

---

## 📊 데이터 통계 확인

Import 후 다음 쿼리로 전체 통계를 확인하세요:

```sql
-- 종합 통계
SELECT 
  '총 사용자' as metric, 
  COUNT(*)::text as value 
FROM users
UNION ALL
SELECT 
  '관리자 수', 
  COUNT(*)::text 
FROM users WHERE role = 'admin'
UNION ALL
SELECT 
  '일반 사용자', 
  COUNT(*)::text 
FROM users WHERE role = 'user'
UNION ALL
SELECT 
  '총 거래 건수', 
  COUNT(*)::text 
FROM transactions
UNION ALL
SELECT 
  '세금계산서', 
  COUNT(*)::text 
FROM transactions WHERE type = '세금계산서'
UNION ALL
SELECT 
  '입금 거래', 
  COUNT(*)::text 
FROM transactions WHERE type = '입금'
UNION ALL
SELECT 
  '출금 거래', 
  COUNT(*)::text 
FROM transactions WHERE type = '출금'
UNION ALL
SELECT 
  '총 수수료', 
  TO_CHAR(SUM(fee_amount), 'FM9,999,999,999')::text || '원'
FROM transactions
UNION ALL
SELECT 
  '거래처 매핑', 
  COUNT(*)::text 
FROM mappings;
```

**예상 출력**:
```
총 사용자     | 10
관리자 수     | 1
일반 사용자   | 9
총 거래 건수  | 202
세금계산서   | 150
입금 거래    | 40
출금 거래    | 12
총 수수료    | 12,345,678원
거래처 매핑  | 9
```

---

## 📞 도움이 필요하신가요?

Import 중 문제가 발생하면:
1. 오류 메시지 전체 복사
2. 어떤 테이블에서 문제 발생했는지
3. CSV 파일 첫 5줄 공유

즉시 도와드리겠습니다! 🚀
