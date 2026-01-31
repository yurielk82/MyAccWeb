#!/bin/bash

echo "🔧 Vercel 환경 변수 설정 스크립트"
echo ""
echo "다음 명령어를 하나씩 실행하세요:"
echo ""
echo "# 1. Vercel CLI 설치 (아직 안 했다면)"
echo "npm i -g vercel"
echo ""
echo "# 2. Vercel 로그인"
echo "vercel login"
echo ""
echo "# 3. 환경 변수 설정"
echo 'vercel env add NEXT_PUBLIC_GAS_API_URL production'
echo "입력: https://script.google.com/macros/s/AKfycbyI_O_rK77ROKV97ehkURQPC9n3_uFrKnBT1RJ7o9yZ_h0Et7SWYLpJbrx_StfhjP8j/exec"
echo ""
echo 'vercel env add NEXT_PUBLIC_SPREADSHEET_ID production'
echo "입력: 1ZAJ6D7gAqOhHeReKRof4NxsZGgT0vVmWKiHXe-Ycz4o"
echo ""
echo 'vercel env add NEXT_PUBLIC_ADMIN_EMAIL production'
echo "입력: ssmtransite@gmail.com"
echo ""
echo "# 4. 배포"
echo "vercel --prod"
