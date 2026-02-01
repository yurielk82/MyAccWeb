// Vercel 배포된 API 테스트
const testData = {
  action: 'addTransaction',
  date: '2026-02-01',
  managerEmail: 'ssmtransite@gmail.com',
  type: '입금',
  description: '테스트',
  supplyAmount: 1000000,
  requestUserEmail: 'ssmtransite@gmail.com'
};

fetch('https://my-acc-web.vercel.app/api/gas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-email': 'ssmtransite@gmail.com',
    'x-user-role': 'admin'
  },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => console.log('Response:', JSON.stringify(data, null, 2)))
.catch(err => console.error('Error:', err));
