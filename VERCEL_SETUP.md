# 🚀 Vercel 배포 가이드

## 📋 준비물
- ✅ GitHub 저장소: https://github.com/yurielk82/MyAccWeb
- ✅ Vercel 계정: https://vercel.com
- ✅ 환경 변수 값 (아래 참조)

---

## 🌐 방법 1: Vercel 웹사이트에서 배포 (추천!)

### 1단계: Vercel에 로그인
https://vercel.com/login

### 2단계: 새 프로젝트 Import
1. **Add New... → Project** 클릭
2. **Import Git Repository** 선택
3. **yurielk82/MyAccWeb** 저장소 선택
4. **Import** 클릭

### 3단계: 환경 변수 설정

**Environment Variables** 섹션에 다음 3개 변수를 추가하세요:

#### 변수 1: GAS_API_URL
```
Name: NEXT_PUBLIC_GAS_API_URL
Value: https://script.google.com/macros/s/AKfycbyI_O_rK77ROKV97ehkURQPC9n3_uFrKnBT1RJ7o9yZ_h0Et7SWYLpJbrx_StfhjP8j/exec
```

#### 변수 2: SPREADSHEET_ID
```
Name: NEXT_PUBLIC_SPREADSHEET_ID
Value: 1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o
```

#### 변수 3: ADMIN_EMAIL
```
Name: NEXT_PUBLIC_ADMIN_EMAIL
Value: ssmtransite@gmail.com
```

### 4단계: 배포
**Deploy** 버튼 클릭!

배포가 완료되면 다음과 같은 URL을 받게 됩니다:
```
https://my-acc-web-xxxxx.vercel.app
```

---

## 💻 방법 2: Vercel CLI로 배포

### 1단계: Vercel CLI 설치
```bash
npm i -g vercel
```

### 2단계: 로그인
```bash
vercel login
```

### 3단계: 프로젝트 디렉토리로 이동
```bash
cd /home/user/webapp
```

### 4단계: 환경 변수 설정

#### GAS API URL
```bash
vercel env add NEXT_PUBLIC_GAS_API_URL production
```
**입력값:**
```
https://script.google.com/macros/s/AKfycbyI_O_rK77ROKV97ehkURQPC9n3_uFrKnBT1RJ7o9yZ_h0Et7SWYLpJbrx_StfhjP8j/exec
```

#### Spreadsheet ID
```bash
vercel env add NEXT_PUBLIC_SPREADSHEET_ID production
```
**입력값:**
```
1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o
```

#### Admin Email
```bash
vercel env add NEXT_PUBLIC_ADMIN_EMAIL production
```
**입력값:**
```
ssmtransite@gmail.com
```

### 5단계: 배포
```bash
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 🔍 환경 변수 확인 방법

### Vercel 웹사이트에서:
1. 프로젝트 선택
2. **Settings** 탭
3. **Environment Variables** 메뉴
4. 설정된 변수 확인/수정

### Vercel CLI로:
```bash
# 환경 변수 목록 확인
vercel env ls

# 특정 환경 변수 확인
vercel env pull .env.local
```

---

## 🛠️ 환경 변수 수정 방법

### 웹사이트에서:
1. **Settings → Environment Variables**
2. 수정할 변수 옆 **Edit** 클릭
3. 새 값 입력 후 **Save**
4. **Redeploy** (자동으로 재배포됨)

### CLI로:
```bash
# 변수 제거
vercel env rm NEXT_PUBLIC_GAS_API_URL production

# 새로운 값으로 다시 추가
vercel env add NEXT_PUBLIC_GAS_API_URL production
```

---

## 📊 배포 후 확인사항

### ✅ 체크리스트
- [ ] 배포 완료 (녹색 체크)
- [ ] 환경 변수 3개 모두 설정됨
- [ ] 로그인 페이지 접속 가능
- [ ] 실제 로그인 성공 (ssmtransite@gmail.com / admin123)
- [ ] 관리자 대시보드 정상 작동
- [ ] 거래내역 조회 가능
- [ ] API 연동 정상

### 🔗 테스트 URL
배포 완료 후 Vercel이 제공하는 URL로 접속:
```
https://your-project-name.vercel.app
```

---

## 🐛 문제 해결

### 문제 1: 환경 변수가 인식되지 않음
**해결:**
1. Vercel 대시보드에서 환경 변수 재확인
2. 변수 이름이 정확한지 확인 (오타 확인)
3. 재배포: **Deployments → 최신 배포 → Redeploy**

### 문제 2: API 연동 실패
**해결:**
1. GAS API URL이 올바른지 확인
2. Google Apps Script가 "모든 사용자" 권한으로 배포되었는지 확인
3. 브라우저 콘솔에서 에러 확인

### 문제 3: 빌드 실패
**해결:**
1. 로컬에서 빌드 테스트: `npm run build`
2. Node.js 버전 확인 (Vercel 기본: Node 18)
3. package.json 의존성 확인

---

## 🎯 배포 완료!

축하합니다! 이제 전 세계 어디서나 My Acc 웹앱을 사용할 수 있습니다! 🎊

**유용한 링크:**
- 📦 GitHub: https://github.com/yurielk82/MyAccWeb
- 🚀 Vercel: https://vercel.com/dashboard
- 📊 Google Sheets: https://docs.google.com/spreadsheets/d/1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o/
- 📧 Admin: ssmtransite@gmail.com

