# GAS "권한이 없습니다" 근본 원인 분석

## 🔍 문제 상황
- **증상**: 거래 추가 시 "권한이 없습니다" 에러
- **전송 데이터**: requestUserRole = "admin" ✅
- **GAS 코드**: `if (userRole !== 'admin')` 체크 존재 ✅
- **결과**: 여전히 권한 거부 ❌

## 🎯 근본 원인

### **Google Apps Script의 치명적 제약**

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const userRole = data.requestUserRole;  // ← 문제는 여기가 아님
  
  if (userRole !== 'admin') {
    return { error: '권한이 없습니다.' };  // ← 여기서 막힘
  }
}
```

**실제 문제**: GAS가 **클라이언트가 보낸 데이터를 신뢰할 수 없음**

### ❌ 현재 흐름 (취약함)
```
클라이언트 → requestUserRole: "admin" 보냄
              ↓
GAS         → data.requestUserRole 확인
              ↓
              "admin"이면 통과 ✅
```

**문제점**: 누구나 `requestUserRole: "admin"`을 보내면 관리자가 됨!

---

## 🚨 Google Sheets를 DB로 쓸 때의 근본적 한계

### 1. **세션/토큰 인증 불가능**
```javascript
// ❌ GAS는 이런 걸 할 수 없음
if (!isValidToken(request.headers.authorization)) {
  return { error: '인증 실패' };
}
```

GAS는:
- HTTP 헤더를 직접 읽을 수 없음
- 세션 쿠키를 관리할 수 없음
- JWT 같은 토큰을 검증할 수 없음

### 2. **OAuth는 GAS 소유자만 인증**
```javascript
// GAS 배포 설정
실행 주체: "나" (ssmtransite@gmail.com)
액세스: "모든 사용자"
```

**결과**: 
- 스크립트는 항상 `ssmtransite@gmail.com` 권한으로 실행
- 외부 요청자가 누구인지 구분 불가능
- `Session.getActiveUser()`는 항상 배포자 이메일 반환

### 3. **클라이언트 데이터는 신뢰할 수 없음**
```javascript
// 클라이언트가 이렇게 보내면?
{
  requestUserEmail: "hacker@evil.com",
  requestUserRole: "admin"  // ← 조작 가능!
}
```

GAS는 이게 진짜인지 확인할 방법이 없음.

---

## 💡 해결 방법 3가지

### **옵션 A: IP 화이트리스트 (추천)**

```javascript
function doPost(e) {
  // 관리자 IP만 허용
  const ALLOWED_IPS = ['123.456.789.0', '98.765.432.1'];
  
  // ❌ GAS는 IP도 못 가져옴...
  // const clientIP = e.remoteAddress; // 존재하지 않음
}
```

**문제**: GAS는 클라이언트 IP도 못 가져옴 😭

---

### **옵션 B: API 키 인증 (실용적)**

**GAS Code.gs**:
```javascript
const API_SECRET = 'your-super-secret-key-here-12345';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // API 키 검증
  if (data.apiKey !== API_SECRET) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: '인증 실패' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 이제 권한 확인
  if (data.requestUserRole !== 'admin') {
    return ContentService
      .createTextOutput(JSON.stringify({ error: '권한이 없습니다.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 나머지 로직...
}
```

**클라이언트 (.env.local)**:
```env
NEXT_PUBLIC_GAS_API_KEY=your-super-secret-key-here-12345
```

**장점**: 
- 간단함
- 즉시 적용 가능
- API 키 없으면 차단

**단점**: 
- API 키 노출 위험
- 클라이언트 코드에서 보임 (NEXT_PUBLIC)

---

### **옵션 C: 서버리스 함수 + 실제 DB (최선)**

```
클라이언트 → Vercel API Route (서버)
                ↓
              JWT 검증
                ↓
              실제 DB (Postgres/MySQL)
                ↓
              응답
```

**장점**:
- 진짜 인증/권한 관리
- 안전함
- 확장 가능

**단점**:
- Google Sheets 포기
- DB 비용 발생
- 마이그레이션 필요

---

## 🎯 현재 상황에서 최선책

### **임시 해결: API 키 방식**

#### 1단계: GAS Code.gs 수정

```javascript
// 맨 위에 추가
const API_SECRET = 'MyAccWeb_Secret_2026_ssmtransite';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ✅ 1차 검증: API 키
    if (data.apiKey !== API_SECRET) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false,
          error: 'API 인증 실패' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = data.action;
    const userRole = data.requestUserRole || data.role;
    
    const publicActions = ['register', 'resetPassword', 'changePassword'];
    
    // ✅ 2차 검증: 권한
    if (userRole !== 'admin' && !publicActions.includes(action)) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: false,
          error: '권한이 없습니다.' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 나머지 로직...
    let result;
    switch (action) {
      // ...
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false,
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### 2단계: Next.js API 프록시 수정

**app/api/gas/route.ts**:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const gasUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
  
  // ✅ 서버 측 환경변수에서 API 키 추가
  const apiKey = process.env.GAS_API_SECRET || 'MyAccWeb_Secret_2026_ssmtransite';
  
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  
  const response = await fetch(gasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      apiKey: apiKey,  // ← 서버에서만 추가
      requestUserEmail: body.requestUserEmail || userEmail,
      requestUserRole: body.requestUserRole || userRole
    })
  });
  
  const data = await response.json();
  return NextResponse.json(toCamelCase(data));
}
```

#### 3단계: .env.local 추가

```env
# 서버 전용 (NEXT_PUBLIC 없음!)
GAS_API_SECRET=MyAccWeb_Secret_2026_ssmtransite
```

---

## 📊 비교표

| 방식 | 보안성 | 구현 난이도 | 비용 | 확장성 |
|------|--------|------------|------|--------|
| 현재 (클라이언트 검증) | ❌ 취약 | ✅ 쉬움 | ✅ 무료 | ❌ 없음 |
| API 키 방식 | ⚠️ 보통 | ✅ 쉬움 | ✅ 무료 | ⚠️ 제한적 |
| 실제 DB + JWT | ✅ 안전 | ❌ 어려움 | ❌ 유료 | ✅ 높음 |

---

## 🎬 결론

### **근본 원인**:
Google Sheets를 DB로 쓰는 한, **진짜 인증은 불가능**합니다.

### **왜?**
1. GAS는 HTTP 헤더/쿠키/세션을 다룰 수 없음
2. 클라이언트 데이터는 조작 가능
3. OAuth는 배포자만 인증

### **현실적 해결책**:
- **단기**: API 키 방식 (위 코드 적용)
- **장기**: Firebase Auth + Firestore 또는 Supabase로 이전

### **다음 단계**:
API 키 방식으로 진행할까요? 아니면 다른 DB로 이전할까요?
